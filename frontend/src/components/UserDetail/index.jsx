import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import { Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import api from '../../lib/api.js';

import './styles.css';

const fetchUser = async (id) => {
  const response = await api.get(`/user/${id}`);
  return response.data;
};

function UserDetail({ userId }) {
  const params = useParams();
  const id = userId || params.userId;

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id),
    enabled: !!id,
  });

  if (isLoading) {
    return <Typography>Loading user...</Typography>;
  }

  if (error) {
    return <Typography color="error">Failed to load user</Typography>;
  }

  if (!user) {
    return <Typography>Looking for User</Typography>;
  }

  return (
    <Typography variant="body1">
      <React.Fragment key={user._id}>
        <h1>{`${user.first_name} ${user.last_name}`}</h1>
        <Link to={`/user/${user._id}/photos`}>
          View
          {' '}
          {user.first_name}
          {' '}
          {user.first_name}
          &apos;s photos
        </Link>
        <p>
          <location>
            Located at:
            {user.location}
          </location>
        </p>
        <p>
          <occupation>
            Works as:
            {user.occupation}
          </occupation>
        </p>
        <p><description>{user.description}</description></p>
      </React.Fragment>
    </Typography>
  );
}
// FORMAT:
//       Fname Lname
//       photos link
//          descr
//        occupation

UserDetail.propTypes = {
  userId: PropTypes.string,
};

export default UserDetail;
