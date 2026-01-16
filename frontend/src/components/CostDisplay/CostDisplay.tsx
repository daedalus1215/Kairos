import { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

type CostDisplayProps = {
  cost: number;
  size?: 'small' | 'medium' | 'large';
  showCents?: boolean;
};

export const CostDisplay = ({
  cost,
  size = 'large',
  showCents = true,
}: CostDisplayProps) => {
  const formattedCost = useMemo(() => {
    const dollars = Math.floor(cost);
    const cents = Math.floor((cost - dollars) * 100);
    return {
      dollars: dollars.toString().padStart(1, '0'),
      cents: cents.toString().padStart(2, '0'),
    };
  }, [cost]);

  const sizeStyles = {
    small: { fontSize: '2rem', dollarSign: '1.2rem' },
    medium: { fontSize: '4rem', dollarSign: '2rem' },
    large: { fontSize: '6rem', dollarSign: '3rem' },
  };

  const styles = sizeStyles[size];

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        fontFamily: '"JetBrains Mono", monospace',
      }}
    >
      <Typography
        component="span"
        sx={{
          fontSize: styles.dollarSign,
          color: 'warning.main',
          fontWeight: 700,
          mt: 1,
          textShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
        }}
      >
        $
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
        <AnimatePresence mode="popLayout">
          {formattedCost.dollars.split('').map((digit, index) => (
            <motion.span
              key={`${index}-${digit}`}
              initial={{ opacity: 0, y: -20, rotateX: 90 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, y: 20, rotateX: -90 }}
              transition={{ duration: 0.2 }}
              style={{
                display: 'inline-block',
                fontSize: styles.fontSize,
                fontWeight: 700,
                color: '#FFD700',
                textShadow: '0 0 30px rgba(255, 215, 0, 0.6)',
                fontFamily: '"JetBrains Mono", monospace',
              }}
            >
              {digit}
            </motion.span>
          ))}
        </AnimatePresence>
        {showCents && (
          <>
            <Typography
              component="span"
              sx={{
                fontSize: `calc(${styles.fontSize} * 0.5)`,
                color: 'warning.main',
                fontWeight: 700,
                opacity: 0.8,
                fontFamily: '"JetBrains Mono", monospace',
              }}
            >
              .
            </Typography>
            <AnimatePresence mode="popLayout">
              {formattedCost.cents.split('').map((digit, index) => (
                <motion.span
                  key={`cents-${index}-${digit}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    display: 'inline-block',
                    fontSize: `calc(${styles.fontSize} * 0.5)`,
                    fontWeight: 700,
                    color: '#FFD700',
                    opacity: 0.8,
                    textShadow: '0 0 20px rgba(255, 215, 0, 0.4)',
                    fontFamily: '"JetBrains Mono", monospace',
                  }}
                >
                  {digit}
                </motion.span>
              ))}
            </AnimatePresence>
          </>
        )}
      </Box>
    </Box>
  );
};
