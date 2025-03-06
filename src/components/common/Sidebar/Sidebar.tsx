import {
  ArrowLeft,
  ArrowRight,
  ArrowUpFromLine,
  Signature,
  Search,
  House,
  ScrollText,
} from "lucide-react";
import bg from "../../../assets/splash-icon.png";
import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

interface MenuItem {
  name: string;
  icon: React.ComponentType<any>;
  to?: string;
  pages?: MenuItem[];
}

export interface ProjectView {
  project_id: number;
  name: string;
  logo: string;
}

const menuItem: MenuItem[] = [
  { name: "Dashboard", icon: House, to: "/" },
  {
    name: "My NFA",
    icon: ScrollText,
    to: "/mynfa",
  },
  {
    name: "Raise NFA",
    icon: ArrowUpFromLine,
    to: "/raisenfa",
    // pages: [
    //   { name: "Tenant", icon: UserRoundCheck, to: "/tenant" },
    //   {
    //     name: "Create Tenant",
    //     icon: BadgePlus,
    //     to: "/addtenant",
    //   },
    // ],
  },
  // { name: "Search NFA", icon: Search, to: "/allnfa" },
  {
    name: "Approvals",
    icon: Signature,
    to: "/approvals",

    // pages: [
    //   { name: "Roles", icon: SquareChevronRight, to: "/setting" },
    //   { name: "Template", icon: SquareChevronRight, to: "/template" },
    // ],
  },
];

