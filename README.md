# 📝 BlogSpace

<div align="center">

![BlogSpace Banner](https://img.shields.io/badge/BlogSpace-MERN%20Blog%20Platform-blue?style=for-the-badge&logo=blogger)

**A modern, full-stack blogging platform built with the MERN stack**

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT%20%2B%20OAuth-orange?style=flat&logo=jsonwebtokens)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Usage](#-usage) • [API Documentation](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 🌟 Features

### 🔐 **Authentication & Authorization**
- **JWT-based Authentication** - Secure token-based authentication system
- **Google OAuth Integration** - Sign in with Google for quick access
- **Protected Routes** - Role-based access control for admin and users
- **Session Management** - Persistent login with secure cookie handling

### ✍️ **Rich Blogging Experience**
- **Rich Text Editor** - Write and format blogs with an intuitive WYSIWYG editor
- **Draft System** - Save drafts and publish when ready
- **Tag-Based Organization** - Categorize blogs with multiple tags (tech, food, travel, etc.)
- **Image Upload** - Support for blog banners and inline images
- **SEO-Friendly URLs** - Clean, readable URLs for better search engine optimization

### 💬 **Interactive Community**
- **Commenting System** - Readers can comment on blog posts
- **Nested Replies** - Threaded comment discussions
- **Like/Reaction System** - Engage with content through likes
- **User Profiles** - Personalized author profiles with bio and social links

### 📊 **Analytics & Dashboard**
- **Blog Statistics** - View counts, likes, and comments analytics
- **User Dashboard** - Manage your published blogs and drafts
- **Admin Panel** - Moderate content and manage users
- **Trending Posts** - Discover popular content based on engagement

### 🎨 **Modern UI/UX**
- **Responsive Design** - Fully optimized for desktop, tablet, and mobile
- **Dark Mode Support** - Toggle between light and dark themes
- **Smooth Animations** - Engaging transitions and micro-interactions
- **Accessibility** - WCAG compliant design for inclusive access
- **Loading States** - Skeleton loaders for better perceived performance

### 🔍 **Search & Discovery**
- **Full-Text Search** - Find blogs by title, content, or author
- **Filter by Tags** - Browse content by categories
- **Latest Blogs Feed** - Stay updated with newest content
- **Trending Section** - Discover popular posts

---

## 🛠️ Tech Stack

### **Frontend**
| Technology | Purpose | Version |
|------------|---------|---------|
| ⚛️ **React** | UI Framework | 18.3.1 |
| ⚡ **Vite** | Build Tool | 5.4.9 |
| 🎨 **Tailwind CSS** | Styling | 3.4.14 |
| 🧭 **React Router** | Navigation | 6.27.0 |
| 🔄 **Axios** | HTTP Client | 1.7.7 |
| 📝 **React Quill** | Rich Text Editor | 2.0.0 |
| 🔍 **Headless UI** | Accessible Components | 2.1.10 |
| 📊 **Recharts** | Data Visualization | 2.14.1 |
| 🎭 **Framer Motion** | Animations | 11.11.11 |

### **Backend**
| Technology | Purpose | Version |
|------------|---------|---------|
| 🟢 **Node.js** | Runtime Environment | - |
| 🚂 **Express** | Web Framework | 4.21.1 |
| 🍃 **MongoDB** | Database | - |
| 🔧 **Mongoose** | ODM | 8.8.1 |
| 🔐 **JWT** | Authentication | 9.0.2 |
| 🔑 **Bcrypt** | Password Hashing | 5.1.1 |
| 🌐 **CORS** | Cross-Origin Resource Sharing | 2.8.5 |
| 📁 **Multer** | File Upload | 1.4.5-lts.1 |
| 🔒 **Helmet** | Security Headers | - |

### **DevOps & Tools**
- **Git** - Version Control
- **GitHub** - Repository Hosting
- **Vite** - Development Server & Build Tool
- **ESLint** - Code Linting
- **Prettier** - Code Formatting

---

## 📦 Installation

### **Prerequisites**

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** - Package manager
- **Git** - [Download](https://git-scm.com/)

### **Clone Repository**

```bash
# Clone the repository
git clone https://github.com/Harshilll29/BlogSpace.git

# Navigate to project directory
cd BlogSpace
```

---

### **Backend Setup**

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
touch .env
```

**Configure Environment Variables** (`.env`):

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/blogspace
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blogspace

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRE=7d

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration (optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_email_app_password
```

**Start Backend Server:**

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

---

### **Frontend Setup**

Open a **new terminal** window:

```bash
# Navigate to frontend directory (from root)
cd frontend

# Install dependencies
npm install

# Create .env file
touch .env
```

**Configure Environment Variables** (`.env`):

```env
# Backend API URL
VITE_SERVER_DOMAIN=http://localhost:5000

# Google OAuth Client ID (for frontend)
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Optional: Analytics, etc.
VITE_GA_TRACKING_ID=your_google_analytics_id
```

**Start Frontend Development Server:**

```bash
# Development mode
npm run dev
```

Frontend will run on `http://localhost:5173`

---

### **Database Setup**

**Option 1: Local MongoDB**

```bash
# Start MongoDB service
# Windows:
net start MongoDB

# macOS (with Homebrew):
brew services start mongodb-community

# Linux (systemd):
sudo systemctl start mongod
```

**Option 2: MongoDB Atlas (Cloud)**

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get connection string
4. Replace `MONGODB_URI` in backend `.env`

---

## 🚀 Usage

### **Access the Application**

1. **Start Backend:** `cd backend && npm run dev`
2. **Start Frontend:** `cd frontend && npm run dev`
3. **Open Browser:** Navigate to `http://localhost:5173`

### **Create an Account**

1. Click **Sign Up** button
2. Fill in your details (name, email, password)
3. Or use **Sign in with Google** for quick access

### **Write Your First Blog**

1. Navigate to **Write** or **Editor**
2. Add a catchy title
3. Upload a banner image
4. Select relevant tags (tech, lifestyle, food, etc.)
5. Write your content using the rich text editor
6. **Save as Draft** or **Publish** immediately

### **Explore Content**

- **Home Page:** Browse latest and trending blogs
- **Search:** Use search bar to find specific content
- **Filter by Tags:** Click tag buttons to see related posts
- **User Profiles:** Click author names to view their profiles

### **Engage with Community**

- **Like Posts:** Click heart icon on blogs
- **Comment:** Share your thoughts on blog posts
- **Reply:** Engage in threaded discussions
- **Follow Authors:** Stay updated with your favorite writers

---

## 🔌 API Documentation

### **Authentication Endpoints**

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Google OAuth
```http
GET /api/auth/google
```
Redirects to Google OAuth consent screen.

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

---

### **Blog Endpoints**

#### Get All Blogs
```http
GET /api/blogs?page=1&limit=10&tag=tech&sort=latest
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 10)
- `tag` - Filter by tag
- `sort` - Sort by: `latest`, `trending`, `oldest`

#### Get Single Blog
```http
GET /api/blogs/:id
```

#### Create Blog
```http
POST /api/blogs
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "My First Blog",
  "content": "<p>Blog content here...</p>",
  "banner": "image_url",
  "tags": ["tech", "programming"],
  "isDraft": false
}
```

#### Update Blog
```http
PUT /api/blogs/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content..."
}
```

#### Delete Blog
```http
DELETE /api/blogs/:id
Authorization: Bearer {token}
```

#### Like Blog
```http
POST /api/blogs/:id/like
Authorization: Bearer {token}
```

---

### **Comment Endpoints**

#### Get Blog Comments
```http
GET /api/blogs/:blogId/comments
```

#### Add Comment
```http
POST /api/blogs/:blogId/comments
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "Great blog post!",
  "parentId": null
}
```

#### Delete Comment
```http
DELETE /api/comments/:id
Authorization: Bearer {token}
```

---

### **User Endpoints**

#### Get User Profile
```http
GET /api/users/:id
```

#### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Doe",
  "bio": "Full-stack developer",
  "avatar": "image_url",
  "social": {
    "twitter": "@johndoe",
    "github": "johndoe"
  }
}
```

