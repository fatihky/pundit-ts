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
  FilterFor = Filter,
> {
  constructor(private cons: new (...args: any[]) => Model) {}

  /**
   * Your policy's authorization logic will be implemented in this method.
   */
  abstract authorize(
    context: Context,
    object: Model,
    action: Actions,
  ): Promise<boolean>;

  /**
   * Build a generic filter for your entity.
   * Can be used for both generic entity selection queries and individual record lookups.
   */
  abstract filter(
    context: Context,
  ): Promise<Filter | typeof punditMatchNothing>;

  /**
   * Build a filter specific for the given action.
   * FilterFor parameter can be used to declare different return type for this.
   *
   * Unlike the filter() method, this method is not required to be implemented.
   */
  filterFor(
    context: Context,
    action: Actions,
  ): Promise<FilterFor | typeof punditMatchNothing> {
    throw new Error("Not implemented.");
  }

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

/**
 * Helper generic to find a proper `filter()` result for the given
 * entity type.
 */
type FindFilterForType<
  C,
  P extends PunditPolicy<C, unknown, any, any>[],
  M,
> = P extends [infer F, ...infer R]
  ? F extends PunditPolicy<C, M, infer _Actions, infer _Filter, infer FilterFor>
    ? FilterFor
    : R extends PunditPolicy<C, any, any, any, any>[]
      ? FindFilterForType<C, R, M>
      : C
  : "No proper policy registered for handling this model type";

export class Pundit<C, P extends PunditPolicy<C, unknown, any, any>[] = []> {
  constructor(private policies: PunditPolicy<C, unknown, any, any>[] = []) {}

  /**
   * Register a policy, then, this pundit instance will be able to
   * recognize the entity that policy includes.
   */
  register<M, A extends string, F, FF>(
    policy: PunditPolicy<C, M, A, F, FF>,
  ): Pundit<C, [...P, PunditPolicy<C, M, A, F, FF>]> {
    return new Pundit(this.policies.concat(policy)) as unknown as Pundit<
      C,
      [...P, PunditPolicy<C, M, A, F, FF>]
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

    return await policy.filter(context);
  }

  /**
   * Build a filter for specific to an action.
   */
  async filterFor<M>(
    context: C,
    cons: new (...args: any[]) => M,
    action: FindAction<C, P, M>,
  ): Promise<FindFilterForType<C, P, M> | typeof punditMatchNothing> {
    const policy = this.policies.find(
      (p): p is PunditPolicy<C, M, any, FindFilterForType<C, P, M>> => {
        return p.handlesModelConstructor(cons);
      },
    );

    if (!policy) {
      throw new Error(`No policy found for model constructor ${cons}`);
    }

    return await policy.filterFor(context, action);
  }
}
