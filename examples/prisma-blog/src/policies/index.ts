import { Pundit } from "pundit-ts";
import { PolicyContext } from "./policy-context";
import { PostPolicy } from "./post.policy";
import { UserPolicy } from "./user.policy";

export const pundit = new Pundit<PolicyContext>()
  .register(new UserPolicy())
  .register(new PostPolicy());

export { PolicyContext };