#### Get User's Blogs
```http
GET /api/users/:id/blogs
```

---

### **Statistics Endpoints**

#### Get Blog Stats
```http
GET /api/stats/stats/:year
```

#### Get Total Blog Count
```http
GET /api/stats/blogs/total-count
```

#### Get Filtered Blogs
```http
GET /api/stats/blogs/filter?year=2025&tag=tech
```

---

## 🎨 Customization

### **Change Theme Colors**

Edit `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#8B46FF',    // Purple
        secondary: '#FF6B6B',  // Red
        accent: '#4ECDC4',     // Teal
        dark: '#1A1A2E',       // Dark background
        light: '#F7F7F7',      // Light background
      }
    }
  }
}
```

### **Modify Blog Tags**

Edit `frontend/src/components/statistics.component.jsx`:

```javascript
const TAGS = [
  "informative", "social media", "food", "tech", 
  "finance", "travel", "bollywood", "health and fitness",
  "lifestyle", "fashion and beauty", "photography", 
  "music", "sports", "political", "religion"
];
```

### **Configure Rich Text Editor**

Edit `frontend/src/components/blog-editor.component.jsx`:

```javascript
const modules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ 'header': 1 }, { 'header': 2 }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'image', 'video'],
    ['clean']
  ]
};
```

---

