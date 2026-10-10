import { createBot } from "./bot";
import { loadEnv } from "./env";

const env = loadEnv();
const bot = createBot(env);
// Long-polling for the demo; webhook mode is a pilot item. One instance only.
void bot.start({ onStart: () => console.log("SafeChilds bot: long-polling") });
