import React, { useState, useEffect } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import { Typography } from '@mui/material';
import api from "../../lib/api.js";
import { useParams, Link } from "react-router-dom"

import './styles.css';

function UserDetail({ userId }) {
  console.log("params: ", useParams());

  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await api.get(`/user/${userId}`);
        setUser(response.data);
      } catch (err) {
        console.error(err);
      }
    }

    loadUser();
  }, [userId]);
  //userdatail should provide a link for user photos

  if (!user) return <div>Looking for User</div>

  return (
    <Typography variant="body1">
      <React.Fragment key={user._id}>
          <h1>{`${user.first_name} ${user.last_name}`}</h1>
          <Link to={`/user/${user._id}/photos`}>
            View {user.first_name} {user.last_name}'s photos
          </Link>
          <p><location>Located at: {user.location}</location></p>
          <p><occupation>Works as: {user.occupation}</occupation></p>
          <p><description>{user.description}</description></p>
      </React.Fragment>
    </Typography>
  );
}
//FORMAT:
//       Fname Lname
//       photos link
//          descr
//        occupation


export default UserDetail;
