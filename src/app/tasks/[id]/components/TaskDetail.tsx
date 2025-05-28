'use client';

import classNames from 'classnames';
import React, { MouseEventHandler } from 'react';
import moment from 'moment/moment';
import { FormEvent } from 'react';
import toast from 'react-hot-toast';
import { deleteTask } from '../../../actions/deleteTask';
import { toggleArchived } from '../../../actions/toggleArchived';
import { undoTask } from '../../../actions/undoTask';
import { updateTask } from '../../../actions/updateTask';
import type { getTask } from '../../../actions/getTask';
import { useRouter } from 'next/navigation';

export function TaskDetail({
  task,
  userId,
}: {
  task?: NonNullable<Awaited<ReturnType<typeof getTask>>>;
  userId?: string;
}) {
  const router = useRouter();

  const handleArchive: MouseEventHandler<HTMLButtonElement> = event => {
    event.preventDefault();
    if (!task) {
      return;
    }

    if (!confirm(`Archive "${task?.title}"?`)) {
      return;
    }

    void toast.promise(toggleArchived(task.id), {
      loading: (
        <span>
          {task?.archived ? 'Unarchiving' : 'Archiving'} {task?.title}
        </span>
      ),
      success: (
        <b>
          {task?.archived ? 'Unarchived' : 'Archived'} {task?.title}
        </b>
      ),
      error: <b>Could not toggleArchived {task?.title}</b>,
    });
  };

  const handleDelete: MouseEventHandler<HTMLButtonElement> = event => {
    event.preventDefault();
    if (!task) {
      return;
    }

    if (!confirm(`Delete "${task?.title}"?`)) {
      return;
    }

    void (async function () {
      await toast.promise(deleteTask(task?.id), {
        loading: <span>Deleting {task?.title}...</span>,
        success: <b>Deleted {task?.title}</b>,
        error: <b>Could not delete {task?.title}</b>,
      });

      router.replace('/');
    })();
  };

  return (
    <div className="w-full">
      <div className="divider">Actions</div>
      <div className="grid grid-cols-3 gap-2">
        <button
          className={classNames(!task && 'skeleton', 'btn-secondary btn flex flex-1')}
          disabled={!task}
          onClick={event => {
            event.preventDefault();
            router.back();
          }}
        >
          ⬅️ Back
        </button>
        <button
          disabled={!task}
          className={classNames(!task && 'skeleton', 'btn-warning btn flex flex-1')}
          onClick={handleArchive}
        >
          {task?.archived ? 'Unarchive' : 'Archive'}
        </button>
        <button
          disabled={!task}
          className={classNames(!task && 'skeleton', 'btn-error btn flex flex-1')}
          onClick={handleDelete}
        >
          ❌ Delete
        </button>
      </div>

      <div className="divider">Edit task</div>

      <form
        className="relative flex flex-col space-y-3 pb-4"
        onSubmit={(
          form: FormEvent<
            HTMLFormElement & {
              icon: HTMLInputElement;
              title: HTMLInputElement;
              description: HTMLTextAreaElement;
              'required-comment': HTMLInputElement;
            }
          >
        ) => {
          form.preventDefault();

          void toast.promise(
            updateTask({
              id: task?.id,
              icon: form.currentTarget.icon.value,
              title: form.currentTarget.title.value,
              description: form.currentTarget.description.value,
              requiresComment: form.currentTarget['required-comment'].checked,
            }),
            {
              loading: <span>Updating {task?.title}</span>,
              success: <b>Updated {task?.title}</b>,
              error: <b>Could not update {task?.title}</b>,
            }
          );
        }}
      >
        <div className="indicator gap-2">
          <input
            disabled={!task}
            className={classNames(!task && 'skeleton', 'input-bordered input w-full flex-1/4')}
            type="text"
            name="icon"
            placeholder="Icon"
            defaultValue={task?.icon}
          />
          <input
            disabled={!task}
            className={classNames(!task && 'skeleton', 'input-bordered input w-full')}
            type="text"
            name="title"
            placeholder="Title"
            defaultValue={task?.title}
          />
          {task && task?.times > 1 && (
            <div className="indicator-start badge-secondary badge indicator-item indicator-top">{task?.times}</div>
          )}
        </div>
        <div>
          <textarea
            name="description"
            defaultValue={task?.description}
            className="textarea w-full p-4"
            placeholder="Description"
          ></textarea>
        </div>
        <div className="self-end flex align-middle items-center justify-between">
          <div className="space-x-2">
            <label htmlFor="required-comment" className="select-none">
              Requires comment:
            </label>
            <input
              disabled={!task}
              id="required-comment"
              className={classNames(!task && 'skeleton', 'checkbox')}
              type="checkbox"
              defaultChecked={task?.requiresComment}
            />
          </div>
        </div>
        <div className="grid">
          <button
            className={classNames(!task && 'skeleton', 'btn-primary btn flex flex-1')}
            disabled={!task}
            type="submit"
          >
            💾 Save
          </button>
        </div>
      </form>

      <div className="divider">History</div>

      <div className="w-full">
        <table className="table-zebra table-compact table w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th className="text-center">Date</th>
              <th>Comment</th>
              <th className="w-2 text-center">Undo</th>
            </tr>
          </thead>
          <tbody>
            {!task && <HistorySkeleton />}
            {task?.history.map(h => {
              return (
                <tr key={h.createdAt.getTime()}>
                  <td>{h.user.displayName}</td>
                  <td className="text-center">{moment(h.createdAt).fromNow()}</td>
                  <td>{h.comment}</td>
                  <td className="w-fit">
                    {h.user.id === userId && (
                      <button
                        className="btn-ghost btn"
                        onClick={() => {
                          void toast.promise(undoTask(h.id), {
                            loading: <span>Undoing previous completion</span>,
                            success: <b>Undo complete</b>,
                            error: <b>Could not undo</b>,
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
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                          />
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HistorySkeleton() {
  return (
    <React.Fragment>
      <tr>
        <td>
          <div className="skeleton w-full h-4"></div>
        </td>
        <td>
          <div className="skeleton w-full h-4"></div>
        </td>
        <td>
          <div className="skeleton w-full h-4"></div>
        </td>
      </tr>
      <tr>
        <td>
          <div className="skeleton w-full h-4"></div>
        </td>
        <td>
          <div className="skeleton w-full h-4"></div>
        </td>
        <td>
          <div className="skeleton w-full h-4"></div>
        </td>
      </tr>
      <tr>
        <td>
          <div className="skeleton w-full h-4"></div>
        </td>
        <td>
          <div className="skeleton w-full h-4"></div>
        </td>
        <td>
          <div className="skeleton w-full h-4"></div>
        </td>
      </tr>
      <tr>
        <td>
          <div className="skeleton w-full h-4"></div>
        </td>
        <td>
          <div className="skeleton w-full h-4"></div>
        </td>
        <td>
          <div className="skeleton w-full h-4"></div>
        </td>
      </tr>
    </React.Fragment>
  );
}
