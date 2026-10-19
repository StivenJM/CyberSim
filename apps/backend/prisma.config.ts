import 'dotenv/config'
import { defineConfig } from 'prisma/config'

const configuredUrl =
	process.env.DIRECT_URL ||
	process.env.DATABASE_URL ||
	(process.env.PGHOST
		? `postgresql://${encodeURIComponent(process.env.PGUSER || 'postgres')}:${encodeURIComponent(process.env.PGPASSWORD || 'postgres')}@${process.env.PGHOST}:${process.env.PGPORT || '5432'}/${process.env.PGDATABASE || 'cybersim'}`
		: undefined)

export default defineConfig({
	schema: 'prisma/schema.prisma',
	migrations: {
		path: 'prisma/migrations',
	},
	datasource: {
		// Generar el cliente no requiere conexión; los comandos de BD sí exigen URL.
		url: configuredUrl,
	},
})
