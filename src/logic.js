import { openai } from './openai.js';
import { convertMarkdownToHTML } from './utils.js';


export const INITIAL_SESSION = {
  messages: [],
};

export async function initCommand(ctx) {
  ctx.session = { ...INITIAL_SESSION };
  await ctx.reply('Жду вашего голосового или текстового сообщения');
}

export async function processTextToChat(ctx, content) {
  try {
    ctx.session.messages.push({ role: openai.roles.USER, content });

    const response = await openai.chat(ctx.session.messages);

    ctx.session.messages.push({
      role: openai.roles.ASSISTANT,
      content: response.content,
    });

    const convertedContent = convertMarkdownToHTML(response.content);
    await ctx.reply(convertedContent, { parse_mode: 'HTML' });
  } catch (e) {
    console.log('Error while processing text to gpt', e.message);
    await ctx.reply('Произошла ошибка при обработке вашего запроса.');
  }
}
