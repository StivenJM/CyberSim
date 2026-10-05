interface AppLogoProps {
  size?: number;
}

export default function AppLogo({ size = 64 }: AppLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
    >
      {/* Network lines */}
      <line x1="32" y1="14" x2="12" y2="35" stroke="currentColor" strokeWidth="2.5" />
      <line x1="32" y1="14" x2="52" y2="35" stroke="currentColor" strokeWidth="2.5" />
      <line x1="12" y1="35" x2="52" y2="35" stroke="currentColor" strokeWidth="2.5" />
      <line x1="32" y1="14" x2="32" y2="50" stroke="currentColor" strokeWidth="2.5" />
      <line x1="12" y1="35" x2="32" y2="50" stroke="currentColor" strokeWidth="2.5" />
      <line x1="52" y1="35" x2="32" y2="50" stroke="currentColor" strokeWidth="2.5" />

      {/* Nodes */}
      <circle cx="32" cy="14" r="5" fill="currentColor" />
      <circle cx="12" cy="35" r="5" fill="currentColor" />
      <circle cx="52" cy="35" r="5" fill="currentColor" />
      <circle cx="32" cy="50" r="5" fill="currentColor" />
    </svg>
  );
}
