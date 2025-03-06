import type { Post as PrismaPost } from "@prisma/client";

export class Post {
  public id: number;
  public authorId: number;
  public content: string | null;
  public title: string;

  constructor({
    id,
    authorId,
    content,
    title,
  }: {
    id: number;
    authorId: number;
    content: string | null;
    title: string;
  }) {
    this.id = id;
    this.authorId = authorId;
    this.content = content;
    this.title = title;
  }

  static fromPrisma(post: PrismaPost): Post {
    return new Post({
      id: post.id,
      authorId: post.authorId,
      content: post.content,
      title: post.title,
    });
  }
}
