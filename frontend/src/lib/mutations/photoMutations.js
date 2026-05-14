import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';

/**
 * useUploadPhoto
 * Uploads a photo file for the currently logged-in user.
 * After a successful upload it invalidates ['photos', userId] so the
 * UserPhotos component refetches and the new image appears immediately.
 */
export function useUploadPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photoUrl) => {
      const res = await api.post('/photos', {
        url: photoUrl,
      });

      return res.data;
    },

    onSuccess: () => {
      // refresh all photo feeds
      queryClient.invalidateQueries({ predicate: q => q.queryKey[0] === 'photos' });
    },
  });
}

export function useAddComment(userId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ photoId, comment }) => {
      const res = await api.post(`/commentsOfPhoto/${photoId}`, { comment });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos', userId] });
    },
  });
}

