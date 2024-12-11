# Pundit-TS - Plain Typescript Authorization Library

Pundit-TS is an authorization library highly-inspired by the [pundit](https://github.com/varvet/pundit) gem.



https://github.com/user-attachments/assets/02994236-0182-4d84-a8b8-25589a511aad



### Usage

Install the package first:

```sh
npm i -S pundit-ts
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

export class PostPolicy
  implements PunditPolicy<PolicyContext, Post, PostActions>
{
  async canCreate() {
    return false;
  }

  async canDelete() {
    return false;
  }

  async canUpdate() {
    return false;
  }

  handlesAction(action) {
    return action === "create" || action === "delete" || action === "update";
  }

  handlesModel(object) {
    return object instanceof User;
  }

  filter(ctx) {
    // modify context
  }
}

export class UserPolicy
  implements PunditPolicy<PolicyContext, User, UserActions>
{
  async canCreate() {
    return false;
  }

  async canDelete() {
    return false;
  }

  async canUpdate() {
    return false;
  }

  handlesAction(action) {
    return action === "create" || action === "delete" || action === "update";
  }

  handlesModel(object) {
    return object instanceof User;
  }

  filter(ctx) {
    // modify context
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
