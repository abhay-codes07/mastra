import { describe, expect, it } from 'vitest';
import type { AIV5Type } from '../types';
import { StepContentExtractor } from './step-content';

// Each assistant step is stored beginning with a leading `step-start` marker.
function makeUiMessages(parts: AIV5Type.UIMessage['parts']): AIV5Type.UIMessage[] {
  return [{ id: 'm1', role: 'assistant', parts } as AIV5Type.UIMessage];
}

// Simple content function: return each model message's content as text parts.
const stepContentFn = (message?: AIV5Type.ModelMessage): AIV5Type.StepResult<any>['content'] => {
  if (!message) return [];
  if (typeof message.content === 'string') return [{ type: 'text', text: message.content }];
  return message.content as AIV5Type.StepResult<any>['content'];
};

function texts(content: AIV5Type.StepResult<any>['content']): string[] {
  return content.filter((c: any) => c.type === 'text').map((c: any) => c.text);
}

describe('StepContentExtractor.extractStepContent', () => {
  it('returns the same content for step 1 and the last step of a single-step message', () => {
    const ui = makeUiMessages([{ type: 'step-start' } as any, { type: 'text', text: 'ONLY' } as any]);

    const first = StepContentExtractor.extractStepContent(ui, 1, stepContentFn);
    const last = StepContentExtractor.extractStepContent(ui, -1, stepContentFn);

    expect(texts(last)).toEqual(['ONLY']);
    expect(texts(first)).toEqual(['ONLY']);
  });

  it('attributes multi-step content to the correct step number', () => {
    const ui = makeUiMessages([
      { type: 'step-start' } as any,
      { type: 'text', text: 'STEP1' } as any,
      { type: 'step-start' } as any,
      { type: 'text', text: 'STEP2' } as any,
    ]);

    expect(texts(StepContentExtractor.extractStepContent(ui, 1, stepContentFn))).toEqual(['STEP1']);
    expect(texts(StepContentExtractor.extractStepContent(ui, 2, stepContentFn))).toEqual(['STEP2']);
    expect(texts(StepContentExtractor.extractStepContent(ui, -1, stepContentFn))).toEqual(['STEP2']);
  });
});
