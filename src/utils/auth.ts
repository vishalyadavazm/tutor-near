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
    if (typeof window !== "undefined") window.dispatchEvent(new Event("auth-state-change"));
};

export const getRole = (): string | null => {
    return localStorage.getItem("userRole");
};

export const subscribeToRoleChanges = (onChange: () => void) => {
    if (typeof window === "undefined") return () => {};
    window.addEventListener("storage", onChange);
    window.addEventListener("auth-state-change", onChange);
    return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener("auth-state-change", onChange);
    };
};

export const getIsTeacherSnapshot = () =>
    typeof window !== "undefined" && getRole() === "teacher";

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
