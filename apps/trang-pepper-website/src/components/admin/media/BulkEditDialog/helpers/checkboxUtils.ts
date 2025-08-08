// import type { MediaItem } from "@southern-syntax/types";
import { MediaItem } from "@/types/trpc";

export type CheckboxState = "checked" | "indeterminate" | "unchecked";
export type CheckboxStates = Record<string, CheckboxState>;

export function getInitialCheckboxStates(
  mediaItems: MediaItem[],
  key: "categories" | "tags"
): CheckboxStates {
  const countMap: Record<string, number> = {};
  const totalItems = mediaItems.length;

  for (const media of mediaItems) {
    for (const item of media[key]) {
      countMap[item.id] = (countMap[item.id] || 0) + 1;
    }
  }

  const states: CheckboxStates = {};
  for (const [id, count] of Object.entries(countMap)) {
    states[id] = count === totalItems ? "checked" : "indeterminate";
  }

  return states;
}

export function toggleCheckboxState(
  states: CheckboxStates,
  id: string
): CheckboxStates {
  const current = states[id] ?? "unchecked";
  return {
    ...states,
    [id]: current === "checked" ? "unchecked" : "checked",
  };
}

export function getChangedCheckboxIdsSafe(
  initial: CheckboxStates,
  current: CheckboxStates
): { toAdd: string[]; toRemove: string[] } {
  const toAdd: string[] = [];
  const toRemove: string[] = [];

  const allKeys = new Set([...Object.keys(initial), ...Object.keys(current)]);

  for (const id of allKeys) {
    const initialState = initial[id] ?? "unchecked";
    const currentState = current[id] ?? "unchecked";

    if (initialState === currentState) continue;

    // ✅ ถือว่าเปลี่ยนเสมอหากสถานะเปลี่ยนไปจากเดิม ไม่ว่าจากอะไร → checked หรือ → unchecked
    if (currentState === "checked") {
      toAdd.push(id);
    } else if (currentState === "unchecked") {
      toRemove.push(id);
    }

    // ถ้า currentState เป็น indeterminate → ไม่ทำอะไร
  }

  return { toAdd, toRemove };
}
