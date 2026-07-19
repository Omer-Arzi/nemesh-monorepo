import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithTheme as render } from "@/test/renderWithTheme";
import type { Image } from "@/types/domain";
import AboutPhotoRail from "./AboutPhotoRail";

const primaryImage: Image = { url: "/uploads/primary.jpg", alt: "תמונה ראשונה", width: 800, height: 1000 };
const secondaryImage: Image = { url: "/uploads/secondary.jpg", alt: "תמונה שנייה", width: 800, height: 1000 };

describe("AboutPhotoRail", () => {
  it("renders both images with their Strapi alt text", () => {
    render(<AboutPhotoRail primaryImage={primaryImage} secondaryImage={secondaryImage} />);

    expect(screen.getByAltText("תמונה ראשונה")).toBeInTheDocument();
    expect(screen.getByAltText("תמונה שנייה")).toBeInTheDocument();
  });

  it("hides the decorative rail line and clips from assistive technology", () => {
    const { container } = render(
      <AboutPhotoRail primaryImage={primaryImage} secondaryImage={secondaryImage} />
    );

    const hidden = container.querySelectorAll('[aria-hidden="true"]');
    expect(hidden.length).toBeGreaterThan(0);
  });
});
