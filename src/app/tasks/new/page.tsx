'use client';

import { useRouter } from 'next/navigation';
import { FormEvent } from 'react';
import { createTask } from '../../actions/createTask';

export default function NewTask() {
  const router = useRouter();

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <form
        className="mt-5 flex w-full flex-col space-y-3"
        onSubmit={async (
          form: FormEvent<HTMLFormElement & { title: HTMLInputElement; frequency: HTMLInputElement }>
        ) => {
          form.preventDefault();
          await createTask({
            title: form.currentTarget.title.value,
            frequency: Number(form.currentTarget.frequency.value) || null,
          });

          router.replace('/');
        }}
      >
        <input className="input-bordered input" autoFocus type="text" name="title" placeholder="Title" />
        <input className="input-bordered input" type="number" name="frequency" placeholder="Frequency in hours" />
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
