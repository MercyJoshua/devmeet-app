import React, { useState, useEffect } from 'react';
import { Project } from '../../../types/Project';
import ProjectDetail from './ProjectDetail';
import Image from 'next/image';


interface ProjectViewProps {
  viewType: 'list' | 'card';
  projects: Project[];
  currentUserRole: string;
}


const ProjectView: React.FC<ProjectViewProps> = ({ viewType, projects, currentUserRole }) => {
  const [localProjects, setLocalProjects] = useState<Project[]>(projects);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    if (projects.length > 0) {
      setLocalProjects(projects); // Initialize local state with passed projects
      setLoading(false);
    }
  }, [projects]);

 /*  const refreshProjects = async () => {
    try {
      const response = await fetch('/api/projects/retrieve'); 
      const updatedProjects = await response.json();
      setLocalProjects(updatedProjects);
    } catch (error) {
      console.error('Error refreshing projects:', error);
    }
  }; */

  const handleViewProject = (projectId: string) => {
    const project = localProjects.find((p) => p.id === Number(projectId));
    setSelectedProject(project || null);
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
  };

  const handleSaveProject = (updatedProject: Project) => {
    setLocalProjects((prev) =>
      prev.map((proj) => (proj.id === updatedProject.id ? updatedProject : proj))
    );
    setSelectedProject(null); // Close modal after save
  };

  const handleProjectDelete = (projectId: string) => {
    setLocalProjects((prev) => prev.filter((proj) => proj.id.toString() !== projectId));
  };

  const handleProjectArchive = (projectId: string) => {
    setLocalProjects((prev) =>
      prev.map((proj) =>
        proj.id === Number(projectId) ? { ...proj, status: 'Archived' } : proj
      )
    );
  };

  if (loading) {
    return <p>Loading projects...</p>;
  }

  if (localProjects.length === 0) {
    return <p>No projects found.</p>;
  }

  return (
    <div>
  {viewType === 'list' ? (
    <div className="project-list">
      {localProjects.map((project) => (
        <div
          key={project.id}
          className="project-item flex items-center justify-between p-2 bg-indigo-400 h-10 text-base mb-2 rounded"
        >
          <div className="flex items-center">
            <Image
              src={project.thumbnail || '/assets/images/default-thumbnail.png'}
              alt={project.title || 'Project'}
              width={16}  
              height={16} 
              className="rounded"
            />
            <div className="ml-2">
              <h3 className="text-sm font-semibold">{project.title}</h3>
              <div className="flex items-center">
                {project.teamMembers?.slice(0, 3).map((member, index) => (
                  <Image
                    key={index}
                    src={member.profilePicture || '/assets/images/profile.png'}
                    alt={member.name || 'Member'}
                    width={16}  
                    height={16}
                    className="rounded-full ml-1"
                  />
                ))}
               <p className="ml-2 text-xs">
              {Array.isArray(project.teamMembers) ? project.teamMembers.length : 0} members
            </p>
              </div>
            </div>
          </div>
          <span
            className={`status-label text-sm ${
              project.status === 'Completed'
                ? 'text-green-500'
                : project.status === 'In progress'
                ? 'text-yellow-500'
                : 'text-black'
            }`}
          >
            {project.status}
          </span>
          <button
            className="btn-view bg-purple-500 text-white px-3 py-1 text-xs rounded"
            onClick={() => handleViewProject(project.id.toString())}
          >
            View
          </button>
        </div>
      ))}
    </div>
  ) : (
    <div className="grid grid-cols-3 gap-2">
      {localProjects.map((project) => (
        <div
          key={project.id}
          className="project-card p-2 bg-lime-600 rounded shadow-md"
        >
        <Image
  src={project.thumbnail || '/assets/images/default-thumbnail1.png'}
  alt={project.title || 'Project'}
  width={60}
  height={30}
  objectFit="cover"
  className="rounded"
/>

          <h3 className="text-sm font-semibold mt-1">{project.title}</h3>
          <div className="flex items-center mt-1">
            {project.teamMembers?.slice(0, 3).map((member, index) => (
            <Image
            key={index}
            src={member.profilePicture || '/assets/images/profile.png'}
            alt={member.name || 'Member'}
            width={16}
            height={16}
            objectFit="cover"
            className="rounded-full ml-1"
          />
          
            ))}
            <p className="ml-2 text-xs">
              {project.teamMembers ? project.teamMembers.length : 1} members
            </p>
          </div>
          <span
            className={`status-label text-xs ${
              project.status === 'Completed'
                ? 'text-green-500'
                : project.status === 'In progress'
                ? 'text-yellow-500'
                : 'text-black'
            }`}
          >
            {project.status}
          </span>
          <button
            className="btn-view bg-purple-500 text-white px-3 py-1 mt-1 text-xs rounded"
            onClick={() => handleViewProject(project.id.toString())}
          >
            View
          </button>
        </div>
      ))}
    </div>
  )}
 {selectedProject && (
  <ProjectDetail
    project={selectedProject}
    onClose={handleCloseModal}
    onSave={handleSaveProject}
    onDelete={handleProjectDelete}
    onArchive={handleProjectArchive}
    currentUserRole={currentUserRole}
    // refreshProjects={refreshProjects}
  />
)}

</div>
  );
};

export default ProjectView;