## 🧪 Testing

### **Run Tests**

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

---

## 🏗️ Build for Production

### **Backend**

```bash
cd backend

# Set environment to production
NODE_ENV=production

# Start with PM2 (process manager)
npm install -g pm2
pm2 start server.js --name blogspace-api
```

### **Frontend**

```bash
cd frontend

# Build for production
npm run build

# Preview production build
npm run preview

# Serve with any static server
# Example with serve:
npm install -g serve
serve -s dist -p 3000
```

---

## 🚢 Deployment

### **Deploy Backend (Render/Railway/Heroku)**

1. Push code to GitHub
2. Connect repository to hosting platform
3. Set environment variables
4. Deploy!

### **Deploy Frontend (Vercel/Netlify)**

1. Push code to GitHub
2. Import repository to Vercel/Netlify
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variables
6. Deploy!

### **Database (MongoDB Atlas)**

Already cloud-hosted if using MongoDB Atlas connection string.

---

## 🤝 Contributing

Contributions are what make the open-source community amazing! Any contributions you make are **greatly appreciated**.

### **How to Contribute**

1. **Fork the Project**
2. **Create your Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your Changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the Branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### **Contribution Guidelines**

- Write clear, descriptive commit messages
- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Be respectful and constructive in discussions

---

## 🐛 Bug Reports & Feature Requests

Found a bug or have a feature idea? Please open an issue:

- **Bug Report:** [Create Issue](https://github.com/Harshilll29/BlogSpace/issues/new?template=bug_report.md)
- **Feature Request:** [Create Issue](https://github.com/Harshilll29/BlogSpace/issues/new?template=feature_request.md)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Harshil

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 👨‍💻 Author

**Harshil**

- GitHub: [@Harshilll29](https://github.com/Harshilll29)
- LinkedIn: [Harshil Joshi](https://www.linkedin.com/in/harshil-joshi-/)
- Email: harshiljoshi525@gmail.com

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI Framework
- [Node.js](https://nodejs.org/) - Backend Runtime
- [MongoDB](https://www.mongodb.com/) - Database
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Heroicons](https://heroicons.com/) - Icons
- [Unsplash](https://unsplash.com/) - Stock Photos
- [Google Fonts](https://fonts.google.com/) - Typography

---

## 📞 Support

Need help? Feel free to reach out:

- 📧 Email: harshiljoshi525@gmail.com

---

## 🌟 Show Your Support

If you found this project helpful, please give it a ⭐️!

---

<div align="center">

**Made with ❤️ by Harshil**

[⬆ Back to Top](#-blogspace)

</div>
