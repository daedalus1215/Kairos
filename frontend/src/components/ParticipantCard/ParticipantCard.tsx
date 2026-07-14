import { Box, Typography, IconButton, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { CostDisplay } from '../CostDisplay/CostDisplay';
import type { MeetingParticipant } from '@/api/types';

type ParticipantCardProps = {
  participant: MeetingParticipant;
  onRemove?: () => void;
  isActive?: boolean;
  showHourlyRate?: boolean;
  badge?: string;
};

export const ParticipantCard = ({
  participant,
  onRemove,
  isActive = true,
  showHourlyRate = false,
  badge,
}: ParticipantCardProps) => {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, x: -50 }}
      layout
      sx={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid',
        borderColor: isActive ? participant.participantColor : 'rgba(255, 255, 255, 0.1)',
        borderRadius: 3,
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        opacity: isActive ? 1 : 0.5,
        transition: 'all 0.3s ease',
        boxShadow: isActive
          ? `0 0 15px ${participant.participantColor}40`
          : 'none',
      }}
    >
      {/* Avatar/Color indicator */}
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${participant.participantColor} 0%, ${participant.participantColor}80 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '1.2rem',
          color: '#0a0a1a',
          boxShadow: isActive
            ? `0 0 20px ${participant.participantColor}60`
            : 'none',
        }}
      >
        {participant.participantName.charAt(0).toUpperCase()}
      </Box>

      {/* Info */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          {participant.participantName}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {participant.participantRole && (
            <Chip
              label={participant.participantRole}
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'text.secondary',
                fontSize: '0.7rem',
              }}
            />
          )}
          {badge && (
            <Chip
              label={badge}
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 170, 0, 0.2)',
                color: '#FFAA00',
                fontSize: '0.7rem',
                fontWeight: 600,
              }}
            />
          )}
          {showHourlyRate && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontFamily: '"JetBrains Mono", monospace' }}
            >
              ${participant.hourlyRate}/hr
            </Typography>
          )}
        </Box>
      </Box>

      {/* Cost contribution */}
      <Box sx={{ textAlign: 'right' }}>
        <CostDisplay cost={participant.costContribution} size="small" />
      </Box>

      {/* Remove button */}
      {onRemove && isActive && (
        <IconButton
          onClick={onRemove}
          size="small"
          sx={{
            color: 'error.main',
            opacity: 0.7,
            '&:hover': {
              opacity: 1,
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
            },
          }}
        >
          <RemoveCircleOutlineIcon />
        </IconButton>
      )}
    </Box>
  );
};
