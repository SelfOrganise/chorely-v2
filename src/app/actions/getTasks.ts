import { cache } from 'react';
import { prisma } from '../../utils/prisma';
import { scoreToTimes, Positive, Negative } from '../../utils/taskUtils';

export const getTasks = cache(async ({ includeArchived }: { includeArchived?: boolean } = {}) => {
  const tasks = await prisma.task.findMany({
    select: {
      id: true,
      score: true,
      title: true,
      frequency: true,
      archived: true,
      requiresComment: true,
      history: {
        select: {
          createdAt: true,
        },
        take: 1,
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
    where: {
      archived: includeArchived ? undefined : false,
    },
  });

  const users = await prisma.user.findMany({
    select: {
      displayName: true,
      id: true,
      sign: true,
    },
  });

  const positiveUser = users.find(u => u.sign === Positive);
  const negativeUser = users.find(u => u.sign === Negative);

  return tasks.map(t => {
    const assignedUser = t.score < 0 ? positiveUser : negativeUser;

    return {
      ...t,
      times: scoreToTimes(t.score),
      assignedTo: assignedUser,
    };
  });
});
