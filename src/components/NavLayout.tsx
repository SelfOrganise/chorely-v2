import React, { ReactElement, useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { NavBar } from './NavBar';
import { useRouter } from 'next/router';

export function NavLayout({ children }: React.PropsWithChildren): JSX.Element {
  const [theme, setTheme] = useState('cupcake');

  useEffect(() => {
    setTheme(old => window.localStorage.getItem('theme') || old);
  }, []);

  return (
    <main data-theme={theme} className="container flex min-h-screen min-w-full flex-col items-center p-4">
      <Toaster
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            fontSize: '12px',
          },
        }}
      />
      <div className="w-full max-w-xl">
        <NavBar
          theme={theme}
          onThemeChange={(t: string) => {
            localStorage.setItem('theme', t);
            setTheme(t);
          }}
        />
        <div className="flex w-full flex-col items-center">{children}</div>
      </div>
    </main>
  );
}

export const getNavLayout = (page: ReactElement) => <NavLayout>{page}</NavLayout>;
