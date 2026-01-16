import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleIcon from '@mui/icons-material/People';
import HistoryIcon from '@mui/icons-material/History';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useAuth } from '@/auth/AuthContext';
import { motion } from 'framer-motion';

export const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/participants', label: 'Participants', icon: <PeopleIcon /> },
    { path: '/meetings', label: 'History', icon: <HistoryIcon /> },
  ];

  return (
    <AppBar
      position="sticky"
      sx={{
        background: 'rgba(10, 10, 26, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 245, 255, 0.2)',
        boxShadow: 'none',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="h5"
            component="div"
            onClick={() => navigate('/')}
            sx={{
              cursor: 'pointer',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #00F5FF 0%, #FF00FF 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.1em',
            }}
          >
            KAIROS
          </Typography>
        </motion.div>

        {isAuthenticated && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
                sx={{
                  color:
                    location.pathname === item.path
                      ? 'primary.main'
                      : 'text.secondary',
                  borderBottom:
                    location.pathname === item.path
                      ? '2px solid'
                      : '2px solid transparent',
                  borderRadius: 0,
                  px: 2,
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: 'primary.main',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}

            <Box
              sx={{
                ml: 2,
                pl: 2,
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
              <IconButton
                onClick={logout}
                size="small"
                sx={{ color: 'text.secondary' }}
              >
                <LogoutIcon />
              </IconButton>
            </Box>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};
