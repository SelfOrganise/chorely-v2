import { cache } from 'react';
import { prisma } from '../../utils/prisma';

export const getTimeline = cache(async () => {
  const historyItems = await prisma.history.findMany({
    select: {
      id: true,
      createdAt: true,
      task: {
        select: {
          title: true,
        },
      },
      user: {
        select: {
          id: true,
          displayName: true,
        },
      },
    },
    take: 50,
    orderBy: {
      createdAt: 'desc',
    },
  });

  return historyItems;
});

export type TimelineItem = Awaited<ReturnType<typeof getTimeline>>[number];
