import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Generar el cliente no requiere conexión; los comandos de BD sí exigen URL.
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
})
