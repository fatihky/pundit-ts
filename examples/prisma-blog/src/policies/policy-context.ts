import { PrismaClient, User } from "@prisma/client";

export class PolicyContext {
  constructor(
    readonly prisma: PrismaClient,
    readonly actor: User | null = null
  ) {}
}
