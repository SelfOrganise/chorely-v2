'use client';

import classNames from 'classnames';
import moment from 'moment/moment';
import Link from 'next/link';
import { forwardRef, useMemo } from 'react';
import toast from 'react-hot-toast';
import { completeTask } from '../actions/completeTask';
import type { getTasks } from '../actions/getTasks';

const commentIcon = (
  <svg className="h-5 w-5" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g id="Icon-Set" transform="translate(-152.000000, -255.000000)" fill="#000000">
        <path
          d="M168,281 C166.832,281 165.704,280.864 164.62,280.633 L159.912,283.463 L159.975,278.824 C156.366,276.654 154,273.066 154,269 C154,262.373 160.268,257 168,257 C175.732,257 182,262.373 182,269 C182,275.628 175.732,281 168,281 L168,281 Z M168,255 C159.164,255 152,261.269 152,269 C152,273.419 154.345,277.354 158,279.919 L158,287 L165.009,282.747 C165.979,282.907 166.977,283 168,283 C176.836,283 184,276.732 184,269 C184,261.269 176.836,255 168,255 L168,255 Z M175,266 L161,266 C160.448,266 160,266.448 160,267 C160,267.553 160.448,268 161,268 L175,268 C175.552,268 176,267.553 176,267 C176,266.448 175.552,266 175,266 L175,266 Z M173,272 L163,272 C162.448,272 162,272.447 162,273 C162,273.553 162.448,274 163,274 L173,274 C173.552,274 174,273.553 174,273 C174,272.447 173.552,272 173,272 L173,272 Z"
          id="comment-2"
        ></path>
      </g>
    </g>
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

          let comment: string = '';
          if (task.requiresComment) {
            comment = prompt(`Please add a comment for completing "${task?.title}".`);

            if (!comment || comment.length <= 3) {
              alert('Comment must be at least 2 characters long');
              return;
            }
          }

          await toast.promise(completeTask(task.id, comment), {
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
});
