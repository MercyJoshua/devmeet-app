import React from 'react';

interface TeamNavPanelProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TeamNavPanel: React.FC<TeamNavPanelProps> = ({ activeTab, onTabChange }) => {
  const tabs = ['Teams', 'New Team', 'Team Invites'];

  return (
    <div className="flex space-x-4 p-4 bg-gray-800 text-white">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`px-4 py-2 rounded ${
            activeTab === tab ? 'bg-blue-500' : 'bg-gray-600'
          }`}
          onClick={() => onTabChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default TeamNavPanel;
