export * from "./profile";
export * from "./showWhen";
export * from "./items";
export * from "./content/common";
export * from "./signs";
export { ABOUT, SIGNS } from "./content/signs";
import type { Item } from "./items";
import { FAKE_CONTENT } from "./content/fake_content";
import { EXTORTION } from "./content/extortion";
import { FRAUD } from "./content/fraud";
import { CYBERBULLYING } from "./content/cyberbullying";
import { UNKNOWN } from "./content/unknown";

export const ITEMS: readonly Item[] = [...FAKE_CONTENT, ...EXTORTION, ...FRAUD, ...CYBERBULLYING, ...UNKNOWN];
