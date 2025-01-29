import React from 'react';

const EditorTabs: React.FC<{
  tabs: { id: number; name: string }[];
  activeTab: number | null;
  onActivateTab: (id: number) => void;
  onCloseTab: (id: number) => void;
}> = ({ tabs, activeTab, onActivateTab, onCloseTab }) => {
  return (
    <div className="flex bg-gray-800 text-white overflow-x-auto max-w-2xl">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`flex items-center px-4 py-2 cursor-pointer ${
            activeTab === tab.id ? 'bg-gray-600' : 'hover:bg-gray-700'
          }`}
          onClick={() => onActivateTab(tab.id)}
        >
          <span>{tab.name}</span>
          <button
            className="ml-2 text-gray-400 hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering tab activation
              onCloseTab(tab.id);
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default EditorTabs;
