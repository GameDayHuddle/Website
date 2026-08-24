import Image from "next/image";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <a className="brand" href="/" aria-label="GameDay Huddle home">
      <span className="brand-crop" aria-hidden="true">
        <Image src="/logo-mark.svg" alt="" width={48} height={48} priority unoptimized />
      </span>
      <span className="brand-name">
        GameDay <strong>Huddle</strong>
        {!compact && <small>Football intelligence</small>}
      </span>
    </a>
  );
}
