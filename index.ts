// Used when the PunditPolicy#filter() decides NOTHING should be matched.
// This serves the same purpose of ActiveRecord's `none` query method.
// See: https://apidock.com/rails/v7.1.3.4/ActiveRecord/QueryMethods/none
export const punditMatchNothing: unique symbol = Symbol("punditMatchNothing");

export type PunditMatchNothing = typeof punditMatchNothing;

export abstract class PunditPolicy<
  Context,
  Model,
  Actions extends string,
  Filter = unknown,
> {
  constructor(private cons: new (...args: any[]) => Model) {}

  abstract authorize(
    context: Context,
    object: Model,
    action: Actions,
  ): Promise<boolean> | boolean;

  abstract filter(
    context: Context,
  ): Filter | Promise<Filter> | typeof punditMatchNothing;

  handlesModel(object: unknown): object is Model {
    return object instanceof this.cons;
  }

  handlesModelConstructor(cons: unknown): cons is new () => Model {
    return cons === this.cons;
  }
}

type FindAction<C, P extends PunditPolicy<C, unknown, any>[], M> = P extends [
  infer F,
  ...infer R,
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
  M,
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
    policy: PunditPolicy<C, M, A, F>,
  ): Pundit<C, [...P, PunditPolicy<C, M, A, F>]> {
    return new Pundit(this.policies.concat(policy)) as unknown as Pundit<
      C,
      [...P, PunditPolicy<C, M, A, F>]
    >;
  }

  async authorize<M>(
    ctx: C,
    object: M,
    action: FindAction<C, P, M>,
  ): Promise<boolean> {
    const policy = this.policies.find(
      (p): p is PunditPolicy<C, M, typeof action> => p.handlesModel(object),
    );

    if (!policy) {
      throw new Error(`No policy found for model ${object}`);
    }

    return await policy.authorize(ctx, object, action);
  }

  async filter<M>(
    context: C,
    cons: new (...args: any[]) => M,
  ): Promise<FindFilterType<C, P, M> | typeof punditMatchNothing> {
    const policy = this.policies.find(
      (p): p is PunditPolicy<C, M, any, FindFilterType<C, P, M>> => {
        return p.handlesModelConstructor(cons);
      },
    );

    if (!policy) {
      throw new Error(`No policy found for model constructor ${cons}`);
    }

    return await Promise.resolve(policy.filter(context));
  }
}
