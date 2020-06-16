# PDFtextMapper Alpha 0.1

A little electron based program that allows to interactively map and save
corresponding text segments of two PDFs (for example manuals in different languages). 

#### Usage

1. Left panel contains the text fragments that need to me mapped between PDFs (imported from clipboard) 
2. Selected text is automatically searched in Source PDF and marked
3. The Target pdf will automatically scroll to the corresponding (sub)chapter (achieved by automatic mapping of the outlines)
4. Target text is selected and assigned to the source text
5. The left panel contains the mapping, a click will show the corresponding pages with the texts selected in both PDFs
6. export to html table, json for persistance .... (TODO)

#### Used Technology

* mozilla's pdf.js
* electron

