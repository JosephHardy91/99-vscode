import { Range } from './types';

export interface Prompts {
  fillInFunction: () => string;
  visualSelection: (range: Range) => string;
  prompt: (additionalPrompt: string, basePrompt: string) => string;
}

export const prompts: Prompts = {
  fillInFunction: () => {
    return `You are an AI assistant helping to implement a function.

Instructions:
1. Analyze the function signature and any existing code
2. Implement the function body based on the signature and context
3. Return ONLY the complete function implementation
4. Do not include explanations or comments unless they match the existing style
5. Ensure the implementation is correct and follows best practices

Please implement the function.`;
  },

  visualSelection: (range: Range) => {
    return `You are an AI assistant helping to process a code selection.

Instructions:
1. Analyze the selected code
2. Follow any additional instructions provided
3. Return the improved/modified code
4. Maintain the same structure and style
5. Do not include explanations unless requested

Please process the selection.`;
  },

  prompt: (additionalPrompt: string, basePrompt: string) => {
    return `${basePrompt}

Additional Instructions:
${additionalPrompt}`;
  },
};
