import { useState } from 'react';
import TeamNavPanel from './TeamNavPanel';
import TeamBoard from './TeamBoard';
import TeamCreationModal from './TeamCreationModal';
import TeamInvites from './TeamInvites';

const TeamSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Teams'); // Default to "Teams"
  const [isTeamCreationModalOpen, setIsTeamCreationModalOpen] = useState(false);

  // Modal handlers
  const openTeamCreationModal = () => setIsTeamCreationModalOpen(true);
  const closeTeamCreationModal = () => setIsTeamCreationModalOpen(false);

  // Content rendering based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'Teams':
        return <TeamBoard />;
      case 'New Team':
        return (
          <div className="bg-gray-900 p-6 rounded-lg border border-sky-500 w-64 m-6">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={openTeamCreationModal}
            >
              Create New Team
            </button>
            <TeamCreationModal
              isOpen={isTeamCreationModalOpen}
              onClose={closeTeamCreationModal}
              onSave={() => console.log('Team Saved')}
            />
          </div>
        );
      case 'Team Invites':
        return <TeamInvites />;
      default:
        return <TeamBoard />;
    }
  };
  

  return (
    <div className="w-full h-full">
      <TeamNavPanel activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">
          {activeTab === 'Create Team' ? 'Create A Team' : 'Team Board'}
        </h1>
        {renderContent()}
      </div>
    </div>
  );
};

export default TeamSection;
