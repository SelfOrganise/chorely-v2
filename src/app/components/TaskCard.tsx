'use client';

import classNames from 'classnames';
import moment from 'moment/moment';
import Link from 'next/link';
import React, { useMemo } from 'react';
import toast from 'react-hot-toast';
import { completeTask } from '../actions/completeTask';
import type { getTasks } from '../actions/getTasks';
import { toggleFlag } from '../actions/toggleFlag';

const commentIcon = (
  <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <polyline strokeWidth="1.2px" fill="none" stroke="currentColor" points="7.23 9.11 11.04 12.93 17.73 6.25" />
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2px"
      d="M18.68,1.48H5.32A3.82,3.82,0,0,0,1.5,5.3v9.54a3.82,3.82,0,0,0,3.82,3.82H9.14L12,21.52l2.86-2.86h3.82a3.82,3.82,0,0,0,3.82-3.82V5.3A3.82,3.82,0,0,0,18.68,1.48Z"
    />
  </svg>
);

const checkIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="h-6 w-6"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const flagIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
    <path
      className="fill-current"
      fillRule="evenodd"
      d="M5 1.3c.4 0 .8.3.8.7v1l1.5-.2a9 9 0 0 1 5.4.5h.2c1.4.6 3 .7 4.4.3a2 2 0 0 1 2.4 2v7.3c0 1-.6 1.9-1.6 2l-.2.1c-2 .5-4 .4-5.8-.3a8 8 0 0 0-4.5-.5l-1.8.4V22a.8.8 0 0 1-1.5 0V2c0-.4.3-.8.7-.8ZM5.8 13l1.5-.3a9 9 0 0 1 5.4.5 8 8 0 0 0 4.8.3h.3c.2-.1.4-.4.4-.7V5.5c0-.3-.2-.5-.5-.4a9 9 0 0 1-5.4-.4h-.2a8 8 0 0 0-4.5-.5l-1.8.4v8.5Z"
      clipRule="evenodd"
    />
  </svg>
);

export const TaskCard = ({ task }: { task: Awaited<ReturnType<typeof getTasks>>[number] }): React.JSX.Element => {
  const lastCompleted = task.history?.[0]?.createdAt;

  const date = useMemo(() => {
    if (!lastCompleted) {
      return null;
    }

    const date = moment(lastCompleted);

    return <div className="text-xs font-thin text-base-content/70">{date.fromNow()}</div>;
  }, [lastCompleted]);

  return (
    <Link
      key={task.id}
      scroll={true}
      className={classNames(
        task.archived && 'grayscale opacity-50',
        task.flagged && 'bg-warning/20',
        'card flex flex-row w-full cursor-pointer items-center justify-between bg-base-100 border-solid border-primary/20 border-1 py-3 px-3 hover:bg-base-300'
      )}
      href={`/tasks/${task.id}`}
    >
      <div className="flex text-2xl justify-center items-center ml-2 mr-4">
        <span className="z-10">{task.icon || '❓'}</span>
        <span className="absolute text-4xl blur-lg opacity-60 mask mask-squircle">{task.icon || '❓'}</span>
      </div>
      <div className="w-full">
        <span className="text-base-content tracking-tight">{task.title}</span>
        {date}
      </div>
      <button
        className={classNames('btn-ghost btn-square btn right-0 ml-2')}
        onClick={event => {
          event.stopPropagation();
          event.preventDefault();

          void toast.promise(toggleFlag(task.id), {
            loading: <span>Flagging {task?.title}</span>,
            success: <b>Flagged {task?.title}</b>,
            error: <b>Could not flag {task?.title}</b>,
          });
        }}
      >
        <span className={task.flagged ? 'text-error' : 'text-base-content/20'}>{flagIcon}</span>
      </button>
      <button
        className="indicator btn-ghost btn-square btn right-0 ml-2 bg-accent/10"
        onClick={event => {
          event.stopPropagation();
          event.preventDefault();

          let comment: string | null = '';
          if (task.requiresComment) {
            comment = prompt(`Please add a comment for completing "${task?.title}".`);

            if (comment === null) {
              return;
            }

            if (comment.length <= 3) {
              alert('Comment must be at least 3 characters long, mate.');
              return;
            }
          }

          void toast.promise(completeTask(task.id, comment), {
            loading: <span>Completing {task?.title}</span>,
            success: <b>Completed {task?.title}</b>,
            error: <b>Could not complete {task?.title}</b>,
          });
        }}
      >
        {task.requiresComment ? commentIcon : checkIcon}
        {task.times > 1 && (
          <span className="indicator-start badge-secondary badge badge-xs indicator-item indicator-top text-xs">
            {task.times}
          </span>
        )}
      </button>
    </Link>
  );
};
