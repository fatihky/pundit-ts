import { PunditPolicy } from "pundit-ts";
import { User } from "../entities/User";
import { PolicyContext } from "./policy-context";

export type UserActions = "create";

export class UserPolicy extends PunditPolicy<PolicyContext, User, UserActions> {
  authorize(
    _context: PolicyContext,
    _user: User,
    _action: "create"
  ): Promise<boolean> | boolean {
    return true;
  }

  async filter(context: PolicyContext): Promise<void> {}

  handlesModelConstructor(cons: unknown): cons is new () => User {
    return cons === User;
  }

  handlesAction(action: unknown): action is UserActions {
    return action === "create";
  }

  handlesModel(object: User): object is User {
    return true; // cannot perform instanceof check here, because User is just a type, not a class
  }
}
