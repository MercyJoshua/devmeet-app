import React, { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor';
import Image from 'next/image';


// Map of file extensions to languages or types
const fileLanguageMap: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  html: 'html',
  css: 'css',
  json: 'json',
  md: 'markdown',
  png: 'media',
  jpg: 'media',
  jpeg: 'media',
  gif: 'media',
  mp4: 'media',
  webm: 'media',
  avif: 'media',
  sql: 'sql',
  default: 'plaintext',
};

interface CustomFile {
  id: number;
  name: string;
  type: string;
  size: number;
  projectId: number;
}

interface CodeEditorProps {
  selectedFile: CustomFile | null;
  fetchFileContent: (fileId: number) => Promise<string>;
  onCodeChange: (newCode: string) => void;
  saveCode: (fileId: number, codeContent: string) => Promise<void>;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ selectedFile, fetchFileContent, onCodeChange, saveCode }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [mediaContent, setMediaContent] = useState<string | null>(null);
  const modelsByTabRef = useRef<Record<string, monaco.editor.ITextModel>>({});


  useEffect(() => {
    if (editorRef.current) {
      const monacoEditor = monaco.editor.create(editorRef.current, {
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false },
      });
      setEditor(monacoEditor);

      return () => {
        monacoEditor.dispose();
      };
    }
  }, []);

  useEffect(() => {
    const loadFileContent = async () => {
      if (selectedFile) {
        const { id, name } = selectedFile;
        const fileExtension = name.split('.').pop()?.toLowerCase() || 'plaintext';
        const language = fileLanguageMap[fileExtension] || 'plaintext';
    
        if (language === 'media') {
          try {
            const mediaUrl = await fetchFileContent(id);
    
            // Check if the URL is valid for media rendering
            if (mediaUrl.startsWith('/') || mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
              setMediaContent(mediaUrl);
            } else {
              console.warn(`Invalid media URL for file "${name}":`, mediaUrl);
              setMediaContent(null);
            }
    
            // Clear the editor when showing media
            editor?.setModel(null);
          } catch (error) {
            console.error(`Error loading media file "${name}":`, error);
            setMediaContent(null);
          }
        } else {
          let model = modelsByTabRef.current[name];
          if (!model) {
            try {
              const fileContent = await fetchFileContent(id);
              model = monaco.editor.createModel(fileContent || '// Empty file', language);
              modelsByTabRef.current[name] = model;
            } catch (error) {
              console.error(`Error loading file "${name}":`, error);
              model = monaco.editor.createModel('// Error loading file content', 'plaintext');
            }
          }
          setMediaContent(null);
          editor?.setModel(model);
        }
      }
    };
    

    loadFileContent();
  }, [selectedFile, editor, fetchFileContent]);

  
  useEffect(() => {
    if (!editor) return;
  
    let saveTimer: NodeJS.Timeout;
  
    // Content change handler
    const contentChangeHandler = editor.onDidChangeModelContent(() => {
      const updatedCode = editor.getValue(); // Get updated code
  
      // Trigger real-time updates
      onCodeChange(updatedCode);
  
      // Handle saving to the database
      if (selectedFile) {
        // Clear any existing save timer
        clearTimeout(saveTimer);
  
        // Set a new timer to save code after 2 seconds of inactivity
        saveTimer = setTimeout(() => {
          saveCode(selectedFile.id, updatedCode); // Save the code to the backend
        }, 2000); // 2-second debounce
      }
    });
  
    return () => {
      // Cleanup: Dispose of the event listener and clear the timer
      contentChangeHandler.dispose();
      clearTimeout(saveTimer);
    };
  }, [editor, selectedFile, onCodeChange, saveCode]);
  
  return (
    <div
      style={{
        height: '70vh',
        maxWidth: '80vw',
        position: 'relative',
        overflow: 'hidden',
        width: '50vw',
      }}
    >
      {mediaContent ? (
        <div className="media-preview" style={{ textAlign: 'center', padding: '20px' }}>
          {selectedFile?.name.endsWith('.mp4') || selectedFile?.name.endsWith('.webm') ? (
            <video controls style={{ maxWidth: '100%', maxHeight: '100%' }}>
              <source src={mediaContent} type={`video/${selectedFile?.name.split('.').pop()}`} />
              Your browser does not support the video tag.
            </video>
          ) : (
            <Image
              src={mediaContent}
              alt={selectedFile?.name || 'Media Preview'}
              layout="intrinsic"
              width={600}
              height={400}
            />
          )}
        </div>
      ) : (
        <div ref={editorRef} style={{ height: '100%' }} />
      )}
    </div>
  );
};

export default CodeEditor;
