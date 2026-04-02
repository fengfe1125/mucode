import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { tools, executeTool } from '../tools';
import { getConfig } from '../config';

export async function handleChat(messages: any[], onChunk: (chunk: any) => void) {
  const config = getConfig();
  const provider = config.defaultProvider || 'anthropic';

  const systemPrompt = `You are Mu Code, an expert AI software engineer. 
    Current language preference: ${config.language === 'zh' ? 'Chinese (简体中文)' : 'English'}.
    Please always respond and explain in this language.
    You have access to tools like bash, read_file, write_file, and edit_file.
    Use them to help the user build and debug software.`;

  let currentMessages = [...messages];
  let isDone = false;

  if (provider === 'anthropic') {
    if (!config.anthropicApiKey) throw new Error('Anthropic API Key is not configured.');
    const anthropic = new Anthropic({ apiKey: config.anthropicApiKey });

    while (!isDone) {
      const stream = anthropic.messages.stream({
        model: config.modelPreference || 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: systemPrompt,
        messages: currentMessages,
        tools: tools as any[],
      });

      let assistantMessage = '';
      let toolCalls: any[] = [];
      let currentToolCall: any = null;

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          onChunk({ type: 'text', text: chunk.delta.text });
        } else if (chunk.type === 'content_block_start' && chunk.content_block.type === 'tool_use') {
          currentToolCall = { id: chunk.content_block.id, name: chunk.content_block.name, input: '' };
        } else if (chunk.type === 'content_block_delta' && chunk.delta.type === 'input_json_delta') {
          if (currentToolCall) currentToolCall.input += chunk.delta.partial_json;
        } else if (chunk.type === 'content_block_stop') {
          if (currentToolCall) {
            currentToolCall.input = JSON.parse(currentToolCall.input);
            toolCalls.push(currentToolCall);
            currentToolCall = null;
          }
        }
      }

      const finalMessage = await stream.finalMessage();
      currentMessages.push({ role: 'assistant', content: finalMessage.content });

      if (toolCalls.length > 0) {
        const toolResults = [];
        for (const call of toolCalls) {
          onChunk({ type: 'tool_start', name: call.name, input: call.input });
          const result = await executeTool(call.name, call.input);
          onChunk({ type: 'tool_result', name: call.name, result });
          toolResults.push({ type: 'tool_result', tool_use_id: call.id, content: result });
        }
        currentMessages.push({ role: 'user', content: toolResults });
      } else {
        isDone = true;
      }
    }
  } else {
    // OpenAI Provider
    if (!config.openaiApiKey) throw new Error('OpenAI API Key is not configured.');
    const openai = new OpenAI({ apiKey: config.openaiApiKey });

    while (!isDone) {
      const completion = await openai.chat.completions.create({
        model: config.modelPreference || 'gpt-4o',
        messages: [{ role: 'system', content: systemPrompt }, ...currentMessages] as any,
        tools: tools.map(t => ({ type: 'function', function: { name: t.name, description: t.description, parameters: t.input_schema } })) as any,
        stream: true,
      });

      let assistantMessage = '';
      let toolCalls: any[] = [];

      for await (const chunk of completion) {
        const delta = chunk.choices[0]?.delta;
        if (delta?.content) {
          onChunk({ type: 'text', text: delta.content });
          assistantMessage += delta.content;
        }
        if (delta?.tool_calls) {
          for (const tc of delta.tool_calls) {
            if (!toolCalls[tc.index]) {
              toolCalls[tc.index] = { id: tc.id, name: tc.function?.name, input: '' };
            }
            if (tc.function?.arguments) toolCalls[tc.index].input += tc.function.arguments;
          }
        }
      }

      currentMessages.push({ role: 'assistant', content: assistantMessage });

      if (toolCalls.length > 0) {
        const toolResults = [];
        for (const call of toolCalls) {
          const input = JSON.parse(call.input);
          onChunk({ type: 'tool_start', name: call.name, input });
          const result = await executeTool(call.name, input);
          onChunk({ type: 'tool_result', name: call.name, result });
          toolResults.push({ role: 'tool', tool_call_id: call.id, content: result });
        }
        currentMessages.push(...(toolResults as any));
      } else {
        isDone = true;
      }
    }
  }
}
