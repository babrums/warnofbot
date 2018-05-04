import {Chat, IChat, IWarn, Warn} from "./models";
import Messages from './Messages'
import Database from './Database'
import log from './Logger'


export default class Handler {
  private readonly Username: string;
  private Bot: any;

  constructor(Bot, Username: string) {
    this.Bot = Bot;
    this.Username = Username;
    this.setupBot();
  }

  private setupBot() {

    /** User methods */
    this.Bot.on('message', this.onMessage.bind(this));
    this.Bot.on('callback_query', this.onCallbackQuery.bind(this));
    this.Bot.onText(/\/help/, this.onHelp.bind(this));
    this.Bot.onText(/\/language/, this.onSetLanguage.bind(this));
    this.Bot.onText(/\/warns/, this.onSetWarns.bind(this));

    /** Error handling methids */
    this.Bot.on('error', Handler.onApiError.bind(this));
    this.Bot.on('polling_error', Handler.onPollingError.bind(this));

    /** Get new admins from all chats */
    setTimeout(this.getAdmins.bind(this), 60 * 1000);
    setInterval(this.getAdmins.bind(this), 180 * 60 * 1000);
  }


  /*
   * Events handler
   */
  async onMessage(msg) {
    if (msg.new_chat_participant && msg.new_chat_participant.username === this.Username) {
      log.debug('Bot has been added to the new chat');
      await this.getAdmins();
      return this.onHelp(msg);
    } else if (msg.chat.id < 0 && msg.text && msg.text.includes(`@${this.Username}`)) {
      if (!msg.reply_to_message) return;
      return this.onWarn(msg);
    }
  }

  async onWarn(msg) {
    log.debug(`onWarn ${msg.chat.title} [${msg.chat.username || msg.chat.id}]`);
    const contributor = msg.from.id;
    const contributorName = (typeof msg.from.username != 'undefined') ? `@${msg.from.username}` : `${msg.from.first_name || msg.from.last_name}`;

    const member = msg.reply_to_message.from;
    const memberName: string = (typeof member.username != 'undefined') ? `@${member.username}` : `${member.first_name || member.last_name}`;

    if (msg.reply_to_message.from.is_bot === true) return log.debug(`Trying to warn the bot`);

    const chat: IChat = await Database.findOrCreateChat(msg.chat.id);

    /** Check if admin */
    if (!chat.admins.includes(contributor)) return log.warn(`Not an admin`);
    if (chat.admins.includes(member.id)) return log.warn(`Trying to warn an admin`);
    const targetWarns: any = await Warn.find({chatId: chat.id, memberId: member.id});
    if ((targetWarns + 1) > chat.warnsToBan) {
      log.debug(`${msg.chat.title} [${msg.chat.id}] ——— ban ${memberName}[${member.id}]`);
      await this.banUser(chat.id, member.id);
      const text = Messages.sayBanned(chat.lang, memberName);
      await this.sendMessage(chat.id, text);
      for (const warn of targetWarns) {
        log.debug(`[DB] ——— Deleting ${warn._id}`);
        await warn.delete()
      }
    } else {
      log.debug(`${msg.chat.title} [${msg.chat.id}] ——— warn ${memberName}[${member.id}]`);
      const data = Messages.sayWarn(chat.lang, memberName, targetWarns.length + 1, chat.warnsToBan);
      const reply_markup = { inline_keyboard: [[{ text: `${data.button}`, callback_data: `${member.id}`}]]};
      await this.sendMessage(chat.id, data.text, reply_markup);
      const newWarn = await Database.createWarn(chat.id, member.id, contributorName, memberName);
      await newWarn.save();
    }
  }


  /*
   * Commands and settings handler
   */

  async onCallbackQuery(msg) {
    log.debug(`onCallbackQuery ${msg.message.chat.title} (${msg.message.chat.username || msg.message.chat.id})`);
    const chat: IChat = await Database.findOrCreateChat(msg.message.chat.id);
    if (chat.admins && !chat.admins.includes(msg.from.id)) return log.debug(`Users trying to push buttons`);
    if (!chat.admins) {
      await this.getAdmins()
    }
    switch (msg.data) {
      case 'set_lang_en':
        return await this.setLang(msg, 'en');
      case 'set_lang_ru':
        return await this.setLang(msg, 'ru');
      default:
        if (Number(msg.data) < 1000) {
          return await this.onWarnsWasSet(msg);
        } else {
          return await this.forgive(msg)
        }
    }
  }

  async onHelp(msg) {
    // from is ok
    log.debug(`onHelp ${msg.chat.title} [${msg.chat.username || msg.chat.id}]`);
    const chat: IChat = await Database.findOrCreateChat(msg.chat.id);

    if (!chat.admins.includes(msg.from.id)) return log.debug(`Users trying to get settings`);
    const text = Messages.sayHello(chat.lang);
    await this.sendMessage(msg.chat.id, text)
  }

  async onSetLanguage(msg) {
    log.debug(`onSetLanguage ${msg.chat.title} [${msg.chat.username || msg.chat.id}]`);
    const chat: IChat = await Database.findOrCreateChat(msg.chat.id);
    if (!chat.admins.includes(msg.from.id)) return log.debug(`Users trying to get settings`);
    const text: any = Messages.saySetLang(chat.lang);
    const reply_markup = {
      inline_keyboard: [
        [{
          text: 'English',
          callback_data: 'set_lang_en'
        }],
        [{
          text: 'Русский',
          callback_data: 'set_lang_ru'
        }]
      ]};
    await this.sendMessage(msg.chat.id, text, reply_markup)
  }

