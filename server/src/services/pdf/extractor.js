import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

export const extractPdfText = async (filePath) => {

    const data = new Uint8Array(
        fs.readFileSync(filePath)
    );

    const pdf = await pdfjsLib.getDocument({
        data
    }).promise;

    const pages = [];

    for (let pageNumber = 1;
         pageNumber <= pdf.numPages;
         pageNumber++) {

        const page = await pdf.getPage(pageNumber);

        const content = await page.getTextContent();

        const text = content.items
            .map(item => item.str)
            .join(" ");

        pages.push({
            pageNumber,
            text: text.trim()
        });
    }

    return {
        pageCount: pdf.numPages,
        pages
    };
};