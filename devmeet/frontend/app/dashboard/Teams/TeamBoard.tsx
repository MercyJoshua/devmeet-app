import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TeamDetails from './TeamDetails';
axios.defaults.withCredentials = true;

interface Team {
  id: number;
  name: string;
  description: string;
  logo: string | null;
  tags: string[]; // Assuming tags are stored as an array
  type: string;
  members: {
    id: number;
    username: string;
    full_name: string;
    role: string;
  }[];
}

const TeamBoard: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserTeams = async () => {
      try {
        const response = await axios.get('/api/teams/all');
        console.log('Teams Response:', response.data); // Debug log for teams data
        setTeams(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user teams:', error);
        setError('Failed to load teams. Please try again later.');
        setLoading(false);
      }
    };
  
    fetchUserTeams();
  }, []);   

  if (loading) return <p>Loading teams...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {teams.map((team) => (
  <div key={team.id} className="p-4 bg-gray-800 text-white rounded shadow-md">
    <h2 className="text-lg font-semibold">{team.name}</h2>
    <p>{team.description}</p>
    <p>Members: {Array.isArray(team.members) ? team.members.length : 0}</p>
    {Array.isArray(team.members) && team.members.length === 0 && (
      <p className="text-sm text-gray-400">No members yet</p>
    )}
    <button
      className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
      onClick={() => setSelectedTeamId(team.id)}
    >
      View Details
    </button>
  </div>
))}

      {selectedTeamId && (
        <TeamDetails
          teamId={selectedTeamId}
          onClose={() => setSelectedTeamId(null)}
        />
      )}
    </div>
  );
};

export default TeamBoard;
