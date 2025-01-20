import { PunditPolicy } from "pundit-ts";
import { Post } from "../models";
import { PolicyContext } from "./policy-context";

export type PostActions = "create" | "publish" | "unpublish" | "update";

export class PostPolicy
  implements PunditPolicy<PolicyContext, Post, PostActions>
{
  async canCreate(context: PolicyContext, post: Post) {
    // users may only create posts on their behalf.
    return this.isAdminOrAuthor(context, post);
  }

  async canPublish(context: PolicyContext, post: Post) {
    return this.isAdminOrAuthor(context, post);
  }

  async canUnpublish(context: PolicyContext, post: Post) {
    return this.isAdminOrAuthor(context, post);
  }

  async canUpdate(context: PolicyContext, post: Post) {
    // users may only update their own posts
    return this.isAdminOrAuthor(context, post);
  }

  async filter(context: PolicyContext): Promise<void> {}

  handlesAction(action: unknown): action is PostActions {
    return action === "create" || action === "update";
  }

  handlesModel(object: unknown): object is Post {
    return object instanceof Post;
  }

  handlesModelConstructor(cons: unknown): cons is new () => Post {
    return cons === Post;
  }

  private isAdminOrAuthor(context: PolicyContext, post: Post): boolean {
    return (
      context.actor?.isAdmin || post.author.username === context.actor?.username
    );
  }
}
