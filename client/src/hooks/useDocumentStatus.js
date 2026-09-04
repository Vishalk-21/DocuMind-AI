import {
    useEffect,
    useState
} from "react";

import {
    getDocumentStatus
} from "../services/api";


export const useDocumentStatus =
    (documentId) => {

        const [document, setDocument] =
            useState(null);

        useEffect(() => {

            if (!documentId) {
                return;
            }

            let interval;

            const fetchStatus =
                async () => {

                    try {

                        const result =
                            await getDocumentStatus(
                                documentId
                            );

                        setDocument(
                            result.document
                        );

                        if (
                            result.document.status ===
                                "completed" ||
                            result.document.status ===
                                "failed"
                        ) {

                            clearInterval(
                                interval
                            );
                        }

                    } catch (error) {

                        console.error(error);

                    }
                };


            fetchStatus();


            interval =
                setInterval(
                    fetchStatus,
                    1500
                );


            return () => {

                clearInterval(
                    interval
                );

            };

        }, [documentId]);


        return document;
    };