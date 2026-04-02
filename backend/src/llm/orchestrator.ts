import Anthropic from '@anthropic-ai/sdk';
import { tools, executeTool } from '../tools';
import { getConfig } from '../config';

export async function handleChat(messages: any[], onChunk: (chunk: any) => void) {
  const config = getConfig();
  if (!config.anthropicApiKey && config.defaultProvider === 'anthropic') {
    throw new Error('Anthropic API Key is not configured.');
  }

  const anthropic = new Anthropic({
    apiKey: config.anthropicApiKey || 'dummy-key' // Will fail on use if invalid
  });

  let currentMessages = [...messages];
  let isDone = false;

  while (!isDone) {
    const stream = anthropic.messages.stream({
      model: config.modelPreference || 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: currentMessages,
      tools: tools as any[],
    });

    let assistantMessage = '';
    let toolCalls: any[] = [];
    let currentToolCall: any = null;

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        assistantMessage += chunk.delta.text;
        onChunk({ type: 'text', text: chunk.delta.text });
      } else if (chunk.type === 'content_block_start' && chunk.content_block.type === 'tool_use') {
        currentToolCall = {
          id: chunk.content_block.id,
          name: chunk.content_block.name,
          input: ''
        };
      } else if (chunk.type === 'content_block_delta' && chunk.delta.type === 'input_json_delta') {
        if (currentToolCall) {
          currentToolCall.input += chunk.delta.partial_json;
        }
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
        
        toolResults.push({
          type: 'tool_result',
          tool_use_id: call.id,
          content: result
        });
      }
      
      currentMessages.push({
        role: 'user',
        content: toolResults
      });
      // Loop continues with tool results
    } else {
      isDone = true;
    }
  }
}
