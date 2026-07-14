import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import StopIcon from '@mui/icons-material/Stop';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PausePresentationIcon from '@mui/icons-material/PausePresentation';
import { Layout } from '@/components/Layout/Layout';
import { GlassCard } from '@/components/GlassCard/GlassCard';
import { CostDisplay } from '@/components/CostDisplay/CostDisplay';
import { Timer } from '@/components/Timer/Timer';
import { ParticipantCard } from '@/components/ParticipantCard/ParticipantCard';
import { useMeetingWebSocket } from '@/hooks/useMeetingWebSocket';
import { meetingsApi } from '@/api/meetings.api';
import { participantsApi } from '@/api/participants.api';
import type { Meeting, Participant, MeetingCostUpdate, MeetingParticipant, PendingParticipant } from '@/api/types';

export const ActiveMeetingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const meetingId = id ? parseInt(id, 10) : null;

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [availableParticipants, setAvailableParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [participantCosts, setParticipantCosts] = useState<Map<number, number>>(
    new Map()
  );

  // Pause state
  const [isPaused, setIsPaused] = useState(false);
  const [pendingParticipants, setPendingParticipants] = useState<PendingParticipant[]>([]);

  const handleCostUpdate = useCallback((data: MeetingCostUpdate) => {
    setTotalCost(data.totalCost);
    setElapsedSeconds(data.elapsedSeconds);
    const newCosts = new Map<number, number>();
    data.participants.forEach((p) => {
      newCosts.set(p.participantId, p.costContribution);
    });
    setParticipantCosts(newCosts);
  }, []);

  const handleParticipantAdd = useCallback((data: MeetingParticipant) => {
    setMeeting((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        participants: [...prev.participants, data],
      };
    });
  }, []);

  const handleParticipantRemove = useCallback((data: MeetingParticipant) => {
    setMeeting((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        participants: prev.participants.map((p) =>
          p.participantId === data.participantId ? { ...p, leftAt: data.leftAt } : p
        ),
      };
    });
  }, []);

  const handleMeetingEnd = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const handlePause = useCallback((data: { meetingId: number; pausedAt: string; totalPausedSeconds: number; totalCost: number; elapsedSeconds: number }) => {
    setIsPaused(true);
    setTotalCost(data.totalCost);
    setElapsedSeconds(data.elapsedSeconds);
  }, []);

  const handleResume = useCallback((data: { meetingId: number; resumedAt: string; totalPausedSeconds: number; totalCost: number; elapsedSeconds: number }) => {
    setIsPaused(false);
    setPendingParticipants([]);
    setTotalCost(data.totalCost);
    setElapsedSeconds(data.elapsedSeconds);
  }, []);

  const handleParticipantPending = useCallback((data: PendingParticipant) => {
    setPendingParticipants((prev) => [...prev, data]);
  }, []);

  const { isConnected } = useMeetingWebSocket(meetingId, {
    onCostUpdate: handleCostUpdate,
    onParticipantAdd: handleParticipantAdd,
    onParticipantRemove: handleParticipantRemove,
    onMeetingEnd: handleMeetingEnd,
    onPause: handlePause,
    onResume: handleResume,
    onParticipantPending: handleParticipantPending,
  });

  useEffect(() => {
    const loadData = async () => {
      if (!meetingId) return;

      try {
        const [meetingData, allParticipants] = await Promise.all([
          meetingsApi.getOne(meetingId),
          participantsApi.getAll(),
        ]);

        if (meetingData.status !== 'active') {
          navigate(`/meetings/${meetingId}`);
          return;
        }

        setMeeting(meetingData);
        setTotalCost(meetingData.totalCost);
        setAvailableParticipants(allParticipants);

        // Initialize pause state from server
        if (meetingData.pausedAt) {
          setIsPaused(true);
        }

        // Calculate initial elapsed time (accounting for pauses)
        const startTime = new Date(meetingData.startTime);
        const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000) - (meetingData.totalPausedSeconds ?? 0);
        setElapsedSeconds(elapsed);
      } catch (err) {
        setError('Failed to load meeting');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [meetingId, navigate]);

  const handleAddParticipant = async (participantId: number) => {
    if (!meetingId) return;

    try {
      await meetingsApi.addParticipant(meetingId, { participantId });
      setAddDialogOpen(false);
    } catch (err) {
      console.error('Failed to add participant:', err);
    }
  };

  const handleRemoveParticipant = async (participantId: number) => {
    if (!meetingId) return;

    try {
      await meetingsApi.removeParticipant(meetingId, participantId);
    } catch (err) {
      console.error('Failed to remove participant:', err);
    }
  };

  const handleEndMeeting = async () => {
    if (!meetingId) return;

    if (!confirm('Are you sure you want to end this meeting?')) return;

    try {
      await meetingsApi.end(meetingId);
      navigate(`/meetings/${meetingId}`);
    } catch (err) {
      console.error('Failed to end meeting:', err);
    }
  };

  const handlePauseMeeting = async () => {
    if (!meetingId || isPaused) return;

    try {
      const result = await meetingsApi.pause(meetingId);
      setIsPaused(true);
      setTotalCost(result.totalCost);
      setElapsedSeconds(result.elapsedSeconds);
    } catch (err) {
      console.error('Failed to pause meeting:', err);
    }
  };

  const handleResumeMeeting = async () => {
    if (!meetingId || !isPaused) return;

    try {
      const result = await meetingsApi.resume(meetingId);
      setIsPaused(false);
      setPendingParticipants([]);
      setTotalCost(result.totalCost);
      setElapsedSeconds(result.elapsedSeconds);
    } catch (err) {
      console.error('Failed to resume meeting:', err);
    }
  };

  const activeParticipants = meeting?.participants.filter((p) => !p.leftAt) || [];
  const inactiveParticipants = meeting?.participants.filter((p) => p.leftAt) || [];
  const participantsInMeeting = new Set(meeting?.participants.map((p) => p.participantId));
  const availableToAdd = availableParticipants.filter(
    (p) => !participantsInMeeting.has(p.id)
  );

  // Connection status indicator color
  const getStatusColor = () => {
    if (!isConnected) return '#FF0000';
    if (isPaused) return '#FFAA00';
    return '#00FF00';
  };

  const getStatusText = () => {
    if (!isConnected) return 'Connecting...';
    if (isPaused) return 'Paused';
    return 'Live';
  };

  if (isLoading) {
    return (
      <Layout>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
          }}
        >
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error || !meeting) {
    return (
      <Layout>
        <Alert severity="error">{error || 'Meeting not found'}</Alert>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 4,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: getStatusColor(),
                  boxShadow: `0 0 10px ${getStatusColor()}`,
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {getStatusText()}
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight={700}>
              {meeting.title}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {isPaused && (
              <Button
                variant="contained"
                startIcon={<PlayArrowIcon />}
                onClick={handleResumeMeeting}
                sx={{
                  backgroundColor: '#00F5FF',
                  color: '#000',
                  fontWeight: 600,
                  boxShadow: '0 0 20px rgba(0, 245, 255, 0.3)',
                  '&:hover': {
                    backgroundColor: '#00d4d9',
                  },
                }}
              >
                Resume
              </Button>
            )}
            {!isPaused && (
              <Button
                variant="outlined"
                startIcon={<PausePresentationIcon />}
                onClick={handlePauseMeeting}
                sx={{
                  borderColor: '#FFAA00',
                  color: '#FFAA00',
                  '&:hover': {
                    borderColor: '#FFAA00',
                    backgroundColor: 'rgba(255, 170, 0, 0.1)',
                  },
                }}
              >
                Pause
              </Button>
            )}
            <Button
              variant="contained"
              color="error"
              startIcon={<StopIcon />}
              onClick={handleEndMeeting}
              sx={{
                boxShadow: '0 0 20px rgba(255, 0, 0, 0.3)',
              }}
            >
              End Meeting
            </Button>
          </Box>
        </Box>

        {/* Cost Display with Pause Overlay */}
        <GlassCard glow="accent" sx={{ mb: 4, textAlign: 'center', py: 4, position: 'relative', overflow: 'hidden' }}>
          {/* Pause overlay */}
          <AnimatePresence>
            {isPaused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(10, 10, 26, 0.8)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 10,
                }}
              >
                <PausePresentationIcon
                  sx={{
                    fontSize: 64,
                    color: '#FFAA00',
                    mb: 1,
                  }}
                />
                <Typography
                  variant="h5"
                  fontWeight={700}
                  sx={{ color: '#FFAA00', letterSpacing: 3 }}
                >
                  PAUSED
                </Typography>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dim the underlying content when paused */}
          <Box sx={{ opacity: isPaused ? 0.4 : 1, transition: 'opacity 0.3s' }}>
            <Typography variant="overline" color="text.secondary" sx={{ mb: 2 }}>
              Total Meeting Cost
            </Typography>
            <CostDisplay cost={totalCost} size="large" />
            <Box sx={{ mt: 3 }}>
              <Timer elapsedSeconds={elapsedSeconds} />
            </Box>
          </Box>
        </GlassCard>

        {/* Participants Section */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Participants ({activeParticipants.length})
          </Typography>
          <Button
            variant="outlined"
            startIcon={<PersonAddIcon />}
            onClick={() => setAddDialogOpen(true)}
            disabled={availableToAdd.length === 0}
          >
            Add Participant
          </Button>
        </Box>

        {activeParticipants.length === 0 ? (
          <GlassCard sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              No participants yet. Add someone to start tracking costs!
            </Typography>
          </GlassCard>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <AnimatePresence>
              {activeParticipants.map((participant) => (
                <ParticipantCard
                  key={participant.id}
                  participant={{
                    ...participant,
                    costContribution:
                      participantCosts.get(participant.participantId) ||
                      participant.costContribution,
                  }}
                  onRemove={() => handleRemoveParticipant(participant.participantId)}
                  isActive={!isPaused}
                />
              ))}
            </AnimatePresence>
          </Box>
        )}

        {/* Pending Participants Section */}
        {pendingParticipants.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography
              variant="subtitle2"
              sx={{ mb: 2, color: '#FFAA00' }}
            >
              Pending ({pendingParticipants.length}) — will join on resume
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {pendingParticipants.map((pp) => (
                <ParticipantCard
                  key={pp.participantId}
                  participant={{
                    id: 0,
                    participantId: pp.participantId,
                    participantName: pp.participantName,
                    participantRole: pp.participantRole,
                    participantColor: pp.participantColor,
                    hourlyRate: pp.hourlyRate,
                    joinedAt: '',
                    leftAt: null,
                    costContribution: 0,
                  }}
                  isActive={false}
                  badge="PENDING"
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Left Participants */}
        {inactiveParticipants.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              Left the meeting
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {inactiveParticipants.map((participant) => (
                <ParticipantCard
                  key={participant.id}
                  participant={{
                    ...participant,
                    costContribution:
                      participantCosts.get(participant.participantId) ||
                      participant.costContribution,
                  }}
                  isActive={false}
                />
              ))}
            </Box>
          </Box>
        )}
      </motion.div>

      {/* Add Participant Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(10, 10, 26, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 245, 255, 0.2)',
          },
        }}
      >
        <DialogTitle>Add Participant</DialogTitle>
        <DialogContent>
          {availableToAdd.length === 0 ? (
            <Typography color="text.secondary">
              All participants are already in this meeting.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {availableToAdd.map((p) => (
                <Chip
                  key={p.id}
                  label={`${p.name} ($${p.hourlyRate}/hr)`}
                  onClick={() => handleAddParticipant(p.id)}
                  sx={{
                    borderColor: p.color,
                    border: '1px solid',
                    '&:hover': {
                      backgroundColor: `${p.color}40`,
                    },
                  }}
                />
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};
