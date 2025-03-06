import { PunditPolicy } from "pundit-ts";
import { User } from "../entities/User";
import type { PolicyContext } from "./policy-context";

export type UserActions = "create";

export class UserPolicy extends PunditPolicy<PolicyContext, User, UserActions> {
  constructor() {
    super(User);
  }

  authorize(
    _context: PolicyContext,
    _user: User,
    _action: "create",
  ): Promise<boolean> | boolean {
    return true;
  }

  async filter(context: PolicyContext): Promise<void> {}
}
