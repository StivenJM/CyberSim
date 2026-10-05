export default function DocumentIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M9.5 1H3.5C3.10218 1 2.72064 1.15804 2.43934 1.43934C2.15804 1.72064 2 2.10218 2 2.5V13.5C2 13.8978 2.15804 14.2794 2.43934 14.5607C2.72064 14.842 3.10218 15 3.5 15H12.5C12.8978 15 13.2794 14.842 13.5607 14.5607C13.842 14.2794 14 13.8978 14 13.5V5.5L9.5 1Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            <path
                d="M9.5 1V5.5H14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            <path
                d="M11 8.5H5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M11 11.5H5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
