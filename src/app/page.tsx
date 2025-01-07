import { getServerSession } from 'next-auth';
import { Suspense, ReactNode } from 'react';
import { authOptions } from '../utils/authOptions';
import { TaskCard } from './components/TaskCard';
import { getTasks } from './actions/getTasks';

export default async function Tasks({ searchParams }: { searchParams: Promise<{ showArchived?: string }> }) {
  const { showArchived } = await searchParams;
  const includeArchived = showArchived === 'true';
  return (
    <div className="relative w-full space-y-5">
      <div className="divider">My tasks</div>
      <Suspense fallback={<Skeleton />}>
        <MyTasks includeArchived={includeArchived} filterCurrentSession={true} />
      </Suspense>
      <div className="divider">Not my problem</div>
      <Suspense fallback={<Skeleton />}>
        <MyTasks includeArchived={includeArchived} filterCurrentSession={false} />
      </Suspense>
    </div>
  );
}

async function MyTasks({
  includeArchived,
  filterCurrentSession,
}: {
  includeArchived: boolean;
  filterCurrentSession: boolean;
}) {
  const items = await getTasks({ includeArchived });
  const session = await getServerSession(authOptions);
  const filteredItems = items.filter(i =>
    filterCurrentSession ? i.assignedTo?.id === session?.user?.id : i.assignedTo?.id !== session?.user?.id
  );

  return filteredItems.map(item => <TaskCard key={item.id} task={item} />);
}

function Skeleton(): Array<ReactNode> {
  return Array<ReactNode>(5).fill(
    <div className="skeleton flex flex-row pl-3 pr-3 rounded w-full h-16 items-center">
      <div className="flex flex-col pt-2 pb-2 w-full h-full justify-around">
        <div className="skeleton-text w-1/2 h-4 rounded backdrop-contrast-75" />
        <div className="skeleton-text w-1/4 h-4 rounded backdrop-contrast-75" />
      </div>
      <div className="skeleton-text flex w-12 h-12 p-1 rounded backdrop-contrast-75" />
    </div>
  );
}
