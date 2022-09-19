# screepsmod-bots

Screeps mod that manages bots in the game. On startup the mod removes the default bots 
and adds the bots from the `bots.yml` file.

## Setup

1. Install the mod:
  * `npm install screepsmod-bots --save`
2. Install the bots you will be using:
  * `npm install @screeps/simplebot --save`
  * `npm install screeps-bot-overmind --save`
  * `npm install screeps-bot-tooangel --save`
3. Copy or create a bots.yml file in the root of your Screeps server directory:

```yaml
version: 1
bots:
- username: bot1
  botName: overmind
  position: 22,13,W1N8
  cpu: 200
  gcl: 1
- username: bot2
  botName: tooangel
  position: 34,22,W3N1
  cpu: 200
  gcl: 1
- username: bot3
  botName: overmind
  position: 17,12,W8N3
  cpu: 200
  gcl: 1
- username: bot4
  botName: simplebot
  position: 17,37,W9N9
  cpu: 200
  gcl: 1
```

4. Add the mod and bots to your `mods.json` file:

```json
{
  "mods": [
    ...
    "node_modules/screepsmod-bots/index.js"
  ],
  "bots": {
    "simplebot": "node_modules/@screeps/simplebot/src",
    "overmind": "node_modules/screeps-bot-overmind/src",
    "tooangel": "node_modules/screeps-bot-tooangel/src"
  }
}
```

5. Start the server and connect with your client, the default bots in the corners of
   the map should be gone and replaced with the bots you configured.

## Operation

There is no event fired when the server data is reset (`system.resetAllData()`), so
the server must be restarted after the reset, otherwise the mod will not have run
on the new data.

To add new bots, edit the `bots.yml` file and restart the server. Take care to not reuse
usernames as if the username matches a wiped bot, it will not be created - already exists.

The positions in the examples are a best attempt to starting rooms with 2 sources that are
closely equidistant from other bots. 