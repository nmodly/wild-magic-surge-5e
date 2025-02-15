import {
  MODULE_ID,
  OPT_CHAT_MSG,
  OPT_AUTO_D20,
  OPT_AUTO_D20_MSG,
  OPT_AUTO_D20_MSG_NO_SURGE,
  SPELL_LIST_KEY_WORDS,
  OPT_WHISPER_GM,
} from "./Settings.js";
import { SendChat } from "./Chat.js";
import { TidesOfChaos } from "./TidesOfChaos.js";
import { RollTableMagicSurge } from "./RollTableMagicSurge.js";

export function WildMagicCheck(chatMessage) {
  if (isValid(chatMessage)) {
    if (game.settings.get(`${MODULE_ID}`, `${OPT_AUTO_D20}`)) {
      runAutoCheck(game.actors.get(chatMessage.data.speaker.actor));
    } else {
      runMessageCheck();
    }
  }
}

function parseWildMagicFeat(actor) {
  return (
    actor.data.items.find(
      (a) => a.name === "Wild Magic Surge" && a.type === "feat"
    ) !== undefined
  );
}

function parseSpell(content) {
  return SPELL_LIST_KEY_WORDS.some((v) => content.includes(v));
}

function parseNpc(actor) {
  return actor ? actor.data.type === "npc" : false;
}

function isValid(chatMessage) {
  if (!chatMessage.data.speaker || !chatMessage.data.speaker.actor) {
    return false;
  }

  const whisperToGM = game.settings.get(`${MODULE_ID}`, `${OPT_WHISPER_GM}`);
  // If whisper is set
  if (whisperToGM) {
    // Make sure it is the GM who sends the message
    if (!game.user.isGM) return false;
  }
  // If its just a public message
  else {
    // Make sure the player who rolled sends the message
    if (chatMessage.data.user !== game.user.id) return false;
  }

  const isASpell = parseSpell(chatMessage.data.content);
  const actor = game.actors.get(chatMessage.data.speaker.actor);
  if (actor === null) {
    return false;
  }
  const hasWildMagicFeat = parseWildMagicFeat(actor);
  const isNpc = parseNpc(actor);

  return isASpell && !isNpc && hasWildMagicFeat;
}

function wildMagicSurgeRollCheck() {
  let r = new Roll("1d20");
  r.evaluate();
  return r.total;
}

function runAutoCheck(actor) {
  const result = wildMagicSurgeRollCheck();
  if (result === 1) {
    SendChat(
      game.settings.get(`${MODULE_ID}`, `${OPT_AUTO_D20_MSG}`),
      `[[/r ${result} #1d20 result]]`
    );
    TidesOfChaos(actor);
    RollTableMagicSurge();
  } else {
    SendChat(
      game.settings.get(`${MODULE_ID}`, `${OPT_AUTO_D20_MSG_NO_SURGE}`),
      `[[/r ${result} #1d20 result]]`
    );
  }
}

function runMessageCheck() {
  SendChat(game.settings.get(`${MODULE_ID}`, `${OPT_CHAT_MSG}`));
}
