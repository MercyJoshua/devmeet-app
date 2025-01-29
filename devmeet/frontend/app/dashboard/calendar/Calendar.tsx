/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import { EventClickArg, DateSelectArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import EventModal from './EventModal';
import { CalendarEvent } from '../../../types/Calendar';
import useUserStore from "@/app/store/userStore";



interface CalendarProps {
  events: CalendarEvent[];
   event: CalendarEvent;
}
const Calendar: React.FC<CalendarProps> = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { username, full_name } = useUserStore();
   const [events, setEvents] = useState<any[]>([]);

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = {
      id: parseInt(clickInfo.event.id, 10),
      title: clickInfo.event.title,
      description: clickInfo.event.extendedProps.description || '',
      start: clickInfo.event.start?.toISOString() || '',
      end: clickInfo.event.end?.toISOString() || '',
      allDay: clickInfo.event.allDay || false,
      participants: clickInfo.event.extendedProps.participants || [],
      repetition: clickInfo.event.extendedProps.repetition || 'None',
    };
    setSelectedEvent(event);
    setIsModalOpen(true);
  };
  
   // Move fetchEvents outside of useEffect
   const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/calendar/events');
      console.log('Fetched events:', response.data);

      // Add isPast property to each event
      const now = new Date();
      const processedEvents = response.data.map((event: { end: string }) => {
        const isPast = new Date(event.end) < now;
        return { ...event, isPast };
      });

      setEvents(processedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    fetchEvents(); // Fetch events on component mount
  }, []);

  
  useEffect(() => {
    console.log('Updated events state:', events);
  }, [events]);
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setSelectedEvent({
      title: '',
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      allDay: selectInfo.allDay,
      repetition: 'None',
      participants: [],
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setIsModalOpen(false);
  };

  const handleSaveEvent = async (eventData: CalendarEvent) => {
    const payload = {
      ...eventData,
      start: typeof eventData.start === 'string' ? eventData.start : eventData.start.toISOString(),
      end: typeof eventData.end === 'string' ? eventData.end : eventData.end.toISOString(),
    };

    try {
      const response = eventData.id
        ? await axios.put(`/api/calendar/events/${eventData.id}`, payload)
        : await axios.post('/api/calendar/events', payload);

      console.log('Event saved successfully!');
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  // Customize event rendering based on isPast property
  const renderEventContent = (eventInfo: any) => {
    const isPast = eventInfo.event.extendedProps.isPast;
    return (
      <div className={`p-1 rounded-md ${isPast ? 'bg-gray-300 text-gray-500' : 'bg-blue-100 text-blue-700'}`}>
        <b>{eventInfo.timeText}</b>
        <i>{eventInfo.event.title}</i>
      </div>
    );
  };


  return (
    <div>
      <div className="calendar-container p-4 bg-gray-100 dark:bg-gray-900 max-h-full h-96 max-w-full rounded-lg">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          initialView="dayGridMonth"
          selectable={true}
          events={events}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventContent={renderEventContent} // Use custom rendering
          height="100%"
        />
  
        {isModalOpen && selectedEvent && (
          <EventModal
            user_id={{ username, full_name }}
            event={{
              ...selectedEvent,
              start: typeof selectedEvent.start === 'string' ? selectedEvent.start : selectedEvent.start.toISOString(),
              end: typeof selectedEvent.end === 'string' ? selectedEvent.end : selectedEvent.end.toISOString(),
            }}
            closeModal={closeModal}
            saveEvent={handleSaveEvent} 
            refreshEvents={fetchEvents}
          />
        )}
      </div>
    </div>
  );
  
};

export default Calendar;
