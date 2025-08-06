"use client";

import React from "react";
import { Label, Checkbox } from "@southern-syntax/ui";

interface CheckboxGroupProps {
  options: { id: string; label: string }[];
  selectedIds: Set<string> | string[];
  onChange: (ids: Set<string>) => void;
  namePrefix: string;
}

export function CheckboxGroup({
  options,
  selectedIds,
  onChange,
  namePrefix,
}: CheckboxGroupProps) {
  // รองรับทั้ง Array และ Set
  const selectedSet =
    selectedIds instanceof Set ? selectedIds : new Set(selectedIds);

  return (
    <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border p-3">
      {options.map(({ id, label }) => (
        <div key={id} className="flex items-center space-x-2">
          <Checkbox
            id={`${namePrefix}-${id}`}
            checked={selectedSet.has(id)}
            onCheckedChange={(checked: boolean | "indeterminate") => {
              const newSet = new Set(selectedSet);
              if (checked) {
                newSet.add(id);
              } else {
                newSet.delete(id);
              }
              onChange(newSet);
            }}
          />
          <Label
            htmlFor={`${namePrefix}-${id}`}
            className="cursor-pointer text-sm font-normal"
          >
            {label}
          </Label>
        </div>
      ))}
    </div>
  );
}
