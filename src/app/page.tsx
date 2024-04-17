'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '../utils/authOptions';
import { TaskCard } from './components/TaskCard';
import { getTasks } from './actions/getTasks';

export default async function Tasks({ searchParams }: { searchParams: { showArchived?: string } }) {
  const items = await getTasks({ includeArchived: searchParams.showArchived === 'true' });
  const session = await getServerSession(authOptions);
  const myItems = items.filter(i => i.assignedTo?.id === session?.user?.id);
  const otherItems = items.filter(i => i.assignedTo?.id !== session?.user?.id);

  return (
    <div className="relative w-full space-y-5">
      <div className="divider">My tasks</div>
      {myItems.map(item => (
        <TaskCard key={item.id} task={item} />
      ))}
      <div className="divider">Not my problem</div>
      {otherItems.map(item => (
        <TaskCard key={item.id} task={item} />
      ))}
    </div>
  );
}
