type Pascal<T> = T extends `${infer F}${infer Rest}`
  ? `${Capitalize<F>}${Rest}`
  : never;

type AuthorizationMethod<C, M, A> = (
  context: C,
  object: M,
  action: A
) => Promise<boolean>;

export type PunditPolicy<Context, Model, Actions extends string> = {
  [K in Actions as `can${Pascal<K>}`]: AuthorizationMethod<Context, Model, K>;
} & {
  handlesAction(action: unknown): action is Actions;
  handlesModel(object: unknown): object is Model;
  filter(context: Context): Promise<void>;
};

type FindAction<C, P extends PunditPolicy<C, unknown, any>[], M> = P extends [
  infer F,
  ...infer R
]
  ? F extends PunditPolicy<C, M, infer A>
    ? A
    : R extends PunditPolicy<C, any, any>[]
    ? FindAction<C, R, M>
    : C
  : "No proper policy registered for handling this model type";

export class Pundit<C, P extends PunditPolicy<C, unknown, any>[] = []> {
  constructor(private policies: PunditPolicy<C, unknown, any>[] = []) {}

  register<M, A extends string>(
    policy: PunditPolicy<C, M, A>
  ): Pundit<C, [...P, PunditPolicy<C, M, A>]> {
    return new Pundit(this.policies.concat(policy)) as unknown as Pundit<
      C,
      [...P, PunditPolicy<C, M, A>]
    >;
  }

  async authorize<M>(
    ctx: C,
    object: M,
    action: FindAction<C, P, M>
  ): Promise<boolean> {
    const policy = this.policies.find(
      (p): p is PunditPolicy<C, M, typeof action> =>
        p.handlesModel(object) && p.handlesAction(action)
    );

    if (!policy) {
      throw new Error(`No policy found for model ${object}`);
    }

    const methodName = `can${
      toPascal(action) as Pascal<typeof action>
    }` as const;
    const method = policy[methodName] as AuthorizationMethod<
      C,
      M,
      typeof action
    >;

    return await method(ctx, object, action);
  }
}

function toPascal(input: string): string {
  return input[0].toLocaleUpperCase().concat(input.substring(1));
}
