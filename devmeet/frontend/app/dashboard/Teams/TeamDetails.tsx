/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from "react";
import axios from "axios";
// import Image from 'next/image';

const TeamDetails: React.FC<{ teamId: number; onClose: () => void }> = ({ teamId, onClose }) => {
  const [teamDetails, setTeamDetails] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showPortfolioModal, setShowPortfolioModal] = useState<boolean>(false);
  const [inviteInput, setInviteInput] = useState(""); 
  const [inviteRole, setInviteRole] = useState(""); 
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);


  const openCreateProjectModal = () => setIsCreateProjectModalOpen(true);
const closeCreateProjectModal = () => setIsCreateProjectModalOpen(false);


  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        const response = await axios.get(`/api/teams/${teamId}`);
        const data = response.data;

        // Normalize tags to be an array
        data.tags = Array.isArray(data.tags) ? data.tags : [];
        setTeamDetails(data);
      } catch (error) {
        setError("Failed to fetch team details.");
      } finally {
        setLoading(false);
      }
    };
    fetchTeamDetails();
  }, [teamId]);
// HANDLE TEAM INVITE
const handleInvite = async () => {
  if (!inviteInput || !inviteRole) {
    alert("Please enter a username or email and a role.");
    return;
  }

  const isEmail = inviteInput.includes("@");
  const inviteData = isEmail
    ? { email: inviteInput, role: inviteRole }
    : { username: inviteInput, role: inviteRole };

  try {
    const response = await axios.post(
      `/api/teams/${teamId}/invite`,
      inviteData
    );
    alert(response.data.message);
    setInviteInput("");
    setInviteRole("");
    closeInviteModal();
  } catch (error) {
    alert(error.response?.data?.message || "Failed to send invite.");
  }
};


  const renderHeader = () => (
    <header className="bg-gray-800 p-4 rounded-t-lg flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-semibold text-white">{teamDetails?.name || "Team Name"}</h1>
        <p className="text-gray-400">{teamDetails?.type || "Team Type"}</p>
      </div>
      {/* <Image src={teamDetails?.logo || "/placeholder-logo.png"} alt="Team Logo" className="h-12 w-12 rounded-full"    width={100} 
            height={100}  /> */}
    </header>
  );

  const renderTeamOverview = () => (
    <section className="p-4">
      <h2 className="text-lg font-semibold text-white">Overview</h2>
      <p className="text-gray-400">{teamDetails?.description || "No description available."}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {Array.isArray(teamDetails?.tags) && teamDetails.tags.length > 0 ? (
          teamDetails.tags.map((tag: string) => (
            <span key={tag} className="bg-blue-600 text-white text-sm px-2 py-1 rounded">
              {tag}
            </span>
          ))
        ) : (
          <p className="text-gray-400">No tags available.</p>
        )}
      </div>
    </section>
  );

  const openInviteModal = () => setIsInviteModalOpen(true);
  const closeInviteModal = () => setIsInviteModalOpen(false);

  const renderMembers = () => (
    <section className="p-4">
      <h2 className="text-lg font-semibold text-white">Team Members</h2>
      <div className="mt-2 space-y-2">
        {teamDetails?.members?.length ? (
          teamDetails.members.map((member: any) => {
            // Determine styles based on status
            const statusStyles =
              member.status === "Active"
                ? "bg-green-700"
                : member.status === "Pending"
                ? "bg-yellow-700"
                : "bg-gray-600 opacity-50";
  
            return (
              <div
                key={member.id}
                className={`flex items-center justify-between p-2 rounded cursor-pointer ${statusStyles}`}
                onClick={() => setSelectedMember(member)}
              >
                <div>
                  <p className="text-white">{member.full_name}</p>
                  <p className="text-sm text-gray-400">{member.role}</p>
                  <p className="text-sm text-gray-400">Skills: {member.skills?.join(", ") || "None"}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${
                      member.status === "Active"
                        ? "bg-green-500 text-white"
                        : member.status === "Pending"
                        ? "bg-yellow-500 text-black"
                        : "bg-gray-400 text-black"
                    }`}
                  >
                    {member.status}
                  </span>
                  <button className="text-sm text-gray-400 hover:text-gray-200">Manage</button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-400">No members yet.</p>
        )}
      </div>
  
      {/* Invite/Search button */}
      <button
        onClick={openInviteModal}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
      >
        Invite Team Member
      </button>
  
      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded w-96">
            <h3 className="text-lg font-semibold text-white">Invite New Member</h3>
  
            {/* Input for Email or Username */}
            <input
              type="text"
              placeholder="Enter username or email"
              className="mt-2 w-full p-2 rounded bg-gray-700 text-white"
              value={inviteInput}
              onChange={(e) => setInviteInput(e.target.value)}
            />
  
            {/* Role Input */}
            <input
              type="text"
              placeholder="Enter role"
              className="mt-4 w-full p-2 rounded bg-gray-700 text-white"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
            />
  
            {/* Action Buttons */}
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={closeInviteModal}
                className="px-4 py-2 rounded bg-gray-600 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                className="px-4 py-2 rounded bg-blue-600 text-white"
              >
                Invite
              </button>
            </div>
          </div>
        </div>
      )}
  
      {/* Selected Member Modal */}
      {selectedMember && (
        <div className="relative bg-gray-800 p-4 mt-4 rounded">
          <button
            onClick={() => setSelectedMember(null)}
            className="absolute top-4 right-4 text-rose-500 hover:text-white"
          >
            X
          </button>
          <h3 className="text-white">Manage {selectedMember.full_name}</h3>
          <button className="bg-blue-600 text-white px-4 py-2 mt-2 rounded">Reassign Role</button>
          <button className="bg-rose-600 text-white px-4 py-2 mt-2 rounded">Remove Member</button>
        </div>
      )}
    </section>
  );
    
  const renderProjects = () => (
    <section className="p-4">
      <h2 className="text-lg font-semibold text-white">Projects</h2>
      <button
        onClick={openCreateProjectModal}
        className="bg-green-600 text-white px-4 py-2 mt-2 rounded"
      >
        Create Project
      </button>
      <div className="mt-2 space-y-2">
        {teamDetails?.projects?.length ? (
          teamDetails.projects.map((project: any) => (
            <div key={project.id} className="bg-gray-700 p-3 rounded">
              <h3 className="text-white">{project.name}</h3>
              <p className="text-sm text-gray-400">{project.description}</p>
              <p className="text-sm text-gray-400">Status: {project.status}</p>
              <button className="bg-blue-600 text-white px-4 py-2 mt-2 rounded">Edit Project</button>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No projects available.</p>
        )}
      </div>
    </section>
  );
  

  const renderPortfolio = () => (
    <section className="p-4">
      <h2 className="text-lg font-semibold text-white">Portfolio</h2>
      <button
        onClick={() => setShowPortfolioModal(true)}
        className="bg-blue-600 text-white px-4 py-2 mt-2 rounded"
      >
        Add Portfolio Item
      </button>
      <div className="mt-2 space-y-4">
        {teamDetails?.portfolios?.length ? (
          teamDetails.portfolios.map((portfolio: any) => (
            <div key={portfolio.id} className="bg-gray-700 p-4 rounded">
              <h3 className="text-white">{portfolio.project_name}</h3>
              <p className="text-sm text-gray-400">{portfolio.project_description}</p>
              {portfolio.project_link && (
                <a
                  href={portfolio.project_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline mt-2 block"
                >
                  View Project
                </a>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-400">No portfolio items available.</p>
        )}
      </div>
    </section>
  );

  const renderFreelanceSection = () => (
    <section className="p-4">
      <h2 className="text-lg font-semibold text-white">Freelance</h2>
      <div className="mt-2 space-y-2">
        {teamDetails?.freelanceProjects?.length ? (
          teamDetails.freelanceProjects.map((project: any) => (
            <div key={project.id} className="bg-gray-700 p-3 rounded">
              <h3 className="text-white">{project.name}</h3>
              <p className="text-sm text-gray-400">{project.description}</p>
              <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded">Propose</button>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No freelance projects available.</p>
        )}
      </div>
    </section>
  );

  if (loading) return <p>Loading team details...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex justify-center items-center overflow-y-auto">
      <div className="bg-gray-800 w-full max-w-4xl p-6 rounded-lg shadow-lg">
        <button onClick={onClose} className="absolute top-4 right-4 text-rose-500 hover:text-white">
          X
        </button>
        {renderHeader()}
        {renderTeamOverview()}
        {renderMembers()}
        {renderProjects()}
        
        {renderFreelanceSection()}
        {renderPortfolio()}
        {showPortfolioModal && (
          <div className="bg-gray-800 p-6 rounded mt-4">
            <h3 className="text-white">Add Portfolio Item</h3>
            {/* Add form inputs and submit functionality */}
            <button onClick={() => setShowPortfolioModal(false)} className="text-rose-500 mt-2">Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamDetails;

