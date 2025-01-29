// types.tsx
export type Task = {
    id: string;
    title: string;
    description: string;
  };
  
  export type Column = {
    id: string;
    title: string;
    taskIds: string[];
  };
  