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

import { UserProvider } from "./Providers/UserProvider";
import PrivateRoute from "./PrivateRoute";
import Reinitiatenfa from "./Pages/ReInitiatenfa";

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
        <UserProvider>
          <RequestsProvider>
            <MainLayout />
          </RequestsProvider>
        </UserProvider>
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
      {
        path: "reRe-initiate/:id",
        element: <Reinitiatenfa />,
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
        path: "approvals",
        element: <ApprovalScreen />,
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
export default routes;
