import { PrismaClient, type User } from "@prisma/client";
import { punditMatchNothing } from "pundit-ts";
import { Post } from "./entities/Post";
import { pundit } from "./policies";
import { PolicyContext } from "./policies/policy-context";
import type { PostActions } from "./policies/post.policy";

async function check(
  prisma: PrismaClient,
  actor: User | null,
  post: Post,
  action: PostActions,
) {
  const context = new PolicyContext(prisma, actor);
  const isAuthorized = await pundit.authorize(context, post, action);

  console.log("\n#### Authorization Check");
  console.log("Actor:", actor);
  console.log("Post:", post);
  console.log("Action:", action);
  console.log("Is Authorized:", isAuthorized);
}

async function filterPosts(prisma: PrismaClient, actor: User | null) {
  const context = new PolicyContext(prisma, actor);
  const filter = await pundit.filter(context, Post);
  const posts =
    filter === punditMatchNothing ? [] : await prisma.post.findMany(filter);

  console.log("\n#### Filter Posts");
  console.log("Actor:", actor);
  console.log("Filter:", filter);
  console.log("Filtered posts:", posts);
}

async function main() {
  const prisma = new PrismaClient();

  try {
    const user1 = await prisma.user.findFirst({ where: { id: 1 } });
    const user2 = await prisma.user.findFirst({ where: { id: 2 } });
    const post1 = await prisma.post.findFirst({ where: { id: 1 } });
    const post2 = await prisma.post.findFirst({ where: { id: 2 } });

    console.log("\nQuery posts");

    if (user1) {
      await filterPosts(prisma, user1);
    }

    if (user2) {
      await filterPosts(prisma, user2);
    }

    await filterPosts(prisma, null); // anonymous user

    console.log("\nCheck actions");

    if (post1) {
      await check(prisma, user1, post1, "update");
      await check(prisma, user2, post1, "update");
    }

    if (post2) {
      await check(prisma, user1, post2, "update");
      await check(prisma, user2, post2, "update");
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
