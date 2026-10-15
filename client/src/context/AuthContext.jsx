import { useMemo, useState } from "react";
import { AuthContext } from "./auth-context";

export const AuthProvider = ({ children }) => {
    const [user, setUserState] = useState(() => {
        const stored = localStorage.getItem("documind_user");
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (error) {
                console.error(error);
            }
        }
        return null;
    });

    const [token, setTokenState] = useState(() => {
        return localStorage.getItem("documind_token") || null;
    });

    const loading = false;

    const saveUser = (nextUser, nextToken) => {
        setUserState(nextUser);
        if (nextUser) {
            localStorage.setItem("documind_user", JSON.stringify(nextUser));
            const tokenToStore = nextToken || nextUser.token || nextUser.sessionId;
            if (tokenToStore) {
                setTokenState(tokenToStore);
                localStorage.setItem("documind_token", tokenToStore);
            }
        } else {
            setTokenState(null);
            localStorage.removeItem("documind_user");
            localStorage.removeItem("documind_token");
        }
    };

    const value = useMemo(() => ({
        user,
        token,
        loading,
        setUser: saveUser,
        isAuthenticated: !!user
    }), [loading, user, token]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
