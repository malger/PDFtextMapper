// cSpell:disable

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const { remote }= require('electron');

window.remote = remote;
window.customTitlebar = require('custom-electron-titlebar');

const  dialog= remote.dialog;
window.ipcRenderer = require('electron').ipcRenderer;
window.clipboard = require('electron').clipboard;
const {clearWhitespaces,sleep} = require("./misc");
window.clearWhitespaces = clearWhitespaces;
window.sleep = sleep;
window.PDFViewSyncController = require('./PDFViewSyncController').PDFViewSyncController;
const {DataController, Assignment} = require("./DataController.js");
window.DataController  = DataController;
window.Assignment  = Assignment;



const path = require('path');
//const pify = require('pify');


window.saveAssignment = async()=>{
  const dialogopts = {
    "title":"Choose a Destination for Saving the Assingments"
  };
  const s_chooser_res = await dialog.showOpenDialog(dialogopts);

  if(s_chooser_res.canceled)
    return;

  
};



// window.assignTranslationDialog = async() => {
//   const dialogopts = {
//     type:"question",
//     buttons:["yes","no"],
//     title:"Confirm assignment"
//     message:"Would you like to assign:"
//   };
//   await dialog.showMessageBox(fchooser_opts);
// }

// window.dialog = dialog;

window.loadPDFfile = async (viewer_id)=>{
   // limit the picker to just pdfs
  const fchooser_opts = {
    properties: ['openFile'], // set to use openFileDialog
    filters: [ { name: "PDFs", extensions: ['pdf'] } ]
  };

  
  const fchooser_res = await dialog.showOpenDialog(fchooser_opts);

  if(fchooser_res.canceled)
    return;

  // Since we only allow one file, just use the first one
  const filePath = fchooser_res.filePaths[0];

  const iframe = document.getElementById(viewer_id);

  // tell PDF.js to open the file that was selected from the file picker.
  iframe.src = path.resolve( `pdfjs/web/viewer.html?file=${filePath}`);

  
};

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type]);
  }

  
});






