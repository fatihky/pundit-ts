type Pascal<T> = T extends `${infer F}${infer Rest}`
  ? `${Capitalize<F>}${Rest}`
  : never;

type AuthorizationMethod<C, M, A> = (
  context: C,
  object: M,
  action: A
) => boolean | Promise<boolean>;

export type PunditPolicy<
  Context,
  Model,
  Actions extends string,
  Filter = unknown
> = {
  [K in Actions as `can${Pascal<K>}`]: AuthorizationMethod<Context, Model, K>;
} & {
  handlesAction(action: unknown): action is Actions;
  handlesModel(object: unknown): object is Model;
  handlesModelConstructor(cons: unknown): cons is new () => Model;
  filter(context: Context): Filter | Promise<Filter>;
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

type FindFilterType<
  C,
  P extends PunditPolicy<C, unknown, any>[],
  M
> = P extends [infer F, ...infer R]
  ? F extends PunditPolicy<C, M, infer _, infer Filter>
    ? Filter
    : R extends PunditPolicy<C, any, any>[]
    ? FindFilterType<C, R, M>
    : C
  : "No proper policy registered for handling this model type";

export class Pundit<C, P extends PunditPolicy<C, unknown, any>[] = []> {
  constructor(private policies: PunditPolicy<C, unknown, any>[] = []) {}

  register<M, A extends string, F>(
    policy: PunditPolicy<C, M, A, F>
  ): Pundit<C, [...P, PunditPolicy<C, M, A, F>]> {
    return new Pundit(this.policies.concat(policy)) as unknown as Pundit<
      C,
      [...P, PunditPolicy<C, M, A, F>]
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

  async filter<M>(
    context: C,
    cons: new (...args: any[]) => M
  ): Promise<FindFilterType<C, P, M>> {
    const policy = this.policies.find(
      (p): p is PunditPolicy<C, M, any, FindFilterType<C, P, M>> =>
        p.handlesModelConstructor(cons)
    );

    if (!policy) {
      throw new Error(`No policy found for model constructor ${cons}`);
    }

    return await Promise.resolve(policy.filter(context));
  }
}

function toPascal(input: string): string {
  return input[0].toLocaleUpperCase().concat(input.substring(1));
}
