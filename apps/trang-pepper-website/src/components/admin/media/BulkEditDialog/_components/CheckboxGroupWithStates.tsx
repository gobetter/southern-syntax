// src/components/admin/media/BulkEditDialog/CheckboxGroupWithStates.tsx
"use client";

import { cn } from "@southern-syntax/ui/lib/utils";
import { Checkbox } from "@southern-syntax/ui/checkbox";
import { Label } from "@southern-syntax/ui/label";
import type { CheckboxStates } from "../helpers/checkboxUtils";

interface Option {
  id: string;
  label: string;
}

// export type CheckboxStates = Record<string, 'checked' | 'indeterminate' | 'unchecked'>;

interface CheckboxGroupWithStatesProps {
  namePrefix: string;
  options: Option[];
  states: CheckboxStates;
  onChange: (id: string) => void;
}

export default function CheckboxGroupWithStates({
  namePrefix,
  options,
  states,
  onChange,
}: CheckboxGroupWithStatesProps) {
  return (
    <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border p-3">
      {options.map(({ id, label }) => (
        <div key={id} className="flex items-center space-x-2">
          <Checkbox
            id={`${namePrefix}-${id}`}
            checked={states[id] === "checked"}
            onCheckedChange={() => onChange(id)}
          />
          <Label
            htmlFor={`${namePrefix}-${id}`}
            className={cn(
              "cursor-pointer text-sm font-normal",
              states[id] === "indeterminate" && "text-muted-foreground italic"
            )}
          >
            {label} {states[id] === "indeterminate" && "*"}
          </Label>
        </div>
      ))}
    </div>
  );
}
