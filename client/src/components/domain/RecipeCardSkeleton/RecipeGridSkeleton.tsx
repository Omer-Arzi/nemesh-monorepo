import Grid from "@mui/material/Grid";
import RecipeCardSkeleton from "./RecipeCardSkeleton";

type Props = {
  /** Number of skeleton cards to render. Default 8 (one full page). */
  count?: number;
};

/**
 * A Grid of RecipeCardSkeletons using the same breakpoints as the real
 * recipe grids throughout the site (xs:12 / sm:4 / md:3).
 * Drop in where a RecipeCard grid will appear to prevent layout jumps.
 */
export default function RecipeGridSkeleton({ count = 8 }: Props) {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid key={i} size={{ xs: 12, sm: 4, md: 3 }}>
          <RecipeCardSkeleton />
        </Grid>
      ))}
    </Grid>
  );
}
