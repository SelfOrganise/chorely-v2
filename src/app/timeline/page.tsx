import moment from 'moment/moment';
import { getTimeline, TimelineItem } from '../actions/getTimeline';
import { getCurrentUser } from '../actions/getUser';
import { TimelineMiddle } from './components/TimelineMiddle';

export default async function Timeline() {
  const historyItems: Array<TimelineItem> = await getTimeline();
  const userId = (await getCurrentUser()).id;

  return (
    <ul className="timeline timeline-snap-icon timeline-vertical">
      {historyItems.map(({ createdAt, task, user }) => (
        <li key={createdAt.toISOString() + user.id}>
          <div
            className={`flex flex-col timeline-${user.id === userId ? 'end' : 'start'} text-xs font-thin text-base-content/70 h-full mt-6`}
          >
            {moment(createdAt).fromNow()}
          </div>
          <div className="timeline-middle">
            <TimelineMiddle />
          </div>
          <div className={`flex flex-col timeline-${user.id === userId ? 'start' : 'end'} timeline-box mb-8`}>
            <div className="text-md font-semibold text-base-content/90 mb-2">{task.title}</div>
            <div className="flex items-center justify-between text-xs font-thin text-base-content/70 ">
              <div>{user.displayName}</div>
            </div>
          </div>
          <hr />
        </li>
      ))}
    </ul>
  );
}
