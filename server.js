const app = require('./app');
const dotenv = require('dotenv');
const connectDB = require('./database');
dotenv.config({ path: './config.env' });

connectDB();
process.on('uncaughtException', (err) => {
  console.log('uncaughtException:', err.name, err.message);
  console.log('uncaughtException 🔥 Shut down');
  process.exit(1);
});

const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`successful connections on ${port}`);
});
process.on('unhandledRejection', (err) => {
  console.log('unhandledRejection:', err.name, err.message);
  console.log('unhandledRejection 🔥 Shut down');
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('🔥SIGTERM Recevied');
  server.close(() => {
    console.log('process terminated');
  });
});
