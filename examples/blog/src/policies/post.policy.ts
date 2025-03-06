import { PunditPolicy } from "pundit-ts";
import { Post } from "../models";
import type { PolicyContext } from "./policy-context";

export type PostActions = "create" | "publish" | "unpublish" | "update";

export class PostPolicy extends PunditPolicy<PolicyContext, Post, PostActions> {
  constructor() {
    super(Post);
  }

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

  private isAdminOrAuthor(context: PolicyContext, post: Post): boolean {
    return (
      context.actor?.isAdmin || post.author.username === context.actor?.username
    );
  }
}
