import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { CheckboxGroup } from "../CheckboxGroup";

const options = [
  { id: "a", label: "Option A" },
  { id: "b", label: "Option B" },
];

describe("CheckboxGroup", () => {
  it("calls onChange with updated ids when a checkbox is clicked", () => {
    const onChange = vi.fn();
    const { getByLabelText } = render(
      <CheckboxGroup
        options={options}
        selectedIds={[]}
        onChange={onChange}
        namePrefix="test"
      />
    );

    const checkboxA = getByLabelText("Option A") as HTMLInputElement;

    // Select first checkbox
    fireEvent.click(checkboxA);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(Array.from(onChange.mock.calls[0][0])).toEqual(["a"]);
  });
});
