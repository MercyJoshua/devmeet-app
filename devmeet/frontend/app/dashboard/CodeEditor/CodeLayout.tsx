import CodeEditor from './CodeEditor';
import EditorTabs from './EditorTabs';
import { FaChevronDown, FaChevronLeft, FaChevronRight, FaChevronUp } from 'react-icons/fa';
import { Project } from '@/types/Project';
import axios from 'axios';
import { CustomFile } from '@/types/CustomFile';
import dynamic from "next/dynamic";
import { useEffect, useState } from 'react';
import NavPanel from './NavPanel';
import FileExplorer from './FileExplorer';
const PreviewConsole = dynamic(
  () => {
    return import("./PreviewConsole");
  },
  { ssr: false }
);

interface CodeLayoutProps {
  selectedProjectId: number | null;
  selectedFile: CustomFile | null;
  onProjectChange: (projectId: number) => void;
  loggedInUser: { id: number; name: string; email: string };
}

const CodeLayout: React.FC<CodeLayoutProps> = ({ selectedProjectId, onProjectChange, loggedInUser }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [openTabs, setOpenTabs] = useState<{ id: number; name: string }[]>([]);
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isFileExplorerOpen, setFileExplorerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<CustomFile | null>(null);
  const [code, setCode] = useState<string>(''); // Code to pass to PreviewConsole
  const [isConsoleVisible, setConsoleVisible] = useState(true);

  // Fetch file content when a file is selected
  useEffect(() => {
    const fetchContent = async () => {
      if (selectedFile) {
        try {
          const content = await fetchFileContent(selectedFile.id);
           setCode(content); // Initialize the editor with the fetched file content
        } catch (error) {
          console.error('Error fetching file content:', error);
        }
      }
    };
    fetchContent();
  }, [selectedFile]);

  const fetchFileContent = async (fileId: number): Promise<string> => {
    try {
      const response = await axios.get(`/api/explorer/${fileId}`);
      if (response.data.content) {
        return response.data.content;
      } else if (response.data.url) {
        return `Media File URL: ${response.data.url}`;
      } else {
        return '<!-- No content available -->';
      }
    } catch (error) {
      console.error('Error fetching file content:', error);
      return '// Error loading file content';
    }
  };

  // Save code (moved to parent)
  const saveCode = async (fileId: number, codeContent: string) => {
    try {
      await axios.post(`/api/explorer/${fileId}/save`, { codeContent });
    } catch (error) {
      console.error('Failed to save code:', error.response?.data || error.message);
    }
  };

  // Fetch projects on component load
  useEffect(() => {
    axios
      .get('/api/projects/retrieve')
      .then((response) => {
        const data: Project[] = response.data;
        setProjects(data);
        if (data.length > 0) {
          onProjectChange(Number(data[0].id));
        }
      })
      .catch((error) => {
        console.error('Error fetching projects:', error);
      });
  }, [onProjectChange]);

  const toggleConsole = () => {
    setConsoleVisible((prev) => !prev);
  };

  // Handle project selection
  const handleProjectSelection = (projectId: number) => {
    onProjectChange(projectId);
    const selectedProject = projects.find((project) => Number(project.id) === projectId) || null;
    setActiveProject(selectedProject);
    setOpenTabs([]);
    setSelectedFile(null);
  };

  const handleFileClick = (file: CustomFile) => {
    const existingTab = openTabs.find((tab) => tab.name === file.name);
    if (existingTab) {
      setActiveTab(existingTab.id);
    } else {
      const newTab = { id: file.id, name: file.name };
      setOpenTabs((prev) => [...prev, newTab]);
      setActiveTab(newTab.id);
    }
    setSelectedFile(file);
  };

  const activateTab = (id: number) => {
    setActiveTab(id);
    const tab = openTabs.find((tab) => tab.id === id);
    if (tab) {
      setSelectedFile({
        id: tab.id,
        name: tab.name,
        projectId: activeProject?.id ? Number(activeProject.id) : 0,
        type: 'text',
        size: 0,      
      });
    }
  };

  const closeTab = (id: number) => {
    setOpenTabs((prev) => prev.filter((tab) => tab.id !== id));
    if (activeTab === id) {
      const remainingTabs = openTabs.filter((tab) => tab.id !== id);
      if (remainingTabs.length > 0) {
        setActiveTab(remainingTabs[0].id);
        setSelectedFile({
          id: remainingTabs[0].id,
          name: remainingTabs[0].name,
          projectId: activeProject?.id ? Number(activeProject.id) : 0,
          type: 'text',
          size: 0,
        });
      } else {
        setActiveTab(null);
        setSelectedFile(null);
      }
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-1/6 bg-gray-900 text-white">
        <NavPanel
          projects={projects}
          activeProject={activeProject}
          setActiveProject={(project) => handleProjectSelection(Number(project.id))}
          loggedInUser={loggedInUser}
          setFileExplorerOpen={setFileExplorerOpen}
          isFileExplorerOpen={isFileExplorerOpen}
        />
      </aside>
  
      {/* Main Layout */}
      <main className="flex flex-1 relative">
        <button
          className={`absolute top-4 left-6 bg-transparent text-fuchsia-700 p-2 rounded hover:bg-gray-900 z-10`}
          title={isFileExplorerOpen ? 'Collapse File Explorer' : 'Expand File Explorer'}
          onClick={() => setFileExplorerOpen(!isFileExplorerOpen)}
        >
          {isFileExplorerOpen ? <FaChevronLeft className="h-5 w-5" /> : <FaChevronRight className="h-5 w-5" />}
        </button>
  
        {isFileExplorerOpen && selectedProjectId !== null && (
          <aside className="w-1/4 bg-gray-800 text-white">
            <FileExplorer
              projectId={selectedProjectId}
              onFileClick={handleFileClick}
            />
          </aside>
        )}
  
        <div className={`flex-1 flex flex-col ${isFileExplorerOpen ? '' : 'ml-4'}`}>
          <button
            onClick={toggleConsole}
            className="absolute top-4 right-6 bg-green-700 text-white p-2 rounded hover:bg-gray-600 z-10"
            aria-label={isConsoleVisible ? 'Hide Console' : 'Show Console'}
          >
            {isConsoleVisible ? <FaChevronDown /> : <FaChevronUp />}
          </button>
  
          <EditorTabs
            tabs={openTabs}
            activeTab={activeTab}
            onActivateTab={activateTab}
            onCloseTab={closeTab}
          />
  
          <CodeEditor
            selectedFile={selectedFile}
            fetchFileContent={fetchFileContent}
            onCodeChange={setCode}
            saveCode={saveCode}
          />
        </div>
      </main>
  
      {isConsoleVisible && (
        <aside
          className="bg-gray-700 text-white resize-x overflow-auto"
          style={{ width: '30%' }}
        >
          <PreviewConsole code={code} />
        </aside>
      )}
    </div>
  );
  
};

export default CodeLayout;