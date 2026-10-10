import { loadEnv } from "./env";
import { buildApp } from "./server";

const env = loadEnv();
const app = await buildApp(env);
await app.listen({ port: env.PORT, host: "0.0.0.0" });
app.log.info(`SafeChilds backend on :${env.PORT}`);
