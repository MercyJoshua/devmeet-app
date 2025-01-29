// Define the type for the events prop
export type CalendarEvent = {
    id?: number; // Make optional for new events
    title: string;
    description?: string;
    start: string | Date;
    end: string | Date;
    allDay: boolean;
    
    repetition: string;
    participants: string[];
  }