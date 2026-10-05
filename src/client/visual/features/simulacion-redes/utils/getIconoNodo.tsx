import ComputadoraIcon from "../../../common/icons/ComputadoraIcon";
import NubeIcon from "../../../common/icons/NubeIcon";
import { RouterIcon } from "../../../common/icons/RouterIcon";
import ServidorIcon from "../../../common/icons/ServidorIcon";
import VPNIcon from "../../../common/icons/VPNIcon";
import { TipoDispositivo } from "../../../../shared/types/DeviceEnums";

export default function getIconoNodo(option: string) {
    switch (option) {
        case TipoDispositivo.WORKSTATION:
            return <ComputadoraIcon size={16} />;
        case TipoDispositivo.SERVER:
            return <ServidorIcon size={16} />;
        case TipoDispositivo.ROUTER:
            return <RouterIcon size={16} />;
        case TipoDispositivo.VPN:
            return <VPNIcon size={16} />;
        case "Internet":
            return <NubeIcon size={16} />;
        default:
            return null;
    }
}
