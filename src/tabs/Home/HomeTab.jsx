import { BalanceView, BountyView, MajorOrdersView, OverviewView } from "./HomeViews";

// Inner tab -> view. "Galactic News" is the overview from design/01-home.png with the full feed below it.
const VIEWS = {
  "galactic-news": OverviewView,
  "major-orders": MajorOrdersView,
  "balance-tracker": BalanceView,
  "bounty-board": BountyView,
};

export default function HomeTab({ subtab }) {
  const View = VIEWS[subtab.id];
  return <View />;
}
