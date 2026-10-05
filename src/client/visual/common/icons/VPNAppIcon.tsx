export default function VPNAppIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 4C24 4 5 4 5 8V22C5 34 24 44 24 44C24 44 43 34 43 22V8C43 4 24 4 24 4Z" fill="#7E57C2"/>
            <path d="M24 8C24 8 9 8 9 11V22C9 31 24 39 24 39C24 39 39 31 39 22V11C39 8 24 8 24 8Z" fill="#9575CD"/>
            <path d="M15 19C18 14.5 30 14.5 33 19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19 22.5C21 19.5 27 19.5 29 22.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="24" cy="26.5" r="2" fill="white"/>
        </svg>
    );
}
