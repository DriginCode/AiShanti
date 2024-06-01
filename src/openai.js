import OpenAI from 'openai';
import config from 'config';
import { createReadStream } from 'fs';

const SYSTEM_PROMPT = config.get('AI_SHANTI_SYSTEM_PROMPT');

class OpenAIWrapper {
  roles = {
    ASSISTANT: 'assistant',
    USER: 'user',
    SYSTEM: 'system',
  };

  constructor(apiKey) {
    this.client = new OpenAI({ apiKey });
  }

  async chat(messages) {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
      });
      if (response && response.choices && response.choices[0] && response.choices[0].message) {
        return response.choices[0].message.content;
      } else {
        throw new Error('Invalid response structure from OpenAI');
      }
    } catch (e) {
      console.log('Error while gpt chat', e.message);
      throw new Error('Failed to communicate with OpenAI API');
    }
  }

  async transcription(filepath) {
    try {
      const response = await this.client.audio.transcriptions.create({
        file: createReadStream(filepath),
        model: 'whisper-1',
      });
      if (response && response.text) {
        return response.text;
      } else {
        throw new Error('Invalid response structure from OpenAI');
      }
    } catch (e) {
      console.log('Error while transcription', e.message);
      throw new Error('Failed to transcribe audio');
    }
  }

  async generateImage(prompt) {
    try {
      const response = await this.client.images.create({
        prompt,
        n: 1,
        size: '1024x1024',
      });
      if (response && response.data && response.data[0] && response.data[0].url) {
        return response.data[0].url;
      } else {
        throw new Error('Invalid response structure from OpenAI');
      }
    } catch (e) {
      console.log('Error while generating image', e.message);
      throw new Error('Failed to generate image');
    }
  }
}

const apiKey = config.get('OPENAI_KEY');
if (!apiKey) {
  throw new Error('OPENAI_KEY is not set in the configuration');
}

export const openai = new OpenAIWrapper(apiKey);
