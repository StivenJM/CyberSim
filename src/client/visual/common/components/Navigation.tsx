import React from 'react';
import { NavLink } from 'react-router';
import styles from '../styles/Sidebar.module.css';
import Tooltip from './Tooltip';

const NavigationLink: React.FC<{icon: React.ReactNode, label: string, to: string, forceInactive?: boolean, 'data-tour'?: string, tooltipPosition?: 'top' | 'bottom' | 'left' | 'right'}> = ({icon, label, to, forceInactive = false, 'data-tour': dataTour, tooltipPosition = 'top'}) => {
    return (
        <Tooltip text={label} position={tooltipPosition}>
            <NavLink
                to={to}
                className={({ isActive }) => `${styles.dockItem} ${isActive && !forceInactive ? styles.active : ''}`}
                data-tour={dataTour}
            >
                {icon}
            </NavLink>
        </Tooltip>
    );
};

export default NavigationLink;
