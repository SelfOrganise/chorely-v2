import { NextRequest } from 'next/server';
import { completeTaskInternal } from '../../actions/completeTask';
import { getIntentName, SkillBuilders } from 'ask-sdk';
import { RequestEnvelope } from 'ask-sdk-model';
import { prisma } from '../../../utils/prisma';
import { getTasks } from '../../actions/getTasks';
import { undoLastTask } from '../../actions/undoTask';

const hypeAndSassTags = [
  'big whoop.',
  'alert the media!',
  'I’d clap but I’m holding my coffee.',
  'cue the confetti cannons!',
  'someone call the Nobel committee.',
  'and the crowd goes wild—aaah!',
  'prepare the Pulitzer.',
  'put that on your LinkedIn.',
  'achievement unlocked: adulting supreme.',
  'cue dramatic slow-clap.',
  'legend status confirmed.',
  'they’ll write songs about this.',
  'a true masterpiece—according to absolutely no one.',
  'let’s engrave that on a trophy.',
  'your epic saga continues.',
  'we are not worthy!',
  'and the internet just broke.',
  'drop the mic.',
  'bravo, bravo! Encore?',
  'is that all? Just kidding... mostly.',
  'a moment of silence for the task that was.',
  'adding that to the highlight reel.',
  'you’re making the rest of us look bad.',
  'revolutionary, truly.',
  'should we throw a parade?',
  'and the world is forever changed. Or not.',
  '*nods approvingly, yet judgmentally*',
  'can I get an autograph?',
  'they’re basically a superhero now.',
  'someone alert the history books.',
  'just like the prophecy foretold!',
  '*adjusts monocle* Impressive.',
  'you didn’t choose the task life, the task life chose you.',
  'this just in: nobody cares.',
  'champagne is… back in the fridge.',
  'oh look, an over-achiever.',
  'applause postponed due to budget cuts.',
  'Hollywood called—they’re not interested.',
  'shall we notify the royal family?',
  'I’d throw confetti but that’s a mess.',
  'parade scheduled for never.',
  'hold your applause—forever.',
  'we’ll etch that on a Post-it.',
  'break out the imaginary medals!',
  'truly the content we signed up for.',
  'don’t spend all that glory in one place.',
  'historians will skip this chapter.',
  'the universe is forever changed… or not.',
  'guess we’re giving out cookies now.',
  'insert obligatory slow-clap here.',
  'earth’s axis just tilted—kidding.',
  'achievement: Meh-tier unlocked.',
  'breaking news: nobody blinked.',
  'sound the trumpets—or kazoo, budget cuts.',
  'well paint me unimpressed.',
  'congratulations, you played yourself (in hard mode).',
  'SEC filing for your ego incoming.',
  'mom’s gonna put this on the fridge—maybe.',
  'the Oscars are jealous.',
  'insert majestic drum roll that never ends.',
  'and somewhere a unicorn yawns.',
  'better call Guinness—world record for mild accomplishment.',
  'stock price of excitement flatlined.',
  'you’ll be the trivia question no one gets.',
  'can we get a slow-mo replay?',
  'the algorithm remains unmoved.',
  'legendary—like a coupon for expired pizza.',
  'Shakespeare couldn’t write it, mostly because he’s dead.',
  'deserves a sticker, maybe.',
  'sorry, award ceremony buffering…',
  'applause emoji sold separately.',
  '10/10 on the “meh” scale.',
  'dust off the mantel for your invisible trophy.',
  'even your future self just rolled their eyes.',
  'mythical beasts still unimpressed.',
  'guess you’re today’s main character—briefly.',
  'history will file this under “misc.”',
  'expert-approved: a solid “eh.”',
  'this calls for—oh wait, no it doesn’t.',
  'that ripple you felt? Just your ego.',
  'echoes of applause still lost in transit.',
  'achievement unlocked: lukewarm applause.',
  'fortune cookies are jealous of that wisdom.',
  'we’ll add that to the museum of “Okay, sure.”',
  'this feat powered by 100% recycled hype.',
];

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

      if (getIntentName(input.requestEnvelope) === 'AMAZON.CancelIntent') {
        const task = await undoLastTask();
        return input.responseBuilder.speak(`Cancelled "${fixTaskTitle(task.title)}".`).getResponse();
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
        // note: no reliable way to map between alexa user id and app user ids so it's hardcoded for now
        const user = alexaUserId === myPersonId ? users[0] : users[1];

        if (!user) {
          return error('Internal error: cannot find user');
        }

        await completeTaskInternal(user.id, task!.id, 'Completed by Alexa');

        // 50% of the time, add a snarky comment
        const randomSnark =
          Math.random() < 0.5 ? `..., ${hypeAndSassTags[Math.floor(Math.random() * hypeAndSassTags.length)]}` : '';
        return input.responseBuilder
          .speak(`${resolveName(user.displayName)} completed "${fixTaskTitle(task!.title)}" ${randomSnark}.`)
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
