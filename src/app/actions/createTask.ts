'use server';

import { Task } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { prisma } from '../../utils/prisma';

export async function createTask({
  assignedTo,
  ...task
}: Pick<Task, 'title' | 'icon' | 'timesLeft'> & { assignedTo?: string }) {
  const user = await prisma.user.findFirst({
    where: {
      id: assignedTo,
    },
  });

  // ugly-hack: user sign values are 1 or -1. A task with score 0 is implicitly assigned to the negative user.
  // if we set score to user.sign of 1 then the task will be assigned twice to the negative users
  // by using Math.min we ensure the task is assigned once
  // note: the sign needs to be negated
  const score = user && user.sign ? Math.min(0, -user.sign) : undefined;

  await prisma.task.create({
    data: {
      ...task,
      score,
      flagged: !!assignedTo,
    },
  });

  revalidatePath('/');
}
