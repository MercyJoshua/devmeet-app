/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { FC, useState } from "react";
import axios from "axios";

type Task = {
  id: string;
  title: string;
  description: string;
  progress: number;
  dueDate?: string;
  files: string[];
  assignee: string;
};

type TaskOverlayProps = {
  task: Task;
  onClose: () => void;
  onUpdate: (updatedTask: Task | null) => void;
  handleEdit: () => void;
  handleDelete: () => void;
  handleReassign: () => void;
  isProcessing: boolean;
};

const TaskOverlay: FC<TaskOverlayProps> = ({  task, onClose, onUpdate, }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task>(task);

 /*  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setEditedTask(task); // Reset changes when toggling edit mode
  }; */
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    if (!isEditing) setEditedTask(task); // Reset edits when entering edit mode
  };

  const handleInputChange = (field: keyof Task, value: string) => {
    setEditedTask({ ...editedTask, [field]: value });
  };

  const handleSave = async () => {
    setIsProcessing(true);
    try {
      // Prepare payload with only updated fields
      const updatedFields: Partial<Task> = {};
      if (editedTask.title !== task.title) updatedFields.title = editedTask.title;
      if (editedTask.description !== task.description) updatedFields.description = editedTask.description;
      if (editedTask.assignee !== task.assignee) updatedFields.assignee = editedTask.assignee;
      if (editedTask.dueDate !== task.dueDate) updatedFields.dueDate = editedTask.dueDate;
  
      const response = await axios.put(`/api/tasks/edit/${editedTask.id}`, updatedFields);
  
      alert("Task updated successfully.");
      onUpdate(response.data.updatedTask); // Notify parent with updated task data
      setIsEditing(false);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update task.");
      console.error("Save error:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  /* const handleEdit = async () => {
    console.log("Edit button clicked");
    console.log("Task ID:", task.id);
    const newTitle = prompt("Enter new title:", task.title);
    if (newTitle && newTitle.trim() && newTitle !== task.title) {
      console.log("New title:", newTitle);
      setIsProcessing(true);
      try {
        const response = await axios.put(
          `http://localhost:5000/api/tasks/edit/${task.id}`,
          { title: newTitle }
        );
        console.log("API Response:", response.data);
        const updatedTask = { ...task, title: newTitle };
        alert("Task updated successfully.");
        onUpdate(updatedTask);
      } catch (error) {
        console.error("Failed to update task:", error.response?.data || error.message);
        alert("Failed to update task.");
      } finally {
        setIsProcessing(false);
      }
    }
  }; */
  

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this task?")) {
      setIsProcessing(true);
      try {
        await axios.delete(`/api/tasks/delete/${task.id}`);
        alert("Task deleted successfully.");
        onUpdate(null); // Notify parent to remove the task
        onClose();
      } catch (error) {
        alert("Failed to delete task.");
        console.error("Delete error:", error);
      } finally {
        setIsProcessing(false);
      }
    }
  };



  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-sky-950 rounded shadow p-6 w-1/2">
      {isEditing ? (
        <div>
          <label className="block mb-2 font-bold">Title:</label>
          <input
            type="text"
            className="w-full px-3 py-2 mb-4 border rounded text-black"
            value={editedTask.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
          />
          <label className="block mb-2 font-bold">Description:</label>
          <textarea
            className="w-full px-3 py-2 mb-4 border rounded text-black"
            value={editedTask.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
          />
          <label className="block mb-2 font-bold">Due Date:</label>
            <input
              type="date"
              className="w-full px-3 py-2 mb-4 border rounded text-black"
              value={editedTask.dueDate || ""}
              onChange={(e) => handleInputChange("dueDate", e.target.value)}
            />

          <label className="block mb-2 font-bold">Assignee:</label>
          <input
            type="text"
            className="w-full px-3 py-2 mb-4 border rounded text-black"
            value={editedTask.assignee}
            onChange={(e) => handleInputChange("assignee", e.target.value)}
          />
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-bold">{task.title}</h3>
          <p className="mt-2">{task.description}</p>
          <p className="mt-2">Progress: {task.progress}%</p>
          {task.dueDate && <p className="mt-2">Due Date: {task.dueDate}</p>}
          {task.assignee && <p className="mt-2">Assigned To: {task.assignee}</p>}
          {task.files.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold">Attached Files:</h4>
              <ul className="list-disc pl-5">
                {task.files.map((file, index) => (
                  <li key={index}>{file}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex space-x-2">
        {isEditing ? (
          <button
            onClick={handleSave}
            className={`px-4 py-2 bg-green-500 text-white rounded ${
              isProcessing ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isProcessing}
          >
            {isProcessing ? "Saving..." : "Save"}
          </button>
        ) : (
          <button
            onClick={toggleEditMode}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Edit
          </button>
        )}
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-500 text-white rounded"
          disabled={isProcessing}
        >
          {isProcessing ? "Deleting..." : "Delete"}
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-500 text-white rounded"
          disabled={isProcessing}
        >
          Close
        </button>
      </div>
    </div>
  </div>
  );
};

export default TaskOverlay;
