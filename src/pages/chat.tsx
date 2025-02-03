import React, { useState } from 'react';

type Message = {
  id: number;
  sender: 'user' | 'ai';
  text: string;
};

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage: Message = {
      id: Date.now(),
      sender: 'user',
      text: input
    };
    setMessages(prev => [...prev, newMessage]);
    
    // AIの応答をシミュレート
    setTimeout(() => {
      const aiMessage: Message = {
        id: Date.now() + 1,
        sender: 'ai',
        text: 'これはサンプルの応答です。'
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
    
    setInput("");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-xl">ChatGPT風チャット</h1>
      </header>
      <main className="flex-1 overflow-auto p-4">
        {messages.map(msg => (
          <div key={msg.id} className={`mb-2 p-2 rounded ${msg.sender === 'user' ? 'bg-white text-right' : 'bg-blue-200 text-left'}`}>
            <p>{msg.text}</p>
          </div>
        ))}
      </main>
      <footer className="p-4 bg-gray-200 flex">
        <input
          type="text"
          className="flex-1 p-2 border rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if(e.key === 'Enter') { handleSend(); } }}
          placeholder="メッセージを入力..."
        />
        <button className="ml-2 px-4 bg-blue-600 text-white rounded" onClick={handleSend}>
          送信
        </button>
      </footer>
    </div>
  );
};

export default ChatPage; 