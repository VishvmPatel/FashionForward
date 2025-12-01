/**
 * Fashion Forward E-commerce Backend Server
 * 
 * This is the main server file for the Fashion Forward e-commerce application.
 * It sets up Express.js server with MongoDB connection, Socket.IO for real-time features,
 * and all necessary middleware and routes.
 * 
 * Features:
 * - Express.js REST API server
 * - MongoDB Atlas database connection with retry logic
 * - Socket.IO for real-time admin notifications
 * - CORS configuration for frontend communication
 * - File upload handling for product images
 * - Comprehensive error handling and logging
 * 
 * @author Fashion Forward Development Team
 * @version 1.0.0
 */

// Core dependencies for Express server setup
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const socketService = require('./services/socketService');

// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();
const server = http.createServer(app);

// Configure Socket.IO for real-time communication
// This enables live updates for admin dashboard and chat functionality
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Configure CORS to allow frontend requests
// This enables cross-origin requests from the React frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Parse JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (product images) statically
// This allows the frontend to access uploaded images via URL
app.use('/uploads', express.static('uploads'));

/**
 * Database Connection Function
 * 
 * Establishes connection to MongoDB Atlas with retry logic.
 * Handles connection failures gracefully and provides helpful error messages.
 * 
 * @returns {Promise<boolean>} - True if connection successful
 */
const connectDB = async () => {
  try {
    console.log('🔄 Attempting to connect to MongoDB Atlas...');
    console.log('📍 Connection string:', process.env.MONGODB_URI ? 'Found' : 'Not found');
    
    // Attempt initial connection
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('🔍 Error details:', error);
    console.log('🔄 Retrying connection...');
    
    // Wait 2 seconds before retry
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
      // Attempt retry connection
      const conn = await mongoose.connect(process.env.MONGODB_URI);
      console.log(`✅ MongoDB Connected on retry: ${conn.connection.host}`);
      return true;
    } catch (retryError) {
      console.error('❌ MongoDB Connection Failed on retry:', retryError.message);
      console.log('💡 Possible solutions:');
      console.log('   1. Check MongoDB Atlas IP whitelist');
      console.log('   2. Verify cluster URL is correct');
      console.log('   3. Check internet connection');
      console.log('   4. Try different network (mobile hotspot)');
      process.exit(1);
    }
  }
};

/**
 * Socket.IO Connection Handlers
 * 
 * Manages real-time connections for admin dashboard updates
 * and chat functionality.
 */
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  // Handle admin joining admin room for real-time updates
  socket.on('join-admin', () => {
    socket.join('admin-room');
    console.log('👑 Admin joined admin room');
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Make Socket.IO instance available to routes
app.set('io', io);

// Initialize socket service for real-time features
socketService.setIO(io);

// Connect to database and start server
connectDB().then(() => {
  console.log('📊 MongoDB storage enabled');
}).catch((error) => {
  console.error('❌ Failed to connect to MongoDB:', error);
  process.exit(1);
});

/**
 * API Routes Configuration
 * 
 * All API endpoints are organized by feature:
 * - /api/auth: Authentication (login, signup, password reset)
 * - /api/products: Product management (CRUD operations)
 * - /api/chatbot: AI chatbot functionality
 * - /api/reviews: Product reviews and ratings
 * - /api/admin: Admin panel operations
 * - /api/addresses: User address management
 * - /api/orders: Order processing and management
 * - /api/users: User profile management
 * - /api/payments: Payment processing (PayU integration)
 */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/addresses', require('./routes/addresses'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/payments', require('./routes/payu')); 

/**
 * Root Route
 * 
 * Provides API information and available endpoints.
 */
app.get('/', (req, res) => {
  res.json({
    message: 'Fashion Forward E-commerce API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      users: '/api/users',
      admin: '/api/admin',
      reviews: '/api/reviews',
      chatbot: '/api/chatbot',
      addresses: '/api/addresses',
      payments: '/api/payments'
    },
    documentation: 'All API endpoints are prefixed with /api',
    timestamp: new Date().toISOString()
  });
});

/**
 * Test Routes
 * 
 * These routes are used for testing and debugging purposes.
 */
// Test route for payment system verification
app.get('/api/test-payment', (req, res) => {
  res.json({ message: 'Direct payment test route works!' });
});

// Health check endpoint for monitoring
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Fashion Forward API is running!',
    timestamp: new Date().toISOString()
  });
});

/**
 * Error Handling Middleware
 * 
 * These middleware functions handle errors and 404 responses.
 * They must be placed after all route definitions.
 */

// Catch-all route for 404 errors (must be after all other routes)
app.use('*', (req, res) => {
  console.log('Route not found:', req.method, req.originalUrl);
  res.status(404).json({ message: 'Route not found' });
});

// Global error handling middleware (must be last)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

/**
 * Server Startup
 * 
 * Starts the HTTP server on the specified port.
 * Displays startup information including port, frontend URL, and environment.
 */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🔌 Socket.IO enabled for real-time updates`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});