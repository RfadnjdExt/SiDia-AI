import { env } from '$env/dynamic/private';

export const appConfig = {
    // Provider: 'gemini' | 'gpt'
    aiProvider: (env.AI_PROVIDER || 'gemini') as 'gemini' | 'gpt',

    // GPT Configuration (from submodule)
    gptServerUrl: env.GPT_SERVER_URL || 'http://localhost:6969/conversation',
    gptProxy: env.GPT_PROXY || '' // Default to empty (direct connection)
};
