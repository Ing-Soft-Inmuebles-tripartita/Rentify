// Purpose: Comparte el cliente Prisma y evita instancias duplicadas en desarrollo.
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Reutiliza el cliente durante las recargas en desarrollo para no agotar conexiones.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.PRISMA_LOG_QUERIES === 'true'
        ? ['query', 'warn', 'error']
        : ['warn', 'error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma