import { Prisma } from "@prisma/client";
import { punditMatchNothing, PunditPolicy } from "pundit-ts";
import { Post } from "../entities/Post";
import { PolicyContext } from "./policy-context";

export type PostActions = "create" | "update";

export class PostPolicy extends PunditPolicy<
  PolicyContext,
  Post,
  PostActions,
  Prisma.PostFindManyArgs
> {
  authorize(context: PolicyContext, post: Post, action: PostActions): boolean {
    switch (action) {
      case "create":
        return context.actor?.isAdmin || post.authorId === context.actor?.id;
      case "update":
        return context.actor?.isAdmin || post.authorId === context.actor?.id;
    }
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
