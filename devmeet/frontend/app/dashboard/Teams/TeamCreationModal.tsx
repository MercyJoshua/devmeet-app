import React, { useState } from 'react';
import axios from 'axios';

interface TeamCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const TeamCreationModal: React.FC<TeamCreationModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [teamLogo, setTeamLogo] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [teamType, setTeamType] = useState('public');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setTeamLogo(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', teamName);
      formData.append('description', teamDescription);
      formData.append('type', teamType);
      if (teamLogo) {
        formData.append('logo', teamLogo);
      }
      formData.append('tags', JSON.stringify(tags));

      const response = await axios.post(
        '/api/teams/create',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      console.log('Team created successfully:', response.data);

      // Clear inputs and notify parent component
      setTeamName('');
      setTeamDescription('');
      setTeamLogo(null);
      setTags([]);
      setTeamType('public');
      onSave();
      onClose();
    } catch (err) {
      setError(
        axios.isAxiosError(err) && err.response
          ? err.response.data?.error || 'An error occurred.'
          : 'An error occurred.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTeamName('');
    setTeamDescription('');
    setTeamLogo(null);
    setTags([]);
    setTeamType('public');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-900 p-6 rounded shadow-lg w-96">
        <h2 className="text-xl font-semibold text-white mb-4">Create a New Team</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <input
          type="text"
          placeholder="Team Name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="w-full p-2 mb-4 bg-gray-800 text-white rounded"
          disabled={loading}
        />

        <textarea
          placeholder="Team Description"
          value={teamDescription}
          onChange={(e) => setTeamDescription(e.target.value)}
          className="w-full p-2 mb-4 bg-gray-800 text-white rounded"
          disabled={loading}
        />

        <input
          type="file"
          onChange={handleFileChange}
          className="w-full mb-4 text-white"
          disabled={loading}
        />

        <input
          type="text"
          placeholder="Tags (comma-separated)"
          onChange={(e) =>
            setTags(e.target.value.split(',').map((tag) => tag.trim()))
          }
          className="w-full p-2 mb-4 bg-gray-800 text-white rounded"
          disabled={loading}
        />

        <select
          value={teamType}
          onChange={(e) => setTeamType(e.target.value)}
          className="w-full p-2 mb-4 bg-gray-800 text-white rounded"
          disabled={loading}
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
          <option value="freelance">Freelance</option>
        </select>

        <div className="flex justify-between space-x-4">
          <button
            onClick={handleReset}
            className="bg-gray-500 px-4 py-2 rounded text-white"
            disabled={loading}
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="bg-red-500 px-4 py-2 rounded text-white"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-green-500 px-4 py-2 rounded text-white"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamCreationModal;
