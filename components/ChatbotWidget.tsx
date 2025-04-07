'use client';

import { useEffect, useRef, useState } from 'react';

const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Get the current logged-in user
  const fetchUser = async () => {
    try {
      const res = await fetch('/api/get-logged-in-user');
      const data = await res.json();
      return data?.user?.userId || null;
    } catch (err) {
      console.error('Failed to fetch user:', err);
      return null;
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkUserChange = async () => {
      const currentUser = await fetchUser();

      if (userId !== currentUser) {
        setUserId(currentUser);
        setMessages([]); // Clear chat when user changes
      }
    };

    // Poll every 5 minutes
    interval = setInterval(checkUserChange, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [userId]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, `You: ${input}`];
    setMessages(newMessages);
    setInput('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      const botReply = data.reply || 'Sorry, no response from the bot.';
      setMessages([...newMessages, `Bot: ${botReply}`]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages([...newMessages, 'Bot: Sorry, something went wrong.']);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="p-3 bg-blue-600 text-white rounded-full shadow-lg"
        >
          💬
        </button>
      )}

      {open && (
        <div className="relative mt-2 p-4 bg-white border-2 border-purple-300 rounded-lg shadow-lg w-80 h-[32rem] flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold">Shauryan Chatbot</h2>
            <button onClick={() => setOpen(false)} className="text-gray-600">
              ✖
            </button>
          </div>

          <div className="flex-1 overflow-auto space-y-2 pr-1">
            {messages.map((msg, idx) => {
              const isUser = msg.startsWith('You:');
              const text = msg.replace(/^You:\s?|^Bot:\s?/, '');

              return (
                <div
                  key={idx}
                  className={`max-w-[75%] px-3 py-2 rounded-lg text-sm whitespace-pre-line break-words ${
                    isUser
                      ? 'ml-auto bg-purple-100 text-left rounded-br-none'
                      : 'mr-auto bg-gray-100 border border-purple-300 text-left rounded-bl-none'
                  }`}
                >
                  {text}
                </div>
              );
            })}
          </div>

          <div className="mt-2 flex items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              rows={1}
              className="flex-1 border px-2 py-1 rounded-l-md text-sm resize-none overflow-hidden"
              placeholder="Ask me anything..."
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-3 py-1 rounded-r-md text-sm"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
