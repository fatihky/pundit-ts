export class Post {}
export class Comment {}
export class Like {
  constructor(public kind: "postLike" | "commentLike") {}
}
