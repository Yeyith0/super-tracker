/**
 * Page header strip: mono breadcrumb ("04 // LOADOUT BAY"), big uppercase title and, on the right,
 * the inner tabs (underline tabs sit on the bottom rule, chip tabs are vertically aligned with the title).
 */
export default function PageHeader({ tab, tabs, right }) {
  const chips = tab.subtabVariant === "chips";
  const titleColor = tab.titleTone === "danger" ? "text-danger-text" : "text-accent";

  return (
    <header className="flex min-h-[92px] flex-wrap items-end justify-between gap-x-8 border-b border-line bg-strip px-8 pt-5">
      <div className="pb-5">
        <p className="hud-label text-text-2">
          {tab.number} // {tab.breadcrumb}
        </p>
        <h1 className={`mt-2 text-[30px] font-bold uppercase leading-none tracking-[0.04em] ${titleColor}`}>{tab.title}</h1>
      </div>
      {tabs ? <div className={chips ? "mb-5" : ""}>{tabs}</div> : null}
      {right ? <div className="mb-5">{right}</div> : null}
    </header>
  );
}
