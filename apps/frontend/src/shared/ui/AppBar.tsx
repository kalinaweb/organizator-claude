'use client';

import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import { AccountCircle, Logout } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth';
import { authApi } from '@/features/auth';
import type { User } from '@todo-app/shared';

export const TopAppBar = () => {
  const { logout } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    let mounted = true;
    authApi.getCurrentUser()
      .then(user => mounted && setUser(user))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  return (
    <AppBar position="sticky" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Todo App
        </Typography>

        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">
              {user.name || user.email}
            </Typography>
            <IconButton
              size="large"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {(user.name || user.email)[0].toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem disabled>
                <Typography variant="body2">{user.email}</Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Logout fontSize="small" sx={{ mr: 1 }} />
                Выйти
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};
