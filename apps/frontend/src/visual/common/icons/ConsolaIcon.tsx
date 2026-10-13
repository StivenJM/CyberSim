export default function ConsolaIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="6" width="44" height="36" rx="5" fill="#455A64"/>
            <rect x="5" y="9" width="38" height="30" rx="3" fill="#1a2733"/>
            <path d="M13 16L18 21L13 26" stroke="#4FC3F7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="20" y1="30" x2="34" y2="30" stroke="#78909C" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
    );
}
