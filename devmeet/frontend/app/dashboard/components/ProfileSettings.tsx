/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */

import { useState } from 'react';
import Select from 'react-select';

interface User {
  id: any;
  username: string;
  full_name: string;
  email: string;
  role: string | null;
  skills: string; 
}

interface ProfileSettingsProps {
  user: User;
  onClose: () => void;
  onSave: (userData: User) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onClose, onSave }) => {
  // Convert skills string to array or set empty array if undefined
  const initialSkills = user.skills ? user.skills.split(',') : [];
  const [formData, setFormData] = useState<User>(user);
  const [selectedSkills, setSelectedSkills] = useState<{ value: string; label: string }[]>(
    initialSkills.map((skill) => ({ value: skill.trim(), label: skill.trim() }))
  );

  // Handle multi-select change
  const handleSkillChange = (selected: { value: string; label: string }[]) => {
    setSelectedSkills(selected);
    setFormData((prevData) => ({
      ...prevData,
      skills: selected.map((skill) => skill.value).join(','), 
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      // Ensure skills is converted to an array
      const normalizedSkills =
        typeof formData.skills === "string"
          ? formData.skills.split(",").map(skill => skill.trim()) // Convert string to array
          : formData.skills; // If already an array, keep it as is
  
      const response = await fetch(`/api/auth/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          skills: normalizedSkills, // Send as an array
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
  
      const data = await response.json();
      onSave(data.user); // Update parent state or global store with new user data
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save changes. Please try again.");
    }
  };  

  // Predefined list of IT skills
  const skillOptions = [
    { value: 'JavaScript', label: 'JavaScript' },
    { value: 'Python', label: 'Python' },
    { value: 'React', label: 'React' },
    { value: 'Node.js', label: 'Node.js' },
    { value: 'TypeScript', label: 'TypeScript' },
    { value: 'AWS', label: 'AWS' },
    { value: 'Docker', label: 'Docker' },
    { value: 'Kubernetes', label: 'Kubernetes' },
    { value: 'SQL', label: 'SQL' },
    { value: 'MongoDB', label: 'MongoDB' },
    { value: 'Tailwind CSS', label: 'Tailwind CSS' },
    { value: 'DevOps', label: 'DevOps' },
    { value: 'Machine Learning', label: 'Machine Learning' },
    { value: 'Data Analysis', label: 'Data Analysis' },
    { value: 'UI/UX Design', label: 'UI/UX Design' },
  ];

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
      <h2 className="text-xl font-bold text-white mb-4">Profile Settings</h2>

      <div className="mb-4">
        <label htmlFor="full_name" className="block text-sm text-gray-400 mb-1">Full Name</label>
        <input
          type="text"
          id="full_name"
          name="full_name"
          value={formData.full_name}
          onChange={handleInputChange}
          className="w-full p-2 bg-gray-700 text-white rounded-md"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="username" className="block text-sm text-gray-400 mb-1">Username</label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          className="w-full p-2 bg-gray-700 text-white rounded-md"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="block text-sm text-gray-400 mb-1">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full p-2 bg-gray-700 text-white rounded-md"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="skills" className="block text-sm text-gray-400 mb-1">Skills</label>
        <Select
          isMulti
          value={selectedSkills}
          options={skillOptions}
          onChange={(selected) => handleSkillChange(selected as { value: string; label: string }[])}
          className="bg-gray-700 text-black"
          placeholder="Select up to 15 skills"
        />
      </div>

      <div className="flex justify-between">
        <button onClick={onClose} className="bg-gray-600 text-white py-2 px-4 rounded-md">
          Cancel
        </button>
        <button onClick={handleSave} className="bg-blue-500 text-white py-2 px-4 rounded-md">
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ProfileSettings;
