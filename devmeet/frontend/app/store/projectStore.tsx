import { create } from "zustand";

type Project = {
  title: string;
  description: string;
  projectType: 'solo' | 'collaborative';
  startDate: string;
  endDate: string;
  teamMembers?: { role: string; email: string }[];
};

type ProjectState = {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
};

const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
}));

export default useProjectStore;
