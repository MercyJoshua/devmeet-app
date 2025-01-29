// Sidebar.tsx
import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa';

interface Chat {
    id: string;
    name: string;
    type: 'user' | 'team' | 'project';
  }
  
  interface SidebarProps {
    chats: Chat[];
    activeChatId: string | null;
    onSelectChat: (chatId: string | null) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
  }

const Sidebar: React.FC<SidebarProps> = ({ chats, activeChatId, onSelectChat, searchQuery, setSearchQuery }) => {
    const [searchResults, setSearchResults] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(false);

    // search chat
    useEffect(() => {
        const fetchSearchResults = async () => {
          if (searchQuery.trim() === '') {
            setSearchResults([]);
            return;
          }
          setLoading(true);
          try {
            const { data } = await axios.get('/api/messages/search', {
              params: { searchQuery },
            });
            setSearchResults(data.data);
          } catch (error) {
            console.error('Error fetching search results:', error);
          } finally {
            setLoading(false);
          }
        };
        fetchSearchResults();
      }, [searchQuery]);
    
// Select and create chat
const handleSelectSearchResult = async (result: Chat) => {
    try {
      // Create or fetch chat
      const { data } = await axios.post('/api/messages/chats/create', {
        user1Id: 'loggedInUser', // Replace with actual logged-in user ID
        user2Id: result.name,
      });
      const newChat = { id: data.chatId, name: result.name, type: result.type };
      onSelectChat(newChat.id);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

 const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <div className="w-1/4 bg-gray-800 text-white p-4 overflow-y-auto border-r border-gray-700">
      <h2 className="text-lg font-semibold mb-4">Chats</h2>
      <div className="relative mb-6">
      <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-700 text-white px-10 py-2 rounded-md focus:outline-none"
        />
        <div className="absolute inset-y-0 left-2 flex items-center">
          <FaSearch size={16} className="text-gray-400" />
        </div>
      </div>
    
      {loading ? (
        <div className="text-gray-400 text-center">Searching...</div>
      ) : searchResults.length > 0 ? (
        <div className="mb-4">
          <h3 className="text-gray-400 mb-2">Search Results</h3>
          {searchResults.map((result) => (
            <div
              key={result.id}
              className="p-3 mb-2 cursor-pointer rounded-md hover:bg-gray-700"
              onClick={() => handleSelectSearchResult(result)}
            >
              {result.name} <span className="text-sm text-gray-400">({result.type})</span>
            </div>
          ))}
        </div>
      ) : filteredChats.length > 0 ? (
        <div>
          <h3 className="text-gray-400 mb-2">Your Chats</h3>
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              className={`p-3 mb-2 cursor-pointer rounded-md ${
                chat.id === activeChatId ? 'bg-gray-700' : 'hover:bg-gray-700'
              }`}
              onClick={() => onSelectChat(chat.id)}
            >
              {chat.name}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-400 text-center">No results found</div>
      )}
    </div>
  );

};


export default Sidebar;