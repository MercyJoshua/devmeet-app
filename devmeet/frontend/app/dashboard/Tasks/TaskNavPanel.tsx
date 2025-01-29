import React from 'react';
import { Project } from '@/types/Project';

interface TaskNavPanelProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project | null) => void;
}

const TaskNavPanel: React.FC<TaskNavPanelProps> = ({
  activeTab,
  onTabChange,
  projects,
  selectedProject,
  onSelectProject,
}) => {
  const tabs = ["Tasks", "Create Task", "Files", "Activity"];

  return (
    <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <select
          className="bg-gray-800 text-white px-4 py-2 rounded"
          value={selectedProject?.id || ''}
          onChange={(e) => {
            const selectedId = parseInt(e.target.value, 10); // Parse the value to an integer
            const project = projects.find((p) => p.id === selectedId) || null;
            onSelectProject(project); // Update the selected project
          }}
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </select>
        <div className="w-48 bg-gray-700 rounded-full overflow-hidden ml-4">
          <div
            className="bg-green-500 h-2"
            style={{ width: `${selectedProject?.progress || 0}%` }}
          ></div>
        </div>
        <span className="ml-2 text-green-400">
          {selectedProject?.progress || 0}%
        </span>
      </div>
      <div className="flex space-x-4 ml-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-3 py-1 rounded ${
              activeTab === tab ? 'bg-purple-600' : 'bg-gray-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TaskNavPanel;
