import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { MeetingCostUpdate, MeetingParticipant, Meeting } from '@/api/types';

const SOCKET_URL = `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/meetings`;

type MeetingWebSocketEvents = {
  onCostUpdate?: (data: MeetingCostUpdate) => void;
  onParticipantAdd?: (data: MeetingParticipant) => void;
  onParticipantRemove?: (data: MeetingParticipant) => void;
  onMeetingEnd?: (data: Meeting) => void;
};

export const useMeetingWebSocket = (
  meetingId: number | null,
  events: MeetingWebSocketEvents
) => {
  const socketRef = useRef<Socket | null>(null);
  const eventsRef = useRef(events);
  const [isConnected, setIsConnected] = useState(false);

  // Keep events ref up to date without causing reconnects
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    if (!meetingId) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    // Don't reconnect if already connected to the same meeting
    if (socketRef.current?.connected) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('meeting:join', { meetingId });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    socket.on('meeting:cost:update', (data: MeetingCostUpdate) => {
      eventsRef.current.onCostUpdate?.(data);
    });

    socket.on('meeting:participant:add', (data: MeetingParticipant) => {
      eventsRef.current.onParticipantAdd?.(data);
    });

    socket.on('meeting:participant:remove', (data: MeetingParticipant) => {
      eventsRef.current.onParticipantRemove?.(data);
    });

    socket.on('meeting:end', (data: Meeting) => {
      eventsRef.current.onMeetingEnd?.(data);
    });

    return () => {
      socket.emit('meeting:leave', { meetingId });
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [meetingId]); // Only reconnect when meetingId changes

  const disconnect = () => {
    if (socketRef.current && meetingId) {
      socketRef.current.emit('meeting:leave', { meetingId });
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  };

  return { isConnected, disconnect };
};
