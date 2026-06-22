export function LoadingState({ label = "Cargando..." }: { label?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[#d9e1dc] bg-white/70 p-8 text-center text-sm text-[#66746e]">
      {label}
    </div>
  );
}
