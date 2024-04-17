'use server';

import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { authOptions } from '../../utils/authOptions';
import { prisma } from '../../utils/prisma';

export async function updateTheme(theme: string) {
  const session = await getServerSession(authOptions);

  await prisma.user.updateMany({
    where: {
      id: session?.user?.id,
    },
    data: {
      theme,
    },
  });

  revalidatePath('/');
}
