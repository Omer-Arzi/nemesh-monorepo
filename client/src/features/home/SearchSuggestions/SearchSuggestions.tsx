import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import type { SearchSuggestion } from "@/lib/api/services/suggestionsService";
import { SearchSuggestionsStyle } from "./SearchSuggestions.style";

type Props = {
  suggestions: SearchSuggestion[];
  activeIndex: number;
  onSelect: (suggestion: SearchSuggestion) => void;
};

export default function SearchSuggestions({ suggestions, activeIndex, onSelect }: Props) {
  if (suggestions.length === 0) return null;

  return (
    <Paper elevation={2} sx={SearchSuggestionsStyle.root} role="listbox">
      {suggestions.map((s, i) => (
        <Box
          key={`${s.type}-${s.type === "recipe" ? s.slug : s.canonicalName}`}
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
