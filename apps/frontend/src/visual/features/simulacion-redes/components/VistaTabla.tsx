import GreenCheckBox from '../../../common/components/GreenCheckBox';
import styles from '../styles/VistaTabla.module.css';

// Datos de ejemplo
const dispositivosEjemplo = [
    {
        nombre: 'PC de Adam',
        redes: 'Lan Este',
        activos: false,
        usuario: 'Adam',
        seguridad: 'ACL'
    },
    {
        nombre: 'PC de Harry',
        redes: 'Lan 1',
        activos: false,
        usuario: 'Harry',
        seguridad: 'ACL'
    },
    {
        nombre: 'PC de Lisa',
        redes: 'Lan Externa',
        activos: false,
        usuario: 'Lisa',
        seguridad: 'ACL'
    },
    {
        nombre: 'Router 1',
        redes: 'Internet, Lan 1',
        activos: false,
        usuario: '-',
        seguridad: '-'
    },
    {
        nombre: 'Router 2',
        redes: 'Internet, Lan Externa',
        activos: false,
        usuario: '-',
        seguridad: '-'
    },
    {
        nombre: 'Router Este',
        redes: 'Internet, Lan Este',
        activos: false,
        usuario: '-',
        seguridad: '-'
    },
    {
        nombre: 'Server',
        redes: 'Lan 1',
        activos: true,
        usuario: 'N/A',
        seguridad: 'ACL'
    },
    {
        nombre: 'VPN Este',
        redes: 'Internet, Lan Este',
        activos: false,
        usuario: '-',
        seguridad: '-'
    },
    {
        nombre: 'WWW Router',
        redes: 'Internet, WWW Lan',
        activos: false,
        usuario: '-',
        seguridad: '-'
    },
    {
        nombre: 'WWW Server',
        redes: 'WWW Lan',
        activos: true,
        usuario: 'N/A',
        seguridad: 'ACL'
    }
];

export default function VistaTabla() {
    return (
        <div className={styles.vistaTabla}>
            <div className={styles.tablaHeader}>
                <table className={styles.tabla}>
                    <thead>
                        <tr>
                            <th>Dispositivo</th>
                            <th>Redes</th>
                            <th>Activos</th>
                            <th>Usuario</th>
                            {/* <th>Seguridad</th> */}
                        </tr>
                    </thead>
                </table>
            </div>
            <div className={styles.tablaBody}>
                <table className={styles.tabla}>
                    <tbody>
                        {dispositivosEjemplo.map((dispositivo, index) => (
                            <tr key={index}>
                                <td>{dispositivo.nombre}</td>
                                <td>{dispositivo.redes}</td>
                                <td>
                                    <GreenCheckBox checked={dispositivo.activos} />
                                </td>
                                <td>{dispositivo.usuario}</td>
                                {/* <td>{dispositivo.seguridad}</td> */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
