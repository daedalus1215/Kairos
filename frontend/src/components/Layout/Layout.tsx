import { type ReactNode } from 'react';
import { Box, Container } from '@mui/material';
import { Header } from './Header';
import { ParticleBackground } from './ParticleBackground';

type LayoutProps = {
  children: ReactNode;
};

export const Layout = ({ children }: LayoutProps) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <ParticleBackground />
      <Header />
      <Container
        maxWidth="xl"
        sx={{
          flex: 1,
          py: 4,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {children}
      </Container>
    </Box>
  );
};
