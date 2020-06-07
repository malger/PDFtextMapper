//cspell:disable
const pify = require("pify");
const fs = require("fs");


class DataController{
    constructor() {
        this._assignmentBlocks = new Map(); //store assignment pairs
    }


    getCount(){
        return this._assignmentBlocks.size;
    }

    contains(ass_obj){
        return this._assignmentBlocks.has(ass_obj.sourceText);
    }

    add(ass_obj){ //of type assignment
        if (this.contains(ass_obj)){
            console.warn("textBlock is already present.Skip");
            return;
        }
        this._assignmentBlocks.set(ass_obj.sourceText,ass_obj);
    }

    get(key){ //type string
        
        if (!this._assignmentBlocks.has(key)){
            throw new Error("no textblock found that matches sourceText");
        }
        return this._assignmentBlocks.get(key);
    }


    update(ass_obj){
        if (!this.contains(ass_obj)){
            throw new Error("textBlock not found.Skip");
        }
        this._assignmentBlocks.set(ass_obj.sourceText,ass_obj);
    }

    getFinished(){
        //TODO implement filter
    }

    remove(ass_obj){
        return this._assignmentBlocks.delete(ass_obj.sourceText);
    }


    //setTextBlock

    async saveAssignments(filepath){
        let jsonstring = this._mapToJson(this._assignmentBlocks);
        try {
            await pify(fs.write(filepath, Buffer.from(jsonstring, "utf-8")));
        }
        catch(e){
            console.error(e);
        }
    }

    async loadAssignments(filepath){
        try {
            let istring = await pify(fs.read(filepath,"utf-8"));
            this._assignmentBlocks = this._jsonToMap(istring);

        }
        catch(e){
            console.error(e);
        }
    }

    _mapToJson(map) {
        return JSON.stringify([...map]);
    }
    _jsonToMap(jsonStr) {
        return new Map(JSON.parse(jsonStr));
    }
}


class Assignment {

    constructor(sourceText) {
        this.sourceText = sourceText;
        this.targetText = null;
    }

    hasSourceText(){
        return !!this.sourceText;
    }
}

module.exports = {DataController,Assignment};
//TODO:save to json
//TODO:load from json
//TODO:export2Clipboard