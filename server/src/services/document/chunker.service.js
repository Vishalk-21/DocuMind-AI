export const createChunks = (
    pages,
    documentId
) => {

    const chunks = [];

    const chunkSize = 800;
    const overlap = 100;

    for (const page of pages) {

        const pageText = page.text?.trim();

        if (!pageText) {
            continue;
        }

        const words =
            pageText.split(/\s+/);

        let start = 0;

        while (start < words.length) {

            const end =
                Math.min(
                    start + chunkSize,
                    words.length
                );

            const chunkText =
                words
                    .slice(start, end)
                    .join(" ");

            chunks.push({

                chunkId:
                    `${documentId}-${page.pageNumber}-${start}`,

                documentId,

                pageNumber:
                    page.pageNumber,

                text: chunkText,

                source:
                    page.source
            });

            start =
                end - overlap;

            if (start < 0) {
                start = 0;
            }

            if (end === words.length) {
                break;
            }
        }
    }

    return chunks;
};