"use client";

import { alpha } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import type { Image } from "@/types/domain";
import { NemeshImage } from "@/components/shared";
import { CollectionCardStyle } from "./CollectionCard.style";

type Props = {
  name: string;
  image: Image | null;
  href: string;
  /** When true, renders a subtle "אוסף" badge — used for special curated collections. */
  special?: boolean;
};

export default function CollectionCard({ name, image, href, special = false }: Props) {
  return (
    <Card sx={special ? (theme) => ({
        ...CollectionCardStyle.card,
        outline: `1.5px solid ${alpha(theme.palette.primary.main, 0.35)}`,
        boxShadow: `0 0 10px 3px ${alpha(theme.palette.primary.main, 0.2)}`,
        "&:hover": {
          boxShadow: `0 0 18px 5px ${alpha(theme.palette.primary.main, 0.3)}`,
        },
      }) : CollectionCardStyle.card}>
      <CardActionArea
        component={NextLink}
        href={href}
        sx={CollectionCardStyle.actionArea}
      >
        {/* ── Image zone ──────────────────────────────────────────── */}
        <Box sx={CollectionCardStyle.imageZone}>
          <NemeshImage
            image={image}
            fill
            sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
            objectFit="cover"
          />
        </Box>

        {/* ── Content zone ────────────────────────────────────────── */}
        <CardContent sx={CollectionCardStyle.content}>
          <Typography variant="subtitle1" component="h2" sx={CollectionCardStyle.title}>
            {name}
          </Typography>

        </CardContent>
      </CardActionArea>
    </Card>
  );
}
