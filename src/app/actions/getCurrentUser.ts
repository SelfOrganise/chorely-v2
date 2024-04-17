import { getServerSession } from 'next-auth';
import { authOptions } from '../../utils/authOptions';
import { prisma } from '../../utils/prisma';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  return prisma.user.findFirstOrThrow({
    where: {
      id: session?.user?.id,
    },
  });
}
