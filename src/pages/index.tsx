import Head from 'next/head';
import { useRouter } from 'next/router';
import { NextPageWithLayout } from './_app';
import { getNavLayout } from '../components/NavLayout';
import { trpc } from '../utils/trpc';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import OneSignal from 'react-onesignal';

const Home: NextPageWithLayout = () => {
  const session = useSession();
  const { push } = useRouter();
  const utils = trpc.useContext();
  const tasks = trpc.tasks.getTasks.useQuery();
  const completeTask = trpc.tasks.completeTask.useMutation();
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
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {tasksAssignedToMe?.map(t => {
        return (
          <div
            key={t.id}
            className="relative flex w-full cursor-pointer items-center justify-between rounded bg-base-200 pt-2 pb-2 pl-3 pr-3 font-semibold shadow-md hover:bg-base-300"
            onClick={() => push(`/chores/${t.id}`)}
          >
            <span className="text-base-content text-opacity-80">{t.title}</span>
            {t.times > 1 && (
              <div className="absolute -top-2 -left-2 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-accent/80  text-xs font-bold text-accent-content dark:border-gray-900">
                {t.times}
              </div>
            )}
            <button
              className="btn-ghost btn-square btn right-0 bg-base-content bg-opacity-5 ml-2"
              onClick={event => {
                completeTask.mutateAsync({ id: t.id }, { onSuccess: () => utils.tasks.getTasks.invalidate() });
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
      })}
      <div className="divider">Not my problem</div>
      {otherTasks?.map(t => {
        return (
          <div
            key={t.id}
            className="relative flex w-full cursor-pointer items-center justify-between rounded bg-base-200 pt-2 pb-2 pl-3 pr-3 font-semibold shadow-md hover:bg-base-300"
            onClick={() => push(`/chores/${t.id}`)}
          >
            <span className="text-base-content text-opacity-80">{t.title}</span>
            {t.times > 1 && (
              <div className="absolute -top-2 -left-2 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-accent/80  text-xs font-bold text-accent-content dark:border-gray-900">
                {t.times}
              </div>
            )}
            <button
              className="btn-ghost btn-square btn right-0 bg-base-content bg-opacity-5 ml-2"
              onClick={event => {
                completeTask.mutateAsync({ id: t.id }, { onSuccess: () => utils.tasks.getTasks.invalidate() });
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
      })}
    </>
  );
};

Home.getLayout = getNavLayout;

export default Home;
