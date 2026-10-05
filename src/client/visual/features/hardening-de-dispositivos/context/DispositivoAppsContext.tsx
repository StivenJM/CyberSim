import { createContext, useContext, type ReactNode } from "react";
import type { useAppsDispositivo } from "../hooks/useAppsDispositivo";

export type DispositivoAppsValue = ReturnType<typeof useAppsDispositivo>;

const DispositivoAppsContext = createContext<DispositivoAppsValue | null>(null);

export function DispositivoAppsProvider({
    value,
    children,
}: {
    value: DispositivoAppsValue;
    children: ReactNode;
}) {
    return (
        <DispositivoAppsContext.Provider value={value}>
            {children}
        </DispositivoAppsContext.Provider>
    );
}

export function useDispositivoApps(): DispositivoAppsValue {
    const ctx = useContext(DispositivoAppsContext);
    if (!ctx) {
        throw new Error("useDispositivoApps debe usarse dentro de DispositivoAppsProvider");
    }
    return ctx;
}
