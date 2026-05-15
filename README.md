frontend URL https://web-pl-project3-4.vercel.app/
backend URL https://webpl-project3-4.onrender.com/

## Features

- User registration
- Login/logout authentication
- Session persistence
- Photo upload with Cloudinary
- View user photos
- Like/unlike photos

---

## Tech Stack

Frontend:
- React
- Vite
- Axios

Backend:
- Node.js
- Express
- MongoDB Atlas
- Mongoose
- Express Session

Deployment:
- Vercel (frontend)
- Render (backend)
- Cloudinary (image hosting)

---

## Environment Variables

### Backend (.env)

MONGODB_URI=
SESSION_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

### Frontend (.env)

VITE_API_BASE_URL=
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=

---

## Local Development

### Backend

cd backend
npm install
npm start

### Frontend

cd frontend
npm install
npm run dev

---

## Notes

- MongoDB is hosted using MongoDB Atlas
- Images are stored using Cloudinary
- Sessions use secure cross-site cookies for production deployment
- render free tier might cold start
- first request could take a minute
