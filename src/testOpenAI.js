import OpenAI from 'openai';
import config from 'config';
import { escapeMarkdownV2 } from './utils.js';

async function testOpenAI(apiKey, prompt) {
    const openai = new OpenAI({ apiKey });
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'user', content: prompt },
            ],
        });
        if (response && response.choices && response.choices[0] && response.choices[0].message) {
            return response.choices[0].message.content;
        } else {
            throw new Error('Invalid response structure from OpenAI');
        }
    } catch (error) {
        throw new Error(`Error while communicating with OpenAI API: ${error.message}`);
    }
}

export async function handleTestMarkdown(ctx) {
    const apiKey = config.get('OPENAI_KEY');
    const prompt = 'Напиши все возможные варианты форматирования текста в Telegram, которые ты поддерживаешь.';
    try {
        const response = await testOpenAI(apiKey, prompt);
        console.log("Original response from OpenAI:", response);

        const escapedContent = escapeMarkdownV2(response);
        console.log("Escaped content for Telegram:", escapedContent);

        await ctx.reply(escapedContent, { parse_mode: 'MarkdownV2' });
    } catch (error) {
        console.error('Error in handleTestMarkdown:', error.message);
        await ctx.reply(`Error: ${error.message}`);
    }
}
