'use server';

import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import invariant from 'tiny-invariant';
import { authOptions } from '../../utils/authOptions';
import { prisma } from '../../utils/prisma';

export async function completeTask(id: string) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  invariant(userId, 'Missing userId');

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

  await prisma.task.update({
    where: {
      id,
    },
    data: {
      score: task.score + user.sign,
    },
  });

  await prisma.history.create({
    data: {
      taskId: id,
      userId,
    },
  });

  revalidatePath('/');
}
