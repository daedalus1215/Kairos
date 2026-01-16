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
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Layout } from '@/components/Layout/Layout';
import { GlassCard } from '@/components/GlassCard/GlassCard';
import { participantsApi } from '@/api/participants.api';
import type { Participant, CreateParticipantDto } from '@/api/types';

const COLORS = [
  '#00F5FF',
  '#FF00FF',
  '#FFD700',
  '#00FF88',
  '#FF6B6B',
  '#A855F7',
  '#F97316',
  '#14B8A6',
];

export const ParticipantsPage = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<CreateParticipantDto>({
    name: '',
    role: '',
    hourlyRate: 100,
    color: COLORS[0],
  });

  useEffect(() => {
    loadParticipants();
  }, []);

  const loadParticipants = async () => {
    try {
      const data = await participantsApi.getAll();
      setParticipants(data);
    } catch (err) {
      console.error('Failed to load participants:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (participant?: Participant) => {
    if (participant) {
      setEditingParticipant(participant);
      setFormData({
        name: participant.name,
        role: participant.role || '',
        hourlyRate: participant.hourlyRate,
        color: participant.color,
      });
    } else {
      setEditingParticipant(null);
      setFormData({
        name: '',
        role: '',
        hourlyRate: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }
    setDialogOpen(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingParticipant(null);
    setError('');
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      if (editingParticipant) {
        const updated = await participantsApi.update(editingParticipant.id, formData);
        setParticipants((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
      } else {
        const created = await participantsApi.create(formData);
        setParticipants((prev) => [...prev, created]);
      }
      handleCloseDialog();
    } catch (err) {
      setError('Failed to save participant');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this participant?')) return;

    try {
      await participantsApi.delete(id);
      setParticipants((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete participant:', err);
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
            Participants
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Participant
          </Button>
        </Box>

        {participants.length === 0 ? (
          <GlassCard sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" mb={2}>
              No participants yet
            </Typography>
            <Typography color="text.secondary" mb={3}>
              Add team members to track their meeting costs
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Your First Participant
            </Button>
          </GlassCard>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 3,
            }}
          >
            <AnimatePresence>
              {participants.map((participant, index) => (
                <motion.div
                  key={participant.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard
                    hover
                    sx={{
                      borderColor: participant.color,
                      borderWidth: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${participant.color} 0%, ${participant.color}80 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '1.5rem',
                          color: '#0a0a1a',
                          flexShrink: 0,
                        }}
                      >
                        {participant.name.charAt(0).toUpperCase()}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight={600}>
                          {participant.name}
                        </Typography>
                        {participant.role && (
                          <Typography variant="body2" color="text.secondary">
                            {participant.role}
                          </Typography>
                        )}
                        <Typography
                          variant="h6"
                          color="warning.main"
                          sx={{
                            fontFamily: '"JetBrains Mono", monospace',
                            mt: 1,
                          }}
                        >
                          ${participant.hourlyRate}/hr
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(participant)}
                          sx={{ color: 'text.secondary' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(participant.id)}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </Box>
        )}
      </motion.div>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
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
        <DialogTitle>
          {editingParticipant ? 'Edit Participant' : 'Add Participant'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
            autoFocus
          />
          <TextField
            fullWidth
            label="Role (optional)"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            margin="normal"
            placeholder="e.g., Software Engineer"
          />
          <TextField
            fullWidth
            label="Hourly Rate ($)"
            type="number"
            value={formData.hourlyRate}
            onChange={(e) =>
              setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) || 0 })
            }
            margin="normal"
            inputProps={{ min: 0, step: 0.01 }}
          />
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Color
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {COLORS.map((color) => (
              <Box
                key={color}
                onClick={() => setFormData({ ...formData, color })}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: color,
                  cursor: 'pointer',
                  border: formData.color === color ? '3px solid white' : 'none',
                  boxShadow:
                    formData.color === color
                      ? `0 0 15px ${color}`
                      : 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingParticipant ? 'Save Changes' : 'Add Participant'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};
