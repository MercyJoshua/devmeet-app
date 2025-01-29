import { useState, useEffect } from 'react';
import axios from 'axios';
import TaskNavPanel from './TaskNavPanel';
import TaskBoard from './TaskBoard';
import TaskModal from './TaskCreationModal';
import { Project, TeamMember } from '@/types/Project';

const TaskSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Tasks');
  const [isTaskCreationModalOpen, setIsTaskCreationModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [allTeamMembers, setAllTeamMembers] = useState<TeamMember[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null); // Selected project
  const [error, setError] = useState<string | null>(null);
  const user_id = 'your_user_id';

  const openTaskCreationModal = () => setIsTaskCreationModalOpen(true);
  const closeTaskCreationModal = () => setIsTaskCreationModalOpen(false);
  // Helper function to generate unique IDs


  useEffect(() => {
    const fetchProjectsAndTeamMembers = async () => {
      try {
        const response = await axios.get('/api/projects/retrieve');
        console.log('Projects data:', response.data);
        
        const projectsData: Project[] = response.data.map((project: Project) => ({
          ...project,
          projectTeam: project.projectTeam || [], // Default to empty array if undefined
        }));
  
        setProjects(projectsData);
  
        // Automatically select the first project
        setSelectedProject(projectsData[0] || null);
  
        const teamMembers: TeamMember[] = projectsData.flatMap((project: Project) =>
          Array.isArray(project.projectTeam)
            ? project.projectTeam
                .filter((member: TeamMember) => typeof member.id === 'number')
                .map((member: TeamMember) => ({
                  id: member.id as number,
                  role: member.role as 'admin' | 'moderator' | 'member' | 'supervisor',
                  email: member.email,
                  full_name: member.full_name,
                  project_id: member.project_id,
                  added_at: member.added_at || new Date().toISOString(),
                }))
            : []
        );
  
        const uniqueTeamMembers = Array.from(
          new Map(teamMembers.map((member) => [member.email, member])).values()
        );
  
        setAllTeamMembers(uniqueTeamMembers);
      } catch (error) {
        setError('Error fetching projects and team members');
        console.error('Error fetching projects and team members:', error.message);
      }
    };
  
    fetchProjectsAndTeamMembers();
  }, []);
  

  const renderContent = () => {
    switch (activeTab) {
      case 'Tasks':
        return <TaskBoard selectedProject={selectedProject} />;
      case 'Create Task':
        return (
          <div className="bg-gray-900 p-6 rounded-lg border border-sky-500 w-64 m-6">
            <button
              className="bg-yellow-500 text-white px-4 py-2 rounded"
              onClick={openTaskCreationModal}
            >
              Create a Task
            </button>
            <TaskModal
              isOpen={isTaskCreationModalOpen}
              onClose={closeTaskCreationModal}
              onSave={() => {
                // Handle task saving logic here
                closeTaskCreationModal(); // Close the modal after saving
              }}
              projects={projects}
              allTeamMembers={allTeamMembers}
              loggedInUser={user_id}
              isModalOpen={isTaskCreationModalOpen}
              setModalOpen={setIsTaskCreationModalOpen}
            />
          </div>
        );
      default:
        return <TaskBoard selectedProject={selectedProject} />;
    }
  };

  return (
    <div className="w-full h-full">
      <TaskNavPanel
        activeTab={activeTab}
        onTabChange={setActiveTab}
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject} // Allow changing selected project
      />
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">
          {activeTab === 'Create Task' ? 'Create A Task' : 'Task Board'}
        </h1>
        {error && <div className="text-red-500 mb-4">{error}</div>} {/* Error message display */}
        {renderContent()}
      </div>
    </div>
  );
};

export default TaskSection;
