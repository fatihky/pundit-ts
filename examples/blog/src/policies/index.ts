import { Pundit } from "pundit-ts";
import { PolicyContext } from "./policy-context";
import { UserPolicy } from "./user.policy";
import { PostPolicy } from "./post.policy";

export const pundit = new Pundit<PolicyContext>()
  .register(new UserPolicy())
  .register(new PostPolicy());

export { PolicyContext };
