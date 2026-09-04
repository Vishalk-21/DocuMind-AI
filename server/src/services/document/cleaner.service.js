export const cleanText = (text) => {

    return text
        .replace(/\r/g, "")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
};

export const cleanPages = (pages) => {

    return pages.map(page => ({
        ...page,
        text: cleanText(page.text)
    }));
};