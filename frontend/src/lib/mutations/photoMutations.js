import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';

/**
 * useUploadPhoto
 * Saves a Cloudinary URL to the backend after a successful direct upload.
 * Invalidates all photo feeds so the new image appears immediately.
 */
export function useUploadPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photoUrl) => {
      const res = await api.post('/photos', { url: photoUrl });
      return res.data;
    },
    onSuccess: () => {
      // Refresh all photo feeds
      queryClient.invalidateQueries({ predicate: (q) => q.queryKey[0] === 'photos' });
    },
  });
}

/**
 * useLikePhoto
 * Toggles the like status for the current user on a given photo.
 * On success, invalidates the photo feed for the photo owner so counts
 * and button state update immediately.
 *
 * @param {string} ownerId - The user_id of the photo owner (used for cache key).
 */
export function useLikePhoto(ownerId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photoId) => {
      const res = await api.post(`/photos/${photoId}/like`);
      return res.data;
    },
    onSuccess: () => {
      // Invalidate the photos list for this owner so the UI re-renders
      queryClient.invalidateQueries({ queryKey: ['photos', ownerId] });
    },
  });
}

/**
 * useAddComment
 * Posts a new comment on a photo and refreshes the photo feed for the owner.
 *
 * @param {string} userId - The user_id whose photo feed should be refreshed.
 */
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
