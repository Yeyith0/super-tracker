import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";
import { useSettingsStore } from "./store/useSettingsStore";
import { requiredVersions } from "./legal/legalText";
import { LEGAL } from "./legal/useLegal";

const acceptLegal = () => useSettingsStore.getState().acceptLegal(requiredVersions(LEGAL.docs));

describe("app shell", () => {
  beforeEach(() => {
    window.location.hash = "";
    acceptLegal();
  });

  it("shows only the first-run screen until the terms are accepted", async () => {
    useSettingsStore.setState({ legal: null });
    render(<App />);
    expect(await screen.findByRole("heading", { name: "Before you deploy" })).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Main" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Minimize" })).toBeInTheDocument();
  });

  it("opens Home on its first inner tab with the profile bar", async () => {
    render(<App />);
    expect(await screen.findByText("Liberate the Varn Corridor")).toBeInTheDocument();
    expect(window.location.hash).toBe("#/home/galactic-news");
    expect(screen.getByRole("link", { name: "Galactic News" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("meter", { name: /alignment/i })).toHaveAttribute("aria-valuenow", "56");
    expect(screen.getByRole("button", { name: "Minimize" })).toBeInTheDocument();
  });

  it("keeps the inner tab in the route", async () => {
    window.location.hash = "#/arsenal/support";
    render(<App />);
    expect(await screen.findByRole("heading", { name: "Arsenal & Compare" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Support" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("03 // Arsenal // Support")).toBeInTheDocument();
  });

  it("opens a legal document in the reader", async () => {
    window.location.hash = "#/legal/roleplay";
    render(<App />);
    expect(await screen.findByRole("heading", { name: "Treason & Bounty Roleplay Notice" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Roleplay" })).toHaveAttribute("aria-current", "page");
  });

  it("switches and persists the theme from Settings", async () => {
    window.location.hash = "#/settings";
    render(<App />);
    fireEvent.click(await screen.findByRole("radio", { name: /SEAF Fleet/ }));
    expect(useSettingsStore.getState().theme).toBe("seaf");
    expect(JSON.parse(localStorage.getItem("super-tracker:settings")).state.theme).toBe("seaf");
    expect(screen.getByText("Version").parentElement).toHaveTextContent(/v\d+\.\d+\.\d+/);
  });
});
