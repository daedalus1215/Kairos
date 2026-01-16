import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import { format, formatDistanceToNow } from 'date-fns';
import { Layout } from '@/components/Layout/Layout';
import { GlassCard } from '@/components/GlassCard/GlassCard';
import { meetingsApi } from '@/api/meetings.api';
import type { Meeting } from '@/api/types';

export const MeetingHistoryPage = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadMeetings = async () => {
      try {
        const data = await meetingsApi.getAll();
        setMeetings(data);
        setFilteredMeetings(data);
      } catch (err) {
        console.error('Failed to load meetings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadMeetings();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredMeetings(meetings);
      return;
    }

    const filtered = meetings.filter((m) =>
      m.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMeetings(filtered);
  }, [searchTerm, meetings]);

  const calculateDuration = (meeting: Meeting) => {
    const start = new Date(meeting.startTime);
    const end = meeting.endTime ? new Date(meeting.endTime) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#00FF00';
      case 'ended':
        return '#00F5FF';
      case 'cancelled':
        return '#FF6B6B';
      default:
        return '#888';
    }
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
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Typography variant="h4" fontWeight={700}>
            Meeting History
          </Typography>
          <TextField
            placeholder="Search meetings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {filteredMeetings.length === 0 ? (
          <GlassCard sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary">
              {searchTerm ? 'No meetings found' : 'No meetings yet'}
            </Typography>
            <Typography color="text.secondary" mt={1}>
              {searchTerm
                ? 'Try a different search term'
                : 'Start a meeting from the dashboard'}
            </Typography>
          </GlassCard>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredMeetings.map((meeting, index) => (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard
                  hover
                  onClick={() =>
                    navigate(
                      meeting.status === 'active'
                        ? `/meeting/${meeting.id}`
                        : `/meetings/${meeting.id}`
                    )
                  }
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          mb: 1,
                        }}
                      >
                        <Typography variant="h6" fontWeight={600}>
                          {meeting.title}
                        </Typography>
                        <Chip
                          label={meeting.status}
                          size="small"
                          sx={{
                            backgroundColor: `${getStatusColor(meeting.status)}20`,
                            color: getStatusColor(meeting.status),
                            borderColor: getStatusColor(meeting.status),
                            border: '1px solid',
                            textTransform: 'capitalize',
                          }}
                        />
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                          color: 'text.secondary',
                        }}
                      >
                        <Typography variant="body2">
                          {format(new Date(meeting.startTime), 'MMM d, yyyy • h:mm a')}
                        </Typography>
                        <Typography variant="body2">
                          Duration: {calculateDuration(meeting)}
                        </Typography>
                        <Typography variant="body2">
                          {meeting.participants.length} participants
                        </Typography>
                        {meeting.status === 'ended' && (
                          <Typography variant="body2">
                            {formatDistanceToNow(new Date(meeting.endTime!), {
                              addSuffix: true,
                            })}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography
                        variant="h5"
                        color="warning.main"
                        fontWeight={700}
                        sx={{ fontFamily: '"JetBrains Mono", monospace' }}
                      >
                        ${meeting.totalCost.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </GlassCard>
              </motion.div>
            ))}
          </Box>
        )}
      </motion.div>
    </Layout>
  );
};
