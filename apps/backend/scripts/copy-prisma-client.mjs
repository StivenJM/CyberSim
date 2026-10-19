import { cp } from 'node:fs/promises'

// TypeScript no emite los archivos JavaScript del cliente generado por Prisma.
// Conservar también su package.json y runtime para que funcione desde dist.
await cp(
	new URL('../src/generated/prisma/', import.meta.url),
	new URL('../dist/generated/prisma/', import.meta.url),
	{ recursive: true },
)
