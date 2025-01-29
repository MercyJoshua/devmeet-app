/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */

import React, { useState } from 'react';
import ProjectCreationModal from './ProjectCreationModal';
import { Project } from '@/types/Project';

type ProjectTopPanelProps = {
  activeTab: 'Projects' | 'Create Project' | 'Activity';
  onTabChange: (tab: 'Projects' | 'Create Project' | 'Activity') => void;
  onCreateProject: () => void;
  onSearch: (query: string) => void;
  onSort: (criteria: string) => void;
  toggleView: () => void;
  isListView: boolean;
};
const ProjectTopPanel: React.FC<ProjectTopPanelProps> = ({
  activeTab,
  onTabChange,
  onCreateProject,
  onSearch,
  onSort,
  toggleView,
  isListView,
}) => {
  const openProjectCreationModal = () => setIsProjectCreationModalOpen(true);
  const closeProjectCreationModal = () => setIsProjectCreationModalOpen(false);
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
  const [isProjectCreationModalOpen, setIsProjectCreationModalOpen] = useState(false);
  const handleProjectCreated = (newProject: Project) => {
    setProjects((prevProjects: Project[]) => [...prevProjects, newProject]);
  };
  const [projects, setProjects] = useState<Project[]>([]);  
  
  return (
    <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
      <div className="left-controls flex gap-4">
        {/* View Toggle */}
        <button className="btn-toggle-view bg-blue-500 text-white px-4 py-2 rounded" onClick={toggleView}>
          {isListView ? 'Card View' : 'List View'}
        </button>

        {/* Search */}
        <input
          type="text"
          placeholder="Search Projects..."
          className="search-input w-64 p-2 rounded text-black"
          onChange={(e) => onSearch(e.target.value)}
        />

        {/* Sort Dropdown */}
        <select onChange={(e) => onSort(e.target.value)} className="sort-dropdown bg-gray-700 text-white p-2 rounded">
          <option value="name">Sort by Name</option>
          <option value="date">Sort by Start Date</option>
          <option value="status">Sort by Status</option>
        </select>
      </div>

      {/* Create Project Button */}
      {/* <button onClick={() => onTabChange('Create Project')}>Create Project</button> */}
      <button onClick={openProjectCreationModal}>Create Project</button>
      {isProjectCreationModalOpen && (
        <ProjectCreationModal
        onClose={() => setIsProjectCreationModalOpen(false)}
        onProjectCreated={handleProjectCreated}
        user={loggedInUser}
        setProjects={setProjects}
        />
      )}
    </div>
  );
};

export default ProjectTopPanel;

