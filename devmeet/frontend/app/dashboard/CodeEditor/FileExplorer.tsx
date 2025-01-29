import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import {FaFolder, FaFolderOpen, FaFileAlt, FaEllipsisV,FaFile, FaEdit,} from 'react-icons/fa';
import { FiRefreshCw, FiUpload, FiTrash2,} from 'react-icons/fi';
import {SiHtml5, SiCss3,SiJavascript, SiReact, SiPug, SiJpeg,SiPdm, SiMysql } from 'react-icons/si';

interface File {
  id: number;
  name: string;
  projectId: number;
  type: 'code' | 'folder' | 'image' | 'video' | 'document';
  expanded?: boolean;
  children?: File[];
}
interface CustomFile {
  id: number;
  name: string;
  projectId: number;
}

interface FileExplorerProps {
  onFileClick: (file: CustomFile) => void;
  projectId: number; 
}
const FileExplorer: React.FC<FileExplorerProps> = ({ onFileClick, projectId }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [menuOpen, setMenuOpen] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [creatingType, setCreatingType] = useState<'file' | 'folder' | null>(null);
    const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
    const [renamingFileId, setRenamingFileId] = useState<number | null>(null);
    const [newFileName, setNewFileName] = useState('');
    const explorerRef = useRef<HTMLDivElement>(null);
    const uploadInputRef = useRef<HTMLInputElement | null>(null);

    const updateFileTree = (files: File[], parentId: number | null, newFile: File): File[] => {
      console.log("Updating file tree:", { files, parentId, newFile });
      return files.map((file) => {
        if (file.id === parentId && file.type === "folder") {
          console.log("Adding new file to parent folder:", file.name);
          return {
            ...file,
            children: file.children ? [...file.children, newFile] : [newFile],
          };
        }
    
        // Recurse into children if they exist
        if (file.children) {
          return { ...file, children: updateFileTree(file.children, parentId, newFile) };
        }
    
        return file;
      });
    };
        
    const toggleFolder = (id: number) => {
      setFiles((prevFiles) => {
        console.log("Toggling folder:", id);
        return prevFiles.map((file) =>
          file.id === id && file.type === "folder"
            ? { ...file, expanded: !file.expanded }
            : file.children
            ? { ...file, children: toggleFolderRecursive(file.children, id) }
            : file
        );
      });
    };
    
    const toggleFolderRecursive = (items: File[], id: number): File[] => {
      return items.map((file) => {
        if (file.id === id && file.type === "folder") {
          console.log("Toggling folder recursively:", file.name);
          return { ...file, expanded: !file.expanded };
        }
        if (file.children) {
          return { ...file, children: toggleFolderRecursive(file.children, id) };
        }
        return file;
      });
    };
    
    const handleFolderClick = (id: number) => {
      console.log("Folder clicked:", id);
      setSelectedFolderId((prev) => {
        const newSelection = prev === id ? null : id;
        console.log("Selected folder updated:", newSelection);
        return newSelection;
      });
      toggleFolder(id);
    }; 
    
    const handleRename = async (id: number) => {
      try {
        await axios.put(`/api/explorer/${id}/update`, { name: newFileName });
        setFiles((prev) =>
          prev.map((file) =>
            file.id === id
              ? { ...file, name: newFileName }
              : file.children
              ? { ...file, children: renameFileRecursive(file.children, id) }
              : file
          )
        );
        setRenamingFileId(null);
        setNewFileName("");
      } catch (error) {
        console.error("Error renaming file:", error);
      }
    };

const renameFileRecursive = (items: File[], id: number): File[] =>
  items.map((file) => {
    if (file.id === id) {
      return { ...file, name: newFileName };
    }
    if (file.children) {
      return { ...file, children: renameFileRecursive(file.children, id) };
    }
    return file;
  });

  const handleDelete = async (id: number) => {
  try {
    await axios.delete(`/api/explorer/${id}/delete`);
    setFiles((prev) => deleteFileRecursive(prev, id));
  } catch (error) {
    console.error("Error deleting file:", error);
  }
};
  
  const deleteFileRecursive = (items: File[], id: number): File[] =>
    items
      .filter((file) => file.id !== id)
      .map((file) =>
        file.children ? { ...file, children: deleteFileRecursive(file.children, id) } : file
      );
  
// Fetch files whenever `projectId` changes
useEffect(() => {
  const fetchFiles = async () => {
    try {
      const response = await axios.get(`/api/explorer/${projectId}/get`);
      setFiles(response.data);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  if (projectId) {
    fetchFiles();
  }
}, [projectId]);

 // CREATE NEW FILES/FOLDERS
const handleCreate = async () => {
  if (!newItemName.trim()) return; // Prevent empty names

  const payload = {
    name: newItemName,
    projectId,
    type: creatingType === 'folder' ? 'folder' : 'code',
    parentId: selectedFolderId || null, 
  };

  try {
    const response = await axios.post(
      `/api/explorer/${projectId}/create`,
      payload
    );
    const newFile = response.data;

    console.log('New file created:', newFile); // Debugging API response

    // Use updateFileTree to place the new file/folder in the correct location
    setFiles((prev) => updateFileTree(prev, selectedFolderId, { 
      ...newFile, 
      children: newFile.type === 'folder' ? [] : undefined, 
    }));

    setCreatingType(null); // Reset creating type
    setNewItemName(''); // Clear input
  } catch (error) {
    console.error('Error creating file or folder:', error);
  }
};

// UPLOAD FILES
const handleUploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('projectId', projectId.toString());
  formData.append('parentId', selectedFolderId?.toString() || ''); // Attach parent folder ID if available

  try {
    const response = await axios.post(
      `/api/explorer/${projectId}/upload`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    const uploadedFile = response.data;

    setFiles((prev) =>
      updateFileTree(prev, selectedFolderId, uploadedFile)
    );

    uploadInputRef.current!.value = ''; 
  } catch (error) {
    console.error('Error uploading file:', error);
  }
};

const getFileIcon = (fileName?: string) => {
  if (!fileName) {
    // Return a default icon if fileName is undefined or null
    return <FaFileAlt className="text-gray-400" />;
  }

  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'html':
      return <SiHtml5 className="text-orange-600" />;
    case 'css':
      return <SiCss3 className="text-blue-500" />;
    case 'js':
      return <SiJavascript className="text-yellow-400" />;
    case 'jsx':
      return <SiReact className="text-cyan-500" />;
    case 'png':
      return <SiPug className="text-green-500" />;
    case 'jpg':
    case 'jpeg':
      return <SiJpeg className="text-pink-500" />;
    case 'pdf':
      return <SiPdm className="text-red-500" />;
    case 'sql':
      return <SiMysql className="text-purple-400" />;
    default:
      return <FaFileAlt className="text-gray-400" />;
  }
};

    const renderFiles = (items: File[]) =>
      items.map((file) => (
        <div key={file.id} className="pl-4">
          {file.type === 'folder' ? (
            <div>
              <div
                className={`flex items-center cursor-pointer hover:bg-gray-700 p-2 rounded ${
                  selectedFolderId === file.id ? 'bg-gray-600' : ''
                }`}
                onClick={() => handleFolderClick(file.id)}
              >
                {file.expanded ? (
                  <FaFolderOpen className="mr-2 text-yellow-400" />
                ) : (
                  <FaFolder className="mr-2 text-yellow-400" />
                )}
                <div className="flex items-center">
                  {renamingFileId === file.id ? (
                    <input
                      type="text"
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      onBlur={() => handleRename(file.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRename(file.id)}
                      className="w-full px-2 py-1 rounded bg-gray-700 text-white"
                    />
                  ) : (
                    <span>{file.name || 'Untitled'}</span>
                  )}
                  <FaEdit
                    onClick={() => setRenamingFileId(file.id)}
                    className="ml-2 text-blue-400 hover:text-blue-600"
                  />
                  <FiTrash2
                    onClick={() => handleDelete(file.id)}
                    className="ml-2 text-red-400 hover:text-red-600"
                  />
                </div>
              </div>
              {file.expanded && file.children && renderFiles(file.children)}
            </div>
          ) : (
            <div
              className="flex items-center cursor-pointer hover:bg-gray-700 p-2 rounded"
              onClick={() => onFileClick && onFileClick(file)}
            >
             <span className="mr-2">{getFileIcon(file.name || 'unknown')}</span>
              <div className="flex items-center">
                {renamingFileId === file.id ? (
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    onBlur={() => handleRename(file.id)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRename(file.id)}
                    className="w-full px-2 py-1 rounded bg-gray-700 text-white"
                  />
                ) : (
                  <span>{file.name || 'Untitled'}</span>
                )}
                <FaEdit
                  onClick={() => setRenamingFileId(file.id)}
                  className="ml-2 text-green-400 hover:text-blue-600"
                />
               <FiTrash2
                  onClick={() => handleDelete(file.id)}
                  className="ml-2 text-pink-400 hover:text-red-600"
               />
              </div>
            </div>
          )}
        </div>
      ));
    
  
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          explorerRef.current &&
          !explorerRef.current.contains(event.target as Node) &&
          !(event.target as HTMLElement).closest('.toolbar')
        ) {
          setSelectedFolderId(null); // Deselect folder
        }
      };
  
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);
  
    return (
      <div className="p-4 bg-gray-800 h-full">
          {/* File Explorer */}
          <h2 className="text-lg font-bold text-white mb-4">File Explorer</h2>
        {/* Toolbar Section */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setCreatingType('folder')}
              className="flex items-center bg-gray-700 text-white px-3 py-2 rounded hover:bg-gray-600 relative group"
            >
              <FaFolder className="text-yellow-500" />
              <span className="absolute left-10 opacity-0 group-hover:opacity-100 bg-gray-700 text-sm text-white px-2 py-1 rounded shadow">
                Folder
              </span>
            </button>
            <button
              onClick={() => setCreatingType('file')}
              className="flex items-center bg-gray-700 text-white px-3 py-2 rounded hover:bg-gray-600 relative group"
            >
              <FaFile className="text-orange-400" />
              <span className="absolute left-10 opacity-0 group-hover:opacity-100 bg-gray-700 text-sm text-white px-2 py-1 rounded shadow">
                File
              </span>
            </button>
          </div>
  
          {/* Menu Icon */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="text-white bg-gray-700 p-2 rounded hover:bg-gray-600"
            >
              <FaEllipsisV />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-700 text-white rounded shadow-lg">
                <ul>
                <li
                  className="flex items-center px-4 py-2 hover:bg-gray-600 cursor-pointer"
                  onClick={() => uploadInputRef.current?.click()} // Trigger input click
                >
                  <FiUpload className="mr-2" /> Upload File
                  <input
                    type="file"
                    className="hidden"
                    ref={uploadInputRef} // Use ref here
                    onChange={handleUploadFile}
                  />
                </li>
                  <li className="flex items-center px-4 py-2 hover:bg-gray-600 cursor-pointer">
                    <FiRefreshCw className="mr-2" /> Refresh Explorer
                  </li>
                  <li className="flex items-center px-4 py-2 hover:bg-gray-600 cursor-pointer">
                    <FiTrash2 className="mr-2" /> Delete Workspace
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
  
        {/* Input Section */}
        {creatingType && (
          <div className="mb-4">
            <input
              type="text"
              placeholder={`Enter ${creatingType} name`}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              className="w-full px-3 py-2 rounded border border-gray-600 bg-gray-900 text-white"
            />
            <button
              onClick={handleCreate}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
            >
              Create
            </button>
          </div>
        )}
  
        {renderFiles(files)}
      </div>
    );
  };
  
  export default FileExplorer;
  