import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { RecipeCardSkeletonStyle } from "./styles/RecipeCardSkeletonStyle";

/**
 * Placeholder skeleton that mirrors RecipeCard's visual structure.
 * Render inside the same Grid breakpoints as the real cards to prevent
 * layout jumping when data arrives.
 */
export default function RecipeCardSkeleton() {
  return (
    <Card sx={RecipeCardSkeletonStyle.card}>
      <Box sx={RecipeCardSkeletonStyle.imageZone}>
        <Skeleton variant="rectangular" sx={RecipeCardSkeletonStyle.imageSkeleton} />
      </Box>
      <CardContent sx={RecipeCardSkeletonStyle.content}>
        {/* Two title lines — matches RecipeCard's minHeight: "2.7em" reserved area */}
        <Skeleton variant="text" width="72%" height={22} />
        <Skeleton variant="text" width="50%" height={22} />
        <Box sx={RecipeCardSkeletonStyle.metaRow}>
          <Skeleton variant="text" width={60} height={16} />
          <Skeleton variant="text" width={60} height={16} />
        </Box>
      </CardContent>
    </Card>
  );
}
