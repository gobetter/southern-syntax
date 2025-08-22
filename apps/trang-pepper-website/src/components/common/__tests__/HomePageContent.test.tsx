import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import HomePageContent from "../home-page-content";

describe("<HomePageContent />", () => {
  it("renders translated text using provided t function", () => {
    const translations: Record<string, string> = {
      "general.welcome": "Welcome",
      "language.you_are_visiting_the_website_in_language":
        "You are visiting the website in language",
      "language.lang_en": "English",
    };
    const t = vi.fn((key: string) => translations[key]);

    render(<HomePageContent t={t} currentLang="en" />);

    expect(screen.getByText("Welcome!")).toBeInTheDocument();
    expect(
      screen.getByText(/You are visiting the website in language/i)
    ).toBeInTheDocument();
    expect(screen.getByText("English")).toBeInTheDocument();

    expect(t).toHaveBeenCalledWith("general.welcome");
    expect(t).toHaveBeenCalledWith(
      "language.you_are_visiting_the_website_in_language"
    );
    expect(t).toHaveBeenCalledWith("language.lang_en");
  });
});
