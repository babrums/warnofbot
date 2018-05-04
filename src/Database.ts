import {Chat, IChat, Warn} from './models';

export default class Database {

  public static async createChat(id: number) {
    const newChat = new Chat({id});
    await newChat.save();
    return newChat;
  }

  public static async findOrCreateChat(id: number) {
    let chat: IChat = await Chat.findOne({id});
    if (!chat) chat = await this.createChat(id);
    return chat;
  }

  public static async createWarn(chatId: number, memberId: number, contributor: string, memberName: string) {
    const newWarn = new Warn({chatId, memberId, contributor, memberName});
    await newWarn.save();
    return newWarn;
  }
}