import React, { useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import { Typography, Box, TextField, Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import api from '../../lib/api.js';
import { useAddComment } from '../../lib/mutations/photoMutations.js';

import './styles.css';

const fetchUser = (id) => api.get(`/user/${id}`).then((r) => r.data);
const fetchPhotos = (id) => api.get(`/photosOfUser/${id}`).then((r) => r.data);

function formatDateTime(dateString) {
  const date = new Date(dateString);
  return `${date.toLocaleDateString('en-US')} ${date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })}`;
}

/**
 * CommentForm
 * Renders a text input + submit button for posting a comment on one photo.
 * Clears itself on success and shows an inline error on failure.
 */
function CommentForm({ photoId, userId }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const addComment = useAddComment(userId);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) {
      setError('Comment cannot be empty.');
      return;
    }

    addComment.mutate(
      { photoId, comment: trimmed },
      {
        onSuccess: () => {
          setText('');
          setError('');
        },
        onError: (err) => {
          const msg =
            err?.response?.data?.error || 'Failed to post comment. Please try again.';
          setError(msg);
        },
      }
    );
  };

  return (
    <Box sx={{ mt: 1, mb: 2 }}>
      <TextField
        label="Add a comment"
        variant="outlined"
        size="small"
        fullWidth
        multiline
        minRows={1}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (error) setError('');
        }}
        error={!!error}
        helperText={error}
        sx={{ mb: 1 }}
      />
      <Button
        variant="contained"
        size="small"
        onClick={handleSubmit}
        disabled={addComment.isPending}
      >
        {addComment.isPending ? 'Posting…' : 'Post Comment'}
      </Button>
    </Box>
  );
}

CommentForm.propTypes = {
  photoId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
};

function UserPhotos({ userId }) {
  const params = useParams();
  const id = userId || params.id;

  const { data: user, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id),
    enabled: !!id,
  });

  const { data: photos = [], isLoading: photosLoading, error: photosError } = useQuery({
    queryKey: ['photos', id],
    queryFn: () => fetchPhotos(id),
    enabled: !!id,
  });

  if (userLoading || photosLoading) return <Typography>Loading...</Typography>;
  if (userError || photosError) return <Typography color="error">Failed to load data</Typography>;
  if (!user) return <Typography>No user found</Typography>;

  return (
    <Typography variant="body1" component="div">
      <h2>{user.first_name} {user.last_name}</h2>

      {photos.map((photo) => (
        <div key={photo._id}>
          <Box
            component="img"
            src={`/images/${photo.file_name}`}
            sx={{ width: '100%', borderRadius: 2, mb: 1 }}
          />

          {photo.comments?.map((comment) => (
            <div key={comment._id}>
              {comment.user ? (
                <Link to={`/user/${comment.user._id}`}>
                  <strong>{comment.user.first_name} {comment.user.last_name}</strong>
                </Link>
              ) : (
                <strong>Unknown user</strong>
              )}
              {' '}{comment.comment}
              <div style={{ fontSize: '0.8em', color: 'gray' }}>
                {formatDateTime(comment.date_time)}
              </div>
            </div>
          ))}

          {/* Comment input for logged-in users */}
          <CommentForm photoId={photo._id} userId={id} />
        </div>
      ))}
    </Typography>
  );
}

UserPhotos.propTypes = {
  userId: PropTypes.string,
};

export default UserPhotos;
