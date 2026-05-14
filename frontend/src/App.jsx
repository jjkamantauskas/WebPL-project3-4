import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useParams,
} from 'react-router-dom';

import TopBar from './components/TopBar';
import UserDetail from './components/UserDetail';
import UserList from './components/UserList';
import UserPhotos from './components/UserPhotos';
import LoginRegister from './components/LoginRegister';
import ProtectedRoute from './components/protectedRoute';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import api from './lib/api';

function Home() {
  // 1. Load users
  const {
    data: users,
    isLoading: usersLoading,
    error: usersError
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/user/list');
      return res.data;
    }
  });

  // 2. Derive a stable featured user ID (NOT object-based)
  const featuredUserId = useMemo(() => {
    if (!users?.length) return null;

    let hash = 0;
    for (const u of users) {
      hash += parseInt(u._id.slice(-6), 16);
    }

    return users[hash % users.length]._id;
  }, [users]);

  // 3. Derive featured user object (for display only)
  const featuredUser = useMemo(() => {
    if (!users?.length || !featuredUserId) return null;
    return users.find(u => u._id === featuredUserId);
  }, [users, featuredUserId]);

  // 4. Fetch photos for featured user
  const {
    data: photos,
    isLoading: photosLoading,
    error: photosError
  } = useQuery({
    queryKey: ['photos', featuredUserId],
    enabled: !!featuredUserId,
    queryFn: async ({ queryKey }) => {
      const [, userId] = queryKey;
      const res = await api.get(`/photosOfUser/${userId}`);
      return res.data;
    }
  });

  // 5. Pick deterministic featured photo
  const featuredPhoto = useMemo(() => {
    if (!photos?.length || !featuredUserId) return null;

    let hash = 0;
    for (const c of featuredUserId) {
      hash += c.charCodeAt(0);
    }

    return photos[hash % photos.length];
  }, [photos, featuredUserId]);

  // ---------------- UI STATES ----------------

  if (usersLoading || photosLoading) {
    return <Typography>Loading...</Typography>;
  }

  if (usersError || photosError) {
  console.log("USERS ERROR:", usersError);
  console.log("PHOTOS ERROR:", photosError);

  return (
    <Typography color="error">
      Failed to load featured photo
    </Typography>
  );
}

  if (!featuredUserId) {
    return <Typography>No users available</Typography>;
  }

  if (!featuredPhoto) {
    return <Typography>No Featured Photo Available</Typography>;
  }

  // ---------------- RENDER ----------------

  return (
    <Box>
      <Typography variant="h5">
        Featured Photo by {featuredUser.first_name} {featuredUser.last_name}
      </Typography>

      <Box
        component="img"
        src={featuredPhoto.file_name}
        sx={{ width: '100%', borderRadius: 2 }}
      />
    </Box>
  );
}

function UserDetailRoute() {
  const { id } = useParams();
  return <UserDetail userId={id} />;
}

function UserPhotosRoute() {
  const { id } = useParams();
  return <UserPhotos userId={id} />;
}

function Root() {
  return (
    <Box>
      <TopBar />

      <Box sx={{ mt: 8, px: 2 }}>
        <Grid container spacing={2}>
          <Grid item sm={3}>
            <Paper sx={{ p: 2 }}>
              <UserList />
            </Paper>
          </Grid>

          <Grid item sm={9}>
            <Paper sx={{ p: 2 }}>
              <Outlet />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <LoginRegister /> },

      {
        path: 'user/:id',
        element: (
          <ProtectedRoute>
            <Outlet />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <UserDetailRoute /> },
          { path: 'photos', element: <UserPhotosRoute /> },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}