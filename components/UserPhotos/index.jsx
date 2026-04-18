import React, { useState, useEffect } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import { Typography, Box } from '@mui/material';
import api from "../../lib/api.js";
import { useParams, Link } from "react-router-dom"


import './styles.css';

function UserPhotos({ userId }) {

  const { _id } = useParams();

  const [user, setUser] = useState(null);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await api.get(`/user/${userId}`);
        const photoRes = await api.get(`/photosOfUser/${userId}`);
        setUser(response.data);
        setPhotos(photoRes.data)
      } catch (err) {
        console.error(err);
      }
    }

    loadUser();
  }, [userId]);

  if (!user) return <div>Loading...</div>;

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
              <Link to={`/users/${comment.user._id}`}>
                <strong>
                  {comment.user.first_name} {comment.user.last_name}
                </strong>
              </Link>
              {" "}
              {comment.comment}
              <div style={{ fontSize: "0.8em", color: "gray"}}>
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

export default UserPhotos;
