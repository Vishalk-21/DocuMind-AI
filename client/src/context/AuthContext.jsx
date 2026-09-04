import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
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
    const loading = false;

    const saveUser = (nextUser) => {
        setUser(nextUser);
        if (nextUser) {
            localStorage.setItem("documind_user", JSON.stringify(nextUser));
        } else {
            localStorage.removeItem("documind_user");
        }
    };

    const value = useMemo(() => ({
        user,
        loading,
        setUser: saveUser,
        isAuthenticated: !!user
    }), [user]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};
