"use strict";

// cSpell:disable

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.


//refs to the pdfviewer applications in the iframes, default false;
let left_pdfViewer_ready = false;
let right_pdfViewer_ready = false;
let cur_assignment = null;
let syncChapters_enabled =true;
let cur_assigned_id=0;


function getNextId(){
    cur_assigned_id++;
    return cur_assigned_id;
}



//PDFViewSyncController
let pdfViewSyncCon = null;// will be init. after both pdfs are loaded
const page_renderedEvent =  new Event("page_rendered");

// eslint-disable-next-line no-undef
let data = new DataController();

//gets currently selected text in element
function getSelectionText (ele) {
    var text = "";
    if (ele.getSelection) {
        text = ele.getSelection().toString();
    }
    return text;
}


//shortcut document.getElementById
function byId (id) {
    return document.getElementById(id);
}

//shortcut document.getElementById
function byClass (classname) {
    return document.getElementsByClassName(classname);
}

//helper function to get the refs to the pdfviewer applications
function getPdfViewer (outer_iframe) {
    return  byId(outer_iframe).contentWindow.PDFViewerApplication;
}




function preventDeselection(ele,window){
    ele = ele || window.event;
    ele.preventDefault();
}

function handleMarkSourceText(){
    
    let clipboard_win = byId("html_clipboard").contentWindow;

    if (cur_assignment){
            data.remove(cur_assignment);
            cur_assignment = null;
            //remove mark bg
            clipboard_win.removeMark();
    } else {

        try {
            let selText = clipboard_win.getTextFromSel();
            // eslint-disable-next-line no-undef
            selText = clearWhitespaces(selText);
            if(selText.length === 0){
                alert("Selected Text only contains whitespaces.Aborting...");
                return;
            }
            // eslint-disable-next-line no-undef
            const ass = new Assignment(selText,null); 
            //update reference
            cur_assignment = ass;
            //add to data managment
            data.add(ass);    
            //mark text bg red
            clipboard_win.addMark();
        } catch(e){
            alert(e.message);
        }
      
    
    }
     
}

function handleMarkTargetText(id=null){

    //remove
    if(id){
        const span = byId("html_clipboard").contentDocument.getElementById(id);
        const text = span.childNodes[0].nodeValue;
        const ass = data.get(text);
        data.remove(ass);
        byId("html_clipboard").contentWindow.removeAssignedMark(id);
        return;
    }

    if(!id)
        id = "assigned_"+getNextId();

    let r_pdf_doc = byId("pdf_view_fl").contentDocument;
    let selText = getSelectionText(r_pdf_doc);

    if(selText.length===0){
        alert("No text in right PDF selected. Aborting...");
        return;
    }

    if(!cur_assignment){
        alert("No source text marked. Aborting...");
        return;
    }
    cur_assignment.targetText = selText;
    cur_assignment = null;
    byId("html_clipboard").contentWindow.markAssigned(id);

}
    

//communicate with the MenuBar/hotkey
// eslint-disable-next-line no-undef
ipcRenderer.on('syncPage', () => {
if (pdfViewSyncCon)
    pdfViewSyncCon.syncPage_left2right();
});

// eslint-disable-next-line no-undef
ipcRenderer.on('markSourceText', handleMarkSourceText);

// eslint-disable-next-line no-undef
ipcRenderer.on('markTargetText',()=> handleMarkTargetText());





//paste html clipboard into left iframe
async function renderHTMLClipboard(){
    // eslint-disable-next-line no-undef
    let text = clipboard.readHTML();
    if(!text)
        return;

    // fill the iframe with the clipboard contents
    const iframe =document.getElementById("html_clipboard");
    iframe.srcdoc = text;
    return;

}

//wait until pdf.js search has found -> syncChapters
function setupPDFViewerFoundSearchResListener(iframe_sel){
    byId(iframe_sel).contentDocument
    .addEventListener("updatefindmatchescount",async()=>{

        if(!syncChapters_enabled)
            return;
        
        // eslint-disable-next-line no-undef
        await sleep(500); //hack wait for page switch
        await pdfViewSyncCon.syncChapter2SearchResults();
    });
}

