import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ImageWithFallback from "./ImageWithFallback";
import PatchArrow from "./PatchArrow";
import StarToggle from "./StarToggle";
import SubTabs from "./SubTabs";
import FilterPanel from "./FilterPanel";
import { useToastStore, toast } from "../store/useToastStore";

describe("PatchArrow", () => {
  it("labels buffs, nerfs and unchanged items with text, not color alone", () => {
    render(
      <>
        <PatchArrow status="buff" />
        <PatchArrow status="nerf" />
        <PatchArrow status="none" />
      </>,
    );
    expect(screen.getByText("Buff")).toBeVisible();
    expect(screen.getByText("Nerf")).toBeVisible();
    expect(screen.getByText("No change")).toHaveClass("sr-only");
  });
});

describe("ImageWithFallback", () => {
  it("shows the striped placeholder when src is missing", () => {
    render(<ImageWithFallback alt="Liberator" label="Liberator" />);
    expect(screen.getByRole("img", { name: "Liberator" })).toHaveTextContent("[Liberator]");
  });

  it("falls back after a load error", () => {
    render(<ImageWithFallback src="/images/weapons/nope.png" alt="Sickle" />);
    fireEvent.error(screen.getByRole("img", { name: "Sickle" }));
    expect(screen.getByRole("img", { name: "Sickle" })).toHaveTextContent("[Sickle]");
  });
});

describe("StarToggle", () => {
  it("reports the next state and exposes aria-pressed", () => {
    const onChange = vi.fn();
    render(<StarToggle active={false} onChange={onChange} label="Bot Breaker" />);
    const button = screen.getByRole("button", { name: "Add Bot Breaker to favorites" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(button);
    expect(onChange).toHaveBeenCalledWith(true);
  });
});

describe("SubTabs", () => {
  it("renders route links and marks the active one", () => {
    render(
      <MemoryRouter>
        <SubTabs
          label="Home sections"
          tabs={[
            { id: "a", label: "Galactic News" },
            { id: "b", label: "Major Orders" },
          ]}
          active="b"
          hrefFor={(t) => `/home/${t.id}`}
        />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: "Major Orders" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Galactic News" })).toHaveAttribute("href", "/home/a");
  });
});

describe("FilterPanel", () => {
  it("toggles chips and changes the sort", () => {
    const onToggle = vi.fn();
    const onSortChange = vi.fn();
    render(
      <FilterPanel
        categories={[
          { id: "meta", label: "Meta" },
          { id: "fun", label: "Fun" },
        ]}
        selected={["meta"]}
        onToggle={onToggle}
        sortOptions={[
          { id: "liked", label: "Most Liked" },
          { id: "date", label: "Date" },
        ]}
        sort="liked"
        onSortChange={onSortChange}
      />,
    );
    expect(screen.getByRole("button", { name: "Meta" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Fun" }));
    expect(onToggle).toHaveBeenCalledWith("fun");
    fireEvent.change(screen.getByLabelText("Sort by"), { target: { value: "date" } });
    expect(onSortChange).toHaveBeenCalledWith("date");
  });
});

describe("toast store", () => {
  it("pushes and dismisses toasts", () => {
    const id = toast({ label: "Update ready" });
    expect(useToastStore.getState().toasts).toHaveLength(1);
    useToastStore.getState().dismiss(id);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });
});
