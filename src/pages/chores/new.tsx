import { useRouter } from 'next/router';
import { FormEvent } from 'react';
import { NextPageWithLayout } from '../_app';
import { getNavLayout } from '../../components/NavLayout';
import { trpc } from '../../utils/trpc';

const NewChore: NextPageWithLayout = () => {
  const router = useRouter();
  const createTask = trpc.tasks.createTask.useMutation();

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <form
        className="mt-5 flex w-72 flex-col space-y-2"
        onSubmit={(form: FormEvent<HTMLFormElement & { title: HTMLInputElement; frequency: HTMLInputElement }>) => {
          createTask.mutateAsync(
            {
              title: form.currentTarget.title.value,
              frequency: Number(form.currentTarget.frequency.value) || undefined,
            },
            {
              onSuccess: () => {
                router.replace('/');
              },
              onError: res => {
                alert('Could not create task. ' + res.message);
              },
            }
          );

          form.preventDefault();
        }}
      >
        <input className="input" autoFocus type="text" name="title" placeholder="Title" />
        <input className="input" type="number" name="frequency" placeholder="Frequency in hours" />
        <button className="btn" type="submit">
          Create
        </button>
      </form>
    </div>
  );
};

NewChore.getLayout = getNavLayout;

export default NewChore;
