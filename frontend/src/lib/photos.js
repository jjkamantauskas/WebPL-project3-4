import api from './api';

export const getUserPhotos = (id) => api.get(`/photos/photosOfUser/${id}`).then((res) => res.data);
