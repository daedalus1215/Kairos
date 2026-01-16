import { type ReactNode } from 'react';
import { Box, type SxProps, type Theme } from '@mui/material';
import { motion } from 'framer-motion';

type GlassCardProps = {
  children: ReactNode;
  sx?: SxProps<Theme>;
  hover?: boolean;
  glow?: 'primary' | 'secondary' | 'accent' | 'none';
  onClick?: () => void;
};

export const GlassCard = ({
  children,
  sx,
  hover = false,
  glow = 'none',
  onClick,
}: GlassCardProps) => {
  const glowColors = {
    primary: 'rgba(0, 245, 255, 0.3)',
    secondary: 'rgba(255, 0, 255, 0.3)',
    accent: 'rgba(255, 215, 0, 0.3)',
    none: 'transparent',
  };

  return (
    <Box
      component={motion.div}
      whileHover={hover ? { scale: 1.02, y: -4 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      sx={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 245, 255, 0.2)',
        borderRadius: 4,
        p: 3,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        boxShadow: glow !== 'none' ? `0 0 20px ${glowColors[glow]}` : 'none',
        '&:hover': hover
          ? {
              borderColor: 'primary.main',
              boxShadow: `0 0 30px ${glowColors.primary}`,
            }
          : {},
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};
