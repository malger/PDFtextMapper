//generate Assignment From Selected text

function getTextFromSel(){
    let selText = document.getSelection().toString();
    if(selText.length>0)
        return selText;
    else
        throw new Error("No Text selected for Assignment");
}

function addMark(){

    let sel = document.getSelection();
    let selection_text =sel.toString();
    
   
    let span = document.createElement('SPAN');
    let div = document.createElement("div");
    div.classList.add("tooltiptext");
    div.textContent="Not assigned yet!";

    span.style="background-color: rgb(255, 99, 71);";
    span.classList.add("tooltip");
    span.classList.add("marked");


    span.textContent = selection_text;
    span.appendChild(div);
    span.oncontextmenu = function(){
        // eslint-disable-next-line no-undef
        window.parent.handleMarkSourceText();
        return false;//cancel default context menu
    };
    
    var range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(span);

    
}

function removeMark(){
    
    let span = document.getElementsByClassName("marked")[0];
    let div = span.childNodes[1];
    div.remove();
    let text = span.textContent;
    let par = span.parentElement;
    let p = document.createElement('p');
    p.textContent = text;
    par.replaceChild(p,span);
}

function removeAssignedMark(id){
    
    let span = document.getElementById(id);
    let div = span.childNodes[1];
    div.remove();
    let text = span.textContent;
    let par = span.parentElement;
    let p = document.createElement('p');
    p.textContent = text;
    par.replaceChild(p,span);
}



function markAssigned(id){
    let span = document.getElementsByClassName("marked")[0];
    span.style="background-color: #3399ff;";//
    span.classList.add("assigned");
    span.classList.remove("marked");
    span.childNodes[1].textContent = "Assigned";
    span.id = id;
    span.oncontextmenu = function(){
        // eslint-disable-next-line no-undef
        window.parent.handleMarkTargetText(id);
        return false;//cancel default context menu
    };
    span.onclick=async ()=>await window.parent.viewAssignedInPDFViewers(span.childNodes[0].nodeValue);
}