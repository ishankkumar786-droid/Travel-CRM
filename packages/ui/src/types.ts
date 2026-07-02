/**
 * Shared UI type definitions.
 */
import type { ReactNode } from 'react';

export interface ChildrenProps {
  children: ReactNode;
}

export interface ClassNameProps {
  className?: string;
}

export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Variant = 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';
export type ColorScheme = 'light' | 'dark' | 'system';
