import React, { useEffect, useState } from 'react';
import axios from 'axios';
axios.defaults.withCredentials = true;

interface Invite {
  id: number;
  sender: string;
  teamName: string;
  role: string;
}

const TeamInvites: React.FC = () => {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch invites function
  const fetchInvites = async () => {
    setLoading(true);
    setError(null); // Reset error state before fetching
    try {
      const response = await axios.get('/api/teams/invites');
      setInvites(response.data.invites);
    } catch {
      setError('Failed to load invites');
    } finally {
      setLoading(false);
    }
  };

  // Load invites on component mount
  useEffect(() => {
    fetchInvites();
  }, []);

  // Handle accept invite
  const handleAccept = async (inviteId: number) => {
    try {
      await axios.post(
        '/api/teams/invites/accept',
        JSON.stringify({ inviteId }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      await fetchInvites(); // Re-fetch invites after accepting
    } catch (error) {
      console.error('Failed to accept invite:', error);
    }
  };

  // Handle decline invite
  const handleDecline = async (inviteId: number) => {
    try {
      await axios.post(
        '/api/teams/invites/decline',
        JSON.stringify({ inviteId }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      setInvites((prevInvites) => prevInvites.filter((invite) => invite.id !== inviteId)); // Optimistic update
    } catch (err) {
      console.error('Failed to decline invite:', err);
    }
  };

  // Handle loading state
  if (loading) {
    return <p>Loading invites...</p>;
  }

  // Handle error state
  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="p-4 bg-gray-900 text-white rounded">
      <h2 className="text-lg font-semibold">Pending Invites</h2>
      {invites.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {invites.map((invite) => (
            <li
              key={invite.id}
              className="flex justify-between bg-gray-800 p-3 rounded"
            >
              <div>
                <p>
                  <strong>Team:</strong> {invite.teamName}
                </p>
                <p>
                  <strong>Invited by:</strong> {invite.sender}
                </p>
                <p>
                  <strong>Role:</strong> {invite.role}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  className="bg-green-600 px-3 py-1 rounded"
                  onClick={() => handleAccept(invite.id)}
                >
                  Accept
                </button>
                <button
                  className="bg-rose-600 px-3 py-1 rounded"
                  onClick={() => handleDecline(invite.id)}
                >
                  Decline
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400 mt-4">No pending invites.</p>
      )}
    </div>
  );
};

export default TeamInvites;
