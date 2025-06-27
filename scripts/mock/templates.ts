/**
 * Mock content templates organized by personality type
 * Templates use {variable} syntax for dynamic content replacement
 */

// Message templates by personality type
export const messageTemplates = {
  'sharp-bettor': {
    greeting: [
      'Line value on {team} looking good',
      'Early money coming in on {game}',
      'Seeing some interesting movement on {team}',
      'Sharp play developing on {game}',
    ],
    reaction: [
      'Called it 📊',
      "Numbers don't lie",
      'Value was there',
      'Easy read on that line',
      '+EV as expected',
    ],
    discussion: [
      'Check the reverse line movement',
      'Sharp action on the under',
      'Line shopping paid off here',
      'Books adjusting already',
      'Closing line value was key',
    ],
    celebration: [
      'Another winning day ✅',
      'Bankroll management pays off',
      'Steady profits > big swings',
    ],
  },
  degen: {
    greeting: [
      "WHO'S READY TO EAT?? 🍽️",
      'FEELING LUCKY TODAY',
      "Let's get this bread 🍞",
      'Mortgage is back on the menu boys',
      'SEND IT SATURDAY LETS GOOO',
    ],
    reaction: [
      'LFG!!! 🚀🚀🚀',
      'PAIN.',
      'Why do I do this to myself',
      'ONE TIME PLEASE 🙏',
      'SWEATING BULLETS RN',
      'THIS IS WHY WE BET',
    ],
    discussion: [
      "Tailing whoever's hot 🔥",
      'Last leg prayer circle 🙏',
      'Who else is on this parlay?',
      'Need a lock for tonight',
      "Doubling down who's with me",
    ],
    badBeat: [
      "I'm never betting again (see you tomorrow)",
      'How does that even happen???',
      "Rigged. It's all rigged.",
      'I had the over by 0.5 😭',
    ],
  },
  'fade-material': {
    greeting: [
      'Lock of the century coming up',
      "Can't lose parlay inside",
      'Easy money alert 💰',
      'Guaranteed winner loading...',
      'Book it. This is free cash.',
    ],
    reaction: [
      'Rigged!!!',
      'Refs cost me again',
      'Taking a break (back tomorrow)',
      'How did they blow that???',
      'Vegas always knows smh',
    ],
    discussion: [
      'All favorites parlay = free money',
      '{team} is a LOCK trust me',
      'No way {team} loses at home',
      "Public is all over {team}, I'm in",
      'This line is disrespectful to {team}',
    ],
    excuse: [
      "Would've won if not for the refs",
      'That was a fluke play',
      '99 times out of 100 that hits',
      'Bad beat, nothing I could do',
    ],
  },
  contrarian: {
    greeting: [
      'Fading the public today',
      'Going against the grain',
      "Love when everyone's on one side",
      'Contrarian play incoming',
    ],
    reaction: [
      'Told you to fade',
      'Public gets crushed again',
      'Easy fade spot',
      'Square money tastes good',
    ],
    discussion: [
      "80% on {team}? I'm fading",
      'Line movement says fade',
      'Too much public love here',
      'Reverse line movement = fade city',
    ],
  },
  homer: {
    greeting: [
      "{favoriteTeam} day let's go!",
      'Riding with my {favoriteTeam}',
      '{favoriteTeam} ML every time',
      'Never betting against {favoriteTeam}',
    ],
    reaction: [
      '{favoriteTeam} NEVER IN DOUBT',
      "That's my team!!!",
      'TOLD YALL {favoriteTeam} DIFFERENT',
      'Bleed {teamColor} baby!',
    ],
    discussion: [
      '{favoriteTeam} by a million',
      "Can't bet against my boys",
      'Heart over head, {favoriteTeam} ML',
      '{favoriteTeam} gonna shock the world',
    ],
  },
  'live-bettor': {
    greeting: [
      'Live lines looking juicy',
      'In-game hunting time',
      'Watching for live spots',
      "Live betting is where it's at",
    ],
    reaction: [
      'Live bet cashed instantly!',
      "That's why we watch",
      'Momentum shift = money',
      'Live unders printing',
    ],
    discussion: [
      'This pace screams under',
      "Live line hasn't adjusted yet",
      'Momentum shifting, time to bet',
      '4Q unders are automatic',
    ],
  },
  'parlay-degen': {
    greeting: [
      '10-legger locked and loaded',
      'Parlay szn baby',
      '+50000 or bust',
      'One parlay away from glory',
    ],
    reaction: [
      "9/10 legs hit I'm sick",
      'LAST LEG PLEASE',
      'Parlay gods why???',
      'WE HIT THE BIG ONE!!!',
    ],
    discussion: [
      'Need one more leg for my parlay',
      "What's everyone adding to parlays?",
      '20 leg parlay who says no',
      'Small bet big dreams',
    ],
  },
};

