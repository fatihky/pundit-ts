import { describe, expect, it } from "vitest";
import { Pundit, PunditPolicy } from "../";
import { CommentPolicy, PostPolicy } from "./policies";
import type { Context } from "./context";
import { Like, Post } from "./entities";

describe("pundit", () => {
  const pundit = new Pundit<Context>()
    .register(new PostPolicy())
    .register(new CommentPolicy());

  it("should authorize post instance", async () => {
    await expect(
      pundit.authorize("ctx", new Post(), "like"),
    ).resolves.not.throws(Error);
  });

  it("should not authorize if the entity class is not known", async () => {
    await expect(
      pundit.authorize("ctx", new Like("postLike") as any, "like"),
    ).rejects.throws(Error, /No policy found for model/);
  });

  it("should build filter for known entity class", async () => {
    const filter = await pundit.filter("ctx", Post);

    expect(filter).toBe("post filter");
  });

  it("should not build filter for an unknown entity class", async () => {
    expect(pundit.filter("ctx", Like)).rejects.throws(
      Error,
      /No policy found for model/,
    );
  });

  it("should build a specific filter for an action", async () => {
    const filter = await pundit.filterFor("ctx", Post, "list");

    expect(filter).toBe("post filter for list");
  });

  it("should not build a specific filter for an action", async () => {
    expect(pundit.filterFor("ctx", Like as any, "create")).rejects.throws(
      Error,
      /No policy found for model/,
    );
  });
});
