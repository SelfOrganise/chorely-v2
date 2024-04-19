import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../../../utils/authOptions';
import { getTask } from '../../actions/getTask';
import { TaskDetail } from './components/TaskDetail';

export default async function TaskContainer({ params }: { params: { id: string } }) {
  const task = await getTask({ id: params.id });
  const session = await getServerSession(authOptions);

  if (!task) {
    redirect('/');
  }

  return <TaskDetail task={task} userId={session?.user?.id} />;
}
