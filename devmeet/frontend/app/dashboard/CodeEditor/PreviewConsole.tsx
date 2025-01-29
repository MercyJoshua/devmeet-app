import { useState } from 'react';

interface PreviewConsoleProps {
  code: string;
}

const PreviewConsole: React.FC<PreviewConsoleProps> = ({ code }) => {
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  

  const openPreviewInNewTab = () => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      const head = `
        <style>
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
        </style>
      `;

      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          ${head}
        </head>
        <body>
          ${code}
        </body>
        </html>
      `;

      newWindow.document.open();
      newWindow.document.write(html);
      newWindow.document.close();

      // Override the console methods in the new tab
      (newWindow as Window & typeof globalThis).console.log = (...args: unknown[]) => {
        setConsoleLogs((prevLogs) => [...prevLogs, args.join(' ')]);
      };

      (newWindow as Window & typeof globalThis).console.error = (...args: unknown[]) => {
        setConsoleLogs((prevLogs) => [...prevLogs, `Error: ${args.join(' ')}`]);
      };
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 text-white overflow-hidden">
      {/* Button to open preview in a new tab */}
      <div className="p-4">
        <button
          onClick={openPreviewInNewTab}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Preview in New Tab
        </button>
      </div>

      {/* Console Logs */}
      <div className="p-4 overflow-y-auto text-sm text-red-400 h-full">
        <h2 className="text-lg font-bold mb-2">Console</h2>
        {consoleLogs.length > 0 ? (
          consoleLogs.map((log, index) => <p key={index}>{log}</p>)
        ) : (
          <p>No logs to display</p>
        )}
      </div>
    </div>
  );
};

export default PreviewConsole;
