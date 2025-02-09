# Pundit-TS - Plain Typescript Authorization Library

Pundit-TS is an authorization library highly-inspired by the [pundit](https://github.com/varvet/pundit) gem.

<small>
  Pundit-TS is a fully type-safe `pundit` alternative.<br/>
  Here how it auto-completes the actions based on the object you pass:
</small>

https://github.com/user-attachments/assets/02994236-0182-4d84-a8b8-25589a511aad

<br/>

### Use Cases

- Apply RBAC, ABAC, DAC models (see the example snippets below for how to implement)
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

### Installation

```sh
npm i -S pundit-ts
```

### Access Control Models

Here some examples to utilize pundit-ts for applying common access control models like RBAC, ABAC etc..

<details>
<summary>Role-Based Access Control (RBAC)</summary>

```ts
class Policy {
  authorize(ctx, object, action) {
    const isAuthenticated = ctx.actor !== null;
    const role = ctx.actor?.role;
    const isAdmin = role === "admin";
    const isEditor = role === "editor";

    switch (action) {
      case "create":
        return isAdmin || isEditor;
      case "delete":
        return isAdmin;
      case "view":
        return true; // everyone, including anonymous users can view everything
      default:
        return false; // disallow every other action
    }
  }
}
```

</details>

<details>
<summary>Attribute-Based Access Control (ABAC)</summary>

```ts
class Policy {
  authorize(ctx, object, action) {
    // non logged-in users cannot perform any action...
    if (ctx.actor === null) {
      throw new UnauthorizedError();
    }

    const role = ctx.actor.role;
    const isAdmin = role === "admin";
    const isEditor = role === "editor";

    switch (action) {
      case "delete": // only admins can delete the record
        return isAdmin;

      // update permissions
      case "update:content":
        return isAdmin || isEditor;
      case "update:title":
        return isAdmin;

      case "view:content":
      case "view:title":
        return true; // everyone can view title and content

      default:
        return false;
    }
  }
}
```

</details>

<details>
<summary>Discretionary Access Control (DAC)</summary>

Great choice for multi-tenant applications (ie. SaaS applications). Here we use `organization` as our tenant.

```ts
class DocumentPolicy {
  authorize(ctx, object, action) {
    if (ctx.actor === null) {
      return false; // 1. anonymous users cannot perform anything
    }

    const isOrganizationOwner = ctx.actor.id === object.organization.owner_id;

    if (isOrganizationOwner) {
      return true; // 2. organization owner can perform any action
    }

    // 3. check if the actor is member of the related organization
    const member = object.organization.members.findById(ctx.actor.id);

    if (!member) {
      return false;
    }

    switch (action) {
      case "create":
        return member.permissions.canCreateDocument;
      case "update":
        return member.permissions.canUpdateDocument;

      // 4. Even combine with the Attribute-Based Access Control (ABAC) model
      case "update:title":
        return member.permissions.canUpdateDocumentTitle;

      default:
        return false;
    }
  }
}
```

</details>

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
