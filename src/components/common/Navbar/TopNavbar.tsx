import { useRequests } from "@/Providers/RequestsContext";
import { useUser } from "@/Providers/UserProvider";
import bg from "@/assets/defaultimage.jpg";
import {
  Bell,
  BellRing,
  ClipboardCheck,
  Hand,
  LogOut,
  Menu,
  User,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

export default function TopNavbar() {
  const { user, loading, error } = useUser();
  const navigate = useNavigate();

  const handleNavigate = (route: string) => {
    navigate(route);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("login");
  };

  const NavbarProfile = ({
    user,
    onLogout,
    onNavigate,
  }: {
    user: any;
    onLogout: () => void;
    onNavigate: (route: string) => void;
  }) => (
    <div className="flex gap-4 items-center justify-center ml-auto">
      <Bell />
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none">
          <ProfilePicture user={user} />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white min-w-40 max-w-60 shadow-lg rounded-lg mr-2 border-gray-200 px-2 py-2">
          <DropdownMenuItem
            onClick={() => onNavigate("user")}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-black focus:outline-none cursor-pointer"
          >
            <User className="w-5 h-5" />
            <span>Profile</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 hover:bg-red-600 hover:text-white cursor-pointer text-red-600 rounded-b-md"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  const ProfilePicture = ({ user }: { user: any }) => (
    <div className="rounded-full w-10 h-10 hover:opacity-90 transition">
      <img
        src={user?.profile_picture || bg}
        alt="User profile"
        className="w-full h-full rounded-full object-cover focus:outline-none"
      />
    </div>
  );

  return (
    <>
      <div className="h-full w-full flex justify-between items-center">
        <div>
          <span className="text-sm font-semibold capitalize text-stone-800 block">
            {user?.username}
          </span>
          <span className="text-xs block capitalize text-stone-500  capitalize">
            {user?.email}
          </span>
        </div>

        {/* <button className="flex text-sm items-center gap-2 bg-stone-100 transition-colors hover:bg-violet-100 hover:text-violet-700 px-3 py-1.5 rounded">
          <Calendar />
          <span>Prev 6 Months</span>
        </button> */}
        <NavbarProfile
          user={user}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
      </div>
    </>
  );
}
