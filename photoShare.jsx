import React, { useMemo } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import ReactDOM from 'react-dom/client';
import { Grid, Typography, Paper, Box } from '@mui/material';
import {
  createBrowserRouter, RouterProvider, Outlet, useParams,
} from 'react-router-dom';

import './styles/main.css';
import TopBar from './components/TopBar';
import UserDetail from './components/UserDetail';
import UserList from './components/UserList';
import UserPhotos from './components/UserPhotos';
import LoginRegister from './components/LoginRegister';
import api from "./lib/api.js";
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { AuthProvider } from './context/authContext';
import ProtectedRoute from './components/protectedRoute';

function Home() {

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

  const randomUser = useMemo(() => {
    if (!users?.length) return null;
    return users[Math.floor(Math.random() * users.length)];
  }, [users]);

  const {
    data: photos,
    isLoading: photosLoading,
    error: photosError
  } = useQuery({
    queryKey: ['photos', randomUser?._id],
    queryFn: async () => {
      const res = await api.get(`/photosOfUser/${randomUser._id}`);
      return res.data;
    },
    enabled: !!randomUser //only run when user exists
  });

  //Pick random photo
  const featuredPhoto = photos?.length
    ? photos[Math.floor(Math.random() * photos.length)]
    : null;

  console.log("PHOTO:", featuredPhoto);

  //loading
  if (usersLoading || photosLoading) {
    return <Typography>Loading...</Typography>;
  }

  //Error state
  if (usersError || photosError) {
    return <Typography color="error">Failed to load featured photo</Typography>;
  }

  //Empty
  if (!randomUser || !featuredPhoto) {
    return (
      <Typography>
        No Featured Photo Currently! Try Uploading One Of Your Own!
      </Typography>
    );
  }
  console.log("IMAGE URL:", `/images/${featuredPhoto.file_name}`);

  return (
    <Typography variant="body1">
      <h2>
        Featured Photo by {randomUser.first_name} {randomUser.last_name}
      </h2>

      <Box
        component="img"
        src={`/images/${featuredPhoto.file_name}`}
        sx={{
          width: "100%",
          borderRadius: 2,
          mb: 2,
        }}
      />
    </Typography>
  );
}

function UserDetailRoute() {
  const { id } = useParams();
  // eslint-disable-next-line no-console
  if (!id) {
    return <div>User ID not specified</div>;
  }
  console.log("ROUTE PARAMS:", useParams());
  return <UserDetail userId={id} />;
}

function UserPhotosRoute() {
  const { id } = useParams();
  return <UserPhotos userId={id}/>;
}

function Root() {
  return (
    <div className="main-container">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TopBar />
        </Grid>
        <div className="main-topbar-buffer" />
        <Grid item sm={3}>
          <Paper className="main-grid-item">
            <UserList />
          </Paper>
        </Grid>
        <Grid item sm={9}>
          <Paper className="main-grid-item">
            <Outlet />
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

function UserLayout() {
  return <Outlet />;
}


const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      { path: 'login', element: <LoginRegister /> },
      { index: true, element: <Home /> },

      {
        path: 'user/:id',
        element: (
          <ProtectedRoute>
            <UserLayout />
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

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('photoshareapp'));

root.render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </QueryClientProvider>
);
