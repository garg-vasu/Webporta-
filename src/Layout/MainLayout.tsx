import Dashboard from "@/components/common/Dashboard/Dashboard";
import SideBar from "@/components/common/Sidebar/Sidebar";

export default function MainLayout() {
  return (
    <>
      <div className="h-full w-full gap-4 p-4 flex text-stone-950 bg-stone-100">
        <SideBar />
        <div className="flex -1 h-[100vh] w-full overflow-hidden">
          <Dashboard />
        </div>
      </div>
    </>
  );
}
