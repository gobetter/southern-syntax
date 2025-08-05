// src/components/admin/media/MediaGrid/useSelectionSet.ts
import { useState, useCallback } from 'react';

export function useSelectionSet() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = useCallback((id: string, isSelected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isSelected) {
        next.add(id);
      } else {
        next.delete(id);
      }

      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return { selectedIds, toggleSelection, clearSelection };
}
