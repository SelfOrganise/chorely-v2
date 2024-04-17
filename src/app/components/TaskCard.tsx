'use client';

import classNames from 'classnames';
import moment from 'moment/moment';
import Link from 'next/link';
import { forwardRef, useMemo } from 'react';
import toast from 'react-hot-toast';
import { completeTask } from '../actions/completeTask';
import type { getTasks } from '../actions/getTasks';

export const TaskCard = forwardRef(({ task }: { task: Awaited<ReturnType<typeof getTasks>>[number] }): JSX.Element => {
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

    const dueDate = date.clone().add('hours', task.frequency);
    if (dueDate.isSameOrAfter(new Date())) {
      return defaultDate;
    }

    const timeLate = moment.duration(dueDate.diff(moment()));

    return <div className="text-xs font-semibold text-error">{timeLate.humanize()} late</div>;
  }, [lastCompleted, task.frequency]);

  return (
    <Link
      key={task.id}
      className={classNames(
        task.archived && 'grayscale opacity-50',
        'indicator relative flex w-full cursor-pointer items-center justify-between rounded bg-base-300/70 pb-2 pt-2 pl-3 pr-3 font-semibold shadow-md hover:bg-base-300'
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
        onClick={async event => {
          event.stopPropagation();
          event.preventDefault();

          await toast.promise(completeTask(task.id), {
            loading: <span>Completing {task?.title}</span>,
            success: <b>Completed {task?.title}</b>,
            error: <b>Could not complete {task?.title}</b>,
          });
        }}
      >
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
      </button>
    </Link>
  );
});
