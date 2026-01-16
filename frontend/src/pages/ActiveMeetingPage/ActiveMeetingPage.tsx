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
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Layout } from '@/components/Layout/Layout';
import { GlassCard } from '@/components/GlassCard/GlassCard';
import { CostDisplay } from '@/components/CostDisplay/CostDisplay';
import { Timer } from '@/components/Timer/Timer';
import { ParticipantCard } from '@/components/ParticipantCard/ParticipantCard';
import { useMeetingWebSocket } from '@/hooks/useMeetingWebSocket';
import { meetingsApi } from '@/api/meetings.api';
import { participantsApi } from '@/api/participants.api';
import type { Meeting, Participant, MeetingCostUpdate, MeetingParticipant } from '@/api/types';

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

  const { isConnected } = useMeetingWebSocket(meetingId, {
    onCostUpdate: handleCostUpdate,
    onParticipantAdd: handleParticipantAdd,
    onParticipantRemove: handleParticipantRemove,
    onMeetingEnd: handleMeetingEnd,
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

        // Calculate initial elapsed time
        const startTime = new Date(meetingData.startTime);
        const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
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

  const activeParticipants = meeting?.participants.filter((p) => !p.leftAt) || [];
  const inactiveParticipants = meeting?.participants.filter((p) => p.leftAt) || [];
  const participantsInMeeting = new Set(meeting?.participants.map((p) => p.participantId));
  const availableToAdd = availableParticipants.filter(
    (p) => !participantsInMeeting.has(p.id)
  );

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
                  backgroundColor: isConnected ? '#00FF00' : '#FF0000',
                  boxShadow: isConnected
                    ? '0 0 10px #00FF00'
                    : '0 0 10px #FF0000',
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {isConnected ? 'Live' : 'Connecting...'}
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight={700}>
              {meeting.title}
            </Typography>
          </Box>
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

        {/* Cost Display */}
        <GlassCard glow="accent" sx={{ mb: 4, textAlign: 'center', py: 4 }}>
          <Typography variant="overline" color="text.secondary" sx={{ mb: 2 }}>
            Total Meeting Cost
          </Typography>
          <CostDisplay cost={totalCost} size="large" />
          <Box sx={{ mt: 3 }}>
            <Timer elapsedSeconds={elapsedSeconds} />
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
                  isActive
                />
              ))}
            </AnimatePresence>
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