// Post caption templates
export const postTemplates = {
  'pick-share': {
    confident: [
      '{team} {spread} {odds}\n\n🔨 play of the day',
      'HAMMER TIME 🔨\n{team} {type} {line}',
      '{team} {spread}\n\nBiggest play of the week 🎯',
      'MAX PLAY\n\n{team} {type} {line} {odds}',
    ],
    normal: [
      '{team} {spread} {odds}\n\n{confidence} confidence',
      'Rolling with {team} {type} {line}',
      "{team} {spread}\n\nLet's ride 🏇",
      "Today's pick:\n{team} {type} {line}",
    ],
    tail: [
      'Tailing {originalUser} on this\n\n{team} {spread} {odds}',
      "If {originalUser} is in, I'm in\n\n{team} {type}",
      'Following the hot hand\n\n{team} {spread}',
    ],
    fade: [
      'Fading {originalUser} here\n\n{oppositeTeam} {spread}',
      'Going opposite on this one\n\n{oppositeTeam} {type}',
      'Fade material right here\n\n{oppositeTeam} to cover',
    ],
  },
  'outcome-positive': {
    bigWin: [
      'CASH IT ✅💰\n\n{result}\n\nBiggest win of the week!',
      'BOOM 💥\n\n{team} {result}\n\nNever a doubt!',
      'WE EATING GOOD TONIGHT 🍽️\n\n{profit} profit',
    ],
    normal: [
      'Another one ✅\n\n{record} on the week',
      'Winner winner 🐔\n\n{team} covers easily',
      'Cash it ✅ {result}',
      "That's a win 📈\n\nOn to the next",
    ],
    streak: [
      '{streak} IN A ROW 🔥🔥🔥',
      "CAN'T STOP WON'T STOP\n\n{streak} straight",
      'Heater mode: {streak} wins straight',
    ],
  },
  'outcome-negative': {
    badBeat: [
      'Brutal beat 💔\n\n{team} up {points} with {time} left',
      "You can't make this up...\n\n{description}",
      'All-time bad beat\n\nHad {team} {spread}, lost by {margin}',
    ],
    normal: [
      'Tough loss. On to the next 💪',
      "Can't win em all. {record} this week",
      'L today, W tomorrow',
      'Shake it off. Long season.',
    ],
    tilt: [
      'Done for the day 😤',
      'Taking a break after that one',
      "Need to reset. See y'all tomorrow",
    ],
  },
  reaction: {
    exciting: [
      'This game is INSANE 🤯',
      'WHAT A COMEBACK',
      'Best game of the year no cap',
      'ARE YOU WATCHING THIS???',
    ],
    frustrating: [
      'This team is selling hard',
      'Fire everyone. Start over.',
      "I've seen enough. Turning it off.",
      'How do you miss that???',
    ],
    analysis: [
      'Line movement was the tell',
      'Public got trapped again',
      'Sharp money was right',
      'Vegas always knows',
    ],
  },
};

// Chat conversation starters by topic
export const conversationStarters = {
  'game-discussion': [
    'Anyone watching the {team} game?',
    'Thoughts on {team} vs {opponent}?',
    'This {team} line looks off to me',
    "Who's on {team} tonight?",
  ],
  'bad-beat': [
    'Just had the worst beat of my life',
    "You guys aren't ready for this bad beat story",
    'Someone talk me off the ledge',
    "I can't believe what just happened",
  ],
  celebration: [
    'LETS GOOOO WE HIT',
    'Drinks on me tonight boys',
    'Best betting day ever',
    "We're eating good this week",
  ],
  advice: [
    "What y'all think about {game}?",
    'Need a late night play',
    'Someone give me a lock',
    'Torn between these two plays',
  ],
};

// Helper function to get random template
export function getRandomTemplate(templates: string[]): string {
  return templates[Math.floor(Math.random() * templates.length)];
}

// Helper function to fill template variables
export function fillTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/{(\w+)}/g, (match, key) => {
    return variables[key] || match;
  });
}

// Get personality type from mock user
export function getPersonalityFromBehavior(mockPersonalityId: string): string {
  const mapping: Record<string, string> = {
    'sharp-betty': 'sharp-bettor',
    'sharp-sam': 'sharp-bettor',
    'stat-steve': 'sharp-bettor',
    'value-vic': 'sharp-bettor',
    'degen-dan': 'degen',
    'yolo-ethan': 'degen',
    'tilt-tommy': 'degen',
    'parlay-pete': 'parlay-degen',
    'parlay-paul': 'parlay-degen',
    'square-bob': 'fade-material',
    'public-pete': 'fade-material',
    'chalk-charlie': 'fade-material',
    'homer-hank': 'homer',
    'johnny-jets': 'homer',
    'fade-frank': 'contrarian',
    'contrarian-carl': 'contrarian',
    'live-larry': 'live-bettor',
    'livewire-logan': 'live-bettor',
  };

  return mapping[mockPersonalityId] || 'degen'; // Default to degen for fun
}

// Media URLs for mock posts (using placeholder images)
export const mockMediaUrls = {
  reaction: [
    'https://media.giphy.com/media/3o7TKF1fSIs1R19B8k/giphy.gif', // celebration
    'https://media.giphy.com/media/l2JehQ2GitHGdVG9y/giphy.gif', // excited
    'https://media.giphy.com/media/12XMGIWtrHBl5e/giphy.gif', // disappointed
    'https://media.giphy.com/media/3o7TKwmnDgQb5jemjK/giphy.gif', // nervous
  ],
  meme: [
    'https://i.imgflip.com/1bij.jpg', // betting meme placeholder
    'https://i.imgflip.com/1bhk.jpg', // sports meme placeholder
  ],
};
