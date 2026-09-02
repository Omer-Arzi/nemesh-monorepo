import { describe, it, expect, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import { renderWithTheme as render } from "@/test/renderWithTheme";
import type { SearchSuggestion } from "@/lib/api/services/suggestionsService";
import SearchSuggestions from "./SearchSuggestions";

const LISTBOX_ID = "test-listbox";

const RECOMMENDED_TAGS = [
  { name: "ארוחות ערב מהירות", slug: "quick-dinners" },
  { name: "מתכונים לשבת", slug: "shabbat" },
  { name: "קינוחים בלי אפייה", slug: "no-bake-desserts" },
];

const HEADING = "אולי יתחשק לכם";

describe("SearchSuggestions — recommended variant", () => {
  it("renders the non-interactive heading band and one option per tag, in order", () => {
    render(
      <SearchSuggestions
        variant="recommended"
        recommendedTags={RECOMMENDED_TAGS}
        heading={HEADING}
        activeIndex={-1}
        onSelectTag={vi.fn()}
        listboxId={LISTBOX_ID}
      />
    );

    // Heading is present but is not an option / not in the arrow-key cycle.
    expect(screen.getByText(HEADING)).toBeInTheDocument();

    const options = screen.getAllByRole("option");
    expect(options.map((o) => o.textContent)).toEqual(RECOMMENDED_TAGS.map((t) => t.name));
  });

  it("reuses the shared option-id scheme with indices 0..n-1", () => {
    render(
      <SearchSuggestions
        variant="recommended"
        recommendedTags={RECOMMENDED_TAGS}
        heading={HEADING}
        activeIndex={-1}
        onSelectTag={vi.fn()}
        listboxId={LISTBOX_ID}
      />
    );

    const options = screen.getAllByRole("option");
    options.forEach((option, i) => {
      expect(option).toHaveAttribute("id", `${LISTBOX_ID}-option-${i}`);
    });
  });

  it("wraps the rows in a group labelled by the heading", () => {
    render(
      <SearchSuggestions
        variant="recommended"
        recommendedTags={RECOMMENDED_TAGS}
        heading={HEADING}
        activeIndex={-1}
        onSelectTag={vi.fn()}
        listboxId={LISTBOX_ID}
      />
    );

    const group = screen.getByRole("group");
    const headingEl = screen.getByText(HEADING);
    expect(group).toHaveAttribute("aria-labelledby", headingEl.id);
    expect(headingEl.id).toBeTruthy();
    expect(within(group).getAllByRole("option")).toHaveLength(RECOMMENDED_TAGS.length);
  });

  it("marks only the active row aria-selected", () => {
    render(
      <SearchSuggestions
        variant="recommended"
        recommendedTags={RECOMMENDED_TAGS}
        heading={HEADING}
        activeIndex={1}
        onSelectTag={vi.fn()}
        listboxId={LISTBOX_ID}
      />
    );

    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveAttribute("aria-selected", "false");
    expect(options[1]).toHaveAttribute("aria-selected", "true");
    expect(options[2]).toHaveAttribute("aria-selected", "false");
  });

  it("calls onSelectTag with the tag on mouseDown (preventing default to keep input focus)", () => {
    const onSelectTag = vi.fn();
    render(
      <SearchSuggestions
        variant="recommended"
        recommendedTags={RECOMMENDED_TAGS}
        heading={HEADING}
        activeIndex={-1}
        onSelectTag={onSelectTag}
        listboxId={LISTBOX_ID}
      />
    );

    const secondRow = screen.getAllByRole("option")[1];
    const event = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
    secondRow.dispatchEvent(event);

    expect(onSelectTag).toHaveBeenCalledWith(RECOMMENDED_TAGS[1]);
    expect(event.defaultPrevented).toBe(true);
  });

  it("renders nothing when there are no recommended tags", () => {
    const { container } = render(
      <SearchSuggestions
        variant="recommended"
        recommendedTags={[]}
        heading={HEADING}
        activeIndex={-1}
        onSelectTag={vi.fn()}
        listboxId={LISTBOX_ID}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });
});

describe("SearchSuggestions — typed variant (unchanged) regression guard", () => {
  const SUGGESTION: SearchSuggestion = {
    type: "recipe",
    label: "מרק בצל צרפתי",
    subtitle: "מתכון",
    slug: "french-onion-soup",
    score: 8,
  };

  it("renders a flat listbox with no heading band", () => {
    render(
      <SearchSuggestions
        suggestions={[SUGGESTION]}
        activeIndex={-1}
        onSelect={vi.fn()}
        listboxId={LISTBOX_ID}
      />
    );

    expect(screen.queryByRole("group")).not.toBeInTheDocument();
    expect(screen.queryByText(HEADING)).not.toBeInTheDocument();
    const option = screen.getByRole("option");
    expect(option).toHaveAttribute("id", `${LISTBOX_ID}-option-0`);
    expect(option).toHaveTextContent("מרק בצל צרפתי");
  });
});
