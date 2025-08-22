"use client";

import { cn } from "@southern-syntax/ui";
import { Label, Checkbox } from "@southern-syntax/ui";

import type { CheckboxStates } from "../helpers/checkbox-utils";

interface Option {
  id: string;
  label: string;
}

interface CheckboxGroupWithStatesProps {
  namePrefix: string;
  options: Option[];
  states: CheckboxStates;
  onChangeAction: (id: string) => void;
}

export default function CheckboxGroupWithStates({
  namePrefix,
  options,
  states,
  onChangeAction,
}: CheckboxGroupWithStatesProps) {
  return (
    <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border p-3">
      {options.map(({ id, label }) => (
        <div key={id} className="flex items-center space-x-2">
          <Checkbox
            id={`${namePrefix}-${id}`}
            checked={states[id] === "checked"}
            onCheckedChange={() => onChangeAction(id)}
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
