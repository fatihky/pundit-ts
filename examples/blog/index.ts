import { Post, User } from "./src/models";
import { PolicyContext, pundit } from "./src/policies";
import type { PostActions } from "./src/policies/post.policy";

console.log("### Users");

const admin = new User("admin", true);
const john = new User("john.doe", false);
const jane = new User("jane.doe", false);

// User#toString will be utilized
console.log(admin.toString());
console.log(john.toString());
console.log(jane.toString());

console.log("\n### Posts");

const post1 = new Post(admin, "Post 1");
const post2 = new Post(john, "Post 2");
const post3 = new Post(jane, "Post 3");

console.log(post1.toString());
console.log(post2.toString());
console.log(post3.toString());

console.log("\n### Authorization Checks");

main();

async function main() {
  await check(admin, post2, "update");
  await check(john, post2, "update");
  await check(jane, post2, "update");
}

async function check(user: User, post: Post, action: PostActions) {
  const context = new PolicyContext(user);

  console.log("\n### Perfom check ###");
  console.log("Actor:", user.toString());
  console.log("Post:", post.toString());
  console.log("Action:", action);

  console.log("Is Authorized:", await pundit.authorize(context, post, action));
}

const context = new PolicyContext(admin);

pundit.authorize(context, john, "create");

pundit.authorize(context, post1, "publish");
