interface LoadingSpinnerProps {
  label?: string;
}

function LoadingSpinner({ label = 'Carregando informações...' }: LoadingSpinnerProps) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-slate-600" role="status">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-ekoa-purple-100 border-t-ekoa-purple-600" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

export default LoadingSpinner;
