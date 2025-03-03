import { createBrowserRouter, RouteObject } from "react-router-dom";
import AuthLayout from "./Layout/AuthLayout";
import MainLayout from "./Layout/MainLayout";
import Dashboard from "./Pages/DashboardContent";

import { PopoverDemo } from "./Pages/PopoverDemo";
import RaiseNFA from "./Pages/Raisenfa";
import SeeNfa from "./Pages/SeeNfa";
import { RequestsProvider } from "./Providers/RequestsContext";
import SeachNfa from "./Pages/SearchNfa";
import ApprovalScreen from "./Pages/ApprovalScreen";
import Allnfa from "./Pages/Allnfa";

const routes: RouteObject[] = [
  { path: "/login", element: <AuthLayout /> },
  {
    path: "/",
    element: (
      <RequestsProvider>
        <MainLayout />
      </RequestsProvider>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "raisenfa", element: <RaiseNFA /> },
      { path: "nfa/:noteid", element: <SeeNfa /> },
      { path: "popover", element: <PopoverDemo /> },
      { path: "mynfa", element: <SeachNfa /> },
      { path: "allnfa", element: <Allnfa /> },
      { path: "approvals", element: <ApprovalScreen /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
export default routes;
