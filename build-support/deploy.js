const google = require('googleapis');
const fs = require('fs');
const fetch = require('node-fetch');

const projectIdFileName = '.project-id';

const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(clientId, clientSecret);

const tokens = JSON.parse(fs.readFileSync('.tokens.json'));
oauth2Client.setCredentials(tokens);

const drive = google.drive({ version: 'v2', auth: oauth2Client });

const projectId_exportLink = fs.existsSync(projectIdFileName) &&
  fs.readFileSync(projectIdFileName, { encoding: 'utf8' }).split('\n') || [];

const projectId = projectId_exportLink[0];
const exportLink = projectId_exportLink[1];

const projectName = 'Writing Companion';

const createNewProjectData = oldProjectData => {
  const oldProjectDataFiles = oldProjectData &&
    oldProjectData.files.reduce(
      (acc, file) => {
        acc[file.name] = file.id;
        return acc;
      },
      {}
    ) || {};

  const newProjectDataFiles = [
    {
      name: 'Code',
      type: 'server_js',
      source: fs.readFileSync('dist/code.gs', { encoding: 'utf8' })
    },
    {
      name: 'Sidebar',
      type: 'html',
      source: fs.readFileSync('dist/sidebar.html', { encoding: 'utf8' })
    }
  ];

  return {
    files: newProjectDataFiles.map(file => {
      const fileId = oldProjectDataFiles[file.name];
      if (!fileId) {
        return file;
      } else {
        file['id'] = fileId;
        return file;
      }
    })
  };
};

const resource = {
  title: projectName,
  mimeType: 'application/vnd.google-apps.script+json'
};

const createMediaPayload = projectData => {
  return {
    mimeType: 'application/vnd.google-apps.script+json',
    body: JSON.stringify(projectData)
  };
};

if (projectId && exportLink) {
  console.log(`Updating project: ${projectId}`);
  oauth2Client.getRequestMetadata(exportLink, (error, headers) => {
    fetch(exportLink, {
      headers: headers
    })
      .then(response => response.json())
      .then(oldProjectData => {
        drive.files.update(
          {
            fileId: projectId,
            resource: resource,
            media: createMediaPayload(createNewProjectData(oldProjectData))
          },
          error => {
            if (error) {
              console.log(error);
              return;
            }
            console.log(`Updated project: ${projectId}`);
          }
        );
      });
  });
} else {
  console.log('Creating project in Drive');
  drive.files.insert(
    {
      resource: resource,
      media: createMediaPayload(createNewProjectData(null))
    },
    (error, result) => {
      if (error) {
        console.log(error);
        return;
      }
      const projectId = result.id;
      const exportLink = result.exportLinks[
        'application/vnd.google-apps.script+json'
      ];
      console.log(
        `Created project: ${projectId} and wrote to ${projectIdFileName}`
      );
      fs.writeFileSync(projectIdFileName, `${projectId}\n${exportLink}`);
    }
  );
}
