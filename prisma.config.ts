import { defineConfig } from '@prisma/config';
import 'dotenv/config'; // esto carga el .env ANTES de que se evalúe defineConfig

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});