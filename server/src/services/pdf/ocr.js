import { createWorker } from "tesseract.js";

export const performOCR = async (imageBuffer) => {

    const worker = await createWorker("eng");

    const result =
        await worker.recognize(imageBuffer);

    await worker.terminate();

    return result.data.text;
};