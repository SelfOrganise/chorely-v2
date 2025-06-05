'use client';

import { useRouter } from 'next/navigation';
import React, { FormEvent } from 'react';
import { createTask } from '../../../actions/createTask';
import { getUsers } from '../../../actions/getUsers';

export function NewTask({ users }: { users: Awaited<ReturnType<typeof getUsers>> }) {
  const router = useRouter();

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <form
        className="mt-5 flex w-full flex-col space-y-3"
        onSubmit={(
          form: FormEvent<
            HTMLFormElement & {
              title: HTMLInputElement;
              description: HTMLTextAreaElement;
              icon: HTMLInputElement;
              timesLeft: HTMLInputElement;
              assignedTo: HTMLSelectElement;
            }
          >
        ) => {
          form.preventDefault();

          void (async function () {
            await createTask({
              title: form.currentTarget.title.value,
              description: form.currentTarget.description.value,
              icon: form.currentTarget.icon.value,
              timesLeft: form.currentTarget.timesLeft.valueAsNumber || null,
              assignedTo: form.currentTarget.assignedTo.value,
            });

            router.replace('/');
          })();
        }}
      >
        <div className="grid grid-cols-[1fr_4fr] gap-2">
          <input className="input-bordered input" type="text" name="icon" placeholder="Icon" />
          <input className="input-bordered input w-full" autoFocus type="text" name="title" placeholder="Title" />
          <textarea name="description" className="textarea w-full p-4 col-span-2" placeholder="Description"></textarea>
          <input
            className="input-bordered input col-span-2 w-full"
            type="number"
            name="timesLeft"
            placeholder="Nr. of completion times before archival"
          />
          <label className="label">Assigned to:</label>
          <select className="select w-full col-start-2" name="assignedTo">
            <option value="">Default</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.displayName}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            className="btn-secondary btn"
            onClick={event => {
              event.preventDefault();
              router.replace('/');
            }}
          >
            Cancel
          </button>
          <button className="btn-primary btn" type="submit">
            Create
          </button>
        </div>
      </form>
    </div>
  );
}
