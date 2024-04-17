'use server';

import { prisma } from '../../../../utils/prisma';
import { scoreToTimes } from '../../../../utils/taskUtils';

export async function getTask({ id }: { id: string }) {
  const task = await prisma.task.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      title: true,
      frequency: true,
      score: true,
      archived: true,
      history: {
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              displayName: true,
            },
          },
        },
      },
    },
  });

  if (!task) {
    return task;
  }

  return {
    ...task,
    times: scoreToTimes(task.score),
  };
}
