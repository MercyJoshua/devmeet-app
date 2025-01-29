/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
import { Project } from "@/types/Project";
import axios from "axios";
import React, { useEffect, useState } from "react";

interface NavPanelProps {
  projects: Project[];
  activeProject: Project | null;
  setActiveProject: (project: Project | null) => void;
  loggedInUser: any; // Replace with the actual type for the logged-in user
  isFileExplorerOpen: boolean;
  setFileExplorerOpen: (isOpen: boolean) => void;
}

interface TeamMember {
  full_name: string;
  email: string;
  role: string;
  specialization?: string;
  added_at: string;
}

const NavPanel: React.FC<NavPanelProps> = ({ activeProject, setActiveProject, loggedInUser, isFileExplorerOpen, setFileExplorerOpen }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch projects and their team members
    const fetchProjects = async () => {
      try {
        const response = await axios.get("/api/projects/retrieve");
        setProjects(response.data);
        if (response.data.length > 0) {
          setSelectedProjectId(response.data[0].id); // Set the first project as default
          setTeamMembers(response.data[0].projectTeam || []); // Ensure projectTeam is an array
        }
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setError("Failed to fetch projects. Please try again.");
      }
    };

    fetchProjects();
  }, []);

  const handleProjectChange = (projectId: number) => {
    setSelectedProjectId(projectId);
    const selectedProject = projects.find((project) => project.id === projectId);
    setFileExplorerOpen(!!selectedProject);
    if (selectedProject) {
      setTeamMembers(selectedProject.projectTeam || []); // Ensure projectTeam is an array
    } else {
      setTeamMembers([]); // Clear team members if no project is selected
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold">Projects</h2>

      {/* Project dropdown */}
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <select
          className="w-full mt-2 p-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedProjectId ?? ""}
          onChange={(e) => handleProjectChange(Number(e.target.value))}
        >
          {projects.map((project) => (
            <option
              key={project.id}
              value={project.id}
              className="bg-gray-700 text-white hover:bg-gray-600"
            >
              {project.title}
            </option>
          ))}
        </select>
      )}

      {/* Team Members */}
      <div className="mt-4">
        <h3 className="font-semibold">Team Members</h3>
        <ul className="mt-2 space-y-2">
          {teamMembers.length > 0 ? (
            teamMembers.map((member) => (
              <li key={member.email} className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 ${
                    member.role === "online" ? "bg-green-500" : "bg-gray-500"
                  } rounded-full`}
                ></div>
                <span>{member.full_name}</span>
                <span className="text-sm text-gray-400 ml-2">({member.role})</span>
              </li>
            ))
          ) : (
            <p className="text-gray-500">No team members found.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default NavPanel;
