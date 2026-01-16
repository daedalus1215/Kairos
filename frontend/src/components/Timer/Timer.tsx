import { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

type TimerProps = {
  elapsedSeconds: number;
};

export const Timer = ({ elapsedSeconds }: TimerProps) => {
  const formattedTime = useMemo(() => {
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;

    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
    };
  }, [elapsedSeconds]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        fontFamily: '"JetBrains Mono", monospace',
      }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      >
        <AccessTimeIcon sx={{ color: 'primary.main', fontSize: 28 }} />
      </motion.div>
      <Typography
        variant="h5"
        sx={{
          fontFamily: '"JetBrains Mono", monospace',
          fontWeight: 600,
          color: 'text.primary',
          letterSpacing: '0.1em',
        }}
      >
        {formattedTime.hours}:{formattedTime.minutes}:
        <motion.span
          key={formattedTime.seconds}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          style={{ color: '#00F5FF' }}
        >
          {formattedTime.seconds}
        </motion.span>
      </Typography>
    </Box>
  );
};
