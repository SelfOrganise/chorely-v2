'use server';

import '../styles/globals.css';

import React from 'react';
import { Toaster } from 'react-hot-toast';
import invariant from 'tiny-invariant';
import { NavBar } from './components/NavBar';
import { getCurrentUser } from './actions/getCurrentUser';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  invariant(user, 'Cannot determine current user');

  return (
    <html lang="en">
      <body>
        <main
          data-theme={user.theme}
          className="container flex h-screen min-w-full flex-col items-center p-4 bg-gradient-to-b from-secondary/10 to-primary/20"
        >
          <Toaster
            toastOptions={{
              style: {
                background: '#333',
                color: '#fff',
                fontSize: '12px',
              },
            }}
          />
          <div className="w-full h-full overflow-y-auto max-w-xl">
            <NavBar name={user.displayName} />
            <div className="flex w-full flex-col items-center">{children}</div>
          </div>
        </main>
      </body>
    </html>
  );
}
