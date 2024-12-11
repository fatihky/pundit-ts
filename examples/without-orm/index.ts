import { Pundit } from "../..";
import { PunditPolicy } from "../..";

// [START Models]
export class User {
  constructor(readonly username: string) {}
}

export class Post {
  constructor(readonly title: string, readonly body: string) {}
}
// [END Models]

export class PolicyContext {
  constructor(readonly seed: number) {}
}

export type UserActions = "create" | "update";

export class UserPolicy
  implements PunditPolicy<PolicyContext, User, UserActions>
{
  async canCreate() {
    return false;
  }

  async canUpdate() {
    return false;
  }

  async filter(context: PolicyContext): Promise<void> {
    // this is usually introduces some .where calls on the underlying ORM/querying library
  }

  handlesAction(action: unknown): action is UserActions {
    return action === "create" || action === "update";
  }

  handlesModel(object: User): object is User {
    return object instanceof User;
  }
}

export type PostActions = "create";

export class PostPolicy
  implements PunditPolicy<PolicyContext, Post, PostActions>
{
  async canCreate() {
    return false;
  }

  async filter() {
    // this is usually introduces some .where calls on the underlying ORM/querying library
  }

  handlesAction(action: unknown): action is PostActions {
    return action === "create";
  }

  handlesModel(object: Post): object is Post {
    return object instanceof Post;
  }
}

export type CommentActions = "approve" | "create" | "delete" | "update";

export class Comment {
  constructor(public contents: string) {}
}

const pundit = new Pundit<PolicyContext>()
  .register(new UserPolicy())
  .register(new PostPolicy());

pundit.authorize(new PolicyContext(123), new Post("test", "test"), "create");
