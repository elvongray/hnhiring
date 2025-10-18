import type { ButtonHTMLAttributes, DetailedHTMLProps } from 'react';
import { cn } from '../../lib/cn.ts';

type BaseProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

type Variant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps extends BaseProps {
  variant?: Variant;
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-[color:var(--accent)] text-[color:var(--accent-foreground)] shadow-soft hover:brightness-105 focus-visible:ring-accent',
  secondary:
    'bg-surface-muted text-secondary hover:brightness-110 focus-visible:ring-accent',
  ghost:
    'bg-transparent text-secondary hover:text-[color:var(--text-primary)] hover:bg-surface-muted focus-visible:ring-accent',
};

export const Button = ({
  variant = 'primary',
  className,
  type = 'button',
  ...props
}: ButtonProps) => (
  <button
    type={type}
    className={cn(
      'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface)] cursor-pointer',
      variantStyles[variant],
      className,
    )}
    {...props}
  />
);
