import Head from 'next/head';
import { useRouter } from 'next/router';
import { NextPageWithLayout } from './_app';
import { getNavLayout } from '../components/NavLayout';
import { AppRouterTypes, trpc } from '../utils/trpc';
import { useSession } from 'next-auth/react';
import { forwardRef, useEffect } from 'react';
import OneSignal from 'react-onesignal';
import moment from 'moment';
import InternalFlipMove from 'react-flip-move';
import toast from 'react-hot-toast';

const FlipMove: any = InternalFlipMove;

const Home: NextPageWithLayout = () => {
  const session = useSession();
  const tasks = trpc.tasks.getTasks.useQuery();
  const tasksAssignedToMe = tasks.data?.filter(t => t.assignedTo?.id === session.data?.user?.id);
  const otherTasks = tasks.data?.filter(t => t.assignedTo?.id !== session.data?.user?.id);

  useEffect(() => {
    if (!session.data?.user?.id) {
      return;
    }

    OneSignal.setExternalUserId(session.data?.user?.id);
  }, [session.data?.user?.id]);

  return (
    <>
      <div className="relative w-full space-y-5">
        <FlipMove typeName={null}>
          <div className="divider">My tasks</div>
          {tasksAssignedToMe?.map(t => (
            <Chore task={t} key={t.id} />
          ))}
          <div className="divider">Not my problem</div>
          {otherTasks?.map(t => (
            <Chore task={t} key={t.id} />
          ))}
        </FlipMove>
      </div>
    </>
  );
};

Home.getLayout = getNavLayout;

// eslint-disable-next-line react/display-name
const Chore = forwardRef(
  ({ task }: { task: AppRouterTypes['tasks']['getTasks']['output'][number] }, ref: any): JSX.Element => {
    const completeTask = trpc.tasks.completeTask.useMutation();
    const { push } = useRouter();
    const utils = trpc.useContext();

    const lastCompleted = task.history?.[0]?.createdAt ? moment(task.history?.[0]?.createdAt).fromNow() : null;

    return (
      <div
        key={task.id}
        ref={ref}
        className="indicator relative flex w-full cursor-pointer items-center justify-between rounded bg-base-300/70 pb-2 pt-2 pl-3 pr-3 font-semibold shadow-md hover:bg-base-300"
        onClick={() => push(`/chores/${task.id}`)}
      >
        <div className="w-full">
          <span className="text-base-content/70">{task.title}</span>
          {lastCompleted && <div className="text-xs font-thin text-base-content/50">{lastCompleted}</div>}
        </div>
        {task.times > 1 && (
          <span className="badge-secondary badge indicator-start indicator-item indicator-top"> {task.times}</span>
        )}
        <button
          className="btn-ghost btn-square btn right-0 ml-2 bg-base-content/10"
          onClick={event => {
            toast.promise(
              completeTask.mutateAsync({ id: task.id }, { onSuccess: () => utils.tasks.getTasks.invalidate() }),
              {
                loading: <span>Completing {task?.title}</span>,
                success: <b>Completed {task?.title}</b>,
                error: <b>Could not complete {task?.title}</b>,
              }
            );
            event.stopPropagation();
            event.preventDefault();
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
      </div>
    );
  }
);

export default Home;
