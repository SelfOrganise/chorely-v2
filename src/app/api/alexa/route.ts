import { NextRequest } from 'next/server';
import { completeTaskInternal } from '../../actions/completeTask';
import { SkillBuilders } from 'ask-sdk';
import { RequestEnvelope } from 'ask-sdk-model';
import { prisma } from '../../../utils/prisma';
import { getTasks } from '../../actions/getTasks';

const myPersonId =
  'amzn1.ask.person.AMBEZQ7TEOJO6LE2JNJ3NWW7TCQMW3NVCHQCWPFJAPUCVGF6CVY3267EWRXIGY5FPLGWFIM6BULO47DAZMY4HSHEJD5QMDHL6DL7SNREOB4HGKZOL2H2BPC5TRLFSNKC2IJDYRI';

const skill = SkillBuilders.custom()
  .addRequestHandlers({
    canHandle: () => true,
    handle: async input => {
      console.log(JSON.stringify(input.requestEnvelope, null, 2));

      if (input.requestEnvelope.request.type !== 'IntentRequest') {
        return error(`Unsupported operation: ${input.requestEnvelope.request.type}.`);
      }

      const choreInput =
        input.requestEnvelope.request.intent.slots?.chore?.resolutions?.resolutionsPerAuthority?.[0]?.values?.[0]?.value
          .name || input.requestEnvelope.request.intent.slots?.chore?.value;
      if (!choreInput) {
        return error("I don't understand the chore name");
      }

      const task = await tryFindTask(choreInput);
      if (!task) {
        return error(`Cannot find chore with name "${choreInput}`);
      }

      switch (input.requestEnvelope.request.intent.name) {
        case 'ChoreInfo':
          return handleChoreInfo();
        case 'ChoreComplete':
          return await handleChoreComplete();
        default:
          return error('Unknown intent');
      }

      function handleChoreInfo() {
        const times = task!.times != 1 ? `, ${task!.times} times.` : '';
        const name = resolveName(task!.assignedTo?.displayName || 'Unknown');
        const title = fixTaskTitle(task!.title);

        return input.responseBuilder.speak(`${title}: ${name}${times}.`).getResponse();
      }

      async function handleChoreComplete() {
        const alexaUserId = input.requestEnvelope.context.System.person?.personId;
        if (!alexaUserId) {
          return error('Undefined alexa user id');
        }

        const users = await prisma.user.findMany({});
        // note: no realiable way to map between alexa user id and app user ids so it's hardcoded for now
        const user = alexaUserId === myPersonId ? users[0] : users[1];

        if (!user) {
          return error('Internal error: cannot find user');
        }

        await completeTaskInternal(user.id, task!.id, 'Completed by Alexa');
        return input.responseBuilder
          .speak(`${resolveName(user.displayName)} completed "${fixTaskTitle(task!.title)}".`)
          .getResponse();
      }

      function error(msg: string) {
        console.error(msg, JSON.stringify(input.requestEnvelope, null, 2));
        return input.responseBuilder.speak(msg).getResponse();
      }
    },
  })
  .create();

export function GET() {
  return new Response('OK', { status: 200 });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as RequestEnvelope;
  const response = await skill.invoke(body);

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function resolveName(name: string) {
  return name === 'Xingu' ? 'Zing' : name;
}

function fixTaskTitle(title: string) {
  // eslint-disable-next-line no-control-regex
  return title.replace(/[^\x00-\x7F]/g, '').trim();
}

async function tryFindTask(slotValue: string) {
  const tasks = await getTasks();
  const parts = slotValue.toLowerCase().split(/\s+/);

  const sorted = tasks
    .map(t => {
      const titleWords = [...new Set(t.title.toLowerCase().split(/\s+/))];
      const matchScore = parts.reduce(
        (score, part) => score + titleWords.filter(titleWord => titleWord.includes(part)).length,
        0
      );
      return { task: t, matchScore };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  return sorted[0]?.task || null;
}