  async onSetWarns(msg) {
    log.debug(`onSetWarns ${msg.chat.title} [${msg.chat.username || msg.chat.id}]`);
    const chat: IChat = await Database.findOrCreateChat(msg.chat.id);
    if (msg.from.id !== chat.creator) return log.debug(`Only creator can change this`);
    const text: any = Messages.saySetWarns(chat.lang);
    const reply_markup = {
      inline_keyboard: [
        [
          { text: '3', callback_data: '3' },
          { text: '6', callback_data: '6' },
          { text: '9', callback_data: '9' },
        ],
        [
          { text: '12', callback_data: '12' },
          { text: '15', callback_data: '15' },
          { text: '18', callback_data: '18' },
        ],
        [
          { text: '21', callback_data: '21' },
          { text: '24', callback_data: '24' },
          { text: '27', callback_data: '27' },
        ],
        [
          { text: '30', callback_data: '30'}
        ]
      ]};
    await this.sendMessage(msg.chat.id, text, reply_markup)
  }

  async setLang(msg: any, lang: string) {
    log.debug(`setLang ${msg.message.chat.title} [${msg.message.chat.username || msg.message.chat.id}]`);
    const chatId = msg.message.chat.id;
    const msgId = msg.message.message_id;
    let chat: IChat = await Database.findOrCreateChat(chatId);
    chat.lang = lang;
    chat = await chat.save();
    const text = Messages.sayLangWasSet(chat.lang);
    await this.editMessage(chatId, msgId, text)
  }

  async onWarnsWasSet(msg: any) {
    log.debug(`onWarnsWasSet ${msg.message.chat.title} [${msg.message.chat.username || msg.message.chat.id}]`);
    const chatId = msg.message.chat.id;
    const quantity = Number(msg.data);
    const msgId = msg.message.message_id;
    const iniciator = msg.from.id;

    let chat: IChat = await Database.findOrCreateChat(chatId);
    if (iniciator !== chat.creator) return log.debug(`Only creator can change this`);
    chat.warnsToBan = Number(quantity);
    await chat.save();
    const text = Messages.sayWarnsWasSet(chat.lang, Number(quantity));
    await this.editMessage(chatId, msgId, text)
  }

  async forgive(msg: any) {
    log.debug(`forgive ${msg.message.chat.title} [${msg.message.chat.username || msg.message.chat.id}]`);
    const chatId = msg.message.chat.id;
    const msgId = msg.message.message_id;
    const from = msg.from;
    const contributor = from.username ? `@${from.username}` : `${from.firstName || ''}${from.lastName || ''}`;
    const chat: IChat = await Database.findOrCreateChat(chatId);
    const warn: IWarn = await Warn.findOne({chatId: chatId, memberId: Number(msg.data)});
    const text = Messages.sayForgiven(chat.lang, warn.memberName, contributor);
    await warn.remove();
    await this.editMessage(chatId, msgId, text)
  }

  /*
   * Bot actions
   */

  async sendMessage(chatId: number, text: string, reply_markup?: any) {
    log.debug(`sendMessage [${chatId}]`);
    let params = {};
    params['disable_web_page_preview'] = true;
    params['parse_mode'] = 'Markdown';
    if (reply_markup) params['reply_markup'] = reply_markup;
    try {
      await this.Bot.sendMessage(chatId, text, params)
    } catch (err) {
      log.error(`Can not send message. Reason: ${err}`)
    }
  }

  async editMessage(chat_id: number, message_id: number, text: string) {
    log.debug(`editMessage [${chat_id}]`);
    let params = {
      chat_id,
      message_id
    };
    try {
      await this.Bot.editMessageText(text, params)
    } catch (err) {
      log.error(`Can not edit message. Reason: ${err}`)
    }
  }

  async banUser(chatId, userId) {
    log.debug(`banUser [${chatId}]`);
    const until_date: number = Number(new Date()) + (370 * 24 * 60 * 60 * 1000);
    try {
      await this.Bot.kickChatMember(chatId, userId, { until_date })
    } catch (err) {
      log.error(`Can not ban user. Reason: ${err}`)
    }
  }

  async getAdmins() {
    log.debug(`Getting chat admins...`);
    const chats = await Chat.find();
    for (const chat of chats) {
      let admins: any;
      try {
        admins = await this.Bot.getChatAdministrators(chat.id);
      } catch (err) {
        log.error(`Can not obtain admin list for chat ${chat.id}. Reason: ${err}`);
        continue;
      }
      const adminList = [];
      for (const admin of admins) {
        if (admin.status === 'creator') {
          chat.creator = admin.user.id;
        }
        adminList.push(admin.user.id)
      }
      chat.admins = adminList;
      chat.markModified('admins');
      console.log(`${JSON.stringify(adminList, undefined, 2)}`);
      await chat.save();
    }
    log.debug(`End of chat admins request.`);
  }


  /*
   * Internal errors handler
   */

  static onApiError(err) {
    log.error(`Telegram BotAPI error: ${err}`)
  }

  static onPollingError(err) {
    if (err.message.includes(`socket hang up`)) return;
    log.error(`Telegram BotAPI error: ${err}`)
  }
}