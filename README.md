# Full-Stack Template

A clean and modern full-stack application template with **React + TypeScript** frontend and **Node.js + Express + MongoDB** backend.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd full-stack-template
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment setup**
   ```bash
   # Create backend .env file
   cd backend
   cp .env.example .env
   # Edit .env with your MongoDB URI and other settings
   ```

4. **Start development servers**
   ```bash
   # Terminal 1: Start backend (from backend directory)
   npm run dev
   
   # Terminal 2: Start frontend (from frontend directory)
   npm run dev
   ```

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Redux Toolkit** for state management
- **React Router** for navigation
- **shadcn/ui** component library

### Backend
- **Node.js** with Express and TypeScript
- **MongoDB** with Mongoose ODM
- **CORS** and **Helmet** for security
- **ESM** module system

## 📁 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── types/           # TypeScript types
│   │   ├── validators/      # Input validation
│   │   ├── index.ts         # Main server file
│   │   └── utils.ts         # Utility functions
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── components/      # Reusable components
    │   ├── pages/          # Page components
    │   ├── store/          # Redux store setup
    │   ├── types/          # TypeScript types
    │   ├── ui/             # UI components
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    └── vite.config.ts
```

## 🔧 Available Scripts

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks

## 📝 Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/your-app-name

# Server
PORT=3000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

## 🚀 Deployment

### Backend
1. Build the application: `npm run build`
2. Set production environment variables
3. Deploy to your preferred platform (Heroku, Railway, DigitalOcean, etc.)

### Frontend
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your preferred platform (Vercel, Netlify, etc.)
3. Update API URLs for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ✨ Features

- ✅ Full TypeScript support
- ✅ Modern React with hooks
- ✅ MongoDB integration with Mongoose
- ✅ API validation and error handling
- ✅ Responsive design with Tailwind CSS
- ✅ Redux Toolkit for state management
- ✅ Component library with shadcn/ui
- ✅ ESLint and Prettier configuration
- ✅ Hot reload in development
- ✅ Production-ready build setup

## 🎯 Next Steps

1. Customize the UI components and styling
2. Add authentication and authorization
3. Implement your specific business logic
4. Add more comprehensive testing
5. Set up CI/CD pipeline
6. Add monitoring and logging

Happy coding! 🎉
