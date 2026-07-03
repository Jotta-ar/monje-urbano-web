"use client";

export default function ComingSoonButton({
  children,
  className,
  message = "Tienda próximo a habilitar",
}: {
  children: React.ReactNode;
  className?: string;
  message?: string;
}) {
  return (
    <a href="#" className={className} onClick={(e) => { e.preventDefault(); alert(message); }}>
      {children}
    </a>
  );
}
