const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
  app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
  });
}).catch(err => console.error(err));

// ROUTES
// ------------------------
// Auth routes (register, login)
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Item routes (admin uploads)
const itemRoutes = require('./routes/items');
app.use('/api/items', itemRoutes);

//claim routes (user claims items)
const claimRoutes = require('./routes/claims');
app.use('/api/claims', claimRoutes);


// Test routes (protected/admin-only endpoints for development)
const testRoutes = require('./routes/test');
app.use('/api/test', testRoutes);

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);


