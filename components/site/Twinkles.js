// Slow gold sparkles drifting up behind the homepage headline. Purely decorative.
export default function Twinkles() {
  return (
    <div className="tws" aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => (
        <span
          key={i}
          className="tw"
          style={{ left: `${5 + i * 8}%`, '--d': `${7 + ((i * 37) % 6)}s`, '--dl': `-${(i * 13) % 9}s` }}
        />
      ))}
    </div>
  );
}
