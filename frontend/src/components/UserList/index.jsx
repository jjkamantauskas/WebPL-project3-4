import React from 'react';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api.js';
import { useAuth } from '../../context/authContext'; // ADD THIS

import './styles.css';

const fetchUsers = async () => {
  const response = await api.get('/user/list');
  return response.data;
};

function UserList() {
  const { user } = useAuth(); // ADD THIS

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    enabled: !!user, // ADD THIS - only fetch when logged in
  });

  if (isLoading) {
    return <Typography>Loading users...</Typography>;
  }

  if (error) {
    return <Typography color="error">Failed to load users</Typography>;
  }

  return (
    <div>
      <Typography variant="body1">
        Users:
      </Typography>
      <List component="nav">
        {users.map((user) => (
          <React.Fragment key={user._id}>
            <ListItem component={Link} to={`/user/${user._id}`}>
              <ListItemText primary={`${user.first_name} ${user.last_name}`} />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </div>
  );
}

export default UserList;
