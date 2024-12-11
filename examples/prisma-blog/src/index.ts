import { Post, PrismaClient, User } from "@prisma/client";
import { PostActions } from "./policies/post.policy";
import { PolicyContext } from "./policies/policy-context";
import { pundit } from "./policies";

async function check(
  prisma: PrismaClient,
  actor: User | null,
  post: Post,
  action: PostActions
) {
  const context = new PolicyContext(prisma, actor);
  const isAuthorized = await pundit.authorize(context, post, action);

  console.log("\n#### Authorization Check");
  console.log("Actor:", actor);
  console.log("Post:", post);
  console.log("Action:", action);
  console.log("Is Authorized:", isAuthorized);
}

async function main() {
  const prisma = new PrismaClient();

  try {
    const user1 = await prisma.user.findFirst({ where: { id: 1 } });
    const user2 = await prisma.user.findFirst({ where: { id: 2 } });
    const post1 = await prisma.post.findFirst({ where: { id: 1 } });
    const post2 = await prisma.post.findFirst({ where: { id: 2 } });

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
