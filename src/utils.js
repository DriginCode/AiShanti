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

renderer.paragraph = (text) => text + '\n'; // Убираем <p> теги и добавляем новую строку
renderer.heading = (text, level) => `<b><u>${text}</u></b>\n`; // Заголовки
renderer.list = (body, ordered) => body; // Обрабатываем тело списка без тегов <ol> или <ul>
renderer.listitem = (text) => `• ${text}\n`; // Используем маркер списка
renderer.link = (href, title, text) => `<a href="${href}">${text}</a>`;
renderer.blockquote = (quote) => `<blockquote>${quote}</blockquote>`;
renderer.codespan = (text) => `<code>${text}</code>`;
renderer.strong = (text) => `<b>${text}</b>`;
renderer.em = (text) => `<i>${text}</i>`;
renderer.del = (text) => `<s>${text}</s>`;
renderer.html = (html) => html.replace(/<br\s*\/?>/gi, '\n'); // Убираем <br> теги
renderer.hr = () => '---'; // Обрабатываем <hr> тег как строку из трех дефисов

// Новый рендерер для нераспознанных тегов
renderer.html = (html) => {
  console.log("Удаление нераспознанных тегов:", html); // Отладочная информация
  return html.replace(/<\/?[^>]+(>|$)/g, ""); // Удаляем все HTML теги
};

marked.setOptions({
  renderer,
  gfm: true,
  breaks: false,
  sanitize: true,
  smartypants: true,
});

// Функция для конвертации Markdown в HTML с дополнительной отладочной информацией
export function convertMarkdownToHTML(text) {
  const sanitizedText = marked(text);
  console.log("Результат после обработки:", sanitizedText); // Отладочная информация
  return sanitizedText;
}


// Рабочая функция
// export function convertMarkdownToHTML(text) {
//   return marked(text);
// }


