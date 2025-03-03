import { Calendar } from "lucide-react";

export default function TopNavbar() {
  return (
    <>
      <div className="h-full w-full flex justify-between items-center">
        <div>
          <span className="text-sm font-semibold text-stone-800 block">
            Vasu
          </span>
          <span className="text-xs block text-stone-500  capitalize">
            Intern
          </span>
        </div>

        <button className="flex text-sm items-center gap-2 bg-stone-100 transition-colors hover:bg-violet-100 hover:text-violet-700 px-3 py-1.5 rounded">
          <Calendar />
          <span>Prev 6 Months</span>
        </button>
      </div>
    </>
  );
}
