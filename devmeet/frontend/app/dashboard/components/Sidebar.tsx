/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
import Link from "next/link";
import { useState, useRef } from "react";
import {
  FaProjectDiagram,
  FaUsers,
  FaTasks,
  FaCalendar,
  FaCog,
  FaBars,
  FaCode,
} from "react-icons/fa";

interface Props {
  onItemClick: (item: string) => void;
  isOpen: boolean;
}

export default function ResizableSidebar({ onItemClick, isOpen }: Props) {
  const [sidebarWidth, setSidebarWidth] = useState<number>(160);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const handleMouseDown = () => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    const newWidth = e.clientX;
    if (newWidth > 120 && newWidth < 400) {
      setSidebarWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="flex h-full">
      {/* Main Sidebar */}
      <div
        ref={sidebarRef}
        className={`bg-gradient-to-r from-gray-800 to-gray-900 text-white flex-shrink-0 ${
          isOpen ? "block" : "hidden"
        }`}
        style={{ width: isOpen ? sidebarWidth : "0px" }}
      >
        <div className="p-5">
          {/* <h2 className="text-xl font-bold mb-8">DEVMEET</h2> */}
          <nav className="space-y-4">
            {[
              { icon: FaProjectDiagram, label: "Projects" },
              { icon: FaTasks, label: "Tasks" },
              { icon: FaCode, label: "Code" },
              { icon: FaUsers, label: "Teams" },
              { icon: FaBars, label: "Discussions" },
              { icon: FaCalendar, label: "Calendar" },
             
            ].map(({ icon: Icon, label }) => (
              <Link
                href="#"
                className="flex items-center space-x-2 hover:text-white"
                key={label}
                onClick={() => onItemClick(label)}
              >
                <Icon />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
      {/* Resize Handle */}
      <div
        className="bg-gray-600 cursor-col-resize h-full"
        style={{ width: "4px" }}
        onMouseDown={handleMouseDown}
      ></div>
    </div>
  );
}
