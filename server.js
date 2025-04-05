const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/config');

require('dotenv').config(); 

const port = process.env.PORT || 5001;

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI 

mongoose.connect(mongoUri)
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err.message);
    process.exit(1); 
  });

// Utiliser les routes du quiz

// Server
const server = app.listen(port, '0.0.0.0', () =>
  console.log(`Server is listening at`)
);

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
