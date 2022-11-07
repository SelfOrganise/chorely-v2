import { protectedProcedure, publicProcedure, router } from '../trpc';
import { z } from 'zod';
import * as OneSignal from 'onesignal-node';

const Positive = 1;
const Negative = -1;

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const signal = new OneSignal.Client(process.env.ONE_SIGNAL_APP!, process.env.ONE_SIGNAL_KEY!);

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

    if (!history) {
      throw new Error('Cannot find history item.');
    }

    if (history.user.id !== ctx.session.user.id) {
      throw new Error('Cannot find history item.');
    }

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
    const users = await ctx.prisma.user.findMany();

    const result = tasks.map(t => {
      const assignedUser = t.score < 0 ? users.find(u => u.sign === Positive) : users.find(u => u.sign === Negative);

      return {
        ...t,
        times: t.score < 0 ? Math.abs(t.score) : t.score + 1,
        assignedTo: assignedUser,
      };
    });

    return result;
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
      times: task.score < 0 ? Math.abs(task.score) : task.score + 1,
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

      if (!task) {
        throw new Error('Cannot find task');
      }

      const times = task.score < 0 ? Math.abs(task.score) : task.score + 1;

      const users = await ctx.prisma.user.findMany();
      const user = users.find(u => u.id === ctx.session.user.id);
      const otherUser = users.find(u => u.id !== ctx.session.user.id);

      if (!user || !otherUser) {
        throw new Error('Cannot find task or user.');
      }

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
      const heading = !isAssignedToUser || times > 1 ? `${user.displayName} completed ${task.title}` : `${task.title} was assigned to you`;
      const content = isAssignedToUser
        ? times > 1
          ? `They have ${times - 1} turns left`
          : `${user.displayName} completed the task`
        : `You now have to complete the task ${times + 1} times`;

      await signal
        .createNotification({
          chrome_web_icon: 'https://todo.3pounds.cyou/favicon.ico',
          headings: { en: heading },
          url: `https://demo.3pounds.cyou/chores/${task.id}`,
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
});
