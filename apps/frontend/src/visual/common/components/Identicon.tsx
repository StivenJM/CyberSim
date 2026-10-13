interface IdenticonProps {
  seed: string;
}

function djb2(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

export default function Identicon({ seed }: IdenticonProps) {
  const hash = djb2(seed);

  const hue = (hash >>> 15) % 360;
  const fg = `hsl(${hue} 55% 42%)`;
  const bg = `hsl(${hue} 40% 90%)`;

  const on: [number, number][] = [];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 3; c++) {
      if ((hash >> (r * 3 + c)) & 1) {
        on.push([c, r]);
        if (c < 2) on.push([4 - c, r]);
      }
    }
  }

  if (on.length < 6) {
    on.length = 0;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 3; c++) {
        if (!((hash >> (r * 3 + c)) & 1)) {
          on.push([c, r]);
          if (c < 2) on.push([4 - c, r]);
        }
      }
    }
  }

  return (
    <svg
      style={{ display: 'block', width: '100%', height: '100%' }}
      viewBox="0 0 70 70"
      role="img"
      aria-hidden="true"
    >
      <rect width="70" height="70" fill={bg} />
      {on.map(([x, y], i) => (
        <rect
          key={i}
          x={10 + x * 10}
          y={10 + y * 10}
          width="10"
          height="10"
          fill={fg}
        />
      ))}
    </svg>
  );
}
