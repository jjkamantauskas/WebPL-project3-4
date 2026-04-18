import React, { useState, useEffect} from 'react';
import { AppBar, Toolbar, Typography, Box, Link } from '@mui/material';
import { useLocation, useParams } from "react-router-dom"
import api from "../../lib/api.js"; //just in case, probably needed

import './styles.css';

function TopBar() {
  //have the right side of the topbar be reliant on the URL
  const location = useLocation();

  const { id } = useParams();

  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!id) return;

    async function loadUser() {
      try {
        const response = await api.get(`/user/${id}`);
        setUser(response.data);
      } catch (err) {
        console.error(err);
        setUser(null);
      }
    }

    loadUser();
  }, [id]);

  const getTitle = () => {
    const path = location.pathname;

    if(path.endsWith("/photos")){
      return user ? `Photos of ${user.first_name} ${user.last_name}` : "Loading user photos...";
    }
    if(path.startsWith("/user/")){
      return user ? `${user.first_name} ${user.last_name}` : "Loading user...";
    }

    if(path.startsWith("/users")) return("Users");

    return "Featured";
  }

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar>
        <Typography variant="h5" color="inherit">
          Joseph Kamantauskas
        </Typography>

        <Box sx={{ ml: "auto "}}>
          <Typography variant="h6">
            {getTitle(location.pathname)}
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
