import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useSettingsStore } from "../store/useSettingsStore";
import FirstRunScreen from "./FirstRunScreen";
import { requiredVersions } from "./legalText";
import { LEGAL } from "./useLegal";

const renderScreen = () =>
  render(
    <MemoryRouter>
      <FirstRunScreen />
    </MemoryRouter>,
  );

describe("FirstRunScreen", () => {
  beforeEach(() => useSettingsStore.setState({ legal: null }));

  it("keeps ENLIST disabled until both boxes are checked, then stores the accepted versions", () => {
    renderScreen();
    const enlist = screen.getByRole("button", { name: "Enlist" });
    expect(enlist).toBeDisabled();

    fireEvent.click(screen.getByLabelText("I am 18 or older"));
    expect(enlist).toBeDisabled();
    fireEvent.click(screen.getByLabelText(/I accept the Terms of Use/));
    expect(enlist).toBeEnabled();

    fireEvent.click(enlist);
    const { legal } = useSettingsStore.getState();
    expect(legal.ageConfirmed).toBe(true);
    expect(legal.accepted).toEqual(requiredVersions(LEGAL.docs));
    expect(Date.parse(legal.acceptedAt)).not.toBeNaN();
  });

  it("names the documents that changed since the last acceptance", () => {
    useSettingsStore.setState({
      legal: { ageConfirmed: true, accepted: { ...requiredVersions(LEGAL.docs), terms: 0 }, acceptedAt: "2026-01-01T00:00:00Z" },
    });
    renderScreen();
    expect(screen.getByText(/Terms of Use changed/)).toBeInTheDocument();
  });

  it("opens a full document from the summary", () => {
    renderScreen();
    fireEvent.click(screen.getByRole("button", { name: "Treason & Bounty Roleplay Notice" }));
    expect(screen.getByRole("heading", { name: "Treason & Bounty Roleplay Notice", hidden: true })).toBeInTheDocument();
    expect(screen.getByText("Judge gameplay, not people.")).toBeInTheDocument();
  });
});
