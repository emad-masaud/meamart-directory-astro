import { atom } from "nanostores";
import { persistentAtom } from "@nanostores/persistent";

export const search = atom("");

export const tags = atom([]);

// Persist locale in localStorage
export const locale = persistentAtom("locale", "en", {
  encode: JSON.stringify,
  decode: JSON.parse,
});
