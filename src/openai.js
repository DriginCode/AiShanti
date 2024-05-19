import { Configuration, OpenAIApi } from 'openai';
import config from 'config';
import { createReadStream } from 'fs';

const SYSTEM_PROMPT = config.get('AI_SHANTI_SYSTEM_PROMPT');


//Класс для работы с OpenAI API.
class OpenAI {
  roles = {
    ASSISTANT: 'assistant',
    USER: 'user',
    SYSTEM: 'system',
  };

  //* Создает экземпляр OpenAI.
  constructor(apiKey) {
    const configuration = new Configuration({
      apiKey,
    });
    this.openai = new OpenAIApi(configuration);
  }

  //* Отправляет сообщения в модель GPT-3.5-turbo и получает ответ.
  async chat(messages) {
    try {
      const response = await this.openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
      });
      return response.data.choices[0].message;
    } catch (e) {
      console.log('Error while gpt chat', e.message);
    }
  }

  //* Создает текстовую транскрипцию из аудиофайла.
  async transcription(filepath) {
    try {
      const response = await this.openai.createTranscription(
        createReadStream(filepath),
        'whisper-1'
      );
      return response.data.text;
    } catch (e) {
      console.log('Error while transcription', e.message);
    }
  }

  // Генерирует изображение на основе текстового описания.
  async generateImage(prompt) {
    try {
      console.log('Generating image with prompt:', prompt);
      const response = await this.openai.createImage({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
      });
      // console.log('API response:', response);
      //console.log('API response data:', response.data);
      //console.log('Generated image URL:', response.data.data[0].url);
      return response.data.data[0].url;
    } catch (e) {
      console.log('Error while generating image', e.message);
      throw new Error('Failed to generate image.');
    }
  }
}

export const openai = new OpenAI(config.get('OPENAI_KEY'));
