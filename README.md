# Pundit-TS - Plain Typescript Authorization Library

Pundit-TS is an authorization library highly-inspired by the [pundit](https://github.com/varvet/pundit) gem.

<small>
  Pundit-TS is a fully type-safe `pundit` alternative.<br/>
  Here how it auto-completes the actions based on the object you pass:
</small>

https://github.com/user-attachments/assets/c7815622-c1c9-4fbe-986e-6c9f88c8b31d

<br/>

### Use Cases

- **Check if a user is authorized** to perform an action on an entity (ie. Post, Product, Category etc..)
- **Declare actions** can be performed per entity class basis
  - UserActions: create, update
  - PostActions: create, publish, unpublish, update, delete
  - CategoryActions: create, update, delete
- **Filter entities** on database to avoid unnecessary database queries
  - Apply joins, specific `where` clauses or similar things to filter database rows.
- **Apply user tiers:** only premium users can add more than 3 seats to their organization.
- **Avoid code duplication:** Keep your authorization logic in one place. Use whenever you need them. Change one place to affect rest of the code.

### Examples

**Blog**: Plain typescript blog example. Has no relation with a database. Great starting point if you are just starting to use pundit-ts

**Prisma Blog**: Prisma ORM based blog example. Advanced version of the plain blog example. Uses Prisma ORM for querying database, utilizes `PostPolicy#filter` for building argument for `prisma.post.findMany` method.

### Usage

Install the package first:

```sh
npm i -S pundit-ts
```

### Authorize users

Encapsulate your authorization logic behind your `PunditPolicy` implementations. Reuse those policies when you need. Manage your authorization logic from one place.

```diff
const currentUser = {}; // get user from cookies, headers, jwt etc...

// update post

// fetch post from db
const post = await prisma.post.findFirst({ where: { id: 123 } });

- if (post.authorId === currentUser.id) {
-   // update logic...
- }
+ if (await pundit.authorize(currentUser, post, 'update')) {
+   // update logic...
+ }
```

### Filter entitites

Pundit-TS is a ORM-agnostic library. You may use your choice of ORM, query builder or anything.

```diff
-prisma.post.findMany({ /* your arguments  */ })
+prisma.post.findMany(pundit.filter(context, Post))
```

Declare your models.

```typescript
// models.ts
class User {}

class Post {}
```

Declare your actions for each model.

```typescript
// actions.ts
export type UserActions = "create" | "delete" | "update";
export type PostActions = "create" | "delete" | "update";
```

Declare your policies

```typescript
// policies.ts
import { PunditPolicy } from "pundit-ts";
import { Post, User } from "./models";
import { PostActions, UserActions } from "./actions";

export class PolicyContext {
  // your orm related properties might go here
}

export class PostPolicy extends PunditPolicy<PolicyContext, Post, PostActions> {
  constructor() {
    super(Post);
  }

  authorize(context, post, action) {
    switch (action) {
      case "create":
        return true;
      case "delete":
        return false; // to be implemented...
      case "update":
        return false; // to be implemented...
    }
  }

  filter(ctx) {
    // modify context
  }
}

export class UserPolicy extends PunditPolicy<PolicyContext, User, UserActions> {
  constructor() {
    super(User);
  }

  authorize(context, post, action) {
    switch (action) {
      case "create":
        return true;
      case "delete":
        return false; // to be implemented...
      case "update":
        return false; // to be implemented...
    }
  }

  filter(ctx) {
    // modify context or return some filter object...
  }
}
```

Create your Pundit instance:

```typescript
// pundit.ts
import { Pundit } from "pundit-ts";
import { PostPolicy, UserPolicy } from "./policies";

export const pundit = new Pundit<PolicyContext>()
  .register(new UserPolicy())
  .register(new PostPolicy());
```

Authorize your actions in a fully type-safe way.

```typescript
// index.ts
import { PolicyContext } from "./policies";
import { Post } from "./models";
import { pundit } from "./pundit";

const ctx = new PolicyContext();
const post = new Post();

await pundit.authorize(ctx, post, "create");
```
