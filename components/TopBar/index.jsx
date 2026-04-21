import React, { useRef } from 'react';
import { AppBar, Toolbar, Typography, Box, Button, Snackbar, Alert } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

import { useLogout } from '../../lib/mutations/authMutations';
import { useUploadPhoto } from '../../lib/mutations/photoMutations';
import { useAuth } from '../../context/authContext';

import './styles.css';

function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const { user, loading } = useAuth();
  const { mutate: logoutUser } = useLogout();

  // Upload is always for the logged-in user's own photos
  const {
    mutate: uploadPhoto,
    isPending: uploading,
    isSuccess: uploadSuccess,
    isError: uploadFailed,
    error: uploadError,
    reset: resetUpload,
  } = useUploadPhoto(user?._id);

  const handleLogout = () => {
    logoutUser(undefined, { onSuccess: () => navigate('/login') });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    resetUpload();
    uploadPhoto(file);
    e.target.value = '';
  };

  const getTitle = () => {
    const path = location.pathname;
    if (path.endsWith('/photos')) return 'User Photos';
    if (path.startsWith('/user/')) return 'User Detail';
    if (path.startsWith('/users')) return 'Users';
    return 'Featured';
  };

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar>
        {/* Left: app name */}
        <Typography variant="h5">PhotoShare</Typography>

        {/* Right: title + auth + upload */}
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6">{getTitle()}</Typography>

          {!loading && user && (
            <>
              {/* Hidden file input triggered by the Add Photo button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <Button
                variant="outlined"
                color="inherit"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? 'Uploading…' : 'Add Photo'}
              </Button>

              <Typography>Hi {user.first_name}</Typography>

              <Button variant="outlined" color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}

          {!loading && !user && (
            <Button color="inherit" onClick={() => navigate('/login')}>
              Login
            </Button>
          )}
        </Box>
      </Toolbar>

      {/* Upload feedback — Snackbar so it doesn't shift layout */}
      <Snackbar
        open={uploadSuccess}
        autoHideDuration={3000}
        onClose={resetUpload}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={resetUpload}>Photo uploaded!</Alert>
      </Snackbar>
      <Snackbar
        open={uploadFailed}
        autoHideDuration={4000}
        onClose={resetUpload}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={resetUpload}>
          {uploadError?.response?.data?.error || 'Upload failed. Please try again.'}
        </Alert>
      </Snackbar>
    </AppBar>
  );
}

export default TopBar;
