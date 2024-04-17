'use server';

import { revalidatePath } from 'next/cache';
import invariant from 'tiny-invariant';
import { prisma } from '../../utils/prisma';

export async function toggleArchived(id: string) {
  const task = await prisma.task.findUnique({
    where: {
      id,
    },
  });

  invariant(task, 'Cannot find task');

  await prisma.task.update({
    where: {
      id,
    },
    data: {
      archived: !task.archived,
    },
  });

  revalidatePath(`/tasks/${id}`);
  revalidatePath('/');
}
