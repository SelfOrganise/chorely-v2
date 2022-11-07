import { publicProcedure, router } from '../trpc';
import { z } from 'zod';

export const usersRouter = router({
  signup: publicProcedure
    .input(
      z.object({
        email: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      throw new Error('NotImplemented');
    }),
});
