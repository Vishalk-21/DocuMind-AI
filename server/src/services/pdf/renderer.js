import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { createCanvas } from "@napi-rs/canvas";

export const renderPageToImage = async (
    filePath,
    pageNumber
) => {

    const data = new Uint8Array(
        fs.readFileSync(filePath)
    );

    const pdf = await pdfjsLib.getDocument({
        data
    }).promise;

    const page = await pdf.getPage(pageNumber);

    const scale = 2;

    const viewport =
        page.getViewport({ scale });

    const canvas =
        createCanvas(
            viewport.width,
            viewport.height
        );

    const context =
        canvas.getContext("2d");

    await page.render({
        canvasContext: context,
        viewport
    }).promise;

    return canvas.toBuffer("image/png");
};