/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Project, TeamMember } from '@/types/Project';

interface TaskModalProps {
  loggedInUser: string; 
  isModalOpen: boolean;
  setModalOpen: (isOpen: boolean) => void;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  projects: Project[]; 
  allTeamMembers: TeamMember[];
  
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, projects, allTeamMembers }) => {
  if (!isOpen) return null; 
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [priority, setPriority] = useState('');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [visibility, setVisibility] = useState('transparent');
  const [files, setFiles] = useState([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const currentDateTime = new Date().toLocaleString();
  const [project, setProject] = useState<Project | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
 // Filter team members whenever a project is selected
 useEffect(() => {
  if (project) {
    const members = allTeamMembers.filter(
      (member) => member.project_id === Number(project.id) // Match based on `project_id`
    );
    console.log('Filtered Team Members:', members);
    setTeamMembers(members);
  } else {
    setTeamMembers([]);
  }
}, [project, allTeamMembers]);

const handleProjectChange = (selectedProject: Project | null) => {
  setProject(selectedProject);
  setAssignee(''); 
};



  const handleSave = async () => {
    // Log values for debugging purposes
  console.log('Validation Check:', {
    taskTitle,
    assignee,
    project,
    startDate,
    dueDate,
  });

  // Validation logic
  if (!taskTitle) {
    alert('Task Title is required.');
    return;
  }
  if (!project) {
    alert('Please select a project.');
    return;
  }
  if (!startDate) {
    alert('Start Date is required.');
    return;
  }
  if (!dueDate) {
    alert('Due Date is required.');
    return;
  }
  const newTask = {
    title: taskTitle,
    description: taskDescription || null,
    priority: priority || 'medium',
    project: project?.id || null,
    assignee: assignee || null, // Set as null if empty
    dueDate,
    startDate,
    visibility,
    files: files.map((file) => file.name),
    status: 'todo',
  };
  
    console.log('Payload being sent:', newTask);

        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        formData.append('taskData', JSON.stringify(newTask));

    try {
      const response = await axios.post('/api/tasks/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Task created successfully:', response.data);
      onSave(response.data);
      setSuccessMessage('Task created successfully!'); // Set success message
      onClose();
    } catch (error) {
      console.error('Error saving task:', error.response?.data || error.message);
      alert('Failed to create the task. Please try again.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles([...files, ...Array.from(e.target.files || [])]);
  };
  return (
    isOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-slate-900 p-6 rounded-lg w-2/3 h-[80vh] overflow-y-auto relative">
          <h2 className="text-xl font-bold mb-4">Create & Assign Task</h2>
           {/* Success message */}
           {successMessage && (
            <div className="mb-4 p-2 bg-green-500 text-white rounded">
              {successMessage}
            </div>
          )}
          <div className="absolute top-6 right-6 space-y-4 text-left overflow-y-auto h-[30%] pr-4 mb-8 py-2">
            <div className="flex items-center justify-between my-0.5">
              <label className="text-left mr-px text-sm">Date Created:</label>
              <p>{currentDateTime}</p>
            </div>
            <div className="flex items-center justify-between my-0">
              <label className="text-left mr-px text-sm">Priority:</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="p-2 border rounded w-1/2 text-black text-sm h-4.5 py-0"
              >
                <option value="">Select Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="flex items-center justify-between my-0">
              <label className="text-left mr-px text-sm">Project:</label>
              <div className="relative w-1/2">
       <select
  value={project?.id || ''}
  onChange={(e) =>
    handleProjectChange(
      projects.find((p) => p.id.toString() === e.target.value) || null
    )
  }
  className="p-2 border rounded w-full text-black h-4.5 py-0"
>
  <option value="" disabled>Select a Project</option>
  {projects.map((p) => (
    <option key={p.id} value={p.id}>
      {p.title}
    </option>
  ))}
</select>

 </div>
</div>
    <div className="flex items-center justify-between my-0">
  <label className="text-left mr-px text-sm">Assignee:</label>
  <div className="relative w-1/2">
  <select
  value={assignee}
  onChange={(e) => setAssignee(e.target.value)}
  className="p-2 border rounded w-full text-black h-4.5 py-0"
>
  <option value="" disabled>Select a team member</option>
  {teamMembers.map((member) => (
    <option key={member.id} value={member.id}>
      {member.email}
    </option>
  ))}
</select>


  </div>
</div>
   
      <div className="flex items-center justify-between my-0 text-sm">
              <label className="text-left mr-px text-sm">Start Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="p-2 border rounded w-1/2 text-black text-sm h-4.5 py-0"
              />
            </div>
            <div className="flex items-center justify-between my-0 text-sm">
              <label className="text-left mr-px text-sm">Due Date:</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="p-2 border rounded w-1/2 text-black text-sm h-4.5 py-0"
              />
            </div>
      </div>
          <div className="h-[70%] mt-32">
            <div className="mb-4">
              <label className="block text-left">Task Title:</label>
              <input
                type="text"
                placeholder="Task Title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-4/5 p-2 border rounded text-black"
              />
            </div>
            <div className="mb-0">
              <label className="block text-left">Description:</label>
              <textarea
                placeholder="Task Description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                className="w-4/5 p-2 border rounded h-32 text-black"
              />
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="mt-2 text-white"
              />
            </div>
            <div className="flex justify-between items-center py-8 mt-6 mb-4 w-3/5">
              <label className="text-left mr-px text-sm">Visibility:</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="p-2 border rounded w-1/3 text-black text-sm h-6 py-0"
              >
                <option value="transparent">Everyone</option>
                <option value="restricted">Assignee and Admin</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-4 h-[10%]">
            <button className="bg-gray-500 px-4 py-2 rounded h-7" onClick={onClose}>
              Cancel
            </button>
            <button className="bg-blue-500 px-4 py-2 rounded h-7" onClick={handleSave}>
              Create Task
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default TaskModal;
