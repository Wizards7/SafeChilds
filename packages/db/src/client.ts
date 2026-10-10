// One pooled client per process. The backend creates it once at boot and passes it through the tRPC context.

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type Db = ReturnType<typeof createDb>;

export function createDb(url: string) {
  const sql = postgres(url, { max: 10, prepare: false });
  return drizzle(sql, { schema });
}

export { schema };
