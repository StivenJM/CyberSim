import { createContext, useContext, type ReactNode } from "react";

export type OSCategory = "windows" | "linux" | "other";

export function getOSCategory(so?: string): OSCategory {
    if (!so) return "other";
    const lower = so.toLowerCase();
    if (lower.includes("windows")) return "windows";
    if (
        lower.includes("ubuntu") ||
        lower.includes("linux") ||
        lower.includes("debian") ||
        lower.includes("fedora") ||
        lower.includes("centos")
    ) {
        return "linux";
    }
    return "other";
}

const OSThemeContext = createContext<OSCategory>("windows");

export function OSThemeProvider({ os, children }: { os: OSCategory; children: ReactNode }) {
    return <OSThemeContext.Provider value={os}>{children}</OSThemeContext.Provider>;
}

export function useOSTheme(): OSCategory {
    return useContext(OSThemeContext);
}
