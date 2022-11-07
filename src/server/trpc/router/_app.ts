// src/server/trpc/router/_app.ts
import { router } from '../trpc';
import { authRouter } from './auth';
import { usersRouter } from './users';
import { tasksRouter } from './tasks';

export const appRouter = router({
  auth: authRouter,
  users: usersRouter,
  tasks: tasksRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