export default function SideBar() {
  const [selectedProject, setSelectedProject] = useState({
    name: "Dashboard",
    logo: "https://github.com/shadcn.png", // Default dashboard image
  });

  const navigate = useNavigate();

  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [submenuActive, setSubmenuActive] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const currentPath = location.pathname;

    // Find the active menu and submenu index based on the current path
    const activeMenuIndex = menuItem.findIndex((menu) =>
      menu.pages?.some((page) => page.to === currentPath)
    );

    const activeSubMenu = menuItem[activeMenuIndex]?.pages?.find(
      (page) => page.to === currentPath
    );

    setActiveMenu(activeMenuIndex >= 0 ? activeMenuIndex : null);
    setSubmenuActive(activeSubMenu ? activeSubMenu.name : null);
  }, [location.pathname, menuItem]);

  const isActiveRoute = (item: MenuItem, pathname: string): boolean => {
    if (item?.to === pathname) return true;
    if (item.pages)
      return item.pages.some((page) => isActiveRoute(page, pathname));
    return false;
  };

  return (
    <aside
      className={`hidden md:flex  flex-col justify-between bg-gray-100 shadow-lg transition-all rounded-lg duration-300 ease-in-out ${
        isCollapsed ? "md:w-14" : "md:w-65"
      }`}
    >
      <div className="rounded-lg">
        {/* LOGO SECTION */}
        {/* <div className="flex items-center justify-center h-16 bg-[#FFFAFA]">
          <Link
            to="/"
            className="text-xl font-bold flex items-center gap-2 justify-center"
          >
            <HardHat className="w-6 h-6" />
            {!isCollapsed && <span>Precast</span>}
          </Link>
        </div> */}
        <div className="flex h-16 rounded-lg items-center justify-center  bg-[#FFFAFA]">
          <div
            className={`transition-all duration-300  ${
              isCollapsed ? "w-8 h-8" : "w-20 h-12"
            }`}
          >
            <img
              onClick={() => {
                navigate("/");
              }}
              className="w-full h-full max-w-full max-h-full"
              src={bg}
            />
          </div>
        </div>

        {/* NAVIGATION MENU */}
        <nav className="mt-4">
          <ul className="space-y-2">
            {menuItem.map((menu, index) => (
              <li key={menu.name}>
                {menu.pages ? (
                  <div
                    onClick={() =>
                      setActiveMenu(activeMenu === index ? null : index)
                    }
                    className={`flex items-center p-3 cursor-pointer transition ${
                      isCollapsed ? "justify-center" : "gap-4"
                    } ${
                      (isCollapsed || activeMenu !== index) &&
                      isActiveRoute(menu, location.pathname)
                        ? "bg-blue-100"
                        : "hover:bg-gray-200"
                    }`}
                  >
                    <menu.icon className="w-6 h-6 text-gray-700" />
                    {!isCollapsed && <span>{menu.name}</span>}
                  </div>
                ) : (
                  <NavLink
                    to={menu.to || "/"}
                    className={({ isActive }) =>
                      `flex items-center p-3 ${
                        isCollapsed ? "justify-center" : "gap-4"
                      } rounded-md transition ${
                        isActive
                          ? "bg-blue-100 text-blue-500"
                          : "hover:bg-gray-200"
                      }`
                    }
                  >
                    <menu.icon className="w-6 h-6 text-gray-700" />
                    {!isCollapsed && <span>{menu.name}</span>}
                  </NavLink>
                )}
                {menu.pages && activeMenu === index && !isCollapsed && (
                  <ul className="pl-8 space-y-1">
                    {menu.pages.map((subMenu) => (
                      <li key={subMenu.name}>
                        <NavLink
                          to={subMenu.to || "/"}
                          className={({ isActive }) =>
                            `flex items-center p-2 rounded-md transition gap-4 ${
                              isActive || submenuActive === subMenu.name
                                ? "bg-blue-100 text-blue-500"
                                : "hover:bg-gray-200"
                            }`
                          }
                        >
                          <subMenu.icon className="w-5 h-5 text-gray-700" />
                          <span>{subMenu.name}</span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* COLLAPSE BUTTON */}
      <div className="px-4 py-6">
        <hr className="border-gray-300 mb-4" />
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`flex items-center justify-center gap-2 w-full py-2 rounded-md transition ${
            isCollapsed ? "bg-gray-200" : "bg-gray-100 hover:bg-gray-200"
          } text-gray-700`}
        >
          {isCollapsed ? (
            <ArrowRight className="w-5 h-5" />
          ) : (
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Collapse</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}

// // Example of menuItemsByRole structure

// import {
//   ArrowLeft,
//   ArrowRight,
//   BadgePlus,
//   House,
//   LayoutDashboardIcon,
//   Paperclip,
//   Settings,
//   SquareChevronRight,
//   UserRoundCheck,
//   Users,
// } from "lucide-react";
// import bg from "../../../assets/splash-icon.png";
// import { useEffect, useState } from "react";
// import { NavLink, useLocation } from "react-router-dom";

// interface MenuItem {
//   name: string;
//   icon: React.ComponentType<any>;
//   to?: string;
//   pages?: MenuItem[];
// }

// const menuItem: MenuItem[] = [
//   { name: "Dashboard", icon: House, to: "/dashboard" },
//   { name: "Projects", icon: LayoutDashboardIcon, to: "/project" },
//   {
//     name: "Tenants",
//     icon: Users,
//     pages: [
//       { name: "Tenant", icon: UserRoundCheck, to: "/tenant" },
//       { name: "Create Tenant", icon: BadgePlus, to: "/addtenant" },
//     ],
//   },
//   { name: "Reports", icon: Paperclip, to: "/reports" },
//   {
//     name: "Settings",
//     icon: Settings,
//     pages: [
//       { name: "Roles", icon: SquareChevronRight, to: "/setting" },
//       { name: "Template", icon: SquareChevronRight, to: "/template" },
//     ],
//   },
// ];

// export default function SideBar() {
//   const location = useLocation();
//   const [activeMenu, setActiveMenu] = useState<number | null>(null);
//   const [submenuActive, setSubmenuActive] = useState<string | null>(null);
//   const [isCollapsed, setIsCollapsed] = useState(false);

//   useEffect(() => {
//     const currentPath = location.pathname;
//     const activeMenuIndex = menuItem.findIndex((menu) =>
//       menu.pages?.some((page) => page.to === currentPath)
//     );
//     const activeSubMenu = menuItem[activeMenuIndex]?.pages?.find(
//       (page) => page.to === currentPath
//     );

//     setActiveMenu(activeMenuIndex >= 0 ? activeMenuIndex : null);
//     setSubmenuActive(activeSubMenu ? activeSubMenu.name : null);
//   }, [location.pathname]);

//   return (
//     <aside
//       className={`hidden md:flex flex-col bg-gray-100 shadow-lg transition-all duration-300 ease-in-out ${
//         isCollapsed ? "md:w-16" : "md:w-56"
//       }`}
//     >
//       {/* LOGO SECTION */}
//       <div className="flex items-center justify-center h-12 bg-[#FFFAFA] p-2">
//         <img
//           src={bg}
//           className={`transition-all duration-300 ${
//             isCollapsed ? "w-8 h-8" : "w-20 h-12"
//           }`}
//         />
//       </div>

//       {/* NAVIGATION MENU */}
//       <nav className="mt-4">
//         <ul className="space-y-1">
//           {menuItem.map((menu, index) => (
//             <li key={menu.name}>
//               {menu.pages ? (
//                 <div
//                   onClick={() =>
//                     setActiveMenu(activeMenu === index ? null : index)
//                   }
//                   className={`flex items-center p-2 cursor-pointer transition rounded-md gap-3 ${
//                     isCollapsed ? "justify-center" : ""
//                   } hover:bg-gray-200`}
//                 >
//                   <menu.icon className="w-5 h-5 text-gray-700" />
//                   {!isCollapsed && <span>{menu.name}</span>}
//                 </div>
//               ) : (
//                 <NavLink
//                   to={menu.to || "/"}
//                   className={({ isActive }) =>
//                     `flex items-center p-2 rounded-md transition gap-3 ${
//                       isCollapsed ? "justify-center" : ""
//                     } ${
//                       isActive
//                         ? "bg-blue-100 text-blue-500"
//                         : "hover:bg-gray-200"
//                     }`
//                   }
//                 >
//                   <menu.icon className="w-5 h-5 text-gray-700" />
//                   {!isCollapsed && <span>{menu.name}</span>}
//                 </NavLink>
//               )}
//               {menu.pages && activeMenu === index && !isCollapsed && (
//                 <ul className="pl-6 space-y-1">
//                   {menu.pages.map((subMenu) => (
//                     <li key={subMenu.name}>
//                       <NavLink
//                         to={subMenu.to || "/"}
//                         className={({ isActive }) =>
//                           `flex items-center p-2 rounded-md transition gap-3 ${
//                             isActive || submenuActive === subMenu.name
//                               ? "bg-blue-100 text-blue-500"
//                               : "hover:bg-gray-200"
//                           }`
//                         }
//                       >
//                         <subMenu.icon className="w-4 h-4 text-gray-700" />
//                         <span>{subMenu.name}</span>
//                       </NavLink>
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </li>
//           ))}
//         </ul>
//       </nav>

//       {/* COLLAPSE BUTTON */}
//       <div className="px-4 py-3">
//         <hr className="border-gray-300 mb-3" />
//         <button
//           onClick={() => setIsCollapsed(!isCollapsed)}
//           className="flex items-center justify-center gap-2 w-full py-2 rounded-md transition bg-gray-100 hover:bg-gray-200 text-gray-700"
//         >
//           {isCollapsed ? (
//             <ArrowRight className="w-5 h-5" />
//           ) : (
//             <ArrowLeft className="w-5 h-5" />
//           )}
//         </button>
//       </div>
//     </aside>
//   );
// }
