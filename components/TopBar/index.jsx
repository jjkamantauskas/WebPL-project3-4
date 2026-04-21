import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { useLocation, useParams, useNavigate } from "react-router-dom";

import { useLogout } from '../../lib/mutations/authMutations';
import { useAuth } from '../../context/authContext';

import './styles.css';

function TopBar() {
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();

  const { user, loading } = useAuth(); //global auth state

  const { mutate: logoutUser } = useLogout();

  const handleLogout = () => {
    logoutUser(undefined, {
      onSuccess: () => {
        navigate('/login');
      }
    });
  };

  const getTitle = () => {
    const path = location.pathname;

    if (path.endsWith("/photos")) {
      return "User Photos";
    }

    if (path.startsWith("/user/")) {
      return "User Detail";
    }

    if (path.startsWith("/users")) return "Users";

    return "Featured";
  };

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar>
        {/* Left side */}
        <Typography variant="h5">
          PhotoShare
        </Typography>

        {/* Right side */}
        <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 2 }}>
          
          {/* Title */}
          <Typography variant="h6">
            {getTitle()}
          </Typography>

          {/* Auth UI */}
          {!loading && (
            <>
              {user ? (
                <>
                  <Typography>
                    Hi {user.login_name}
                  </Typography>

                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  color="inherit"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
              )}
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;