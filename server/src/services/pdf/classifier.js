export const classifyDocument = (pages) => {

    let textPages = 0;

    for (const page of pages) {

        const text = page.text.trim();

        if (text.length > 50) {
            textPages++;
        }
    }

    const totalPages = pages.length;

    const textRatio =
        totalPages === 0 ? 0 : textPages / totalPages;

    if (textRatio >= 0.7) {
        return "text";
    }

    if (textPages === 0) {
        return "scanned";
    }

    return "mixed";
};