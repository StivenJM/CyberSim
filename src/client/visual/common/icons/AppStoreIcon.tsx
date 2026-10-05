export default function AppStoreIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="40" height="40" rx="10" fill="#5C6BC0"/>
            <rect x="9" y="9" width="13" height="13" rx="3" fill="#C5CAE9"/>
            <rect x="26" y="9" width="13" height="13" rx="3" fill="#7986CB"/>
            <rect x="9" y="26" width="13" height="13" rx="3" fill="#7986CB"/>
            <rect x="26" y="26" width="13" height="13" rx="3" fill="#C5CAE9"/>
        </svg>
    );
}
