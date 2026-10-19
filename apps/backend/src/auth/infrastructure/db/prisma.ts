import { databaseUrl } from '../../../integrations/config.js';
import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../../generated/prisma/client.js'
import type { Prisma } from '../../../generated/prisma/index.js'

declare global {
  var prisma: PrismaClient | undefined
}

const adapter = new PrismaPg({ connectionString: databaseUrl() })

const clientOptions: Prisma.PrismaClientOptions = {
  adapter,
  log: ['error'] as Prisma.LogLevel[],
}

export const prisma = global.prisma || new PrismaClient(clientOptions)

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

process.on('beforeExit', async () => {
  await prisma.$disconnect()
})
