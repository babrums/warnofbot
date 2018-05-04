export default class Messages {

  public static sayHello(lang: string, ) {
    switch (lang) {
      case 'ru': return `😎 Warnofbot позволяет админам предупреждать участников за проступки. Кто-то ведет себя не подобающе джентельмену или вы не считаете бан правильным решением в сложившейся ситуации? Просто ответьте на сообщение провинившегося текстом \`@warnofbot\` и пользователю будет выставлено предупреждение. По достижению определенного числа предупреждений пользователь будет забанен.\n\n\`@warnofbot\` отлично работает в групповых чатах — давайте, добавьте его в парочку! Не забудьте назначить бота админом, иначе он не сможет работать.\n\n/help — Показывает это сообщение 😱\n/language — Позволяет выбрать язык 📣\n/warns — Назначить количество предупреждений перед баном\n\nНравится бот? Оставьте отзыв по ссылке:\nhttps://telegram.me/storebot?start=warnofbot\n\nВопросы и предложения пишите моему создателю — @babrums 🦁\n\nА еще зацените вдохновившего меня на создание \`@warnofbot\` оригинального бота @banofbot который банит пользователей по результатам голосования.`;
      case 'en': return `😎 Warnofbot allows admins to warn users for misconduct. Is someone behaving in a way that is not appropriate for a gentleman way, or you think ban is the not the right sulution? Simply reply to the violator's message with the text \`@warnofbot\` and the bot will warn this user. When a certain number of warnings are reached, the user will be banned\n\n\`@warnofbot\` works well in group chats — so go on, add it to one of your precious chats! Don't forget to set it as an admin, otherwise it wouldn't work.\n\n/help — Shows this message 😱\n/language — Lets you pick the language 📣\n/warns — set warns quantity before user will get ban\n\nLike this bot? Leave a review here:\nhttps://telegram.me/storebot?start=warnofbot\n\nAddress any concerns and questions to my creator — @babrums 🦁\n\nAlso check our bot @banofbot allows you to vote to ban users.`;
    }
  }

  public static sayWarn(lang: string, user: string, currentWarns: number, warnsMax: number) {
    const buttons = {
      ru: `Простить пользователя`,
      en: `Forgive user`
    };
    switch (lang) {
      case 'ru': return {text: `🥊 ${user} предупрежден. (${currentWarns}/${warnsMax})`, button: buttons.ru};
      case 'en': return {text: `🥊 ${user} has been warned. (${currentWarns}/${warnsMax})`, button: buttons.en};
    }
  }

  public static sayBanned(lang: string, restricted: string) {
    switch (lang) {
      case 'ru': return `⚒ ${restricted} был забанен.\nПродолжительность: навечно.`;
      case 'en': return `⚒ ${restricted} was banned.\nDuration: forever.`;
    }
  }

  public static sayForgiven(lang: string, restricted: string, contributor: string) {
    switch (lang) {
      case 'ru': return `⚒ ${restricted} был прощен админом ${contributor}.`;
      case 'en': return `⚒ ${restricted} was forgiven by ${contributor}.`;
    }
  }

  public static saySetLang(lang: string) {
    switch (lang) {
      case 'ru': return '👋 Пожалуйста, выберите язык.';
      case 'en': return '👋 Please, select your language.';
    }
  }

  public static saySetWarns(lang: string) {
    switch (lang) {
      case 'ru': return '👋 Пожалуйста, выберите количество предупреждений перед баном.';
      case 'en': return '👋 Please, select warns quantity before user will get ban.';
    }
  }

  public static sayWarnsWasSet(lang: string, quantity: number) {
    switch (lang) {
      case 'ru': return `Предупреждений до бана ${quantity}`;
      case 'en': return `The number of warns before ban is ${quantity}`;
    }
  }

  public static sayLangWasSet(lang) {
    switch (lang) {
      case 'ru': return '@warnofbot теперь говорит по-русски. Спасибо!';
      case 'en': return '@warnofbot now speaks English. Thank you!';
    }
  }
}