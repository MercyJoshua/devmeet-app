// ChatInterface.tsx
import { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import Sidebar from './Sidebar';
import MainChatArea from './MainChatArea';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  file?: File;
  isRead: boolean;
}

interface Chat {
  id: string;
  name: string;
  type: 'project' | 'user' | 'team';
}

interface Emoji {
  native: string;
}

const ChatInterface = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [file, setFile] = useState<File[]>([]);
  const [isEmojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get('/api/messages/chats');
        setChats(response.data);
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };
    fetchChats();
  }, []);

  useEffect(() => {
    socket.current = io('http://localhost:5000');

    socket.current.on('new-message', (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, { ...message, isRead: false }]);
    });

    return () => {
      socket.current?.disconnect();
    };
  }, []);

  const fetchMessages = useCallback(async (offset = 0) => {
    if (activeChatId) {
      try {
        const response = await axios.get(`/api/messages?chatId=${activeChatId}&offset=${offset}`);
        if (response.data.length) {
          setMessages((prevMessages) => [...response.data.reverse(), ...prevMessages]);
        } else {
          setHasMoreMessages(false);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    }
  }, [activeChatId]);

  useEffect(() => {
    if (activeChatId) {
      fetchMessages();
    }
  }, [activeChatId, fetchMessages]);

  const addEmoji = (emoji: Emoji) => {
    setMessage((prev) => prev + emoji.native);
  };

  const handleSelectChat = (chatId: string | null) => {
    setActiveChatId(chatId);
    setMessages([]);
    setHasMoreMessages(true);
  };

  const handleSendMessage = () => {
    if (message.trim() || file.length > 0) {
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: 'You',
        content: message,
        timestamp: new Date().toLocaleTimeString(),
        file: file.length > 0 ? file[0] : undefined,
        isRead: true,
      };

      socket.current?.emit('send-message', newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessage('');
      setFile([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size <= 10 * 1024 * 1024 && ['image', 'video', 'application/pdf'].includes(selectedFile.type.split('/')[0])) {
        setFile([selectedFile]);
      } else {
        alert('File is too large or unsupported type.');
      }
    }
  };

  return (
    <div className="flex h-full bg-gray-900 text-gray-200">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <MainChatArea
        messages={messages}
        activeChatId={activeChatId}
        chats={chats}
        onSendMessage={handleSendMessage}
        message={message}
        setMessage={setMessage}
        isEmojiPickerOpen={isEmojiPickerOpen}
        setEmojiPickerOpen={setEmojiPickerOpen}
        addEmoji={addEmoji}
        file={file}
        setFile={(file: File) => setFile([file])}
        handleFileChange={handleFileChange}
        hasMoreMessages={hasMoreMessages}
        fetchMessages={fetchMessages}
      />
    </div>
  );
};

export default ChatInterface;
