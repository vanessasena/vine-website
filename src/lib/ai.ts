import { createOpenAI } from '@ai-sdk/openai';

// Vercel AI Gateway:
//   AI_GATEWAY_API_KEY = vck_...  (Vercel AI Gateway token from vercel.com team settings)
//   baseURL            = https://ai-gateway.vercel.sh/v1  (no /openai suffix)
//   model format       = 'openai/gpt-4o-mini'  (provider/model — required by gateway)

export const openai = createOpenAI({
  apiKey: process.env.AI_GATEWAY_API_KEY,
  baseURL: 'https://ai-gateway.vercel.sh/v1',
});

// Model ID must be provider-prefixed when going through the gateway
export const sermonModel = openai('openai/gpt-4o-mini');
