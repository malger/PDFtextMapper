
//
mainWindow = null;
const template = [
   {
      label: 'Changelist',
      submenu:[{
         label: 'Mark Source Text',
         accelerator: 'Alt+1',
         click:() => {mainWindow.webContents.send("markSourceText");}
      },
      {
            label: 'Mark Target Text',
            accelerator: 'Alt+2',
            click:() => {mainWindow.webContents.send("markTargetText");}
      }
      ]
      
   },
    {
        label: 'PDFs',
        submenu: [
           {
              label: 'Sync Page',
              accelerator: 'Alt+S',
              click:() => {mainWindow.webContents.send("syncPage");}
           }
        ]
     },
    {
       label: 'Help',
       submenu: [
          {
             label: 'Ask Malte :-)'
          }
       ]
    }
 ];


module.exports = function(mainWindow){
     this.mainWindow = mainWindow;
     return template;
};