# Blog example using pundit-ts

In this example, we let admins to create/update posts freely while the non-admin users allowed to create and update only their own posts.

Example output:

```
### Users
User(admin, admin: true)
User(john.doe, admin: false)
User(jane.doe, admin: false)

### Posts
Post(title: "Blog 1", author: User(admin, admin: true))
Post(title: "Post 2", author: User(john.doe, admin: false))
Post(title: "Post 3", author: User(jane.doe, admin: false))

### Authorization Checks

### Perfom check ###
Actor: User(admin, admin: true)
Post: Post(title: "Post 2", author: User(john.doe, admin: false))
Action: update
Is Authorized: true

### Perfom check ###
Actor: User(john.doe, admin: false)
Post: Post(title: "Post 2", author: User(john.doe, admin: false))
Action: update
Is Authorized: true

### Perfom check ###
Actor: User(jane.doe, admin: false)
Post: Post(title: "Post 2", author: User(john.doe, admin: false))
Action: update
Is Authorized: false
```
