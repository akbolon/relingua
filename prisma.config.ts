import "dotenv/config";
import { defineConfig } from "prisma/config";

const datasourceUrl =
  process.env.DATABASE_URL?.trim() ||
  "postgresql://prisma:prisma@127.0.0.1:5432/_prisma_generate_only?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: datasourceUrl,
  },
});
