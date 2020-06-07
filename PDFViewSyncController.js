//cSpell:disable

//provides function to sync pdfViewers (mozilla pdf.js)
class PDFViewSyncController {

    
    constructor(leftPDFviewer,rightPDFviewer) {
        this._pdf_viewer_left = leftPDFviewer;
        this._pdf_viewer_right = rightPDFviewer;
    }

    async searchInPdfViewer(text,pdfviewer="left"){
        if (pdfviewer == "left")
            pdfviewer = this._pdf_viewer_left;
        if (pdfviewer == "right") 
            pdfviewer = this._pdf_viewer_right;

        return pdfviewer.findController.executeCommand('find', {
            caseSensitive: false, 
            findPrevious: undefined,
            highlightAll: true, 
            phraseSearch: true, 
            query: text
        });
    }


    async _getPageFromDest (pdfviewer,dest) {
        let num_gen = dest[0];
        return pdfviewer.pdfDocument.getPageIndex(num_gen);
    }

    async _gotoDest  (pdfviewer,dest){
        pdfviewer.pdfLinkService.navigateTo(dest);
    }

    async _getPDFOutline (pdfviewer) {
        return (pdfviewer.pdfDocument.getOutline());
    }

    async _getPDFDestinations  (pdfviewer)  {
        return (pdfviewer.pdfDocument.getDestinations());
    }
    
    async mapOutlines (){
        let left_outline = await this._getPDFOutline(this._pdf_viewer_left);
        let right_outline = await this._getPDFOutline(this._pdf_viewer_right);
        let ldests = await this._getPDFDestinations(this._pdf_viewer_left);
        let rdests = await this._getPDFDestinations(this._pdf_viewer_right);

        //recursively visit the nested subsections and make them a linear array
        const rec_item_concat = (array)=>{
            let output = [];
            for (const i of array){
                output.push(i);
                if(i.items)
                    output = output.concat(rec_item_concat(i.items));
            }
            return output;
        };
        //appply to left pdf and right pdf outline
        left_outline = rec_item_concat(left_outline);
        right_outline = rec_item_concat(right_outline);

        //check size equal
        if (left_outline.length !== right_outline.length){
            alert("Outlines are different in Size. No matching possible!");
            return;
        }
        
        //combine both outlines to pair-objects with title,page,...
        let combined_outlines = [...Array(left_outline.length).keys()].map(async (i) => {

            //left
            let {title,dest} = left_outline[i];
            let page = await this._getPageFromDest(this._pdf_viewer_left,ldests[dest])+1;
            let left_info = {title,dest,page};
            ({title,dest} = right_outline[i]);
            page = await this._getPageFromDest(this._pdf_viewer_right,rdests[dest])+1;
            let right_info = {title,dest,page};

            return (
                {chapter:i,left_info,right_info}
            );
        });
        combined_outlines = await Promise.all(combined_outlines);
        alert("Successfully mapped outlines. SearchResults will be mapped to right PDF");

        //generate a hashmap: ChapterStartPage (left pdf) -> Destination (right pdf)
        let chapterStart2DestinationMap = new Map();
        combined_outlines.map(obj =>chapterStart2DestinationMap.set(obj.left_info.page,obj.right_info.dest));
        this._lStart2RightDestMap = chapterStart2DestinationMap;

    }

    //sync pages between PDFviewers
    async syncPage_left2right () {
        this._pdf_viewer_right.page = this._pdf_viewer_left.page;
    }
    //sync pages between PDFviewers
    async syncPage_right2left () {
        this._pdf_viewer_left.page = this._pdf_viewer_right.page;
    }


    async syncChapter2SearchResults(adj_pdfviewer = "right"){
        let pdfviewer = this._pdf_viewer_left;
        if (adj_pdfviewer == "left")
            pdfviewer = this._pdf_viewer_right;

        let page_w_sel = pdfviewer.findController._selected.pageIdx;
        if(!page_w_sel)
            return;
        page_w_sel++;
        return this.syncChapterViewFromLeft(page_w_sel);
        //TODO:implement left adjust;

    }

    async syncChapterViewFromLeft(p){
        if (!this._lStart2RightDestMap)
            throw new Error("mapOutlines function needs to be called first");

        const chapter_pages = Array.from(this._lStart2RightDestMap.keys());
        const offsets = chapter_pages.map(i=>i-p);
        const surr_chapter_p = offsets.map(i=>i<=0).lastIndexOf(true);
        const dest_hash = this._lStart2RightDestMap.get(chapter_pages[surr_chapter_p]);
        
        let rdest = await this._pdf_viewer_right.pdfDocument.getDestination(dest_hash);
        await this._gotoDest(this._pdf_viewer_right,rdest);

    }


}

module.exports = {PDFViewSyncController};