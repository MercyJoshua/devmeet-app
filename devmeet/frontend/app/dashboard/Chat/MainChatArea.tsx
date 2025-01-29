// MainChatArea.tsx
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Picker from '@emoji-mart/react';
import { FaPaperclip } from 'react-icons/fa';
import axios from 'axios';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  file?: File;
  isRead: boolean;
}

interface MainChatAreaProps {
  messages: Message[];
  activeChatId: string | null;
  chats: { id: string; name: string }[];
  onSendMessage: () => void;
  message: string;
  setMessage: (msg: string) => void;
  isEmojiPickerOpen: boolean;
  setEmojiPickerOpen: (open: boolean) => void;
  addEmoji: (emoji: unknown) => void;
  file: File[] | null;
  setFile: (file: File | null) => void;
//   handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hasMoreMessages: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fetchMessages: (offset: number) => void;
}

const MainChatArea: React.FC<MainChatAreaProps> = ({ activeChatId, chats, message, setMessage, isEmojiPickerOpen, setEmojiPickerOpen, addEmoji, hasMoreMessages}) => {
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [file, setFile] = useState<File[] | null>(null);


  

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(Array.from(e.target.files)); // Convert FileList to an array
      console.log('Files selected:', Array.from(e.target.files)); // Debugging log
    }
  };
  
  const renderFilePreview = (file: File) => {
    const fileType = file.type.split('/')[0];
    if (fileType === 'image') {
      return <Image src={URL.createObjectURL(file)} alt="File preview" width={200} height={200} className="w-full h-auto max-w-xs mt-2 rounded-md" />;
    }
    if (fileType === 'video') {
      return (
        <video controls className="w-full h-auto max-w-xs mt-2 rounded-md">
          <source src={URL.createObjectURL(file)} />
          Your browser does not support the video tag.
        </video>
      );
    }
    if (file.type === 'application/pdf') {
      return <embed src={URL.createObjectURL(file)} type="application/pdf" className="w-full h-64 mt-2 rounded-md" />;
    }
    return <div className="mt-2 text-gray-500"><span>{file.name}</span></div>;
  };

  const convertToLinks = (text: string) => {
    const urlRegex = /https?:\/\/[^\s]+/g;
    return text.split(urlRegex).map((part, index) => {
      const match = text.match(urlRegex)?.[index];
      return match ? (
        <>
          {part}
          <a href={match} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            {match}
          </a>
        </>
      ) : (
        part
      );
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setEmojiPickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setEmojiPickerOpen]);

  // Fetch messages for the active chat
const fetchMessages = async (chatId: string, offset: number) => {
    try {
      const response = await axios.get(`/api/messages`, {
        params: {
          chatId,
          offset,
        },
      });
      return response.data; // Assuming the API returns messages
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  };
  

  // Send messages
  const sendMessage = async (data: FormData) => {
    try {
        const response = await axios.post('/api/messages/send', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        console.log('Message sent successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending message:', error.response?.data || error.message);
        return null;
    }
};


  const handleSendMessage = async () => {
    if (!message.trim() && !file) return; // Don't send empty messages
    const formData = new FormData();
    formData.append('senderId', '123'); // Example sender ID
    formData.append('receiverId', '456'); // Example receiver ID
    formData.append('content', 'Hello, World!');
    // Add files if any
    if (file && file.length > 0) {
        file.forEach((f) => formData.append('files', f));
      }
    try {
      const sentMessage = await sendMessage(formData);
      if (sentMessage) {
        setMessages((prevMessages) => [...prevMessages, sentMessage]); // Append the new message
      }
      setMessage(''); // Clear the input
      setFile(null); // Reset the file
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
// Read receipts
  const markMessagesAsRead = async (chatId: string) => {
    try {
      await axios.put(`/api/messages/read`, { chatId });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };
  useEffect(() => {
    if (activeChatId) {
      markMessagesAsRead(activeChatId);
    }
  }, [activeChatId]);
  
  // Load more messages
  const loadMoreMessages = async (chatId: string, offset: number) => {
    try {
      const response = await axios.get(`/api/messages/load-more`, {
        params: { chatId, offset },
      });
      return response.data; // Assuming the API returns additional messages
    } catch (error) {
      console.error('Error loading more messages:', error);
      throw error;
    }
  };
  const handleLoadMoreMessages = async () => {
    try {
      const moreMessages = await loadMoreMessages(activeChatId!, messages.length);
      setMessages((prevMessages) => [...moreMessages, ...prevMessages]);
    } catch (error) {
      console.error('Error loading more messages:', error);
    }
  };
  
// Delete message
const deleteMessage = async (messageId: string) => {
    try {
      await axios.delete(`/api/messages/${messageId}`);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };
  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
      setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };
  
  useEffect(() => {
    if (activeChatId) {
      const loadInitialMessages = async () => {
        try {
          const messages = await fetchMessages(activeChatId, 0); // Fetch the first batch
          // Assuming you have a state to hold messages
          setMessages(messages);
        } catch (error) {
          console.error('Error loading initial messages:', error);
        }
      };
  
      loadInitialMessages();
    }
  }, [activeChatId]);
  
  return (
    <div className="flex flex-col flex-1 h-96">
      <div className="p-4 bg-gray-800 text-white font-semibold text-lg border-b border-gray-700">
        {activeChatId ? chats.find((chat) => chat.id === activeChatId)?.name : 'No Active Chat'}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 h-80 overflow-auto">No messages yet</div>
        ) : (
          <div className="space-y-3">
           {messages.map((msg) =>
  msg ? (
    <div key={msg.id} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs p-3 rounded-lg ${
          msg.sender === 'You' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white'
        }`}
      >
        <div className="text-sm font-semibold flex justify-between">
          {msg.sender}
          {msg.sender === 'You' && (
            <button
              onClick={() => handleDeleteMessage(msg.id)}
              className="text-red-500 hover:underline"
            >
              Delete
            </button>
          )}
        </div>
        <div className="mt-1">{convertToLinks(msg.content)}</div>
        {msg.file && renderFilePreview(msg.file)}
      </div>
    </div>
  ) : null
)}
            {hasMoreMessages && (
             <button
             onClick={handleLoadMoreMessages}
             className="mt-4 w-full bg-gray-700 text-white py-2 rounded-md"
           >
             Load More Messages
           </button>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center p-4 bg-gray-800 border-t border-gray-700 rounded-lg">
        <div className="relative flex items-center w-full space-x-4">
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onFocus={() => setEmojiPickerOpen(false)}
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={() => setEmojiPickerOpen(!isEmojiPickerOpen)} className="text-gray-400 hover:text-white transition duration-200">
            😊
          </button>
          {isEmojiPickerOpen && (
            <div ref={pickerRef} className="absolute bottom-16 left-4 z-10">
              <Picker onEmojiSelect={addEmoji} />
            </div>
          )}
        <button
  onClick={() => fileInputRef.current?.click()}
  className="text-gray-400 hover:text-white transition duration-200"
>
  <FaPaperclip size={20} />
</button>
<input
  type="file"
  ref={fileInputRef}
  multiple
  style={{ display: 'none' }} // Hide the actual file input
  onChange={handleFileChange}
/>

        </div>
        <button
  onClick={handleSendMessage}
  className="ml-4 px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-200"
>
  Send
</button>
      </div>
    </div>
  );
};

export default MainChatArea;