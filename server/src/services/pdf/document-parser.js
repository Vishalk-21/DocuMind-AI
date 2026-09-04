import {
    extractPdfText
} from "./extractor.js";

import {
    classifyDocument
} from "./classifier.js";

import {
    processPageWithOCR
} from "./ocr-pipeline.js";

import {
    extname
} from "node:path";

import {
    readFile
} from "node:fs/promises";

import {
    OfficeParser
} from "officeparser";

const parseOfficeDocument = async (filePath) => {

    const extension = extname(filePath).toLowerCase().replace(".", "");

    if (extension === "txt") {
        return {
            type: "text",
            pageCount: 1,
            pages: [{
                pageNumber: 1,
                text: (await readFile(filePath, "utf8")).trim(),
                source: "text"
            }]
        };
    }

    const fileType = extension === "markdown" ? "md" : extension;
    const ast = await OfficeParser.parseOffice(filePath, { fileType });
    const text = ast.toText().trim();

    return {
        type: "office",
        pageCount: 1,
        pages: [{
            pageNumber: 1,
            text,
            source: "office"
        }]
    };
};

export const parseDocument = async (filePath) => {

    if (extname(filePath).toLowerCase() !== ".pdf") {
        return parseOfficeDocument(filePath);
    }

    const extraction =
        await extractPdfText(filePath);

    const type =
        classifyDocument(
            extraction.pages
        );

    const pages = [];

    for (const page of extraction.pages) {

        if (
            type === "scanned" ||
            (
                type === "mixed" &&
                page.text.length < 50
            )
        ) {

            const ocrPage =
                await processPageWithOCR(
                    filePath,
                    page.pageNumber
                );

            pages.push(ocrPage);

        } else {

            pages.push({
                pageNumber: page.pageNumber,
                text: page.text,
                source: "pdf"
            });

        }
    }

    return {
        type,
        pageCount: extraction.pageCount,
        pages
    };
};