//wait unitl pdf.js finished rendering page
function setupPDFviewerRenderFinishListener (iframe_sel,left_or_right_rdy){
    byId(iframe_sel).contentDocument.addEventListener("pagerendered",()=>{
        if( left_or_right_rdy === "left")
            left_pdfViewer_ready = true; 
        if( left_or_right_rdy === "right")
            right_pdfViewer_ready = true; 
        document.dispatchEvent(page_renderedEvent); //pass the render event to outter document
    });
}

async function searchSelectionHandler(){
    
    let window = byId("html_clipboard").contentWindow;

    //do not search if currently in assignment mode
    if(cur_assignment){
        return;
    }

    let selText = getSelectionText(window.document);

    //clear starting spaces and trailing spaces /newlines
    // eslint-disable-next-line no-undef
    selText = clearWhitespaces(selText);

    //check if pdfSynController exists
    if(!pdfViewSyncCon)
        return;

    //execute search with selection in left viewer
    pdfViewSyncCon.searchInPdfViewer(selText);

    
}
// eslint-disable-next-line no-unused-vars
async function viewAssignedInPDFViewers(sourceText){
    // eslint-disable-next-line no-undef
    sourceText = clearWhitespaces(sourceText);
    const ass = data.get(sourceText);
    
    if (!pdfViewSyncCon){
        return;
    }

    syncChapters_enabled = false;

    //TODO:suche durch page speicheren ersetzten
    pdfViewSyncCon.searchInPdfViewer(ass.sourceText);
    // eslint-disable-next-line no-undef
    pdfViewSyncCon.searchInPdfViewer(ass.targetText,"right");
    await sleep(500);

    syncChapters_enabled = true;

}

//setup button functions

//function for right pdf button
byId("load_de_pdf_b").addEventListener('click',async ()=>{
    // eslint-disable-next-line no-undef
    await loadPDFfile("pdf_view_de");
    pdfViewSyncCon=null;

});
//function for right pdf button
byId("load_fl_pdf_b").addEventListener('click',async ()=> {
    // eslint-disable-next-line no-undef
    await loadPDFfile("pdf_view_fl");
    pdfViewSyncCon=null;

});
//function for clipboard button
byId("load_clist_b").addEventListener('click', async () => await renderHTMLClipboard());

//wait for iframes to load, setup scripts

//clipboard html
byId("html_clipboard").addEventListener("load",function(){
    
    let window = byId("html_clipboard").contentWindow;
    window.addEventListener("mouseup",searchSelectionHandler);
    
    //append marking logic
    let markingLogic = document.createElement("script");
    markingLogic.src = "./markingLogic.js";
    byId("html_clipboard").contentDocument.body.appendChild(markingLogic);
    
    //append css for tooltips
    let cssLink = document.createElement("link");
    cssLink.href = "./left_iframe.css"; 
    cssLink .rel = "stylesheet"; 
    cssLink .type = "text/css"; 
    byId("html_clipboard").contentDocument.body.appendChild(cssLink);

});
//left pdfviewer
byId("pdf_view_de").addEventListener("load",()=> {
    setupPDFviewerRenderFinishListener("pdf_view_de","left");
    setupPDFViewerFoundSearchResListener("pdf_view_de",left_pdfViewer_ready);
    //prevent deselection
    let win = byId("pdf_view_de").contentWindow;
    let ele = byId("pdf_view_de").contentDocument;
    ele.addEventListener('onmousedown',preventDeselection,ele,win);
});
//right pdfviewer
byId("pdf_view_fl").addEventListener("load",()=> setupPDFviewerRenderFinishListener("pdf_view_fl","right"));


//if both viewers have finished rendering setup the syncController
document.addEventListener("page_rendered",async ()=>{
         if(left_pdfViewer_ready && right_pdfViewer_ready && pdfViewSyncCon === null){
            let left_pdfViewer = getPdfViewer("pdf_view_de");
            let right_pdfViewer = getPdfViewer("pdf_view_fl");

            // eslint-disable-next-line no-undef
            pdfViewSyncCon = new PDFViewSyncController(left_pdfViewer,right_pdfViewer);
            await pdfViewSyncCon.mapOutlines();

         }
});

//document.addEventListener("readystatechange ",document.getElementsByClassName("window-close")[0].addEventListener("close",()=>remote.BrowserWindow.getFocusedWindow().close()));
