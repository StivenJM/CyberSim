export default function FileExplorerIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 10V38C6 39.1046 6.89543 40 8 40H40C41.1046 40 42 39.1046 42 38V16C42 14.8954 41.1046 14 40 14H24L20 8H8C6.89543 8 6 8.89543 6 10Z" fill="#FFD54F"/>
            <path d="M6 18H42V38C42 39.1046 41.1046 40 40 40H8C6.89543 40 6 39.1046 6 38V18Z" fill="#FFECB3"/>
            <path d="M6 10V14H20L18 10H8C6.89543 10 6 8.89543 6 10Z" fill="#FFB300"/>
        </svg>
    );
}
