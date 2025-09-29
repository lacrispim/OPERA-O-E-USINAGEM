import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      models: {
        'gemini-pro': {model: 'gemini-1.5-flash-latest'},
      },
    }),
  ],
  model: 'googleai/gemini-pro',
});
