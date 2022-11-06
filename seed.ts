import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: {
      email: 'a',
    },
    create: {
      email: 'a',
      password: 'a',
      sign: -1,
      displayName: 'Xingu'
    },
    update: {}
  });

  await prisma.user.upsert({
    where: {
      email: 'b',
    },
    create: {
      email: 'b',
      password: 'b',
      sign: 1,
      displayName: 'Bogdan'
    },
    update: {},
  });
}

main()
  .then(() => console.log('done'))
  .catch(err => console.error(err));
