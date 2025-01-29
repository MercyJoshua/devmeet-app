import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import GanttChart from './GanttChart';
import Calendar from './Calendar';
import dynamic from 'next/dynamic';
// Dynamically import the GanttChart component
const GanttChart = dynamic(() => import('./GanttChart'), { ssr: false });


interface Event {
  id: number;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  repetition: string;
  participants: string[];
}


const CalendarSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('gantt');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [projects, setProjects] = useState<{ id: string; title: string }[]>([]);
  const [tasks, setTasks] = useState<{ id: number; text: string; start_date: string; end_date: string }[]>([]);
  const [projectDetails, setProjectDetails] = useState<{ start_date: string; end_date: string } | null>(null);
  const [events] = useState<Event[]>([]);// For storing fetched events

  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('/api/projects/retrieve'); 
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  

  // Fetch tasks and project details when selectedProject changes
  useEffect(() => {
    const fetchTasksAndProject = async () => {
      try {
        if (selectedProject !== 'all') {
          const tasksResponse = await axios.get(`/api/tasks/${selectedProject}`); 
          const projectResponse = await axios.get(`/api/projects/${selectedProject}`);

          setTasks(tasksResponse.data);
          setProjectDetails(projectResponse.data);
        } else {
          setTasks([]);
          setProjectDetails(null); // Default when "all" is selected
        }
      } catch (error) {
        console.error('Error fetching tasks or project details:', error);
      }
    };

    fetchTasksAndProject();
  }, [selectedProject]);
  

    
  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-md w-full h-full max-w-6xl mx-auto my-4 md:my-6 lg:my-8">
      {/* Top navigation panel */}
      <div className="top-nav flex items-center justify-between border-b border-gray-700 mb-4">
        <div className="flex items-center space-x-4">
          <label className="text-white">Select Project:</label>
          <select
            className="bg-gray-800 text-white p-2 rounded-md"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="all">Timelines and Events (All)</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>
        <div className="tabs flex space-x-4">
          <button
            onClick={() => setActiveTab('gantt')}
            className={`py-2 px-4 rounded-t-md transition-colors ${activeTab === 'gantt' ? 'bg-gray-800 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-600'}`}
          >
            Gantt Chart
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`py-2 px-4 rounded-t-md transition-colors ${activeTab === 'schedule' ? 'bg-gray-800 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
          >
            Schedule Events
          </button>
        </div>
      </div>

      {/* Content based on selected tab */}
      <div className="tab-content mt-4 md:mt-6 lg:mt-8">
        {activeTab === 'gantt' && projectDetails && (
          <GanttChart tasks={tasks} project={projectDetails} />
        )}
        {activeTab === 'schedule' && <div className="flex flex-col h-full max-h-screen">
          <Calendar events={events} event={events[0]} />
</div>}
      </div>
    </div>
  );
};

export default CalendarSection;
