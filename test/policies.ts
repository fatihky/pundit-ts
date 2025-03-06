import { PunditPolicy } from "../dist";
import type { Context } from "./context";
import { Comment, Post } from "./entities";

type PostActions =
  | "create"
  | "like"
  | "list"
  | "publish"
  | "unlike"
  | "unpublish";

export class PostPolicy extends PunditPolicy<
  Context,
  Post,
  PostActions,
  "post filter",
  `post filter for ${PostActions}`
> {
  constructor() {
    super(Post);
  }

  override async authorize(
    context: string,
    object: Post,
    action: PostActions,
  ): Promise<boolean> {
    return false;
  }

  override async filter(context: string) {
    return "post filter" as const;
  }

  override async filterFor(context: string, action: PostActions) {
    return `post filter for ${action}` as const;
  }
}

type CommentActions =
  | "create"
  | "like"
  | "publish"
  | "report"
  | "unlike"
  | "unpublish";
export class CommentPolicy extends PunditPolicy<
  Context,
  Comment,
  CommentActions,
  "comment filter",
  `comment filter for ${CommentActions}`
> {
  constructor() {
    super(Comment);
  }

  override async authorize(
    context: string,
    object: Comment,
    action: CommentActions,
  ): Promise<boolean> {
    return false;
  }

  override async filter(context: string) {
    return "comment filter" as const;
  }

  override async filterFor(context: string, action: CommentActions) {
    return `comment filter for ${action}` as const;
  }
}
