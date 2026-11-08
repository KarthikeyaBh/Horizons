const express = require('express');
const path = require('node:path');

const app = express();

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.use(express.static(path.join(__dirname, '../frontend/dist')));

if (require.main === module) {
  app.listen(3000, '127.0.0.1', (error) => {
    if (error) {
      console.error('Could not start the Horizons server:', error.message);
      process.exitCode = 1;
      return;
    }
    console.log('Horizons is running at http://127.0.0.1:3000');
  });
}

module.exports = app;
