/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import ResizeableSidebar from "./components/Sidebar";
import TopNavbar from "./components/TopNavbar";
import TaskSection from "./Tasks/TaskSection";
import TeamSection from "./Teams/TeamSection";
import ChatInterface from "./Chat/ChatInterface";
import CalendarSection from "./calendar/CalendarSection";
// import CodeLayout from "./CodeEditor/CodeLayout";
// import ProjectsSection from "./projects/ProjectsSection";
import { useState, useEffect } from "react";
import "../globals.css";
import axios from "axios";
import { useRouter } from "next/navigation";
import DashboardShowcase from "./components/dashboardShowcase";
axios.defaults.withCredentials = true;
import dynamic from "next/dynamic";

const CodeLayout = dynamic(
  () => {
    return import("./CodeEditor/CodeLayout");
  },
  { ssr: false }
);
const ProjectsSection = dynamic(
  () => {
    return import("./projects/ProjectsSection");
  },
  { ssr: false }
);


interface User {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role: string | null;
  skills: string;
}

export default function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedItem, setSelectedItem] = useState("");
  const [user, setUser] = useState<User | null>(null);
  // const [searchQuery, setSearchQuery] = useState("");
  // const [projects, setProjects] = useState<Project[]>([]);
  // const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const handleProjectChange = (projectId: number) => {
    setSelectedProjectId(projectId);
  };
  
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("/api/auth/user", {
          withCredentials: true,
        });
        setUser(response.data);
      } catch (err) {
        console.error("Error fetching user:", err);
        router.push("/auth/SignIn");
      }
    };

    if (isHydrated) {
      fetchUser();
    }
  }, [isHydrated, router]);

 
  const handleSidebarItemClick = (item: string) => {
    setSelectedItem((prev) => (prev === item ? "" : item));
  };

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const renderContent = () => {
    switch (selectedItem) {
      case "Code":
  return (
  
      <div className="flex-1 bg-gray-900 relative">
        <div className="p-4 h-full">
        <CodeLayout 
          selectedProjectId={selectedProjectId}
          selectedFile={null} 
          onProjectChange={handleProjectChange} 
          loggedInUser={user ? { id: Number(user.id), name: user.full_name, email: user.email } : { id: 0, name: "", email: "" }} 
        />
        </div>
      </div> 
  
  );

      case "Projects":
        return <ProjectsSection />;
      case "Tasks":
        return <TaskSection />;
      case "Teams":
        return <TeamSection />;
      case "Discussions":
        return <ChatInterface />;
      case "Calendar":
        return <CalendarSection />;
      
      default:
        return <DashboardShowcase />;
    }
  };

  return (
    <>
      <TopNavbar
        toggleSidebar={toggleSidebar}
        user={user || { id: "", username: "", full_name: "", email: "", role: null, skills: "" }} onItemClick={function (item: string): void {
          throw new Error("Function not implemented.");
        } } isOpen={false}      />
      <div className="flex h-screen">
        <div className="flex flex-row h-full">
          <ResizeableSidebar
            isOpen={!isCollapsed}
            onItemClick={handleSidebarItemClick}
          />
         
        </div>
        <div className="flex-1 bg-gray-700 text-white">
          <div className="p-4">{renderContent()}</div>
        </div>
      </div>
    </>
  );
}