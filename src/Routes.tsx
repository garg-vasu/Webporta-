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
import { UserProvider } from "./Providers/UserProvider";
import PrivateRoute from "./PrivateRoute";

const routes: RouteObject[] = [
  {
    path: "/login",
    element: <AuthLayout />,
  },
  {
    path: "/",
    element: (
      <PrivateRoute>
        {/* <UserProvider> -- If you wish to wrap in your own UserProvider */}
        <RequestsProvider>
          <MainLayout />
        </RequestsProvider>
        {/* </UserProvider> */}
      </PrivateRoute>
    ),
    children: [
      // Dashboard is shown by default at "/"
      {
        index: true,
        element: <Dashboard />,
      },
      // CREATE a new NFA
      {
        path: "raisenfa",
        element: <RaiseNFA />,
      },
      // EDIT an existing NFA
      {
        path: "editnfa/:id",
        element: <RaiseNFA />,
      },
      // View NFA details
      {
        path: "nfa/:noteid",
        element: <SeeNfa />,
      },
      {
        path: "popover",
        element: <PopoverDemo />,
      },
      {
        path: "mynfa",
        element: <SeachNfa />,
      },
      {
        path: "allnfa",
        element: <Allnfa />,
      },
      {
        path: "approvals",
        element: <ApprovalScreen />,
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
export default routes;
