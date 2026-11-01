import { Navigate, useLocation, useParams } from "react-router-dom";
import { useFeature } from "../../content/useContentStore";
import { tabPath } from "../../tabs/tabs";
import Badge from "../Badge";
import FeatureClosed from "../FeatureClosed";
import SubTabs from "../SubTabs";
import PageHeader from "./PageHeader";
import ProfileBar from "./ProfileBar";

/**
 * One top-level tab: header + body. The inner tab is part of the route (#/home/major-orders);
 * a missing or unknown inner tab redirects to the first one. A tab behind a feature flag that is off shows
 * the UNDER CONSTRUCTION screen in release builds and a "FLAG OFF" badge in dev builds.
 */
export default function TabPage({ tab, component: Component }) {
  const { subtab } = useParams();
  const { search } = useLocation();
  const featureOn = useFeature(tab.feature);
  const subtabs = tab.subtabs;

  if (!featureOn && import.meta.env.PROD) return <FeatureClosed tab={tab} />;

  if (subtabs.length && !subtabs.some((s) => s.id === subtab)) {
    // Keep the query (e.g. #/arsenal?item=railgun from the Home tab) through the redirect.
    return <Navigate to={{ pathname: tabPath(tab, subtabs[0].id), search }} replace />;
  }
  if (!subtabs.length && subtab) {
    return <Navigate to={tabPath(tab)} replace />;
  }

  const active = subtabs.find((s) => s.id === subtab) ?? null;
  const nav = subtabs.length ? (
    <SubTabs
      tabs={subtabs}
      active={subtab}
      hrefFor={(s) => tabPath(tab, s.id)}
      label={`${tab.label} sections`}
      variant={tab.subtabVariant}
    />
  ) : null;
  const flagBadge = featureOn ? null : <Badge tone="outline">Flag off</Badge>;

  return (
    <>
      {tab.header === "profile" ? (
        <>
          <ProfileBar />
          <h1 className="sr-only">{tab.title}</h1>
          <div className="border-b border-line px-8">{nav}</div>
        </>
      ) : (
        <PageHeader tab={tab} tabs={nav} right={flagBadge} />
      )}
      <div className="px-8 pb-10 pt-7">
        <Component tab={tab} subtab={active} />
      </div>
    </>
  );
}
