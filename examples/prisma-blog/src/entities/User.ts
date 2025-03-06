import type { User as PrismaUser } from "@prisma/client";

export class User {
  public id: number;
  public email: string;
  public isAdmin: boolean;

  constructor({
    id,
    email,
    isAdmin,
  }: {
    id: number;
    email: string;
    isAdmin: boolean;
  }) {
    this.id = id;
    this.email = email;
    this.isAdmin = isAdmin;
  }

  static fromPrisma(user: PrismaUser): User {
    return new User({ id: user.id, email: user.email, isAdmin: user.isAdmin });
  }
}
