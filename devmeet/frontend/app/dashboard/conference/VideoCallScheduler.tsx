/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */

import React, { useState } from 'react';

const VideoCallScheduler = ({ onSave }: { onSave: (data: any) => void }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleSave = () => {
    onSave({ title, date, time });
  };

  return (
    <div className="bg-grey-500 text-black">
      <input
        type="text"
        placeholder="Meeting Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-2 p-2 border rounded text-black"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="mb-2 p-2 border rounded text-black"
      />
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className="mb-4 p-2 border rounded text-black"
      />
      <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded">
        Save Meeting
      </button>
    </div>
  );
};

export default VideoCallScheduler;
