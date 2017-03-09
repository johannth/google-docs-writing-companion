# Google Docs Writing Companion

This is an attempt to implement some kind of a framework for Hemmingway App style suggestions as a Google Docs Add On.


## Development

This is a little bit complex while I'm experimenting and seeing if this is feasible. Eventually you will be able to install this from the Google Add Ons store.

Create an app on Google App and create an `.env` file with the following

  export GOOGLE_OAUTH_CLIENT_ID=
  export GOOGLE_OAUTH_CLIENT_SECRET=


Login to Google and get a personal oAuth token to be able to deploy to Google Drive

    yarn deploy-token

This will open a oAuth flow in a browser and eventually save authentication tokens to `.tokens.json`.

Then you can deploy to Google Drive using

    yarn deploy
