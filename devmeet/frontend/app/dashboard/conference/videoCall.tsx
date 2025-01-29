import React, { useState } from 'react';
// import JitsiMeetComponent from './VideoConferencingUI';
import dynamic from "next/dynamic";

const JitsiMeetComponent = dynamic(
  () => {
    return import("./VideoConferencingUI");
  },
  { ssr: false }
);


const ConferencePage = () => {
  const [showConference, setShowConference] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-00 relative z-40">
      <h1 className="text-2xl font-bold mb-6">Devmeet Video Conferencing</h1>
      {!showConference ? (
        <button
          onClick={() => setShowConference(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded z-10"
        >
          Start Conference
        </button>
      ) : (
        <>
          <JitsiMeetComponent participants={[]} />
          <button
            onClick={() => setShowConference(false)}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded z-10"
          >
            End Conference
          </button>
        </>
      )}
    </div>
  );
};

export default ConferencePage;
