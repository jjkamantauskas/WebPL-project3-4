import React, { useState, useEffect } from 'react';
import { Typography, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useLogin, useRegister } from '../../lib/mutations/authMutations';
import { useAuth } from '../../context/authContext';

function LoginRegister() {
  const [isRegister, setIsRegister] = useState(false);

  const [login_name, setLoginName] = useState('');
  const [password, setPassword] = useState('');

  // register fields
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [occupation, setOccupation] = useState('');

  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const { mutate: loginUser, isPending: loginPending, error: loginError } = useLogin();
  const { mutate: registerUser, isPending: regPending, error: regError } = useRegister();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isRegister) {
      registerUser(
        {
          login_name,
          password,
          first_name,
          last_name,
          location,
          description,
          occupation,
        },
        {
          onSuccess: () => navigate('/'),
        },
      );
    } else {
      loginUser(
        { login_name, password },
        {
          onSuccess: () => navigate('/'),
        },
      );
    }
  };

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Typography variant="body1">
      <h2>{isRegister ? 'Register' : 'Login'}</h2>

      <form onSubmit={handleSubmit}>

        <TextField
          label="Login Name"
          value={login_name}
          onChange={(e) => setLoginName(e.target.value)}
          fullWidth
          margin="normal"
        />

        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
        />

        {isRegister && (
          <>
            <TextField label="First Name" value={first_name} onChange={(e) => setFirstName(e.target.value)} fullWidth margin="normal" />
            <TextField label="Last Name" value={last_name} onChange={(e) => setLastName(e.target.value)} fullWidth margin="normal" />
            <TextField label="Location" value={location} onChange={(e) => setLocation(e.target.value)} fullWidth margin="normal" />
            <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth margin="normal" />
            <TextField label="Occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)} fullWidth margin="normal" />
          </>
        )}

        <Button type="submit" variant="contained" disabled={loginPending || regPending}>
          {isRegister
            ? (regPending ? 'Registering...' : 'Register')
            : (loginPending ? 'Logging in...' : 'Login')}
        </Button>

      </form>

      <Button onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? 'Already have an account? Login' : 'Need an account? Register'}
      </Button>

      {loginError && <Typography color="error">Login failed</Typography>}
      {regError && <Typography color="error">Registration failed</Typography>}
    </Typography>
  );
}

export default LoginRegister;
