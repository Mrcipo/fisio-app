type EmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-[#b8c5bf] bg-white/80 p-8 text-center">
      <h2 className="text-base font-semibold text-[#17211d]">{title}</h2>
      {description ? <p className="mt-2 text-sm text-[#66746e]">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
