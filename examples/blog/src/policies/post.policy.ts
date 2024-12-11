import { PunditPolicy } from "pundit-ts";
import { Post } from "../models";
import { PolicyContext } from "./policy-context";

export type PostActions = "create" | "update";

export class PostPolicy
  implements PunditPolicy<PolicyContext, Post, PostActions>
{
  async canCreate(context: PolicyContext, post: Post) {
    // users may only create posts on their behalf.
    return (
      context.actor?.isAdmin || post.author.username === context.actor?.username
    );
  }

  async canUpdate(context: PolicyContext, post: Post) {
    // users may only update their own posts
    return (
      context.actor?.isAdmin || post.author.username === context.actor?.username
    );
  }

  async filter(context: PolicyContext): Promise<void> {}

  handlesAction(action: unknown): action is PostActions {
    return action === "create" || action === "update";
  }

  handlesModel(object: unknown): object is Post {
    return object instanceof Post;
  }
}
