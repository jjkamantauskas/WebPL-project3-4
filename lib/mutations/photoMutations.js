import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';

/**
 * useUploadPhoto
 * Uploads a photo file for the currently logged-in user.
 * After a successful upload it invalidates ['photos', userId] so the
 * UserPhotos component refetches and the new image appears immediately.
 */
export function useUploadPhoto(userId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('photo', file);
      const res = await api.post('/photos/new', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      // Invalidate this user's photo list so the grid refreshes automatically
      queryClient.invalidateQueries({ queryKey: ['photos', userId] });
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

