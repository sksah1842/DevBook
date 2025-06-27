# DEVBOOK Deployment Guide

## 🚀 Deployment Options

### Option 1: Vercel Deployment

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

3. **Set Environment Variables in Vercel Dashboard:**
   - `MONGO_URI` - Your MongoDB Atlas connection string
   - `JWT_SECRET` - Strong secret key for JWT tokens
   - `GITHUB_TOKEN` - GitHub API token (optional)
   - `NODE_ENV` - Set to "production"

### Option 2: Render Deployment

1. **Connect your GitHub repository to Render**

2. **Create a new Web Service with these settings:**
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment:** Node

3. **Set Environment Variables in Render Dashboard:**
   - `NODE_ENV` = `production`
   - `MONGO_URI` = Your MongoDB Atlas connection string
   - `JWT_SECRET` = Strong secret key for JWT tokens
   - `GITHUB_TOKEN` = GitHub API token (optional)

4. **Deploy using render.yaml:**
   ```bash
   render deploy
   ```

## 📝 Environment Variables Setup

### For MongoDB Atlas:
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Replace `<password>` with your database password
5. Add to environment variables as `MONGO_URI`

### For JWT Secret:
Generate a strong secret key:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### For GitHub Token (Optional):
1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Generate a new token with `read:user` and `read:email` scopes
3. Add to environment variables as `GITHUB_TOKEN`

## 🔧 Local Development

1. **Install dependencies:**
   ```bash
   npm install
   cd client && npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
DEVBOOK/
├── client/                 # React frontend
├── config/                 # Database configuration
├── middleware/             # Express middleware
├── models/                 # MongoDB models
├── routes/                 # API routes
├── server.js              # Express server
├── vercel.json            # Vercel configuration
├── render.yaml            # Render configuration
└── package.json           # Backend dependencies
```

## 🚨 Important Notes

- **MongoDB Atlas:** Make sure your cluster is accessible from your deployment platform
- **CORS:** The app is configured to handle CORS for production
- **Static Files:** React build files are served automatically in production
- **Health Check:** Render uses `/api/users` as health check endpoint

## 🔍 Troubleshooting

### Common Issues:
1. **Database Connection Failed:** Check your `MONGO_URI` and network access
2. **Build Failed:** Ensure all dependencies are installed
3. **CORS Errors:** Check if your frontend URL is correctly set
4. **JWT Errors:** Verify your `JWT_SECRET` is set correctly

### Logs:
- **Vercel:** Check deployment logs in Vercel dashboard
- **Render:** Check build and runtime logs in Render dashboard 