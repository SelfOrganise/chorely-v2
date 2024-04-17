'use server';

import { revalidatePath } from 'next/cache';
import invariant from 'tiny-invariant';
import { prisma } from '../../utils/prisma';

export async function deleteTask(id: string) {
  invariant(id, 'Task id must be set.');

  await prisma.task.delete({
    where: {
      id,
    },
  });

  revalidatePath('/');
}
