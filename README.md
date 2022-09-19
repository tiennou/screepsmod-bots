# screepsmod-bots

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
  botName: tooangel
  position: 17,37,W9N9
  cpu: 200
  gcl: 1


{
  "mods": [
    "node_modules/screepsmod-auth/index.js",
    "node_modules/screepsmod-mongo/index.js",
    "node_modules/screepsmod-market/index.js",
    "node_modules/screepsmod-history/index.js",
    "node_modules/screepsmod-bots/index.js"
  ],
  "bots": {
    "simplebot": "node_modules/@screeps/simplebot/src",
    "overmind": "node_modules/screeps-bot-overmind/src",
    "tooangel": "node_modules/screeps-bot-tooangel/src"
  }
}