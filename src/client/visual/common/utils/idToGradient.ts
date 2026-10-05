export function idToGradient(id: number): string {
    const hash = ((id * 2654435761) >>> 0);
    const hue = 190 + (hash % 130);
    const sat = 30 + ((hash >>> 8) % 25);
    const light = 24 + ((hash >>> 16) % 14);
    const angle = (hash >>> 20) % 360;
    return `linear-gradient(${angle}deg, hsl(${hue}, ${sat}%, ${light}%) 0%, hsl(0, 0%, 8%) 80%)`;
}
