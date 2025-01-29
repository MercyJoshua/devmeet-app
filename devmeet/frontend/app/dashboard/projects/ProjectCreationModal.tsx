/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from 'react';
import axios from 'axios';
axios.defaults.withCredentials = true;
import { Project } from '../../../types/Project';

type LocalProject = {
  title: string;
  description: string;
  projectType: 'solo' | 'collaborative';
  startDate: string;
  endDate: string;
  teamMembers?: { role: string; email: string }[];
};
type ProjectCreationModalProps = 
{ user: { id: number, username: string, email: string }; 
onClose: () => void;
onProjectCreated: (newProject: Project) => void;
setProjects: (projects: Project[]) => void;

};

const roles = ['Supervisor', 'Moderator', 'Member', 'Admin'];

const ProjectCreationModal: React.FC<ProjectCreationModalProps> = ({ onClose, onProjectCreated }) => {
  const [project, setProject] = useState<LocalProject>({
    title: '',
    description: '',
    projectType: 'solo',
    startDate: '',
    endDate: '',
    teamMembers: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [teamMemberInputs, setTeamMemberInputs] = useState<
    { role: string; email: string }[]
  >([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProject((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProject((prev) => ({ ...prev, projectType: e.target.value as 'solo' | 'collaborative' }));
  };

  const handleAddTeamMember = () => {
    setTeamMemberInputs((prev) => [...prev, { role: '', email: '' }]);
  };

  const handleTeamMemberChange = (
    index: number,
    field: keyof { role: string; email: string },
    value: string
  ) => {
    setTeamMemberInputs((prev) => {
      const updatedInputs = [...prev];
      updatedInputs[index][field] = value;
      return updatedInputs;
    });
  };

  const handleSubmit = async () => {
    if (!project.title || !project.startDate || !project.endDate) {
      alert('Please fill in all required fields.');
      return;
    }
  
    if (project.projectType === 'collaborative') {
      const invalidEmails = teamMemberInputs.filter(
        (member) => !member.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)
      );
  
      if (invalidEmails.length > 0) {
        alert('Please provide valid email addresses for all team members.');
        return;
      }
    }
  
    setIsLoading(true);
    try {
      const requestBody = { ...project, projectTeam: project.projectType === 'collaborative' ? teamMemberInputs : [] };
      const response = await axios.post('/api/projects/create', requestBody, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    
      if (response.status === 201) {
        alert('Project created successfully!');
        onProjectCreated(response.data);
        onClose();
      } else {
        alert('Failed to create project. Please try again.');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error('Error creating project:', error.response.data);
          alert('Failed to create project. Please try again.');
        } else {
          console.error('Error creating project:', error.message);
          alert('Failed to create project. Please try again.');
        }
      } else {
        console.error('Error creating project:', error.message);
        alert('Failed to create project. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }    
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <div className="bg-gray-900 rounded-lg p-6 w-1/3">
        <h2 className="text-xl font-bold mb-4">Create New Project</h2>

        <label className="block mb-2">
          <span>Project Title</span>
          <input
            type="text"
            name="title"
            value={project.title}
            onChange={handleInputChange}
            className="w-full p-2 border rounded mt-1 text-black"
            placeholder="Enter project title"
          />
        </label>

        <label className="block mb-2">
          <span>Description</span>
          <textarea
            name="description"
            value={project.description}
            onChange={handleInputChange}
            className="w-full p-2 border rounded mt-1 text-black"
            placeholder="Enter project description"
          />
        </label>

        <label className="block mb-4">
          <span>Project Type</span>
          <select
            name="projectType"
            value={project.projectType}
            onChange={handleTypeChange}
            className="w-full p-2 border rounded mt-1 text-black"
          >
            <option value="solo">Solo</option>
            <option value="collaborative">Collaborative</option>
          </select>
        </label>

        <label className="block mb-2">
          <span>Start Date</span>
          <input
            type="date"
            name="startDate"
            value={project.startDate}
            onChange={handleInputChange}
            className="w-full p-2 border rounded mt-1 text-black"
          />
        </label>

        <label className="block mb-4">
          <span>End Date</span>
          <input
            type="date"
            name="endDate"
            value={project.endDate}
            onChange={handleInputChange}
            className="w-full p-2 border rounded mt-1 text-black"
          />
        </label>

        {project.projectType === 'collaborative' && (
          <>
            <h3 className="text-lg font-semibold mb-2">Team Members (Optional)</h3>
            {teamMemberInputs.map((member, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <select
                  value={member.role}
                  onChange={(e) => handleTeamMemberChange(index, 'role', e.target.value)}
                  className="w-1/2 p-2 border rounded text-black"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <input
                  type="email"
                  placeholder="Member Email"
                  value={member.email}
                  onChange={(e) => handleTeamMemberChange(index, 'email', e.target.value)}
                  className="w-1/2 p-2 border rounded text-black"
                />
              </div>
            ))}
            <button
              onClick={handleAddTeamMember}
              className="px-4 py-2 bg-gray-200 rounded mb-4 text-black"
            >
              + Add Team Member
            </button>
          </>
        )}

        <div className="flex justify-end">
        <button
  onClick={onClose}
  className="px-4 py-2 bg-gray-300 rounded mr-2 text-blue"
  disabled={isLoading}
>
  Cancel
</button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded"
            disabled={!project.title || !project.startDate || !project.endDate || isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCreationModal;
