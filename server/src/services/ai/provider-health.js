const providers = {};


export const markProviderFailure =
    (provider, cooldownMs = 60000) => {

        providers[provider] = {

            available: false,

            retryAfter:
                Date.now() + cooldownMs

        };

    };


export const markProviderHealthy =
    (provider) => {

        providers[provider] = {

            available: true,

            retryAfter: 0

        };

    };


export const isProviderAvailable =
    (provider) => {

        const state =
            providers[provider];


        if (!state) {
            return true;
        }


        if (
            !state.available &&
            Date.now() >= state.retryAfter
        ) {

            delete providers[provider];

            return true;
        }


        return state.available;
    };