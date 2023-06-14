import { Bank } from "./components/Bank";
import { Branch } from "./components/Branch";
import { Home } from "./components/Home";

const AppRoutes = [
  {
    index: true,
    element: <Home />,
  },
  {
    path: "/bank",
    element: <Bank />,
  },
  {
    path: "/branch",
    element: <Branch />,
  },
];

export default AppRoutes;
