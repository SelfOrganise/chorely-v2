'use server';

import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import invariant from 'tiny-invariant';
import { authOptions } from '../../utils/authOptions';
import { prisma } from '../../utils/prisma';

export async function completeTask(id: string, comment: string) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  invariant(userId, 'Missing userId');

  return await completeTaskInternal(userId, id, comment);
}

export async function completeTaskInternal(userId: string, id: string, comment: string) {
  const task = await prisma.task.findUnique({
    where: {
      id,
    },
  });

  invariant(task, 'Cannot find task');

  const users = await prisma.user.findMany();
  const user = users.find(u => u.id === userId);
  const otherUser = users.find(u => u.id !== userId);

  invariant(user, 'Cannot find user');
  invariant(otherUser, 'Cannot find user');

  const newTimesLeft = task.timesLeft ? task.timesLeft - 1 : null;

  await prisma.task.update({
    where: {
      id,
    },
    data: {
      score: task.score + user.sign,
      flagged: false,
      archived: newTimesLeft === 0,
      // note: when we reach 0, remove timesLeft
      timesLeft: newTimesLeft === 0 ? null : newTimesLeft,
    },
  });

  await prisma.history.create({
    data: {
      taskId: id,
      userId,
      comment,
    },
  });

  revalidatePath('/');
}
