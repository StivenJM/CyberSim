export default function KeyIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M10.5 5.5C11.3284 5.5 12 4.82843 12 4C12 3.17157 11.3284 2.5 10.5 2.5C9.67157 2.5 9 3.17157 9 4C9 4.82843 9.67157 5.5 10.5 5.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            <path
                d="M14 1.5L11.5 4L9.5 6L4 11.5V14.5H7L12.5 9L14.5 7L14 1.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            <path
                d="M4 11.5L6 13.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
