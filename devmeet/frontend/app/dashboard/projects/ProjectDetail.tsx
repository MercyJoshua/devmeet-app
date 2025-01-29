/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import React, { useState, useEffect } from 'react';
import { Project } from '../../../types/Project';
import axios from 'axios';
import { format } from 'date-fns';

interface ProjectDetailProps {
  project: Project;
  onClose: () => void;
  onSave: (updatedProject: Project) => void;
  onDelete: (projectId: string) => void;
  onArchive: (projectId: string) => void;
  currentUserRole: string;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  onClose,
  onSave,
  onDelete,
  //onArchive,
  currentUserRole,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [updatedProject, setUpdatedProject] = useState<Project>({
    ...project,
    startDate: project.startDate || '', // Default to an empty string if not provided
    endDate: project.endDate || '',     // Default to an empty string if not provided
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (dateString: string | undefined): string => {
    return dateString ? format(new Date(dateString), 'dd-MM-yyyy') : 'Not specified';
  };

  useEffect(() => {
    setUpdatedProject({
      ...project,
      startDate: project.startDate || '',
      endDate: project.endDate || '',
    });
  }, [project]);

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
    setUpdatedProject((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleMemberChange = (e: React.ChangeEvent<HTMLInputElement>, memberId: string) => {
    const updatedMembers = updatedProject.teamMembers?.map((member) =>
      member.id === Number(memberId) ? { ...member, role: e.target.value } : member
    );
    setUpdatedProject({ ...updatedProject, teamMembers: updatedMembers });
  };

  const handleAddMember = () => {
    const newMember = { id: Date.now().toString(), name: '', role: '' };
    setUpdatedProject({
      ...updatedProject,
      teamMembers: updatedProject.teamMembers || [],
    });
  };

  // UPDATE AND SAVE
  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const formattedProject = {
        ...updatedProject,
        startDate: updatedProject.startDate.split('-').reverse().join('-'), // Converts DD-MM-YYYY to YYYY-MM-DD
        endDate: updatedProject.endDate.split('-').reverse().join('-'),   // Same conversion
      };

      const { data } = await axios.put(
        `/api/projects/edit/${formattedProject.id}`,
        formattedProject,
        { headers: { 'Content-Type': 'application/json' } }
      );
      onSave(data); // Notify parent to update the project
      setIsEditing(false);
    } catch (err) {
      console.error('Edit Error:', err);
      setError('Failed to save project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // HANDLE DELETE
  const handleDelete = async () => {
    if (typeof window !== "undefined" && !window.confirm('Are you sure you want to delete this project?')) return;
    setIsLoading(true);
    setError(null);
    try {
      await axios.delete(`/api/projects/delete/${project.id}`);
      onDelete(project.id.toString());
      onClose();
    } catch (err) {
      console.error('Delete Error:', err);
      setError('Failed to delete project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async () => {
    if (typeof window !== 'undefined' && !window.confirm('Are you sure you want to archive this project?')) return;
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axios.put(`/api/projects/archive/${project.id}`);
      onSave(data);
    } catch (err) {
      console.error('Archive Error:', err); 
      setError('Failed to archive project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const actionDisabled = isLoading || currentUserRole === 'viewer';

  return (
    <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <div className="modal-content bg-gray-900 p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Project Details</h2>
          <button className="text-gray-500" onClick={onClose}>X</button>
        </div>

        <div className="mt-4">
          {error && <div className="text-red-500 mb-4">{error}</div>}

          <div className="mb-4">
            <label className="block font-semibold">Project Title</label>
            <input
              type="text"
              value={updatedProject.title || ''}
              onChange={(e) => handleFieldChange(e, 'title')}
              disabled={!isEditing}
              className="w-full p-2 border rounded text-black"
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold">Project Description</label>
            <textarea
              value={updatedProject.description || ''}
              onChange={(e) => handleFieldChange(e, 'description')}
              disabled={!isEditing}
              className="w-full p-2 border rounded text-black"
            />
          </div>

          <div className="mb-4">
            <label className="block font-semibold">Team Members</label>
            {updatedProject.teamMembers?.map((member) => (
              <div key={member.id} className="flex items-center justify-between mb-2">
                <span>{member.email || 'New Member'}</span>
                <input
                  type="text"
                  value={member.role || ''}
                  onChange={(e) => handleMemberChange(e, member.id.toString())}
                  disabled={!isEditing}
                  className="p-2 border rounded text-black"
                />
              </div>
            ))}
            {isEditing && (
              <button className="mt-2 text-blue-500" onClick={handleAddMember}>
                + Add Member
              </button>
            )}
          </div>

          <div className="flex space-x-4 mb-4">
            <div className="w-1/2">
              <label className="block font-semibold">Start Date</label>
              <input
                type="date"
                value={updatedProject.startDate || ''}
                placeholder="Select a date"
                onChange={(e) => handleFieldChange(e, 'startDate')}
                disabled={!isEditing || updatedProject.status === 'Started'}
                className="w-full p-2 border rounded text-black"
              />
            </div>
            <div className="w-1/2">
              <label className="block font-semibold">End Date</label>
              <input
                type="date"
                value={updatedProject.endDate || ''}
                onChange={(e) => handleFieldChange(e, 'endDate')}
                disabled={!isEditing}
                className="w-full p-2 border rounded text-black"
              />
            </div>
          </div>

          <div className="mt-4 flex space-x-4">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              disabled={actionDisabled}
            >
              {isEditing ? 'Save' : 'Edit'}
            </button>

            <button
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={handleDelete}
              disabled={actionDisabled}
            >
              Delete
            </button>
            <button
              className="bg-gray-500 text-white px-4 py-2 rounded"
              onClick={handleArchive}
              disabled={actionDisabled}
            >
              Archive
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;