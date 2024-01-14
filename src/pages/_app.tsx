/* eslint-disable @typescript-eslint/no-explicit-any */

// src/pages/_app.tsx
import '../styles/globals.css';
import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';
import type { AppType } from 'next/app';
import { ReactElement, ReactNode } from 'react';
import { NextPage } from 'next';

import { trpc } from '../utils/trpc';
import { useOneSignal } from '../hooks';

export type NextPageWithLayout<P = Record<string, unknown>, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

const MyApp: AppType<{ session: Session | null }> = ({ Component, pageProps: { session, ...pageProps } }) => {
  useOneSignal();

  // Use the layout defined at the page level, if available
  const getLayout = (Component as any).getLayout ?? ((page: JSX.Element) => page);

  return <SessionProvider session={session}>{getLayout(<Component {...pageProps} />)}</SessionProvider>;
};

export default trpc.withTRPC(MyApp);
