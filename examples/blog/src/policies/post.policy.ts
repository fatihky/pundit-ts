import { PunditPolicy } from "../../../../index";
import { Post } from "../models";
import { PolicyContext } from "./policy-context";

export type PostActions = "create" | "publish" | "unpublish" | "update";

export class PostPolicy extends PunditPolicy<PolicyContext, Post, PostActions> {
  authorize(context: PolicyContext, post: Post, action: PostActions): boolean {
    switch (action) {
      case "create":
      case "publish":
      case "unpublish":
      case "update":
        return this.isAdminOrAuthor(context, post);
    }
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
