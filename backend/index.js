const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoSanitize = require('express-mongo-sanitize');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Sanitize user-supplied data to prevent MongoDB Operator Injection.
//app.use(mongoSanitize());

// Import Routes
const authRoutes = require('./routes/auth');
const formsRoutes = require('./routes/forms');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/forms', formsRoutes);

async function startServer() {
  const { MONGO_URI } = process.env;

  if (!MONGO_URI) {
    console.error('Missing MONGO_URI in backend/.env');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });

    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);

    if (error.name) {
      console.error(`Mongo error type: ${error.name}`);
    }

    if (error.message.includes('whitelist') || error.message.includes('Atlas cluster')) {
      console.error('Atlas access check: add your current public IP in Atlas > Network Access, or temporarily allow 0.0.0.0/0 for testing.');
    }

    if (error.message.toLowerCase().includes('authentication failed')) {
      console.error('Atlas auth check: confirm the database username and password in MONGO_URI are correct and URL-encoded if they contain special characters.');
    }

    if (error.message.toLowerCase().includes('querysrv') || error.message.toLowerCase().includes('dns')) {
      console.error('DNS check: verify the cluster hostname in MONGO_URI and make sure your network can resolve MongoDB Atlas SRV records.');
    }

    process.exit(1);
  }
}

startServer();
