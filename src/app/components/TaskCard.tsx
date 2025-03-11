'use client';

import classNames from 'classnames';
import moment from 'moment/moment';
import Link from 'next/link';
import React, { useMemo } from 'react';
import toast from 'react-hot-toast';
import { completeTask } from '../actions/completeTask';
import type { getTasks } from '../actions/getTasks';

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

export const TaskCard = ({ task }: { task: Awaited<ReturnType<typeof getTasks>>[number] }): React.JSX.Element => {
  const lastCompleted = task.history?.[0]?.createdAt;

  const date = useMemo(() => {
    if (!lastCompleted) {
      return null;
    }

    const date = moment(lastCompleted);
    const defaultDate = <div className="text-xs font-thin text-base-content/50">{date.fromNow()}</div>;

    if (!task.frequency || task.frequency <= 0) {
      return defaultDate;
    }

    const dueDate = date.clone().add(task.frequency, 'hours');
    if (dueDate.isSameOrAfter(new Date())) {
      return defaultDate;
    }

    const timeLate = moment.duration(dueDate.diff(moment()));

    return <div className="text-xs font-semibold text-error">{timeLate.humanize()} late</div>;
  }, [lastCompleted, task.frequency]);

  return (
    <Link
      key={task.id}
      scroll={true}
      className={classNames(
        task.archived && 'grayscale opacity-50',
        'indicator relative flex w-full cursor-pointer items-center justify-between rounded-sm bg-base-300/70 pb-2 pt-2 pl-3 pr-3 font-semibold shadow-md hover:bg-base-300'
      )}
      href={`/tasks/${task.id}`}
    >
      <div className="w-full">
        <span className="text-base-content/70">{task.title}</span>
        {date}
      </div>
      {task.times > 1 && (
        <span className="indicator-start badge-secondary badge indicator-item indicator-top">{task.times}</span>
      )}
      <button
        className="btn-ghost btn-square btn right-0 ml-2 bg-base-content/10"
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
      </button>
    </Link>
  );
};
