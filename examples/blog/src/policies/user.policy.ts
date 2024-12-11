import { PunditPolicy } from "pundit-ts";
import { User } from "../models";
import { PolicyContext } from "./policy-context";

export type UserActions = "create";

export class UserPolicy
  implements PunditPolicy<PolicyContext, User, UserActions>
{
  async canCreate() {
    return true;
  }

  async filter(context: PolicyContext): Promise<void> {}

  handlesAction(action: unknown): action is UserActions {
    return action === "create";
  }

  handlesModel(object: unknown): object is User {
    return object instanceof User;
  }
}
