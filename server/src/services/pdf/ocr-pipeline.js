import { renderPageToImage }
    from "./renderer.js";

import { performOCR }
    from "./ocr.js";

export const processPageWithOCR = async (
    filePath,
    pageNumber
) => {

    const image =
        await renderPageToImage(
            filePath,
            pageNumber
        );

    const text =
        await performOCR(image);

    return {
        pageNumber,
        text: text.trim(),
        source: "ocr"
    };
};