import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithTheme as render } from "@/test/renderWithTheme";
import ShareRecipeButton from "./ShareRecipeButton";
import { ShareRecipeButtonText as T } from "./ShareRecipeButton.consts";

const props = {
  slug: "chocolate-cake",
  title: "עוגת שוקולד",
  recipeUrl: "https://www.nemesh-food.com/recipes/chocolate-cake",
};

const share = vi.fn();
const canShare = vi.fn();
const fetchMock = vi.fn();

function domError(name: string) {
  return new DOMException("x", name);
}

function pdfResponse() {
  return Promise.resolve(
    new Response(new Blob(["%PDF-1.4"], { type: "application/pdf" }), { status: 200 }),
  );
}

beforeEach(() => {
  share.mockReset().mockResolvedValue(undefined);
  canShare.mockReset().mockReturnValue(true);
  fetchMock.mockReset().mockImplementation(pdfResponse);
  Object.defineProperty(navigator, "share", { value: share, configurable: true });
  Object.defineProperty(navigator, "canShare", { value: canShare, configurable: true });
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  // @ts-expect-error — remove the stubs so other files see a bare jsdom navigator
  delete navigator.share;
  // @ts-expect-error -- optional in lib.dom; deleting restores a bare jsdom navigator
  delete navigator.canShare;
  vi.unstubAllGlobals();
});

describe("ShareRecipeButton", () => {
  it("renders a button whose accessible name is the visible label", () => {
    render(<ShareRecipeButton {...props} />);
    expect(screen.getByRole("button", { name: T.label })).toBeInTheDocument();
  });

  it("fetches the recipe PDF and shares it as a file", async () => {
    render(<ShareRecipeButton {...props} />);
    fireEvent.click(screen.getByRole("button", { name: T.label }));

    await waitFor(() => expect(share).toHaveBeenCalledTimes(1));
    expect(fetchMock.mock.calls[0][0]).toBe("/api/recipes/chocolate-cake/pdf");

    const data = share.mock.calls[0][0] as ShareData;
    expect(data.files).toHaveLength(1);
    expect(data.files![0].type).toBe("application/pdf");
    expect(data.files![0].name).toBe("עוגת שוקולד.pdf");
    expect(data.title).toBe(props.title);
    await waitFor(() => expect(screen.getByRole("button", { name: T.label })).toBeEnabled());
  });

  it("disables the button and shows progress while the PDF is prepared", async () => {
    let resolveFetch!: (r: Response) => void;
    fetchMock.mockReturnValue(new Promise<Response>((r) => (resolveFetch = r)));
    render(<ShareRecipeButton {...props} />);
    fireEvent.click(screen.getByRole("button", { name: T.label }));

    const busy = await screen.findByRole("button", { name: T.preparing });
    expect(busy).toBeDisabled();

    resolveFetch(new Response(new Blob(["%PDF"]), { status: 200 }));
    await waitFor(() => expect(share).toHaveBeenCalled());
  });

  it("offers a second tap when the browser says the first tap is too old", async () => {
    share.mockRejectedValueOnce(domError("NotAllowedError"));
    render(<ShareRecipeButton {...props} />);
    fireEvent.click(screen.getByRole("button", { name: T.label }));

    expect(await screen.findByText(T.readyTitle)).toBeInTheDocument();
    expect(share).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: T.readyConfirm }));
    await waitFor(() => expect(share).toHaveBeenCalledTimes(2));
    // Reuses the already-fetched file — no second request.
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect((share.mock.calls[1][0] as ShareData).files).toHaveLength(1);
    await waitFor(() => expect(screen.queryByText(T.readyTitle)).not.toBeInTheDocument());
  });

  it("treats closing the share sheet as a no-op, not an error", async () => {
    share.mockRejectedValueOnce(domError("AbortError"));
    render(<ShareRecipeButton {...props} />);
    fireEvent.click(screen.getByRole("button", { name: T.label }));

    await waitFor(() => expect(screen.getByRole("button", { name: T.label })).toBeEnabled());
    expect(screen.queryByText(T.error)).not.toBeInTheDocument();
    expect(screen.queryByText(T.readyTitle)).not.toBeInTheDocument();
  });

  it("shares the recipe link — without fetching a PDF — when files can't be shared", async () => {
    canShare.mockReturnValue(false);
    render(<ShareRecipeButton {...props} />);
    fireEvent.click(screen.getByRole("button", { name: T.label }));

    await waitFor(() => expect(share).toHaveBeenCalledTimes(1));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(share).toHaveBeenCalledWith({ title: props.title, url: props.recipeUrl });
  });

  it("shows an error message when the PDF request fails", async () => {
    fetchMock.mockResolvedValue(new Response("nope", { status: 500 }));
    render(<ShareRecipeButton {...props} />);
    fireEvent.click(screen.getByRole("button", { name: T.label }));

    expect(await screen.findByText(T.error)).toBeInTheDocument();
    expect(share).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: T.label })).toBeEnabled();
  });
});
