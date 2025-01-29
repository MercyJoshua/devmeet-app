'use client';
import React, { useEffect, useRef } from 'react';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import { gantt } from 'dhtmlx-gantt';

interface GanttChartProps {
  tasks: { id: number; text: string; start_date: string; end_date: string }[];
  project: { start_date: string; end_date: string };
}

const GanttChart = ({ tasks, project }: GanttChartProps) => {
  const ganttContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const formatDateForGantt = (date: string): string => {
      // Reformat 'DD-MM-YYYY' to 'YYYY-MM-DD'
      const [day, month, year] = date.split('-');
      const formattedDate = `${day}-${month}-${year}`; 
      const parsedDate = new Date(formattedDate);
    
      if (!date || isNaN(parsedDate.getTime())) {
        console.error(`Invalid date: ${date}`);
        return '';
      }
    
      const formattedMonth = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
      const formattedDay = parsedDate.getDate().toString().padStart(2, '0');
      const formattedYear = parsedDate.getFullYear();
      return `${formattedMonth}/${formattedDay}/${formattedYear}`; 
    };
    
    const calculateDuration = (start: string, end: string): number => {
      const startDate = new Date(start);
      const endDate = new Date(end);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error(`Invalid dates for duration calculation: ${start}, ${end}`);
        return 0;
      }

      // Ensure start date is not after end date
      if (startDate > endDate) {
        console.warn(`Start date ${start} is later than end date ${end}. Setting duration to 0.`);
        return 0; // Optionally handle this case differently
      }

      return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)); // Duration in days
    };

    const generateGanttData = () => {
      const projectData = {
        id: `project_${project.start_date || 'unknown'}`,
        text: 'Project',
        start_date: formatDateForGantt(project.start_date || ''),
        duration: calculateDuration(project.start_date || '', project.end_date || ''),
        type: 'project',
      };

      const taskData = tasks.map((task) => ({
        id: `task_${task.id}`,
        text: task.text || 'Untitled Task',
        start_date: formatDateForGantt(task.start_date || ''),
        duration: calculateDuration(task.start_date || '', task.end_date || ''),
        parent: `project_${project.start_date || 'unknown'}`,
      }));

      return {
        data: [projectData, ...taskData],
        links: [],
      };
    };

    const ganttData = generateGanttData();

    // Configure Gantt chart scale
    gantt.config.scale_unit = 'day'; // Primary scale unit
    gantt.config.date_scale = '%d %M'; // Format for days
    gantt.config.subscales = [
      { unit: 'month', step: 1, date: '%F %Y' }, // Subscale for months
    ];
    gantt.config.min_column_width = 50; // Adjust column width for better spacing
    gantt.config.scale_height = 50; // Adjust height of scale rows

    // Initialize Gantt chart
    if (ganttContainerRef.current) {
      gantt.clearAll();
      gantt.init(ganttContainerRef.current);
      gantt.parse(ganttData);
    }

    // Cleanup on unmount
    return () => {
      gantt.clearAll();
    };
  }, [tasks, project]);

  return <div ref={ganttContainerRef} style={{ width: '100%', height: '500px', backgroundColor: 'gray' }} />;
};


export default GanttChart;
