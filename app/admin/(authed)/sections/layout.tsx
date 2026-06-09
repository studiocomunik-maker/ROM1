import SectionsNav from "./SectionsNav";

export default function SectionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
      <SectionsNav />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
