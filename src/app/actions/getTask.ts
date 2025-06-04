'use server';

import { notFound } from 'next/navigation';
import { cache } from 'react';
import { prisma } from '../../utils/prisma';
import { scoreToTimes } from '../../utils/taskUtils';

export const getTask = cache(async ({ id }: { id: string }) => {
  const task = await prisma.task.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      icon: true,
      title: true,
      description: true,
      frequency: true,
      score: true,
      archived: true,
      requiresComment: true,
      history: {
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          createdAt: true,
          comment: true,
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
    notFound();
  }

  return {
    ...task,
    times: scoreToTimes(task.score),
  };
});
