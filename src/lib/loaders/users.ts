import { userSchema } from "@validation/user";
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";

export function createUsersCollection() {
  return defineCollection({
    loader: glob({
      pattern: "**/[^_]*.json",
      base: "./src/data/users",
    }),
    schema: userSchema,
  });
}
