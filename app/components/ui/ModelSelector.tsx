"use client";

import React from 'react';
import { ModelType } from '@/lib/types';

interface ModelSelectorProps {
  value: ModelType;
  onChange: (model: ModelType) => void;
  disabled?: boolean;
}

export function ModelSelector({ value, onChange, disabled }: ModelSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ModelType)}
      disabled={disabled}
      className="rounded-lg border border-zinc-300 dark:border-zinc-600 px-3 py-2 text-sm bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <option value="mistral-tiny-latest">Mistral Tiny</option>
      <option value="mistral-small-latest">Mistral Small</option>
      <option value="mistral-large-latest">Mistral Large</option>
    </select>
  );
}