import { useFasesContext } from '../contexts/FasesContext';

export const useFases = () => {
    const { fases, faseActualIndex, actualizarFases } = useFasesContext();

    const faseActual = fases[faseActualIndex];

    const puedaAvanzar = faseActual?.completada ?? false;

    return {
        fases,
        faseActual,
        faseActualIndex,
        actualizarFases,
        puedaAvanzar,
    };
};
