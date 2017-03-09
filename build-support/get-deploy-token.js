const google = require('googleapis');
const express = require('express');
const open = require('open');
const fs = require('fs');

const port = 3000;
const redirectUrl = `http://localhost:${port}/callback`;

const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const scopes = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.scripts'
];

const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

const app = express();

app.get('/callback', (req, res) => {
  const code = req.query.code;
  console.log('Requesting tokens');
  oauth2Client.getToken(code, (error, tokens) => {
    if (error) {
      console.error('Error when requesting token', error);
      return;
    }

    console.log('Received tokens. Writing them to .tokens.json');
    fs.writeFile('.tokens.json', JSON.stringify(tokens), err => {
      console.log('Successfully wrote token to .tokens.json');
      res.send('Successfully wrote token to .tokens.json');
      server.close();
      process.exit();
    });
  });
});

console.log('Starting callback server');
const server = app.listen(port, () => {
  console.log(`Callback server listening on port ${port}!`);

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // will return a refresh token
    scope: scopes
  });
  open(url);
});
