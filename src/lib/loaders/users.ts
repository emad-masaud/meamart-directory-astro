import { userSchema } from "@validation/user";
import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "zod";

export function createUsersCollection() {
  return defineCollection({
    loader: glob({
      pattern: "**/[^_]*.json",
      base: "./src/data/users",
    }),
    schema: userSchema,
  });
}
