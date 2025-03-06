/**
 * punditMatchNothing: This is what your Policy class should return if the
 * current context IS NOT authorized to query this entity.
 * You should throw a "not authorized" error when your `pundit.filter()`
 * call returns this.
 * 
 * Used when the PunditPolicy#filter() decides NOTHING should be matched.
 * This serves the same purpose of ActiveRecord's `none` query method.
 * See: https://apidock.com/rails/v7.1.3.4/ActiveRecord/QueryMethods/none
 */
export const punditMatchNothing: unique symbol = Symbol("punditMatchNothing");

export type PunditMatchNothing = typeof punditMatchNothing;

/**
 * Base class for your policies.
 * Extend this class for each of your entities.
 * Declare your authorization logic in the `authorize()` method and
 * filtering logic in `filter()` and `filterFor()` methods.
 * 
 * You should `.register()` your policies to your own pundit instance
 * so your entity will be correctly recognized.
 */
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

/**
 * Find a proper action type for the given entity class.
 */
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

/**
 * Helper generic to find a proper `filter()` result for the given
 * entity type.
 */
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

  /**
   * Register a policy, then, this pundit instance will be able to
   * recognize the entity that policy includes.
   */
  register<M, A extends string, F>(
    policy: PunditPolicy<C, M, A, F>,
  ): Pundit<C, [...P, PunditPolicy<C, M, A, F>]> {
    return new Pundit(this.policies.concat(policy)) as unknown as Pundit<
      C,
      [...P, PunditPolicy<C, M, A, F>]
    >;
  }

  /**
   * Authorize an action on an instance of any of the register()'ed entities.
   * `action` type will be determined the type of your object's class.
   */
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

  /**
   * Build a filter for the given entity.
   * This filter is supposed to be used in your database queries.
   */
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
