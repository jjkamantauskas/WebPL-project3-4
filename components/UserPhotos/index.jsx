import React, { useState, useEffect } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import { Typography, Box } from '@mui/material';
import api from "../../lib/api.js";
import { useParams, Link } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';

import './styles.css';

const fetchUser = async (id) => {
  const res = await api.get(`/user/${id}`);
  return res.data;
};

const fetchPhotos = async (id) => {
  const res = await api.get(`/photosOfUser/${id}`);
  return res.data;
};

function UserPhotos({ userId }) {
  const params = useParams();
  const id = userId || params.userId;

  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  }= useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id),
    enabled: !!id
  });

  const {
    data: photos = [],
    isLoading: photosLoading,
    error: photosError,
  } = useQuery({
    queryKey: ['photos', id],
    queryFn: () => fetchPhotos(id),
    enabled: !!id,
  });

  if (userLoading || photosLoading) {
    return <Typography>Pardon our dust!</Typography>;
  }

  if (userError || photosError) {
    return <Typography color="error">Failed to load data</Typography>;
  }

  if (!user) {
    return <Typography>No user found</Typography>;
  }

  function formatDateTime(dateString) {
    const date = new Date(dateString);

    const formattedDate = date.toLocaleDateString("en-US");
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return `${formattedDate} ${formattedTime}`
  }

  return (
    <Typography variant="body1">
      <h2>{user.first_name} {user.last_name}</h2>

      {photos.map(photo => (
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
          {photo.comments?.map(comment => (
            <div key={comment._id}>
    
              {comment.user ? (
                <Link to={`/user/${comment.user._id}`}>
                  <strong>
                    {comment.user.first_name} {comment.user.last_name}
                  </strong>
                </Link>
              ) : (
                <strong>Unknown user</strong>
              )}

              {" "}
              {comment.comment}

              <div style={{ fontSize: "0.8em", color: "gray" }}>
                {formatDateTime(comment.date_time)}
              </div>
            </div>
          ))}
        </div>
      ))}
    </Typography>
  );

}

UserPhotos.propTypes = {
  userId: PropTypes.string.isRequired,
};

UserPhotos.propTypes = {
  userId: PropTypes.string,
};

export default UserPhotos;
