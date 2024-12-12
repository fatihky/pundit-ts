import { Prisma } from "@prisma/client";
import { punditMatchNothing, PunditPolicy } from "pundit-ts";
import { Post } from "../entities/Post";
import { PolicyContext } from "./policy-context";

export type PostActions = "create" | "update";

export class PostPolicy
  implements
    PunditPolicy<PolicyContext, Post, PostActions, Prisma.PostFindManyArgs>
{
  async canCreate(context: PolicyContext, post: Post) {
    // users may only create posts on their behalf.
    return context.actor?.isAdmin || post.authorId === context.actor?.id;
  }

  async canUpdate(context: PolicyContext, post: Post) {
    // users may only update their own posts
    return context.actor?.isAdmin || post.authorId === context.actor?.id;
  }

  filter(context: PolicyContext) {
    if (!context.actor) return punditMatchNothing;

    return {
      include: { author: true },
      where: { authorId: context.actor?.id },
    } satisfies Prisma.PostFindManyArgs;
  }

  handlesAction(action: unknown): action is PostActions {
    return action === "create" || action === "update";
  }

  handlesModel(object: unknown): object is Post {
    return true; // cannot perform instanceof check here
  }

  handlesModelConstructor(cons: unknown): cons is new () => Post {
    return cons === Post;
  }
}
