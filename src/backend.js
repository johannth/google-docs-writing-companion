/* global Logger:false DocumentApp:false HtmlService:false */
/* exported onInstall */

// eslint-next
const onOpen = e => {
  Logger.log('onOpen');
  DocumentApp.getUi()
    .createAddonMenu()
    .addItem('Start', 'showSidebar')
    .addToUi();
};

const onInstall = e => {
  Logger.log('onInstall');
  onOpen(e);
};

const showSidebar = () => {
  const ui = HtmlService.createHtmlOutputFromFile('Sidebar')
    .setTitle('Translate');
  DocumentApp.getUi().showSidebar(ui);
};
