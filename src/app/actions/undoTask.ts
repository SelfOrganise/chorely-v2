'use server';

import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import invariant from 'tiny-invariant';
import { authOptions } from '../../utils/authOptions';
import { prisma } from '../../utils/prisma';

export async function undoTask(id: string) {
  const session = await getServerSession(authOptions);
  invariant(session?.user?.id, "User ID can't be null");

  await undoTaskInternal(id, session.user.id);

  revalidatePath(`/tasks/${id}`);
  revalidatePath('/');
}

export async function undoLastTask() {
  const lastTask = await prisma.history.findFirst({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: true,
      task: true,
    },
  });

  invariant(lastTask, 'Cannot find last task.');

  await undoTaskInternal(lastTask.id, lastTask.user.id);

  return lastTask.task;
}

export async function undoTaskInternal(id: string, userId: string) {
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
  invariant(history.user.id === userId, 'Cannot find history item.');

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
}
