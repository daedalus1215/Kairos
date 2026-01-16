import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Layout } from '@/components/Layout/Layout';
import { GlassCard } from '@/components/GlassCard/GlassCard';
import { meetingsApi } from '@/api/meetings.api';
import { participantsApi } from '@/api/participants.api';
import type { Meeting, Participant } from '@/api/types';
import { format } from 'date-fns';

export const DashboardPage = () => {
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
  const [recentMeetings, setRecentMeetings] = useState<Meeting[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [active, recent, allParticipants] = await Promise.all([
          meetingsApi.getActive(),
          meetingsApi.getAll({ limit: 5 }),
          participantsApi.getAll(),
        ]);
        setActiveMeeting(active);
        setRecentMeetings(recent.filter((m) => m.status === 'ended'));
        setParticipants(allParticipants);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleStartMeeting = async () => {
    try {
      const meeting = await meetingsApi.start({
        title: newMeetingTitle || 'Untitled Meeting',
        participantIds: selectedParticipants,
      });
      setDialogOpen(false);
      navigate(`/meeting/${meeting.id}`);
    } catch (error) {
      console.error('Failed to start meeting:', error);
    }
  };

  const toggleParticipant = (id: number) => {
    setSelectedParticipants((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
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

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" fontWeight={700} mb={4}>
          Dashboard
        </Typography>

        {/* Active Meeting Banner */}
        {activeMeeting && (
          <GlassCard
            glow="accent"
            sx={{ mb: 4, cursor: 'pointer' }}
            onClick={() => navigate(`/meeting/${activeMeeting.id}`)}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: '#00FF00',
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 1 },
                        '50%': { opacity: 0.5 },
                      },
                    }}
                  />
                  <Typography variant="h6" fontWeight={600}>
                    Meeting in Progress
                  </Typography>
                </Box>
                <Typography variant="h5" color="warning.main" fontWeight={700}>
                  {activeMeeting.title}
                </Typography>
              </Box>
              <Button variant="contained" color="warning">
                Resume Meeting
              </Button>
            </Box>
          </GlassCard>
        )}

        {/* Quick Start */}
        {!activeMeeting && (
          <GlassCard sx={{ mb: 4, textAlign: 'center', py: 6 }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayArrowIcon />}
                onClick={() => setDialogOpen(true)}
                sx={{
                  fontSize: '1.2rem',
                  py: 2,
                  px: 6,
                  background: 'linear-gradient(135deg, #00F5FF 0%, #FF00FF 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #00F5FF 20%, #FF00FF 80%)',
                  },
                }}
              >
                Start New Meeting
              </Button>
            </motion.div>
            <Typography color="text.secondary" mt={2}>
              Track meeting costs in real-time
            </Typography>
          </GlassCard>
        )}

        {/* Recent Meetings */}
        <Typography variant="h6" fontWeight={600} mb={2}>
          Recent Meetings
        </Typography>
        {recentMeetings.length === 0 ? (
          <GlassCard>
            <Typography color="text.secondary" textAlign="center">
              No meetings yet. Start your first meeting!
            </Typography>
          </GlassCard>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {recentMeetings.map((meeting, index) => (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard
                  hover
                  onClick={() => navigate(`/meetings/${meeting.id}`)}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {meeting.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {format(new Date(meeting.startTime), 'MMM d, yyyy • h:mm a')}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography
                        variant="h6"
                        color="warning.main"
                        fontWeight={700}
                        sx={{ fontFamily: '"JetBrains Mono", monospace' }}
                      >
                        ${meeting.totalCost.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {meeting.participants.length} participants
                      </Typography>
                    </Box>
                  </Box>
                </GlassCard>
              </motion.div>
            ))}
          </Box>
        )}
      </motion.div>

      {/* New Meeting Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
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
        <DialogTitle>Start New Meeting</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Meeting Title"
            value={newMeetingTitle}
            onChange={(e) => setNewMeetingTitle(e.target.value)}
            margin="normal"
            placeholder="e.g., Sprint Planning"
          />
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Add Participants (optional)
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {participants.map((p) => (
              <Chip
                key={p.id}
                label={p.name}
                onClick={() => toggleParticipant(p.id)}
                sx={{
                  borderColor: p.color,
                  backgroundColor: selectedParticipants.includes(p.id)
                    ? `${p.color}40`
                    : 'transparent',
                  border: '1px solid',
                }}
              />
            ))}
          </Box>
          {participants.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No participants yet.{' '}
              <span
                style={{ color: '#00F5FF', cursor: 'pointer' }}
                onClick={() => {
                  setDialogOpen(false);
                  navigate('/participants');
                }}
              >
                Add some first
              </span>
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleStartMeeting}>
            Start Meeting
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};
