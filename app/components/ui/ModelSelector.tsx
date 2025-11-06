"use client";

import React from 'react';
import { ModelType } from '@/lib/types';

interface ModelSelectorProps {
  value: ModelType;
  onChange: (model: ModelType) => void;
  disabled?: boolean;
}

/**
 * Reusable model selector component
 * Displays a dropdown with available Mistral models
 */
export function ModelSelector({ value, onChange, disabled }: ModelSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ModelType)}
      disabled={disabled}
      className="rounded-md border border-zinc-300 px-3 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
    >
      <option value="mistral-tiny-latest">Mistral Tiny</option>
      <option value="mistral-small-latest">Mistral Small</option>
      <option value="mistral-large-latest">Mistral Large</option>
    </select>
  );
}