'use server';
import { getUsers } from '../../actions/getUsers';
import { NewTask } from './components/NewTask';

export default async function Index() {
  const users = await getUsers();

  return <NewTask users={users} />;
}
