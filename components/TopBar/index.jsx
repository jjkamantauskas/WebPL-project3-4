import React, { useRef, useState } from 'react';
import { AppBar, Toolbar, Typography, Box, Button, Snackbar, Alert } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

import { useLogout } from '../../lib/mutations/authMutations';
import { useUploadPhoto } from '../../lib/mutations/photoMutations';
import { useAuth } from '../../context/authContext';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import './styles.css';

function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const { user, loading } = useAuth();
  const { mutate: logoutUser } = useLogout();
  const [open, setOpen] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [cloudinaryError, setCloudinaryError] = useState('');

  // Upload is always for the logged-in user's own photos
  const {
    mutate: uploadPhoto,
    isPending: uploading,
    isSuccess: uploadSuccess,
    isError: uploadFailed,
    error: uploadError,
    reset: resetUpload,
  } = useUploadPhoto();

  const handleLogout = () => {
    logoutUser(undefined, { onSuccess: () => navigate('/login') });
  };

  const getTitle = () => {
    const path = location.pathname;
    if (path.endsWith('/photos')) return 'User Photos';
    if (path.startsWith('/user/')) return 'User Detail';
    if (path.startsWith('/users')) return 'Users';
    return 'Featured';
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setCloudinaryError('');

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append(
        'upload_preset',
        import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
      );

      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

      // Upload directly to Cloudinary
      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!cloudinaryResponse.ok) {
        throw new Error('Cloudinary upload failed');
      }

      const data = await cloudinaryResponse.json();

      // Save secure_url to backend
      uploadPhoto(data.secure_url, {
        onSuccess: () => {
          setOpen(false);
          setSelectedFile(null);
        },
      });
    } catch (err) {
      setCloudinaryError(err.message || 'Upload failed');
    }
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
              />
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => setOpen(true)}
              >
                Add Photo
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

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Upload Photo</DialogTitle>

        <DialogContent>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedFile(e.target.files[0])}
          />

          {cloudinaryError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {cloudinaryError}
            </Alert>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>
            Cancel
          </Button>

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'Upload'
            )}
          </Button>
        </DialogActions>
      </Dialog>

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
