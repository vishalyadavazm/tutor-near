export const saveToken = (token: string) => {
    localStorage.setItem("authToken", token);
    if (typeof window !== "undefined") window.dispatchEvent(new Event("auth-state-change"));
};

export const getToken = () => {
    return localStorage.getItem("authToken");
};
//test
export const removeToken = () => {
    localStorage.removeItem("authToken");
    if (typeof window !== "undefined") window.dispatchEvent(new Event("auth-state-change"));
};

export const saveRole = (role: string) => {
    localStorage.setItem("userRole", role.toLowerCase());
};

export const getRole = (): string | null => {
    return localStorage.getItem("userRole");
};

export const removeRole = () => {
    localStorage.removeItem("userRole");
};

export const redirectByRole = (router: { push: (path: string) => void }) => {
    const role = getRole();
    if (role === "teacher") {
        router.push("/dashboard");
    } else {
        router.push("/student");
    }
};
