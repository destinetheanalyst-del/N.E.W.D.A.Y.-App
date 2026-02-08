import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { DriverSplash } from "./components/driver/DriverSplash";
import { DriverLogin } from "./components/driver/DriverLogin";
import { DriverSignUp } from "./components/driver/DriverSignUp";
import { DriverOTP } from "./components/driver/DriverOTP";
import { DriverHome } from "./components/driver/DriverHome";
import { DriverSenderDetails } from "./components/driver/DriverSenderDetails";
import { DriverItemDetails } from "./components/driver/DriverItemDetails";
import { DriverReceiverDetails } from "./components/driver/DriverReceiverDetails";
import { DriverParcelConfirmation } from "./components/driver/DriverParcelConfirmation";

import { OfficialSplash } from "./components/official/OfficialSplash";
import { OfficialLogin } from "./components/official/OfficialLogin";
import { OfficialSignUp } from "./components/official/OfficialSignUp";
import { OfficialOTP } from "./components/official/OfficialOTP";
import { OfficialHome } from "./components/official/OfficialHome";
import { TrackParcel } from "./components/official/TrackParcel";
import { ParcelDetails } from "./components/official/ParcelDetails";
import { LandingPage } from "./components/LandingPage";
import { ConnectionTest } from "./components/ConnectionTest";

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    children: [
      {
        path: "/",
        Component: LandingPage,
      },
      {
        path: "/diagnostics",
        Component: ConnectionTest,
      },
      {
        path: "/driver",
        children: [
          { index: true, Component: DriverSplash },
          { path: "login", Component: DriverLogin },
          { path: "signup", Component: DriverSignUp },
          { path: "otp", Component: DriverOTP },
          { path: "home", Component: DriverHome },
          { path: "register/sender", Component: DriverSenderDetails },
          { path: "register/items", Component: DriverItemDetails },
          { path: "register/receiver", Component: DriverReceiverDetails },
          { path: "confirmation", Component: DriverParcelConfirmation },
          { path: "diagnostics", Component: ConnectionTest },
        ],
      },
      {
        path: "/official",
        children: [
          { index: true, Component: OfficialSplash },
          { path: "login", Component: OfficialLogin },
          { path: "signup", Component: OfficialSignUp },
          { path: "otp", Component: OfficialOTP },
          { path: "home", Component: OfficialHome },
          { path: "track", Component: TrackParcel },
          { path: "details/:id", Component: ParcelDetails },
        ],
      },
    ],
  },
]);