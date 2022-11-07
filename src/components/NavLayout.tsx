import React, { ReactElement, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {Toaster} from "react-hot-toast";

const themes = [
  'light',
  'dark',
  'cupcake',
  'bumblebee',
  'emerald',
  'corporate',
  'synthwave',
  'retro',
  'cyberpunk',
  'valentine',
  'halloween',
  'garden',
  'forest',
  'aqua',
  'lofi',
  'pastel',
  'fantasy',
  'wireframe',
  'black',
  'luxury',
  'dracula',
  'cmyk',
  'autumn',
  'business',
  'acid',
  'lemonade',
  'night',
  'coffee',
  'winter',
];

export function NavLayout({ children }: React.PropsWithChildren): JSX.Element {
  const session = useSession();
  const [theme, setTheme] = useState('cupcake');
  const router = useRouter();

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
        <div className="navbar bg-base-100">
          <div className="flex-none">
            <button className="btn-ghost btn-square btn" onClick={() => router.asPath !== '/' && router.push('/')}>
              {router.asPath === '/' ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              )}
            </button>
          </div>
          <div className="flex-1 pl-2 pr-2 text-lg">
            <span>
              Hello <span className="font-bold">{session.data?.user?.name}</span>
            </span>
          </div>
          <Link className="btn-ghost btn" href="/chores/new">
            <button className="btn-ghost btn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </button>
          </Link>
          <div className="dropdown-end dropdown">
            <label tabIndex={0} className="btn-ghost btn-circle avatar btn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
                />
              </svg>
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu rounded-box menu-compact mt-3 h-[200px] w-52 flex-nowrap overflow-auto bg-base-100 p-2 shadow"
            >
              {themes.map(t => (
                <li
                  onClick={() => {
                    localStorage.setItem('theme', t);
                    setTheme(t);
                  }}
                  className="justify-between"
                  key={t}
                  value={t}
                >
                  <a>{t}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex w-full flex-col items-center">{children}</div>
      </div>
    </main>
  );
}

export const getNavLayout = (page: ReactElement) => <NavLayout>{page}</NavLayout>;
