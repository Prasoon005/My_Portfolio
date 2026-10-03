/** Left, right and top scrims, plus a bottom one on phones where the headline sits low. Center stays clear. */
export default function Scrims() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="scrim-left absolute inset-y-0 left-0 hidden w-[52%] md:block" />
      <div className="scrim-right absolute inset-y-0 right-0 hidden w-[24%] md:block" />
      <div className="scrim-top absolute inset-x-0 top-0 h-[22svh]" />
      <div className="scrim-bottom absolute inset-x-0 bottom-0 h-[45svh] md:hidden" />
    </div>
  );
}
