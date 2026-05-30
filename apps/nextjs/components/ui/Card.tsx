import { cn } from '@/lib/utils';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
}

export default function Card({ className, children, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6',
        hover && 'transition-all duration-300 hover:bg-white/8 hover:border-white/20 hover:shadow-lg hover:shadow-blue-500/10',
        className
      )}
    >
      {children}
    </div>
  );
}
