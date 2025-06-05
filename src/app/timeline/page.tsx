import moment from 'moment/moment';
import { getTimeline, TimelineItem } from '../actions/getTimeline';
import { getCurrentUser } from '../actions/getCurrentUser';
import React from 'react';

export default async function Timeline() {
  const historyItems: Array<TimelineItem> = await getTimeline();
  const userId = (await getCurrentUser()).id;

  return (
    <div className="flex flex-col w-full mt-4">
      {historyItems.map(({ createdAt, task, user }) => (
        <React.Fragment key={createdAt.toISOString() + user.id}>
          <div className={`${user.id === userId ? 'self-end' : 'self-start'} font-thin text-base-content w-[50%]`}>
            <div className="text-sm">{moment(createdAt).fromNow()}</div>
            <div className="font-semibold py-1">{task.title}</div>
            <div className="text-sm">{user.displayName}</div>
          </div>
          <hr className="h-1 bg-base-100/10  my-4" />
        </React.Fragment>
      ))}
    </div>
  );
}
