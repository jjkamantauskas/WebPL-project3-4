import React, { useEffect, useState } from 'react';
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
import api from "./lib/api.js";

function Home() {
  const [photo, setPhoto] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeaturedPhoto(){
      try{
        const userRes = await api.get("/user/list");
        console.log("full response: ", userRes);
        const users = userRes.data;

        const randomUser = users[Math.floor(Math.random() * users.length)];
        console.log(randomUser);

        const photoRes = await api.get(`/photosOfUser/${randomUser._id}`);
        console.log(photoRes);
        const photos = photoRes.data;

        const featuredPhoto = photos[Math.floor(Math.random()*photos.length)];
        console.log(featuredPhoto)

        setUser(randomUser);
        setPhoto(featuredPhoto);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadFeaturedPhoto();
  }, []);

  if (loading) return <div>Loading...</div>
  if (!photo || !user) return <div>No Featured Photo Currently! Try Uploading One Of Your Own!</div>

  return (
    <Typography variant="body1">
      <h2>Featured Photo by {user.first_name} {user.last_name}</h2>
      <div key={photo._id}>
        <Box
          component="img"
          src={`/images/${photo.file_name}`}
          sx={{
            width: "100%",
            borderRadius: 2,
            mb: 2,
          }}
          />
        </div>
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
      { index: true, element: <Home /> },

      { path: 'users', element: <UserList /> },

      {
        path: 'user/:id',
        element: <UserLayout />,
        children: [
          { index: true, element: <UserDetailRoute /> }, // matches /user/:id
          { path: 'photos', element: <UserPhotosRoute /> }, // matches /user/:id/photos
        ],
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById('photoshareapp'));
root.render(<RouterProvider router={router} />);
