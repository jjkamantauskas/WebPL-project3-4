import axios from "axios";
// Import mock setup
//import './mockSetup.js';

export const api = {
  getUsers: () => fetch('user/list').then(r => r.json()),
  getUser: (id) => fetch(`/user/${id}`).then(r => r.json()),
  getPhotos: (id) => fetch(`/photosOfUser/${id}`).then(r => r.json()),
};
