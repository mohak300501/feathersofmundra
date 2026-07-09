# 🐦 Feathers of Mundra - Bird Photography Webapp

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://www.netlify.com/)

A beautiful, modern web application for bird photography enthusiasts. Built with React, Firebase Auth, MongoDB, and Google Drive integration. Features a premium glassmorphic UI with light/dark mode support.

---

## ✨ Features

- 🎨 **Premium UI**: Modern glassmorphic design, dynamic animations, and dark mode support
- 🔐 **Authentication**: Firebase Auth with email verification
- 🐦 **Bird Gallery**: Browse and search through bird species with real-time data from MongoDB
- 📸 **Photo Upload**: Members can upload photos with location and date
- 👑 **Admin Panel**: Manage birds and view system statistics
- 🗂️ **Google Drive Integration**: Photos stored safely in a shared Google Drive folder
- 🚀 **Serverless Functions**: Netlify functions for secure backend API routes
- 📱 **Responsive Design**: Beautiful UI that works on all devices

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: MongoDB
- **File Storage**: Google Drive API
- **Deployment**: Netlify
- **Backend API**: Netlify Serverless Functions
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

---

## 📋 Prerequisites

Before setting up this project, you'll need:

1. **Firebase Project**: Create a Firebase project and enable Authentication (Email/Password)
2. **MongoDB Database**: Set up a MongoDB cluster and get the connection string
3. **Google Cloud Project**: Set up Google Drive API and create a service account
4. **Google Drive**: Create a shared drive folder for photos
5. **Netlify Account**: For deployment and serverless functions

---

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/mohak300501/feathersofmundra.git
cd feathersofmundra
```

### 2. Firebase & Google Drive Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/) and enable Authentication.
2. Go to **Project Settings** > **Service Accounts** and generate a new private key (download the JSON file).
3. In the [Google Cloud Console](https://console.cloud.google.com/), enable the **Google Drive API**.
4. Use the Firebase Service Account email to share a Google Drive folder.

### 3. Environment Variables

Copy `env.example` to `.env` and fill in all the required values:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=111111111111

# Firebase Admin SDK (for serverless functions)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"

# Google Drive API (uses same Firebase service account)
GOOGLE_DRIVE_SHARED_DRIVE_ID=your_shared_drive_id
GOOGLE_DRIVE_FOLDER_ID=your_shared_drive_folder_id

# MongoDB Configuration
MONGODB_USERNAME=your_mongodb_username
MONGODB_PASSWORD=your_mongodb_password
# Format A:
MONGODB_CONNECTION_STRING=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=<appName>
# Format B (Alternative):
# MONGODB_CONNECTION_STRING=mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

> 📁 **Google Drive Setup**: The app uses the same Firebase service account for Google Drive access. You need to set up a shared drive and provide both the shared drive ID and folder ID within that drive.

### 4. Install and Run (Local Development)

```bash
# Install frontend dependencies
npm install

# Install backend dependencies (Netlify serverless functions)
cd netlify/functions
npm install
cd ../../

# Run the development server (use Netlify Dev to run functions locally)
netlify dev
```

### 5. Deploy to Netlify (Production Deployment)

1. Push your code to GitHub.
2. Connect your repository to Netlify.
3. The build command is automatically set in `netlify.toml`: `npm run build`.
4. Set the publish directory: `dist`.
5. Add all environment variables in the Netlify dashboard.
6. Set Node.js version to `18.20.8` in Netlify build settings.
7. Deploy!

> 💡 **Note**: Function dependencies are included in the main `package.json` to avoid memory issues during build.

---

## 📂 Project Structure

```text
feathersofmundra/
├── src/
│   ├── components/         # Reusable UI components
│   ├── contexts/           # React contexts (Auth)
│   ├── pages/              # Page components
│   ├── config/             # Configuration files
│   ├── App.tsx             # Main app component
│   └── main.tsx            # App entry point
├── netlify/
│   └── functions/          # Serverless functions 
├── public/                 # Static assets
├── package.json            # Dependencies
├── netlify.toml            # Netlify configuration
└── README.md               # This file
```

---

## 🔍 Features in Detail

### 🔐 Authentication
- Email/password registration and login
- Email verification required
- Protected routes for logged-in users
- Admin role checking

### 🐦 Bird Management
- Public bird gallery with search
- Admin-only bird addition/deletion
- Bird details with photo galleries

### 📸 Photo Management
- Upload photos with location and date
- High-quality image display
- Delete permissions (owner or admin)
- Automatic Google Drive integration

### 👑 Admin Features
- Add/delete bird species
- Delete any photo
- View system statistics
- User management

---

## 🛡️ Security Features

- Firebase Auth with email verification
- Firestore security rules
- Admin-only operations
- File upload validation
- CORS protection on functions

---

## 🏗️ Security & Architecture

- **Auth & Database**: Firebase Auth handles user authentication securely. Upon login/registration, the client calls a serverless function to sync the user UID to **MongoDB**.
- **Data Protection**: All MongoDB operations (CRUD) are executed exclusively within Netlify Functions.
- **Admin Rights**: Users can be marked as admins in the MongoDB `users` collection to gain privileges for adding/editing/deleting birds.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

## 💖 Acknowledgements

- [Firebase](https://firebase.google.com/) for authentication and database
- [Google Drive API](https://developers.google.com/drive) for file storage
- [Netlify](https://www.netlify.com/) for hosting and serverless functions
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide React](https://lucide.dev/) for icons