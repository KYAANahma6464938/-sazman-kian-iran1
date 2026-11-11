export default function GlitchText({
  text,
  className = "",
  red = false,
}: {
  text: string;
  className?: string;
  red?: boolean;
}) {
  return (
    <span className={className}>
      <span
        aria-hidden="true"
        data-text={text}
        className={`glitch ${red ? "text-glow-red" : "text-glow"}`}
      >
        {text}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
