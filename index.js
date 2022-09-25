/**
 * Screeps Bots - Mod for manage bots
 * 
 * The default DB comes with 4 instances of the simple bots in the corners of the
 * world. This mod will remove them and replace them with the bots defined in
 * bots.yml.
 */
const YAML = require('yaml')
const cliBots = require('@screeps/backend/lib/cli/bots');
const fs = require('fs');
const process = require('process');

module.exports = function(config) {
  if (!config.backend) {
    console.log('screepsmod-bots: no backend or common.storage found, skipping');
    return;
  }

  // Read bots config
  const file = fs.readFileSync(`${process.cwd()}/bots.yml`, 'utf8')
  const botsConfig = YAML.parse(file);

  // Hook into an event that fires during server startup
  // TODO find a better one, or add one to the server
  config.backend.on('expressPreConfig', async function(app) {
    await handleBots(config, botsConfig);
  });
  console.log('screepsmod-bots: hooked into backend');

  // Hook into an event that fires during data reset
  config.backend.on('resetAllData', async function(app) {
    console.log('resetAllData');
    await handleBots(config, botsConfig);
  });
  console.log('screepsmod-bots: hooked into storage');

  console.log('screepsmod-bots: loaded');
};

async function handleBots(config, botsConfig) {
  console.log('screepsmod-bots: checking bots');

  const {common: {storage: {db, pubsub}}} = config;
  if (!db) {
    console.log('screepsmod-bots: no database found, skipping');
    return;
  }

  if (!db.users) {
    console.log('screepsmod-bots: no users collection found, skipping');
    return;
  }

  // find all default bots in the database
  const bots = await db.users.find({
    _id: {
      $in: [
        'a1123272b261687',
        '17c332744f825c7',
        'e3b732c504eb83a',
        'eea532c5a2f9e44'
      ]
    }
  });

  // iterate default bots and remove them
  for await (const bot of bots) {
    console.log('screepsmod-bots: removing bot', bot.username);
    await cliBots.removeUser(bot.username);
  }

  // iterate bots in config and create them
  for await (const bot of botsConfig.bots) {
    // check if bot already exists
    let botUser = await db.users.findOne({
      username: bot.username
    });

    console.log('screepsmod-bots: checking bot', !!botUser);
    if (!botUser) {
      const spawnPosition = cordsFromString(bot.position);
      const roomName = spawnPosition.roomName
      console.log('screepsmod-bots: adding bot', bot.username);
      await cliBots.spawn(bot.botName, roomName, {
        username: bot.username,
        cpu: bot.cpu,
        gcl: bot.gcl,
        x: spawnPosition.x,
        y: spawnPosition.y
      });

      console.log('screepsmod-bots: fetching created bot user', bot.username);
      botUser = await db.users.findOne({
        username: bot.username
      });
      if (!botUser) {
        console.error('screepsmod-bots: bot user not found after create', bot.username);
        continue;
      }
    }

    if (bot.log_console) {
      // Setup logging of bot's output
      setupBotLog(pubsub, botUser);
    }
  }

  console.log('screepsmod-bots: done');
}

function setupBotLog(pubsub, user) {
  console.log('screepsmod-bots: setting up bot log', user._id);
  // subscribe to the bot's console output
  pubsub.subscribe(`user:${user._id}/console`, (payloadJSON) => {
    const payload = JSON.parse(payloadJSON);
    if (payload.messages && payload.messages.log) {
      for (const log of payload.messages.log) {
        console.log(`screepsmod-bots: ${user.username}: ${log}`);
      }
    }
  });
}

function cordsFromString(positionString) {
  const [x, y, roomName] = positionString.split(',');
  if (!x || !y || !roomName) {
    throw new Error('Invalid position string');
  }

  return {x: parseInt(x, 10), y: parseInt(y, 10), roomName};
}
