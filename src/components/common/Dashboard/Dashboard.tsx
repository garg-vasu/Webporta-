import { Outlet } from "react-router-dom";
import TopNavbar from "../Navbar/TopNavbar";

export default function Dashboard() {
  return (
    <div className="bg-white rounded-lg flex flex-col h-full overflow-y-auto   shadow w-full ">
      <div className="h-16 w-full sticky mb-4 border-b border-slate-200 px-4">
        <TopNavbar />
      </div>

      <div className="w-full h-[calc(100vh-70px)] flex-grow px-4 ">
        <Outlet />
      </div>
    </div>
  );
}
