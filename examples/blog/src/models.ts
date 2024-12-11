export class User {
  constructor(readonly username: string, readonly isAdmin: boolean = false) {}

  toString() {
    return `User(${this.username}, admin: ${this.isAdmin})`;
  }
}

export class Post {
  constructor(readonly author: User, readonly title: string) {}

  toString() {
    return `Post(title: ${JSON.stringify(this.title)}, author: ${this.author})`;
  }
}
