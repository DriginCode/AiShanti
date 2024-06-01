import { openai } from './openai.js';
import { convertMarkdownToHTML, fetchWithRetry } from './utils.js';

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

    const responseContent = await fetchWithRetry(openai.chat.bind(openai), [ctx.session.messages], ctx, 3, 1000);

    ctx.session.messages.push({
      role: openai.roles.ASSISTANT,
      content: responseContent,
    });

    const convertedContent = convertMarkdownToHTML(responseContent);
    await ctx.reply(convertedContent, { parse_mode: 'HTML' });
  } catch (e) {
    console.log('Error while processing text to gpt', e.message);
    await ctx.reply('Произошла ошибка при обработке вашего запроса.');
  }
}
