import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { FooterData } from "@/types/domain";

const useFooterMock = vi.fn<() => { data: FooterData | undefined }>();

vi.mock("@/features/page/hooks", () => ({
  useFooter: () => useFooterMock(),
}));

import Footer from "./Footer";

describe("Footer", () => {
  it("renders a section title and its linked page from footer.sections", () => {
    // Regression test: Footer previously derived sections from a
    // content-page-level `footerSection` string field, ignoring the actual
    // Strapi "Footer" singleton's `sections[].title`. A section title
    // configured there (e.g. "על נמש") would silently never render even
    // though it was present in the API response.
    useFooterMock.mockReturnValue({
      data: {
        sections: [
          {
            title: "על נמש",
            links: [
              {
                customLabel: "מדיניות פרטיות",
                page: { slug: "privacy-policy", title: "מדיניות פרטיות" },
                externalUrl: null,
                openInNewTab: true,
              },
            ],
          },
        ],
        copyrightText: null,
      },
    });

    render(<Footer />);

    expect(screen.getByText("על נמש")).toBeInTheDocument();

    const link = screen.getByRole("link", { name: "מדיניות פרטיות" });
    expect(link).toHaveAttribute("href", "/privacy-policy");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("renders no section block when footer.sections is empty", () => {
    useFooterMock.mockReturnValue({
      data: { sections: [], copyrightText: null },
    });

    render(<Footer />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
