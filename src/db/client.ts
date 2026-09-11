import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { validateEnvironment } from "@/config/environment";

const env = validateEnvironment();

// For query operations in Server Components / Actions
const queryClient = postgres(env.DATABASE_URL);

export const db = drizzle(queryClient, { schema });
