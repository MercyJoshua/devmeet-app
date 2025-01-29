/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { FC, useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { DropResult } from "react-beautiful-dnd";
import axios from 'axios';
import TaskOverlay from './TaskOverlay'; 
import { Project } from '@/types/Project';
axios.defaults.withCredentials = true;

type Task = {
  id: string;
  title: string;
  description: string;
  assignee: string;
  progress: number;
  dueDate?: string; // Add dueDate field
  files: string[];
};

type Column = {
  id: string;
  title: string;
  taskIds: string[];
};

type BoardData = {
  tasks: { [key: string]: Task };
  columns: { [key: string]: Column };
  columnOrder: string[];
};

interface TaskBoardProps {
  selectedProject: Project | null;
}
const TaskBoard: React.FC<TaskBoardProps> = ({ selectedProject }) => {
  const [boardData, setBoardData] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [user, setUser] = useState<{ email: string; id: number; username: string } | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/auth/user', { withCredentials: true });
        setUser(response.data); // Assuming the API returns user data like { id, username }
      } catch (err) {
        setError('Failed to fetch user data.');
        console.error(err);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (!selectedProject) {
      setBoardData(null);
      return;
    }
  
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/tasks/retrieve', {
          withCredentials: true,
        });
        const tasksData = response.data;
  
        console.log('Tasks data received from backend:', tasksData);
  
        // Filter tasks based on the selected project and user permissions
        const filteredTasksData = tasksData.filter((task: any) => {
          const isPartOfProject = task.project_id === selectedProject.id;
          const isMemberOfProject = task.email === user?.email;
          const isAssignedToUser = task.assignee_id === user?.id;
          const isTaskCreatedByUser = task.created_by === user?.id;
          const isTaskNotRestricted = task.restricted !== 'transparent';
  
          console.log(`Filtering task ${task.id}`, {
            isPartOfProject,
            isMemberOfProject,
            isAssignedToUser,
            isTaskCreatedByUser,
            isTaskNotRestricted,
          });
  
          return (
            isPartOfProject &&
            (isMemberOfProject || isAssignedToUser || isTaskCreatedByUser) &&
            isTaskNotRestricted
          );
        });
  
        console.log('Filtered tasks:', filteredTasksData);

     // Transform tasks data into the required board format
     const tasks = filteredTasksData.reduce((acc: Record<string, Task>, task: any) => {
      acc[task.id] = {
        id: task.id.toString(),
        title: task.title || 'Untitled Task',
        description: task.description || 'No description available',
        assignee: task.assignee_id ? `User ${task.assignee_id}` : 'Unassigned',
        progress: task.progress || 0,
        dueDate: task.due_date || null,
        files: task.files ? JSON.parse(task.files) : [],
      };
      return acc;
    }, {});

  // Define columns and their task IDs
      const columns = {
        'column-1': {
          id: 'column-1',
          title: 'To Do',
          taskIds: filteredTasksData
            .filter((task: any) => task.status === 'todo')
            .map((task: any) => task.id.toString()),
        },
        'column-2': {
          id: 'column-2',
          title: 'In Progress',
          taskIds: filteredTasksData
            .filter((task: any) => task.status === 'in-progress')
            .map((task: any) => task.id.toString()),
        },
        'column-3': {
          id: 'column-3',
          title: 'Review',
          taskIds: filteredTasksData
            .filter((task: any) => task.status === 'review')
            .map((task: any) => task.id.toString()),
        },
        'column-4': {
          id: 'column-4',
          title: 'Done',
          taskIds: filteredTasksData
            .filter((task: any) => task.status === 'done')
            .map((task: any) => task.id.toString()),
        },
      };

      const columnOrder = ['column-1', 'column-2', 'column-3', 'column-4'];

      // Update the board data
      setBoardData({ tasks, columns, columnOrder });
    } catch (err) {
      console.error('Failed to load task data:', err);
      setError('Failed to load task data.');
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [user, selectedProject]);
  
