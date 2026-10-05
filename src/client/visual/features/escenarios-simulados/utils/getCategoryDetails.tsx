import type { JSX } from 'react';
import { LogCategory } from '../../../../shared/types/LogCategory';

import AdvertenciaIcon from '../../../common/icons/AdvertenciaIcon';
import AlertCircleIcon from '../../../common/icons/AlertCircleIcon';
import ShieldCheckIcon from '../../../common/icons/ShieldCheckIcon';
import InfoIcon from '../../../common/icons/InfoIcon';

export function obtenerColorCategoria(category: LogCategory): string {
    switch (category) {
        case LogCategory.ATAQUE:
            return "#D4474A";
        case LogCategory.ADVERTENCIA:
            return "#F59E0B";
        case LogCategory.COMPLETADO:
            return "#52AB7B";
        case LogCategory.INFORMACION:
            return "#3B82F6";
        default:
            return "#787878";
    }
}

export function obtenerIconoCategoria(category: LogCategory): JSX.Element {
    switch (category) {
        case LogCategory.ATAQUE:
            return (<AdvertenciaIcon size={16} />);
        case LogCategory.ADVERTENCIA:
            return (<AlertCircleIcon size={16} />);
        case LogCategory.COMPLETADO:
            return (<ShieldCheckIcon size={16} />);
        case LogCategory.INFORMACION:
            return (<InfoIcon size={16} />);
        default:
            return (<InfoIcon size={16} />);
    }
}
