import { unlink } from 'fs/promises';
import { marked } from 'marked';

// Настройка кастомного рендерера для marked
const renderer = new marked.Renderer();

renderer.paragraph = (text) => text + '\n';
renderer.heading = (text, level) => `<b><u>${text}</u></b>\n`;
renderer.list = (body, ordered) => body;
renderer.listitem = (text) => `• ${text}\n`;
renderer.link = (href, title, text) => `<a href="${href}">${text}</a>`;
renderer.blockquote = (quote) => `<blockquote>${quote}</blockquote>`;
renderer.codespan = (text) => `<code>${text}</code>`;
renderer.strong = (text) => `<b>${text}</b>`;
renderer.em = (text) => `<i>${text}</i>`;
renderer.del = (text) => `<s>${text}</s>`;
renderer.hr = () => '\n---\n';

// Функция для удаления нераспознанных тегов и замены <br> тегов
function sanitizeMarkdown(text) {
  return text.replace(/<br\s*\/?>/gi, '\n\n'); // Заменяем <br> теги на \n
}

marked.setOptions({
  renderer,
  gfm: true,
  breaks: false,
  sanitize: false, // Снимаем sanitize, чтобы мы могли контролировать процесс
  smartypants: true,
});

// Функция для конвертации Markdown в HTML
export function convertMarkdownToHTML(text) {
  const sanitizedText = sanitizeMarkdown(marked(text));
  return sanitizedText;
}

// Функция для повторных попыток запросов
export async function fetchWithRetry(fetchFunction, args, ctx, retries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fetchFunction(...args);
    } catch (error) {
      console.log(`Attempt ${attempt} failed: ${error.message}`);
      if (attempt < retries) {
        await new Promise(res => setTimeout(res, delay));
      } else {
        // Уведомление администратора в случае, если все попытки неудачны
        await ctx.telegram.sendMessage(377484655, `Ошибка после ${retries} попыток: ${error.message}`);
        throw error;
      }
    }
  }
}

// Функция для удаления файла
export async function removeFile(path) {
  try {
    await unlink(path);
  } catch (e) {
    console.log('Error while removing file', e.message);
  }
}
