export * from "./profile";
export * from "./showWhen";
export * from "./items";
export * from "./content/common";
import type { Item } from "./items";
import { FAKE_CONTENT } from "./content/fake_content";
import { EXTORTION } from "./content/extortion";

// Fraud and cyberbullying content are written by the content people against the schema in README.md.
export const ITEMS: readonly Item[] = [...FAKE_CONTENT, ...EXTORTION];
