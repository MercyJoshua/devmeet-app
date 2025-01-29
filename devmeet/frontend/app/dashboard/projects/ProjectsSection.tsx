import React, { useState, useEffect, useMemo } from 'react';
import ProjectTopPanel from './ProjectTopPanel';
// import ProjectView from './ProjectView';
import ProjectCreationModal from './ProjectCreationModal';
import { Project } from '../../../types/Project';
import axios from 'axios';
import dynamic from "next/dynamic";

const ProjectView = dynamic(
  () => {
    return import("./ProjectView");
  },
  { ssr: false }
);

const ProjectsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Projects' | 'Create Project' | 'Activity'>('Projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isProjectCreationModalOpen, setIsProjectCreationModalOpen] = useState(false);
  const [isListView, setIsListView] = useState(true);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortCriteria, setSortCriteria] = useState('title');
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('/api/projects/retrieve');
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const processedProjects = useMemo(() => {
    let result = [...projects];
    if (searchQuery) {
      result = result.filter((project) =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (sortCriteria === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortCriteria === 'startDate') {
      result.sort((a, b) => {
        const dateA = new Date(a.startDate || 0).getTime();
        const dateB = new Date(b.startDate || 0).getTime();
        return dateA - dateB;
      });
    }
    return result;
  }, [projects, searchQuery, sortCriteria]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSort = (criteria: string) => {
    setSortCriteria(criteria);
  };

  const handleProjectCreated = (newProject: Project) => {
    setProjects((prevProjects) => [...prevProjects, newProject]);
  };
  const renderContent = () => {
    switch (activeTab) {
      case 'Projects':
        return (
          <div>
            <h1 className="text-2xl font-semibold mb-4">Projects Overview</h1>
            <ProjectView
              viewType={isListView ? 'list' : 'card'}
              projects={processedProjects}
              currentUserRole={''}
            />
          </div>
        );
      case 'Create Project':
        return (
          <div>
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
      case 'Activity':
        return <div>Activity Component (to be implemented)</div>;
      default:
        return null;
    }
  };

  if (loading) return <p>Loading projects...</p>;

  return (
    <div className="w-full h-full">
      <ProjectTopPanel
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreateProject={() => setIsProjectCreationModalOpen(true)}
        onSearch={handleSearch}
        onSort={handleSort}
        toggleView={() => setIsListView(!isListView)}
        isListView={isListView}
      />
      <div className="p-4">{renderContent()}</div>
    </div>
  );
};

export default ProjectsSection;
