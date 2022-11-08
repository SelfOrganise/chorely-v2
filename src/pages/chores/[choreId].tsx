import { useRouter } from 'next/router';
import { NextPageWithLayout } from '../_app';
import { getNavLayout } from '../../components/NavLayout';
import { trpc } from '../../utils/trpc';
import moment from 'moment';
import { FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

const ChoreDetail: NextPageWithLayout = () => {
  const router = useRouter();
  const session = useSession();
  const context = trpc.useContext();
  const chore = trpc.tasks.getTask.useQuery(router?.query?.choreId as string, {
    enabled: Boolean(router.query.choreId),
    cacheTime: 0,
  });
  const updateChore = trpc.tasks.updateTask.useMutation();
  const deleteChore = trpc.tasks.deleteTask.useMutation();
  const undoChore = trpc.tasks.undoTask.useMutation();
  const sendReminder = trpc.tasks.sendReminder.useMutation();

  if (!chore?.data) {
    return <p>Loading...</p>;
  }

  return (
    <div className="w-full">
      <div className="divider">Actions</div>
      <div className="grid grid-cols-2 gap-2">
        <button className="btn-secondary btn flex flex-1" onClick={() => router.back()}>
          Back
        </button>
        <button
          className="btn-secondary btn flex flex-1"
          onClick={() =>
            toast.promise(
              sendReminder.mutateAsync({
                id: chore.data!.id,
              }),
              {
                loading: <span>Sending reminder</span>,
                success: <b>Reminder sent</b>,
                error: <b>Cannot send reminder</b>,
              }
            )
          }
        >
          Send reminder
        </button>
      </div>

      <div className="divider">Edit task</div>

      <form
        className="relative flex flex-col space-y-3 pb-4"
        onSubmit={(form: FormEvent<HTMLFormElement & { title: HTMLInputElement; frequency: HTMLInputElement }>) => {
          toast.promise(
            updateChore.mutateAsync({
              id: chore.data!.id,
              title: form.currentTarget.title.value,
              frequency: Number(form.currentTarget.frequency.value) || undefined,
            }),
            {
              loading: <span>Updating {chore.data?.title}</span>,
              success: <b>Updated {chore.data?.title}</b>,
              error: <b>Could not update {chore.data?.title}</b>,
            }
          );

          form.preventDefault();
        }}
      >
        <div className="indicator w-full">
          <input
            className="input-bordered input w-full"
            type="text"
            name="title"
            placeholder="Title"
            defaultValue={chore.data.title}
          />
          {chore.data.times > 1 && (
            <div className="indicator-start badge-secondary badge indicator-item indicator-top">{chore.data.times}</div>
          )}
        </div>
        <input
          className="input-bordered input"
          type="number"
          name="frequency"
          placeholder="Frequency in hours"
          defaultValue={chore.data.frequency || undefined}
        />
        <div className="grid grid-cols-2 gap-2">
          <button
            className="btn-secondary btn flex flex-1"
            onClick={event => {
              if (confirm(`Are you sure you want to delete '${chore.data?.title}'.`)) {
                toast.promise(deleteChore.mutateAsync(chore.data!.id, { onSuccess: () => router.push('/') }), {
                  loading: <span>Deleting {chore.data?.title}</span>,
                  success: <b>Deleted {chore.data?.title}</b>,
                  error: <b>Could not delete {chore.data?.title}</b>,
                });

                event.preventDefault();
              }
            }}
          >
            Delete
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
            {chore.data?.history.map(h => {
              return (
                <tr key={h.createdAt.getTime()}>
                  <td>{h.user.displayName}</td>
                  <td className="text-center">{moment(h.createdAt).fromNow()}</td>
                  <td className="w-fit">
                    {h.user.id === session.data?.user?.id && (
                      <button
                        className="btn-ghost btn"
                        onClick={() => {
                          toast.promise(
                            undoChore.mutateAsync(h.id, {
                              onSuccess: () => {
                                context.tasks.getTask.invalidate(chore.data!.id);
                              },
                            }),
                            {
                              loading: <span>Undoing previous completion</span>,
                              success: <b>Undo complete</b>,
                              error: <b>Could not undo</b>,
                            }
                          );
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
};

ChoreDetail.getLayout = getNavLayout;

export default ChoreDetail;
