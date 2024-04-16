import { pairRouter } from './router/pair';
import { publicProcedure, router } from './trpc';
 
export const appRouter = router({
  pair: pairRouter
});
 
// Export only the type of a router!
// This prevents us from importing server code on the client.
export type AppRouter = typeof appRouter;