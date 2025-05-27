Simple task tracking app playground for new tech :)

Current stack: next, react server components, server actions, NextAuth, SQLite, docker, prisma, tailwind, PWA, OneSignal (web push), typescript


### Add new prisma fields

* Add the new field to the `prisma/schema.prisma` file.
* Run `yarn prisma migrate dev --name <migration_name>` to create a new migration and apply to development database.
* PROD: Run `yarn prisma migrate deploy`
