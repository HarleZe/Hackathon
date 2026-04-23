import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

/**
 * Client Prisma Singleton.
 * Assure qu'une seule instance de Prisma est utilisée dans l'application, 
 * évitant ainsi les fuites de connexions en mode développement (Hot Reload).
 */
const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
