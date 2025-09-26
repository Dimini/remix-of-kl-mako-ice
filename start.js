// Simple script to start both the Express server and Vite dev server
import { spawn } from 'child_process';

console.log('🚀 Starting Climate & Slovakia application...');

// Start the Express server
const server = spawn('node', ['server.js'], {
  stdio: 'pipe'
});

server.stdout.on('data', (data) => {
  console.log(`[Server] ${data}`);
});

server.stderr.on('data', (data) => {
  console.error(`[Server Error] ${data}`);
});

// Start Vite dev server after a short delay
setTimeout(() => {
  const vite = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit'
  });

  vite.on('close', (code) => {
    console.log(`Vite process exited with code ${code}`);
    server.kill();
  });
}, 2000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️  Shutting down...');
  server.kill();
  process.exit();
});