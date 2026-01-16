import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { format } from 'date-fns';
import { Layout } from '@/components/Layout/Layout';
import { GlassCard } from '@/components/GlassCard/GlassCard';
import { CostDisplay } from '@/components/CostDisplay/CostDisplay';
import { meetingsApi } from '@/api/meetings.api';
import type { Meeting, MeetingNote } from '@/api/types';

export const MeetingDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const meetingId = id ? parseInt(id, 10) : null;

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [notes, setNotes] = useState<MeetingNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!meetingId) return;

      try {
        const [meetingData, notesData] = await Promise.all([
          meetingsApi.getOne(meetingId),
          meetingsApi.getNotes(meetingId),
        ]);

        if (meetingData.status === 'active') {
          navigate(`/meeting/${meetingId}`);
          return;
        }

        setMeeting(meetingData);
        setNotes(notesData);
      } catch (err) {
        setError('Failed to load meeting');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [meetingId, navigate]);

  const calculateDuration = () => {
    if (!meeting) return '';
    const start = new Date(meeting.startTime);
    const end = meeting.endTime ? new Date(meeting.endTime) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handleAddNote = async () => {
    if (!meetingId || !newNote.trim()) return;

    try {
      const note = await meetingsApi.addNote(meetingId, { content: newNote });
      setNotes((prev) => [note, ...prev]);
      setNewNote('');
    } catch (err) {
      console.error('Failed to add note:', err);
    }
  };

  const handleUpdateNote = async (noteId: number) => {
    if (!meetingId || !editingNoteContent.trim()) return;

    try {
      const updated = await meetingsApi.updateNote(meetingId, noteId, {
        content: editingNoteContent,
      });
      setNotes((prev) => prev.map((n) => (n.id === noteId ? updated : n)));
      setEditingNoteId(null);
      setEditingNoteContent('');
    } catch (err) {
      console.error('Failed to update note:', err);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!meetingId) return;
    if (!confirm('Delete this note?')) return;

    try {
      await meetingsApi.deleteNote(meetingId, noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (err) {
      console.error('Failed to delete note:', err);
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/meetings')}
          sx={{ mb: 2, color: 'text.secondary' }}
        >
          Back to History
        </Button>

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700}>
            {meeting.title}
          </Typography>
          <Typography color="text.secondary">
            {format(new Date(meeting.startTime), 'EEEE, MMMM d, yyyy • h:mm a')}
          </Typography>
        </Box>

        {/* Summary Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 3,
            mb: 4,
          }}
        >
          <GlassCard glow="accent">
            <Typography variant="overline" color="text.secondary">
              Total Cost
            </Typography>
            <CostDisplay cost={meeting.totalCost} size="medium" />
          </GlassCard>

          <GlassCard>
            <Typography variant="overline" color="text.secondary">
              Duration
            </Typography>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ fontFamily: '"JetBrains Mono", monospace' }}
            >
              {calculateDuration()}
            </Typography>
          </GlassCard>

          <GlassCard>
            <Typography variant="overline" color="text.secondary">
              Participants
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {meeting.participants.length}
            </Typography>
          </GlassCard>
        </Box>

        {/* Participant Breakdown */}
        <Typography variant="h6" fontWeight={600} mb={2}>
          Cost Breakdown
        </Typography>
        <GlassCard sx={{ mb: 4 }}>
          {meeting.participants.map((participant, index) => (
            <Box key={participant.id}>
              {index > 0 && <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${participant.participantColor} 0%, ${participant.participantColor}80 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      color: '#0a0a1a',
                    }}
                  >
                    {participant.participantName.charAt(0).toUpperCase()}
                  </Box>
                  <Box>
                    <Typography fontWeight={600}>
                      {participant.participantName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ${participant.hourlyRate}/hr
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="h6"
                  color="warning.main"
                  fontWeight={700}
                  sx={{ fontFamily: '"JetBrains Mono", monospace' }}
                >
                  ${participant.costContribution.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          ))}
        </GlassCard>

        {/* Notes Section */}
        <Typography variant="h6" fontWeight={600} mb={2}>
          Notes
        </Typography>
        <GlassCard sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              placeholder="Add a note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              multiline
              rows={2}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNote}
              disabled={!newNote.trim()}
              sx={{ alignSelf: 'flex-end' }}
            >
              Add
            </Button>
          </Box>
        </GlassCard>

        {notes.length === 0 ? (
          <GlassCard sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              No notes yet. Add some notes about this meeting.
            </Typography>
          </GlassCard>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {notes.map((note) => (
              <GlassCard key={note.id}>
                {editingNoteId === note.id ? (
                  <Box>
                    <TextField
                      fullWidth
                      value={editingNoteContent}
                      onChange={(e) => setEditingNoteContent(e.target.value)}
                      multiline
                      rows={3}
                      autoFocus
                    />
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button
                        size="small"
                        startIcon={<SaveIcon />}
                        onClick={() => handleUpdateNote(note.id)}
                      >
                        Save
                      </Button>
                      <Button
                        size="small"
                        startIcon={<CancelIcon />}
                        onClick={() => {
                          setEditingNoteId(null);
                          setEditingNoteContent('');
                        }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Typography sx={{ whiteSpace: 'pre-wrap', flex: 1 }}>
                        {note.content}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, ml: 2 }}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditingNoteId(note.id);
                            setEditingNoteContent(note.content);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteNote(note.id)}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1, display: 'block' }}
                    >
                      {format(new Date(note.createdAt), 'MMM d, yyyy • h:mm a')}
                    </Typography>
                  </Box>
                )}
              </GlassCard>
            ))}
          </Box>
        )}
      </motion.div>
    </Layout>
  );
};
