import { protectedProcedure, router } from '../trpc';
import { z } from 'zod';
import * as OneSignal from 'onesignal-node';
import { scoreToTimes } from '../../../utils/taskUtils';
import invariant from 'tiny-invariant';

const Positive = 1;
const Negative = -1;

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const signal = new OneSignal.Client(process.env.NEXT_PUBLIC_ONE_SIGNAL_APP!, process.env.ONE_SIGNAL_KEY!);

export const tasksRouter = router({
  createTask: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        frequency: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.task.create({
        data: input,
      });
    }),

  updateTask: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        frequency: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.task.update({
        where: {
          id: input.id,
        },
        data: input,
      });
    }),

  deleteTask: protectedProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
    await ctx.prisma.task.delete({
      where: {
        id: input,
      },
    });
  }),

  undoTask: protectedProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
    const history = await ctx.prisma.history.findUnique({
      where: {
        id: input,
      },
      select: {
        task: {
          select: {
            id: true,
            score: true,
          },
        },
        user: {
          select: {
            id: true,
            sign: true,
          },
        },
      },
    });

    invariant(history, 'Cannot find history item.');
    invariant(history.user.id === ctx.session.user.id, 'Cannot find history item.');

    await ctx.prisma.task.update({
      where: {
        id: history.task.id,
      },
      data: {
        score: history.task.score - history.user.sign,
      },
    });

    await ctx.prisma.history.delete({
      where: {
        id: input,
      },
    });
  }),

  getTasks: protectedProcedure.query(async ({ ctx }) => {
    const tasks = await ctx.prisma.task.findMany({
      select: {
        id: true,
        score: true,
        title: true,
        frequency: true,
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
    });
    const users = await ctx.prisma.user.findMany({
      select: {
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
  }),

  getTask: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const task = await ctx.prisma.task.findUnique({
      where: {
        id: input,
      },
      select: {
        id: true,
        title: true,
        frequency: true,
        score: true,
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
  }),

  completeTask: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const task = await ctx.prisma.task.findUnique({
        where: {
          id: input.id,
        },
      });

      invariant(task, 'Cannot find task');

      const times = task.score < 0 ? Math.abs(task.score) : task.score + 1;

      const users = await ctx.prisma.user.findMany();
      const user = users.find(u => u.id === ctx.session.user.id);
      const otherUser = users.find(u => u.id !== ctx.session.user.id);

      invariant(user, 'Cannot find user');
      invariant(otherUser, 'Cannot find user');

      await ctx.prisma.task.update({
        where: {
          id: input.id,
        },
        data: {
          score: task.score + user.sign,
        },
      });

      await ctx.prisma.history.create({
        data: {
          taskId: input.id,
          userId: ctx.session.user.id,
        },
      });

      const assignedUser = task.score < 0 ? users.find(u => u.sign === Positive) : users.find(u => u.sign === Negative);
      const isAssignedToUser = assignedUser?.id === user.id;
      const [heading, content] = isAssignedToUser
        ? times > 1
          ? [
              `??? Task completed (${times - 1}x left)`,
              `${user.displayName} completed ${task.title}. They have (${times - 1}) turns left.`,
            ]
          : [`?????? You have a new task`, `${task.title} is now assigned to you.`]
        : [`??? Task completed by ${user.displayName}`, `You now have to complete ${task.title} (${times + 1}) times.`];

      await signal
        .createNotification({
          headings: { en: heading },
          url: `${process.env.NEXTAUTH_URL}/chores/${task.id}`,
          contents: {
            en: content,
          },
          include_external_user_ids: [otherUser.id],
        })
        .then(async () => {
          console.log(`Notified: ${otherUser.email} - ${otherUser.id}`);
        })
        .catch(console.error);
    }),

  sendReminder: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const task = await ctx.prisma.task.findUnique({
        where: {
          id: input.id,
        },
      });

      invariant(task, 'Cannot find task');

      const users = await ctx.prisma.user.findMany();
      const assignedUser = task.score < 0 ? users.find(u => u.sign === Positive) : users.find(u => u.sign === Negative);

      invariant(assignedUser, 'Cannot find assignedUser');

      await signal
        .createNotification({
          headings: { en: `???? Task reminder` },
          url: `${process.env.NEXTAUTH_URL}/chores/${task.id}`,
          contents: {
            en: `${task.title} is ready to be started`,
          },
          include_external_user_ids: [assignedUser.id],
        })
        .then(async () => {
          console.log(`Notified: ${assignedUser.email} - ${assignedUser.id}`);
        })
        .catch(console.error);
    }),
});
