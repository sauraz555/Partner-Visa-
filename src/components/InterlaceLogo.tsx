export default function InterlaceLogo({
  className = '',
  showText = true,
  size = 32,
  textSize = 'text-xl',
}: {
  className?: string;
  showText?: boolean;
  size?: number;
  textSize?: string;
}) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Icon: Two interlocking rings */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <circle
          cx="12"
          cy="16"
          r="8"
          stroke="#2563EB"
          strokeWidth="2.5"
          fill="none"
        />
        <circle
          cx="20"
          cy="16"
          r="8"
          stroke="#1D4ED8"
          strokeWidth="2.5"
          fill="none"
          opacity="0.7"
        />
        {/* Intersection highlight */}
        <path
          d="M16 9.5 C14.5 11.5 14 13.8 14 16 C14 18.2 14.5 20.5 16 22.5 C17.5 20.5 18 18.2 18 16 C18 13.8 17.5 11.5 16 9.5Z"
          fill="#2563EB"
          opacity="0.2"
        />
      </svg>

      {showText && (
        <span
          className={`font-bold tracking-tight text-gray-900 dark:text-white ${textSize}`}
          style={{ fontFamily: "'Instrument Sans', ui-sans-serif, system-ui, sans-serif" }}
        >
          Interlace
        </span>
      )}
    </div>
  );
}
