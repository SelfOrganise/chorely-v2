#!/bin/sh

#node watcher.js &
#echo 'executed "node watcher.js"';

echo 'Applying migrations...';
npx --yes prisma migrate deploy


node server.js &
echo 'executed "node server"';

echo 'waiting for jobs to finish...';
wait < <(jobs -p)

