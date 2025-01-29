import { useState } from 'react';
import { FaSearch, FaBell, FaPlus, FaUserCircle, FaLaptopCode, FaBars } from 'react-icons/fa';
import VideoCallScheduler from './../conference/VideoCallScheduler';
import { useRouter } from 'next/navigation';
import ProfileSettings from './ProfileSettings';
import Link from 'next/link';
import ConferencePage from '../conference/videoCall';
import axios from 'axios';
import Image from 'next/image';


interface Props {
  onItemClick: (item: string) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
  user: {
    id: string;
    username: string;
    full_name: string;
    email: string;
    role: string | null;
    skills: string; 
  };
}
export default function TopNavbar({ toggleSidebar, user }: Props) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [showVideoUI, setShowVideoUI] = useState(false); 
  const router = useRouter();
  // const [userData, setUserData] = useState(null);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  
  const toggleModal = (modalName: string) => {
    setActiveModal(activeModal === modalName ? null : modalName);
  };
// Handle Search function
const handleSearch = async () => {
  try {
    const response = await axios.get(
      `/api/auth/search/users?query=${encodeURIComponent(
        searchQuery
      )}`
    );
    setSearchResults(response.data.results);
  } catch (error) {
    console.error("Error fetching search results:", error);
    alert("Failed to fetch search results. Please try again.");
  }
};
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // To send cookies with the request
      });

      if (response.ok) {
        // Clear user session and redirect to login
        router.push('/auth/SignIn');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
// PROFILE SETTINGS
  const handleSaveProfile = (updatedUserData: { username: string; full_name: string; email: string; role: string | null }) => {
    // You can handle saving user profile changes here
    console.log('Updated user data:', updatedUserData);
    setShowProfileSettings(false); 
  };

  const handleScheduleMeeting = () => {
    setIsSchedulerOpen(true);
    setActiveModal(null);
  };

  const handleCloseScheduler = () => {
    setIsSchedulerOpen(false);
  };

  return (
    <div className="bg-gray-800 text-white flex items-center w-full mt-0 justify-between p-4">
      <FaBars onClick={toggleSidebar} size={24} className="cursor-pointer mr-4" />
      <div>
  <Link href="/dashboard">
    <Image src="/assets/images/Devmeet.png" alt="DevMeet Logo"
  width={70}  
  height={35} />
  </Link>
</div>
      <div className="flex items-center space-x-4">
        <FaSearch size={20} />
        <input
          type="text"
          placeholder="Search..."
          className="bg-gray-700 text-white px-4 py-1 rounded-full focus:outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
        />
      </div>
  {/* Results Dropdown */}
  {searchResults.length > 0 && (
        <div className="absolute top-16 left-6 bg-gray-800 text-white rounded-md shadow-lg w-96 z-50">
          {searchResults.map((result) => (
            <div
              key={result.id}
              className="p-4 hover:bg-gray-700 cursor-pointer"
            >
              <h3 className="font-semibold">{result.full_name}</h3>
              <p className="text-sm text-gray-400">
                @{result.username} | {result.email}
              </p>
              <p className="text-sm">Skills: {result.skills.join(", ")}</p>
            </div>
          ))}
        </div>
      )}
      {/* Icons Section */}
      <div className="flex items-center space-x-4 relative">
       {/* Plus Icon Dropdown */}
      <div className="relative">
        <FaPlus
          size={20}
          className="cursor-pointer"
          onClick={() => toggleModal('plusMenu')}
        />
        {activeModal === 'plusMenu' && (
          <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg">
            <ul className="text-sm text-white">
              <li
                className="px-4 py-2 hover:bg-gray-600 cursor-pointer"
              >
                Extensions(coming soon)
              </li>
            </ul>
          </div>
        )}
      </div>

        {/* Laptop Icon for Meetings */}
        <FaLaptopCode
          size={20}
          className="cursor-pointer"
          onClick={() => toggleModal('meetingModal')}
        />
        
        {/* Meetings Modal Dropdown */}
        {activeModal === 'meetingModal' && (
          <div className="absolute right-0 mt-44 w-48 bg-gray-900 px-2 rounded-lg shadow-lg">

            {/* ____TEMPORARY BUTTON___--------______ */}
               {/* Video UI Toggle Button */}
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => setShowVideoUI(!showVideoUI)}
        >
          {showVideoUI ? 'Hide Video UI' : 'Show Video UI'}
        </button>

        {/* Video Conferencing UI */}
        {showVideoUI && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-gray-950 p-6 rounded-lg shadow-lg max-w-full w-full">
              <ConferencePage />
              <button
                className="text-red-500 mt-4"
                onClick={() => setShowVideoUI(false)}
              >
                Close Video UI
              </button>
            </div>
          </div>
        )}

            <p className="mb-4">No meetings scheduled.</p>
            <button
              className="bg-blue-500 text-white p-2 rounded"
              onClick={handleScheduleMeeting} 
            >
              Schedule a Meeting
            </button>
            <button
              className="text-red-500 mt-4"
              onClick={() => setActiveModal(null)}
            >
              Close
            </button>
          </div>
        )}

        {/* Video Call Scheduler Modal */}
        {isSchedulerOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
              <VideoCallScheduler onSave={(data) => console.log('Meeting data:', data)} />
              <button
                className="text-red-500 mt-4"
                onClick={handleCloseScheduler}
              >
                Close Scheduler
              </button>
            </div>
          </div>
        )}
        {/* Bell Icon for Notifications */}
        <div className="relative">
          <FaBell
            size={20}
            className="cursor-pointer"
            onClick={() => toggleModal('notifications')}
          />
          {activeModal === 'notifications' && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg">
              <ul className="text-sm text-white">
                <li className="px-4 py-2 hover:bg-gray-600 cursor-pointer">General Notification 1</li>
                <li className="px-4 py-2 hover:bg-gray-600 cursor-pointer">Important Notification</li>
              </ul>
            </div>
          )}
        </div>

        {/* Profile Icon with User Info */}
        <div className="relative flex items-center">
        <FaUserCircle
          size={24}
          className="cursor-pointer"
          onClick={() => toggleModal('profile')}
        />
        <div className="flex flex-col">
          <span className="text-xs text-gray-400">{user.full_name}</span>
          <span className="text-sm font-bold">{user.username}</span>
        </div>
        {activeModal === 'profile' && (
          <div className="absolute right-0 mt-2 w-40 bg-gray-700 rounded-lg shadow-lg">
            <ul className="text-sm text-white">
              <li
                className="px-4 py-2 hover:bg-gray-600 cursor-pointer"
                onClick={() => setShowProfileSettings(true)} 
              >
                Profile Settings
              </li>
              <li
                className="px-4 py-2 hover:bg-gray-600 cursor-pointer"
                onClick={handleLogout}
              >
                Logout
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Show Profile Settings Modal */}
      {showProfileSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <ProfileSettings
              user={user}
              onClose={() => setShowProfileSettings(false)}
              onSave={handleSaveProfile} 
            />
          </div>
        </div>
      )}
      </div>
    </div>
  );
}