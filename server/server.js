const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
// ROUTES
const authRoute = require('./api/routes/auth.route');
const bookingsRoute = require('./api/routes/bookings.route');
const devicesRoute = require('./api/routes/devices.route');

// Load "MONGODB_URI" and "PORT"
dotenv.config();

// Server port
const PORT = process.env.PORT || 5000;

// App initialization
const app = express();

// Docs auto-generation
const expressSwagger = require('express-swagger-generator')(app);
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'D-Shop UI5 Demo API',
      description: 'Representational State Transfer (REST) API for D-Shop Demo using UI5 Web Components',
      version: '1.0.0',
      tags: [{ name: 'Authentication' }, { name: 'Bookings' }, { name: 'Devices' }],
    },
    host: 'localhost:5000',
    basePath: '/api/v1',
    produces: ['application/json'],
  },
  basedir: __dirname,
  files: ['./api/routes/*.js'],
  route: {
    url: '/api/docs',
    docs: '/api/docs.json',
  },
};
expressSwagger(swaggerOptions);

// Parse application/json
app.use(express.json());
// Cross-Origin Resource Sharing, Express middleware
app.use(cors());
// Routes middleware
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/bookings', bookingsRoute);
app.use('/api/v1/devices', devicesRoute);

async function start() {
  try {
    // Connect to the MongoDB cluster
    await mongoose.connect(
      process.env.MONGODB_URI,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
      },
      () => console.log('Successfully established connection to the MongoDB cluster')
    );
    // Run server
    app.listen(PORT, () => console.log(`Server is successfully running on port ${PORT}`));
  } catch (error) {
    console.log(`Server error: ${error.message}`);
    process.exit(1);
  }
}

start();
