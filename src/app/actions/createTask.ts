'use server';

import { Task } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { prisma } from '../../utils/prisma';

export async function createTask(task: Pick<Task, 'title' | 'frequency'>) {
  await prisma.task.create({
    data: task,
  });

  revalidatePath('/');
}
