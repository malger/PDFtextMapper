function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function clearWhitespaces(selText){
    let rep = selText.replace(/^[\s|\n]+/,"");
    rep = rep.replace(/[\s|\n]+$/,"");
    return rep;
}

module.exports={sleep,clearWhitespaces};