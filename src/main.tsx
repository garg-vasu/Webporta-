import { createRoot } from "react-dom/client";
import "./index.css";

import { RouterProvider } from "react-router-dom";
import { router } from "./Routes.tsx";

createRoot(document.getElementById("root")!).render(
  <div className="text-stone-950 bg-stone-100">
    <RouterProvider router={router}></RouterProvider>
  </div>
);
