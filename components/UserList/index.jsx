import React, { useEffect, useState } from 'react';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import api from "../../lib/api.js";
import { Link } from "react-router-dom"

import './styles.css';

function UserList() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    async function loadUsers() {
      try {
        const response = await api.get('/user/list');
        console.log(response)
        setUsers(response.data);
        console.log(users);
      } catch (err) {
        console.error(err);
      }
    }

    loadUsers();
  }, []);

  return (
    <div>
      <Typography variant="body1">
        Users:
      </Typography>
      <List component="nav">
        {users.map(user => (
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

//turn into links that change the URL, provides full details of user

export default UserList;
