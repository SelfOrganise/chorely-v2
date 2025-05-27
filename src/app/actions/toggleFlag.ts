'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '../../utils/prisma';

export async function toggleFlag(id: string) {
  const task = await prisma.task.findUnique({
    where: {
      id,
    },
  });

  if (!task) {
    throw new Error('Cannot find task');
  }

  await prisma.task.update({
    where: {
      id,
    },
    data: {
      flagged: !task.flagged,
    },
  });

  revalidatePath(`/tasks/${id}`);
  revalidatePath('/');
}
