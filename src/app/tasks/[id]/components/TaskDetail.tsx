'use client';

import moment from 'moment/moment';
import { FormEvent } from 'react';
import toast from 'react-hot-toast';
import { deleteTask } from '../../../actions/deleteTask';
import { toggleArchived } from '../../../actions/toggleArchived';
import { undoTask } from '../../../actions/undoTask';
import { updateTask } from '../../../actions/updateTask';
import type { getTask } from '../actions/getTask';
import { useRouter } from 'next/navigation';

export function TaskDetail({
  task,
  userId,
}: {
  task: NonNullable<Awaited<ReturnType<typeof getTask>>>;
  userId?: string;
}) {
  const router = useRouter();

  return (
    <div className="w-full">
      <div className="divider">Actions</div>
      <div className="grid grid-cols-2 gap-2">
        <button
          className="btn-secondary btn flex flex-1"
          onClick={async event => {
            event.preventDefault();
            await toast.promise(toggleArchived(task.id), {
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
          }}
        >
          {task.archived ? 'Unarchive' : 'Archive'}
        </button>
        <button
          className="btn-error btn flex flex-1"
          onClick={async event => {
            event.preventDefault();
            if (!confirm(`Delete ${task.title}`)) {
              return;
            }

            await toast.promise(deleteTask(task.id), {
              loading: <span>Deleting {task?.title}...</span>,
              success: <b>Deleted {task?.title}</b>,
              error: <b>Could not delete {task?.title}</b>,
            });

            router.replace('/');
          }}
        >
          Delete
        </button>
      </div>

      <div className="divider">Edit task</div>

      <form
        className="relative flex flex-col space-y-3 pb-4"
        onSubmit={async (
          form: FormEvent<HTMLFormElement & { title: HTMLInputElement; frequency: HTMLInputElement }>
        ) => {
          form.preventDefault();

          await toast.promise(
            updateTask({
              id: task.id,
              title: form.currentTarget.title.value,
              frequency: Number(form.currentTarget.frequency.value) || undefined,
            }),
            {
              loading: <span>Updating {task.title}</span>,
              success: <b>Updated {task.title}</b>,
              error: <b>Could not update {task.title}</b>,
            }
          );
        }}
      >
        <div className="indicator w-full">
          <input
            className="input-bordered input w-full"
            type="text"
            name="title"
            placeholder="Title"
            defaultValue={task.title}
          />
          {task.times > 1 && (
            <div className="indicator-start badge-secondary badge indicator-item indicator-top">{task.times}</div>
          )}
        </div>
        <input
          className="input-bordered input"
          type="number"
          name="frequency"
          placeholder="Frequency in hours"
          defaultValue={task.frequency || undefined}
        />
        <div className="grid grid-cols-2 gap-2">
          <button
            className="btn-secondary btn flex flex-1"
            onClick={event => {
              event.preventDefault();
              router.back();
            }}
          >
            Back
          </button>
          <button className="btn-primary btn flex flex-1" type="submit">
            Save
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
              <th className="w-2 text-center">Undo</th>
            </tr>
          </thead>
          <tbody>
            {task?.history.map(h => {
              return (
                <tr key={h.createdAt.getTime()}>
                  <td>{h.user.displayName}</td>
                  <td className="text-center">{moment(h.createdAt).fromNow()}</td>
                  <td className="w-fit">
                    {h.user.id === userId && (
                      <button
                        className="btn-ghost btn"
                        onClick={async () => {
                          await toast.promise(undoTask(h.id), {
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