const onDragEnd = (result: DropResult) => {
  if (!boardData) return; // Ensure boardData is defined
  
  const { destination, source, draggableId } = result;

  // If no destination or item is dropped in the same position, do nothing
  if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
    return;
  }

  // Columns involved in the drag operation
  const startColumn = boardData.columns[source.droppableId];
  const endColumn = boardData.columns[destination.droppableId];

  if (!startColumn || !endColumn) {
    console.error("Invalid column data.");
    return;
  }

  // Moving within the same column
  if (startColumn === endColumn) {
    const updatedTaskIds = Array.from(startColumn.taskIds);
    updatedTaskIds.splice(source.index, 1); // Remove task
    updatedTaskIds.splice(destination.index, 0, draggableId); // Add task

    const updatedColumn = {
      ...startColumn,
      taskIds: updatedTaskIds,
    };

    setBoardData((prev) =>
      prev
        ? {
            ...prev,
            columns: {
              ...prev.columns,
              [updatedColumn.id]: updatedColumn,
            },
          }
        : null
    );
    return;
  }

  // Moving between different columns
  const startTaskIds = Array.from(startColumn.taskIds);
  startTaskIds.splice(source.index, 1); // Remove task from start column

  const endTaskIds = Array.from(endColumn.taskIds);
  endTaskIds.splice(destination.index, 0, draggableId); // Add task to end column

  const updatedStartColumn = {
    ...startColumn,
    taskIds: startTaskIds,
  };

  const updatedEndColumn = {
    ...endColumn,
    taskIds: endTaskIds,
  };

  setBoardData((prev) =>
    prev
      ? {
          ...prev,
          columns: {
            ...prev.columns,
            [updatedStartColumn.id]: updatedStartColumn,
            [updatedEndColumn.id]: updatedEndColumn,
          },
        }
      : null
  );
};
  
if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error}</div>;
if (!boardData) return <div>No tasks available for the selected project.</div>;

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-row w-full h-full p-4 space-x-4 bg-gray-900 overflow-auto">
          {boardData.columnOrder.map((columnId) => {
            const column = boardData.columns[columnId];
            const tasks = column.taskIds.map((taskId) => boardData.tasks[taskId]);

            return (
<Droppable droppableId={column.id} key={column.id}>
  {(provided) => (
    <div
      {...provided.droppableProps}
      ref={provided.innerRef}
      className="flex flex-col w-full sm:w-1/4 md:w-1/5 lg:w-1/6 h-96 bg-cyan-900 rounded shadow p-2 space-y-3"
    >
      {/* Fixed Title */}
      <div className="sticky top-0 z-10 bg-cyan-900 p-2 rounded">
        <h3 className="text-lg sm:text-xl font-bold text-center">{column.title}</h3>
      </div>

      {/* Scrollable Task List */}
      <div className="flex-1 h-80 overflow-y-auto space-y-3">
        {tasks.map((task, index) => (
          <Draggable key={task.id} draggableId={task.id} index={index}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className="p-2 sm:p-3 bg-sky-950 rounded shadow-md text-sm"
              >
                <h4 className="font-semibold text-xs sm:text-sm">{task.title}</h4>
                <p className="text-xs sm:text-sm">Assigned to: {task.assignee}</p>
                <button
                  onClick={() => setSelectedTask(task)}
                  className="mt-2 text-xs sm:text-sm text-blue-500 underline"
                >
                  View
                </button>
              </div>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </div>
    </div>
  )}
</Droppable>
            );
          })}
        </div>
      </DragDropContext>
      {selectedTask && (
  <TaskOverlay
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={(updatedTask) => {
            // Update the task in the state
            setBoardData((prev) => {
              if (!prev) return null;

              return {
                ...prev,
                tasks: {
                  ...prev.tasks,
                  [updatedTask.id]: updatedTask,
                },
              };
            });


            setSelectedTask(null);
          } } handleEdit={function (): void {
            throw new Error('Function not implemented.');
          } } handleDelete={function (): void {
            throw new Error('Function not implemented.');
          } } handleReassign={function (): void {
            throw new Error('Function not implemented.');
          } } isProcessing={false}  />
)}

    </>
  );
};

export default TaskBoard;
