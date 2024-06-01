import { Telegraf, session } from 'telegraf';
import { message } from 'telegraf/filters';
import { code } from 'telegraf/format';
import config from 'config';
import { ogg } from './ogg.js';
import { openai } from './openai.js';
import { removeFile, convertMarkdownToHTML } from './utils.js';
import { initCommand, processTextToChat, INITIAL_SESSION } from './logic.js';
import { checkAccess, addUser, removeUser, decrementMessageCount } from './access.js';

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'));

bot.use(session());

bot.command('new', initCommand);
bot.command('start', initCommand);

bot.command('adduser', async (ctx) => {
  const userId = ctx.message.text.split(' ')[1];
  if (!userId) {
    await ctx.reply('Пожалуйста, укажите ID пользователя.');
    return;
  }
  await removeUser(userId); // Удаление из списка с ограничениями
  await addUser(userId); // Добавление в список с неограниченным доступом
  await ctx.reply(`Пользователь ${userId} добавлен с неограниченным доступом.`);
});

bot.command('removeuser', async (ctx) => {
  const userId = ctx.message.text.split(' ')[1];
  if (!userId) {
    await ctx.reply('Пожалуйста, укажите ID пользователя.');
    return;
  }
  await removeUser(userId);
  await ctx.reply(`Пользователь ${userId} удален из списка с неограниченным доступом.`);
});

bot.command('genimage', async (ctx) => {
  const userId = String(ctx.message.from.id);
  const hasAccess = await checkAccess(userId);
  if (!hasAccess) {
    await ctx.reply('Достигнут лимит на использование. Попробуйте еще раз завтра.');
    return;
  }

  const prompt = ctx.message.text.replace('/genimage', '').trim();
  if (!prompt) {
    await ctx.reply('Пожалуйста, предоставьте описание для генерации изображения. Например /genimage Сделай красивого кота');
    return;
  }
  try {
    await ctx.reply('Генерация изображения, пожалуйста, подождите...');
    const imageUrl = await openai.generateImage(prompt);
    await ctx.replyWithPhoto(imageUrl);
    await decrementMessageCount(userId); // Уменьшаем счетчик после успешной генерации изображения
  } catch (e) {
    console.log('Error while generating image', e.message);
    await ctx.reply('Произошла ошибка при генерации изображения. Попробуйте еще раз позже.');
  }
});

bot.on(message('voice'), async (ctx) => {
  ctx.session ??= INITIAL_SESSION;
  const userId = String(ctx.message.from.id);
  const hasAccess = await checkAccess(userId);
  if (!hasAccess) {
    await ctx.reply('Достигнут лимит на использование. Попробуйте еще раз завтра.');
    return;
  }
  try {
    await ctx.telegram.sendChatAction(ctx.chat.id, 'typing');
    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
    const oggPath = await ogg.create(link.href, userId);
    const mp3Path = await ogg.toMp3(oggPath, userId);
    removeFile(oggPath);

    const text = await openai.transcription(mp3Path);
    removeFile(mp3Path);

    await ctx.reply(code(`Ваш запрос: ${text}`));
    await processTextToChat(ctx, text);
    await decrementMessageCount(userId); // Уменьшаем счетчик после успешной обработки голосового сообщения
  } catch (e) {
    console.log('Error while voice message', e.message);
    await ctx.reply('Произошла ошибка при обработке голосового сообщения.');
  }
});

bot.on(message('text'), async (ctx) => {
  ctx.session ??= INITIAL_SESSION;
  const userId = String(ctx.message.from.id);
  const hasAccess = await checkAccess(userId);
  if (!hasAccess) {
    await ctx.reply('Достигнут лимит на использование. Попробуйте еще раз завтра.');
    return;
  }
  try {
    await ctx.telegram.sendChatAction(ctx.chat.id, 'typing');
    await processTextToChat(ctx, ctx.message.text);
    await decrementMessageCount(userId); // Уменьшаем счетчик после успешной обработки текстового сообщения
  } catch (e) {
    console.log('Error while processing text message', e.message);
    await ctx.reply('Произошла ошибка при обработке текстового сообщения.');
  }
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
