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
    console.log('screepsmod-bots: no backend found, skipping');
    return;
  }

  // Read bots config
  const file = fs.readFileSync(`${process.cwd()}/bots.yml`, 'utf8')
  const botsConfig = YAML.parse(file);

  // Hook into an event that fires during server startup
  // TODO find a better one, or add one to the server
  config.backend.on('expressPreConfig', async function(app) {
    console.log('screepsmod-bots: checking bots');

    const {common: {storage: {db}}} = config;
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
      const exists = await db.users.findOne({
        username: bot.username
      });
      console.log('screepsmod-bots: checking bot', !!exists);
      if (exists) {
        console.log('screepsmod-bots: bot already exists', bot.username);
        continue;
      }

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
    }

    console.log('screepsmod-bots: done');
  });
};

function cordsFromString(positionString) {
  const [x, y, roomName] = positionString.split(',');
  if (!x || !y || !roomName) {
    throw new Error('Invalid position string');
  }

  return {x: parseInt(x, 10), y: parseInt(y, 10), roomName};
}
