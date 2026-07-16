import type { Icon } from '@phosphor-icons/react';
import { MagnifyingGlass } from '@phosphor-icons/react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: Icon;
}

function EmptyState({ title, description, icon: IconComponent = MagnifyingGlass }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ekoa-purple-50 text-ekoa-purple-600">
        <IconComponent size={26} aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-ekoa-navy">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

export default EmptyState;
