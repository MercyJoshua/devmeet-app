import React, { useState, useEffect } from 'react';
import axios from 'axios';
axios.defaults.withCredentials = true;
import toast from 'react-hot-toast';
import useUserStore from '@/app/store/userStore';
import type { CalendarEvent } from '../../../types/Calendar'

interface Event {
  id?: number;
  title: string;
  description?: string;
  start: string;
  end: string;
  allDay: boolean;
  repetition?: string; // None, Daily, Weekly, Monthly, Custom
  participants?: string[]; // List of usernames/emails/team names
}

interface EventModalProps {
  // user: { username: string; full_name: string };
  user_id: { username: string; full_name: string };
  event: Event;
  closeModal: () => void;
  refreshEvents: () => void;
  selectedDate?: string;
  // saveEvent: (eventData: Event) => Promise<void>;
  saveEvent: (eventData: CalendarEvent) => Promise<void>;
}

const EventModal: React.FC<EventModalProps> = ({
  event,
  closeModal,
  refreshEvents,
  selectedDate,
}) => {
  const [formData, setFormData] = useState<Event>({
    title: event.title || '',
    description: event.description || '',
    start: event.start || selectedDate || new Date().toISOString(),
    end: event.end || selectedDate || new Date().toISOString(),
    allDay: event.allDay || false,
    repetition: event.repetition || 'None',
    participants: event.participants || [],
  });

  const [newParticipant, setNewParticipant] = useState<string>(''); // Input for adding participants
  const [invalidParticipants, setInvalidParticipants] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync modal form data with the passed `event` prop
  useEffect(() => {
    console.log('Event passed to modal:', event);
    setFormData({
      title: event.title || '',
      description: event.description || '',
      start: event.start || selectedDate || new Date().toISOString(),
      end: event.end || selectedDate || new Date().toISOString(),
      allDay: event.allDay || false,
      repetition: event.repetition || 'None',
      participants: event.participants || [],
    });
  }, [event, selectedDate]);

  // Add a participant to the list
  const handleAddParticipant = () => {
    if (newParticipant.trim()) {
      if (formData.participants?.includes(newParticipant.trim())) {
        toast.error('This participant is already added.');
      } else {
        setFormData((prev) => ({
          ...prev,
          participants: [...(prev.participants || []), newParticipant.trim()],
        }));
        setNewParticipant('');
      }
    }
  };

  // Remove a participant from the list
  const handleRemoveParticipant = (participant: string) => {
    setFormData((prev) => ({
      ...prev,
      participants: prev.participants?.filter((p) => p !== participant),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');
    setIsLoading(true);

    const { id } = useUserStore.getState();

    if (!id) {
      toast.error('User is not authenticated.');
      setIsLoading(false);
      return;
    }

    const payload = {
      user_id: id,
      title: formData.title,
      description: formData.description,
      start: formData.start,
      end: formData.end,
      allDay: formData.allDay,
      repetition: formData.repetition,
      participants: formData.participants || [],
    };

    console.log('Payload:', payload);

    try {
      const response = event.id
        ? await axios.put(`/api/calendar/events/${event.id}`, payload)
        : await axios.post('/api/calendar/events', payload);

      if (response.data.invalidParticipants?.length > 0) {
        setInvalidParticipants(response.data.invalidParticipants);
        toast.error('Some participants are invalid.');
      } else {
        closeModal();
        toast.success('Event saved successfully!');
      }
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('An error occurred while saving the event.');
    } finally {
      setIsLoading(false);
    }
  };
  // delete event
  const handleDelete = async () => {
    if (!event.id) return;

    if (!confirm('Are you sure you want to delete this event?')) return;

    setIsLoading(true);

    try {
      await axios.delete(`http://localhost:5000/api/calendar/events/${event.id}`);
      toast.success('Event deleted successfully!');
      if (refreshEvents) {
        refreshEvents(); // Refresh events if function is provided
      } else {
        console.warn('refreshEvents function is not defined.');
      }
      closeModal();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event.');
    } finally {
      setIsLoading(false);
    }
  };

  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-purple-500 rounded-lg text-black p-6 w-full max-w-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">{event.id ? 'Edit Event' : 'Add Event'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input Fields */}
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) => {
              console.log("Title changed:", e.target.value);
              setFormData({ ...formData, title: e.target.value });
            }}
            required
            className="w-full border rounded p-2"
          />
         {/* Description */}
            <textarea
              placeholder="Description"
              value={formData.description || ''}
              onChange={(e) => {
                console.log("Title changed:", e.target.value);
                setFormData({ ...formData, description: e.target.value });
            }}
              className="w-full border rounded p-2"
            />
          {/* Start and End Times */}
            <input
              type="datetime-local"
              value={formData.start}
              onChange={(e) => setFormData({ ...formData, start: e.target.value })}
              required
              className="w-full border rounded p-2"
            />
            <input
              type="datetime-local"
              value={formData.end}
              onChange={(e) => setFormData({ ...formData, end: e.target.value })}
              className="w-full border rounded p-2"
            />
          {/* All-Day Checkbox */}
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.allDay}
              onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
              className="w-4 h-4"
            />
            <span>All Day</span>
          </label>
          {/* Participants */}
          <div>
            <label className="block">Invite Participants</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Enter username, email, or team"
                value={newParticipant}
                onChange={(e) => setNewParticipant(e.target.value)}
                className="w-full border rounded p-2"
              />
              <button
                type="button"
                onClick={handleAddParticipant}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Add
              </button>
            </div>
            {/* Participant List */}
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.participants?.map((participant, index) => (
                <div
                  key={index}
                  className="flex items-center bg-blue-200 text-blue-700 px-3 py-1 rounded-full shadow"
                >
                  <span>{participant}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveParticipant(participant)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            {/* Invalid Participants */}
            {invalidParticipants.length > 0 && (
              <div className="mt-4 text-red-500">
                Invalid Participants: {invalidParticipants.join(', ')}
              </div>
            )}
          </div>
          {/* Submit and Close */}
          <div className="flex justify-between items-center space-x-2">
          <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 rounded ${
                isLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
            >
              {isLoading ? 'Saving...' : event.id ? 'Save Changes' : 'Create Event'}
            </button>
           
            {event.id && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isLoading}
                className={`px-4 py-2 rounded ${
                  isLoading ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'
                } text-white`}
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            )}
            <button
              type="button"
              onClick={closeModal}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
