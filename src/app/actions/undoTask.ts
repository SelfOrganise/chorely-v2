'use server';

import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import invariant from 'tiny-invariant';
import { authOptions } from '../../utils/authOptions';
import { prisma } from '../../utils/prisma';

export async function undoTask(id: string) {
  const session = await getServerSession(authOptions);
  const history = await prisma.history.findUnique({
    where: {
      id,
    },
    select: {
      task: {
        select: {
          id: true,
          score: true,
        },
      },
      user: {
        select: {
          id: true,
          sign: true,
        },
      },
    },
  });

  invariant(history, 'Cannot find history item.');
  invariant(history.user.id === session?.user?.id, 'Cannot find history item.');

  await prisma.task.update({
    where: {
      id: history.task.id,
    },
    data: {
      score: history.task.score - history.user.sign,
    },
  });

  await prisma.history.delete({
    where: {
      id,
    },
  });

  revalidatePath(`/tasks/${id}`);
  revalidatePath('/');
}
