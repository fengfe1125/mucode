import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Terminal, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Chunk {
  type: string;
  text?: string;
  name?: string;
  input?: any;
  result?: string;
  error?: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentStream, setCurrentStream] = useState<Chunk[]>([]);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStream]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setCurrentStream([]);

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] })
      });

      if (!response.body) throw new Error('No body in response');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let streamedContent = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        
        const lines = chunkValue.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') {
               done = true;
               break;
            }
            if (dataStr) {
              try {
                const data = JSON.parse(dataStr);
                setCurrentStream(prev => [...prev, data]);
                if (data.type === 'text') {
                   streamedContent += data.text;
                }
              } catch (e) {
                console.error('Error parsing chunk:', e);
              }
            }
          }
        }
      }
      setMessages(prev => [...prev, { role: 'assistant', content: streamedContent }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
      setCurrentStream([]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-3xl p-4 rounded-lg shadow-md ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-200'}`}>
              <ReactMarkdown className="prose prose-invert max-w-none">{m.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        
        {isTyping && currentStream.length > 0 && (
          <div className="flex flex-col items-start space-y-2">
            <div className="max-w-3xl p-4 rounded-lg bg-gray-800 text-gray-200">
              {currentStream.filter(c => c.type === 'text').map(c => c.text).join('') && (
                 <ReactMarkdown className="prose prose-invert max-w-none">
                    {currentStream.filter(c => c.type === 'text').map(c => c.text).join('')}
                 </ReactMarkdown>
              )}
              
              {currentStream.map((chunk, idx) => {
                if (chunk.type === 'tool_start') {
                   return (
                     <div key={idx} className="mt-4 p-3 bg-gray-950 rounded border border-gray-700 font-mono text-sm">
                        <div className="flex items-center text-blue-400 mb-2">
                           <Terminal size={16} className="mr-2" />
                           Running: {chunk.name}
                        </div>
                        <pre className="text-gray-400 overflow-x-auto">
                          {JSON.stringify(chunk.input, null, 2)}
                        </pre>
                     </div>
                   );
                }
                if (chunk.type === 'tool_result') {
                   return (
                     <div key={idx} className="mt-2 p-3 bg-gray-950 rounded border border-green-900 font-mono text-sm">
                        <div className="text-green-400 mb-1">Result:</div>
                        <pre className="text-gray-300 overflow-x-auto max-h-40">
                          {chunk.result}
                        </pre>
                     </div>
                   );
                }
                return null;
              })}
              {isTyping && <div className="mt-2 text-gray-500 animate-pulse flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Thinking...</div>}
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <form onSubmit={handleSubmit} className="flex space-x-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            placeholder="Ask Mu Code to build something..."
            className="flex-1 bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={isTyping || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center justify-center disabled:opacity-50 transition-colors"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
