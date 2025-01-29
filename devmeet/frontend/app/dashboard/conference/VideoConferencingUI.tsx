"use client";
import React, { useState, useEffect, useRef } from "react";

// Declare the JitsiMeetExternalAPI on the window object
declare global {
  interface Window {
    JitsiMeetExternalAPI: JitsiMeetExternalAPIConstructor;
  }
}

// Define the type for JitsiMeetExternalAPI
interface JitsiMeetExternalAPIConstructor {
  new (domain: string, options: JitsiMeetExternalAPIOptions): JitsiMeetExternalAPIInstance;
}

interface JitsiMeetExternalAPIOptions {
  roomName: string;
  parentNode: HTMLElement;
  width?: string | number;
  height?: string | number;
  userInfo?: {
    displayName?: string;
  };
}

interface JitsiMeetExternalAPIInstance {
  dispose: () => void;
}

interface Participant {
  id: number;
  name: string;
}

interface VideoConferencingUIProps {
  participants: Participant[];
}

const JitsiMeetComponent: React.FC<VideoConferencingUIProps> = () => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadJitsiScript = () => {
      const script = document.createElement("script");
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      script.onload = () => setIsScriptLoaded(true);
      document.body.appendChild(script);
    };

    if (!window.JitsiMeetExternalAPI) {
      loadJitsiScript();
    } else {
      setIsScriptLoaded(true);
    }

    return () => {
      const script = document.querySelector('script[src="https://meet.jit.si/external_api.js"]');
      script?.remove();
    };
  }, []);

  useEffect(() => {
    if (isScriptLoaded && jitsiContainerRef.current) {
      const domain = "meet.jit.si";
      const options: JitsiMeetExternalAPIOptions = {
        roomName: "DevmeetRoom123",
        parentNode: jitsiContainerRef.current,
        width: "100%",
        height: "100%",
        userInfo: {
          displayName: "Guest User",
        },
      };

      const api = new window.JitsiMeetExternalAPI(domain, options);

      return () => {
        if (api) {
          api.dispose();
        }
      };
    }
  }, [isScriptLoaded]);

  return (
    <div className="absolute inset-0 w-full h-full z-[9999] bg-black bg-opacity-90">
      <div ref={jitsiContainerRef} className="w-full h-full" />
    </div>
  );
};

export default JitsiMeetComponent;
