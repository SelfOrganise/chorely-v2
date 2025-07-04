'use client';

import classNames from 'classnames';
import Link from 'next/link';
import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { updateTheme } from '../actions/updateTheme';

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

export function NavBar({ name }: { name?: string }): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const showArchived = search.get('showArchived') === 'true';

  const homeButton = (
    <button className="btn-ghost btn-square btn" onClick={pathname !== '/' ? () => router.back() : undefined}>
      {pathname === '/' ? (
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
  );

  const archivedButton = (
    <button
      className={classNames('btn', showArchived ? 'btn-accent' : 'btn-ghost')}
      onClick={() => {
        toast.success(!showArchived ? 'Showing archived tasks' : 'Hiding archived tasks');
        router.replace('/?showArchived=' + !showArchived);
      }}
    >
      <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M9 12C9 11.5341 9 11.3011 9.07612 11.1173C9.17761 10.8723 9.37229 10.6776 9.61732 10.5761C9.80109 10.5 10.0341 10.5 10.5 10.5H13.5C13.9659 10.5 14.1989 10.5 14.3827 10.5761C14.6277 10.6776 14.8224 10.8723 14.9239 11.1173C15 11.3011 15 11.5341 15 12C15 12.4659 15 12.6989 14.9239 12.8827C14.8224 13.1277 14.6277 13.3224 14.3827 13.4239C14.1989 13.5 13.9659 13.5 13.5 13.5H10.5C10.0341 13.5 9.80109 13.5 9.61732 13.4239C9.37229 13.3224 9.17761 13.1277 9.07612 12.8827C9 12.6989 9 12.4659 9 12Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          opacity="0.5"
          d="M20.5 7V13C20.5 16.7712 20.5 18.6569 19.3284 19.8284C18.1569 21 16.2712 21 12.5 21H11.5C7.72876 21 5.84315 21 4.67157 19.8284C3.5 18.6569 3.5 16.7712 3.5 13V7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M2 5C2 4.05719 2 3.58579 2.29289 3.29289C2.58579 3 3.05719 3 4 3H20C20.9428 3 21.4142 3 21.7071 3.29289C22 3.58579 22 4.05719 22 5C22 5.94281 22 6.41421 21.7071 6.70711C21.4142 7 20.9428 7 20 7H4C3.05719 7 2.58579 7 2.29289 6.70711C2 6.41421 2 5.94281 2 5Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    </button>
  );

  const newTaskButton = (
    <Link href="/tasks/new">
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
  );

  const themeSelector = (
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
        className="dropdown-content menu rounded-box menu-compact mt-3 h-[200px] w-52 flex-nowrap overflow-auto bg-base-100 p-2 shadow-sm z-10"
      >
        {themes.map(t => (
          <li className="justify-between" key={t} value={t}>
            <button
              onClick={() =>
                void toast.promise(updateTheme(t), {
                  loading: <span>Updating theme</span>,
                  success: <b>Theme updated</b>,
                  error: <b>Could not update theme</b>,
                })
              }
            >
              {t}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  const timelineButton = (
    <Link href="/timeline">
      <button className="btn-ghost btn">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlSpace="preserve"
          width="20px"
          height="20px"
          fillRule="evenodd"
          strokeLinejoin="round"
          strokeMiterlimit="2"
          clipRule="evenodd"
          viewBox="0 0 512 512"
          className="fill-current"
        >
          <path
            fillRule="nonzero"
            d="M256 208a21 21 0 1 1 0-41 21 21 0 0 1 0 41m0 137a21 21 0 1 1 0-42 21 21 0 0 1 0 42m0 137a21 21 0 1 1 0-42 21 21 0 0 1 0 42m0-452a21 21 0 1 1 0 42 21 21 0 0 1 0-42m51 21a51 51 0 1 0-66 48v40a51 51 0 0 0 0 97v40a51 51 0 0 0 0 97v40a51 51 0 1 0 30 0v-40a51 51 0 0 0 0-97v-40a51 51 0 0 0 0-97V99c21-6 36-25 36-48M140 61c-3 3-6 5-10 5H50c-4 0-7-2-10-5a15 15 0 0 1 0-21c3-3 6-4 10-4h80a15 15 0 0 1 15 15c0 4-2 8-5 10M130 6H50A45 45 0 0 0 5 51a45 45 0 0 0 45 45h80a45 45 0 0 0 45-45 45 45 0 0 0-45-45m10 329c-3 3-6 4-10 4H50c-4 0-7-1-10-4a15 15 0 0 1 0-21c3-3 6-5 10-5h80a15 15 0 0 1 15 15c0 4-2 8-5 11m-10-56H50a45 45 0 0 0-45 45 45 45 0 0 0 45 45h80a45 45 0 0 0 45-45 45 45 0 0 0-45-45m242-102c3-3 6-4 10-4h80a15 15 0 0 1 15 15 15 15 0 0 1-15 15h-80a15 15 0 0 1-15-15c0-4 2-8 5-11m10 56h80a45 45 0 0 0 45-45 45 45 0 0 0-45-45h-80a45 45 0 0 0-45 45 45 45 0 0 0 45 45m90 239c-3 3-6 4-10 4h-80a15 15 0 0 1-15-15 15 15 0 0 1 15-15h80a15 15 0 0 1 15 15c0 4-2 8-5 11m-10-56h-80a45 45 0 0 0-45 45 45 45 0 0 0 45 45h80a45 45 0 0 0 45-45 45 45 0 0 0-45-45M160 142H49a15 15 0 0 0 0 30h111a15 15 0 0 0 0-30m0 61h-50a15 15 0 1 0 0 30h50a15 15 0 0 0 0-30m192 106h111a15 15 0 0 0 0-30H352a15 15 0 0 0 0 30m0 61h50a15 15 0 0 0 0-30h-50a15 15 0 1 0 0 30"
          />
        </svg>
      </button>
    </Link>
  );

  return (
    <div className="navbar bg-base-100 rounded-xl border-solid border-primary/20 border-1">
      <div className="flex-none">{homeButton}</div>
      <div className="flex-1 pl-2 pr-2 text-lg">
        <span className="font-bold">{name}</span>
      </div>
      {timelineButton}
      {archivedButton}
      {newTaskButton}
      {themeSelector}
    </div>
  );
}
