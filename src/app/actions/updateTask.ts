'use server';

import { Task } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import invariant from 'tiny-invariant';
import { prisma } from '../../utils/prisma';

export async function updateTask(task: Partial<Task>) {
  invariant(task?.id, 'Task id must be set.');

  await prisma.task.update({
    where: {
      id: task.id,
    },
    data: task,
  });

  revalidatePath('/');
}
