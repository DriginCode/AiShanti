import { unlink } from 'fs/promises';
import { marked } from 'marked';

export async function removeFile(path) {
  try {
    await unlink(path);
  } catch (e) {
    console.log('Error while removing file', e.message);
  }
}


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
  console.log("Sanitizing text:", text);
  return text.replace(/<br\s*\/?>/gi, '\n\n') // Заменяем <br> теги на \n
}

marked.setOptions({
  renderer,
  gfm: true,
  breaks: false,
  sanitize: false, // Снимаем sanitize, чтобы мы могли контролировать процесс
  smartypants: true,
});

// Функция для конвертации Markdown в HTML с дополнительной отладочной информацией
export function convertMarkdownToHTML(text) {
  console.log("Исходный текст:", text);
  const sanitizedText = sanitizeMarkdown(marked(text));
  console.log("Результат после обработки:", sanitizedText); // Отладочная информация
  return sanitizedText;
}
