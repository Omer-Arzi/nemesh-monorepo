import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import type { SearchSuggestion } from "@/lib/api/services/suggestionsService";
import type { RecommendedTag } from "@/types/domain";
import { SearchSuggestionsStyle } from "./SearchSuggestions.style";

type TypedProps = {
  variant?: "typed";
  suggestions: SearchSuggestion[];
  activeIndex: number;
  onSelect: (suggestion: SearchSuggestion) => void;
  /** Unique id for this listbox instance — must match the input's aria-controls. */
  listboxId: string;
};

type RecommendedProps = {
  variant: "recommended";
  recommendedTags: RecommendedTag[];
  /** Non-interactive group heading (Hebrew lead-in copy). */
  heading: string;
  activeIndex: number;
  onSelectTag: (tag: RecommendedTag) => void;
  listboxId: string;
};

type Props = TypedProps | RecommendedProps;

/** Must match how useHomeSearch derives activeDescendantId from the same listboxId. */
function optionId(listboxId: string, index: number) {
  return `${listboxId}-option-${index}`;
}

export default function SearchSuggestions(props: Props) {
  if (props.variant === "recommended") {
    const { recommendedTags, heading, activeIndex, onSelectTag, listboxId } = props;
    if (recommendedTags.length === 0) return null;

    const headingId = `${listboxId}-recommended-heading`;

    return (
      <Paper elevation={2} sx={SearchSuggestionsStyle.root} role="listbox" id={listboxId}>
        <Box sx={SearchSuggestionsStyle.recommendedHeading}>
          <Typography id={headingId} component="p" sx={SearchSuggestionsStyle.recommendedHeadingText}>
            {heading}
          </Typography>
        </Box>
        <Box role="group" aria-labelledby={headingId}>
          {recommendedTags.map((tag, i) => (
            <Box
              key={`tag-${tag.slug}`}
              id={optionId(listboxId, i)}
              role="option"
              aria-selected={i === activeIndex}
              sx={[
                SearchSuggestionsStyle.row,
                SearchSuggestionsStyle.recommendedRow,
                i === activeIndex ? SearchSuggestionsStyle.rowActive : false,
              ]}
              onMouseDown={(e) => {
                e.preventDefault(); // keep input focused so blur doesn't fire before click
                onSelectTag(tag);
              }}
            >
              <Typography sx={SearchSuggestionsStyle.label} noWrap>
                {tag.name}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    );
  }

  const { suggestions, activeIndex, onSelect, listboxId } = props;
  if (suggestions.length === 0) return null;

  return (
    <Paper elevation={2} sx={SearchSuggestionsStyle.root} role="listbox" id={listboxId}>
      {suggestions.map((s, i) => (
        <Box
          key={`${s.type}-${s.type === "recipe" ? s.slug : `${s.canonicalId}-${s.matchType}`}`}
          id={optionId(listboxId, i)}
          role="option"
          aria-selected={i === activeIndex}
          sx={[
            SearchSuggestionsStyle.row,
            i === activeIndex ? SearchSuggestionsStyle.rowActive : false,
          ]}
          onMouseDown={(e) => {
            e.preventDefault(); // keep input focused so blur doesn't fire before click
            onSelect(s);
          }}
        >
          <Typography sx={SearchSuggestionsStyle.label} noWrap>
            {s.label}
          </Typography>
          <Typography sx={SearchSuggestionsStyle.subtitle} noWrap>
            {s.subtitle}
          </Typography>
        </Box>
      ))}
    </Paper>
  );
}
