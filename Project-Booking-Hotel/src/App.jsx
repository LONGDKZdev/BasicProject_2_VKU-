import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Footer, Header, ProtectedRoute } from "./components";
import ChatBox from "./components/chatBox";
import {
  Home,
  RoomDetails,
  Admin,
  Login,
  Register,
  ForgotPassword,
  ResetPassword,
  RoomsPage,
  Contact,
  UserDashboard,
  RestaurantPage,
  SpaPage,
  CleanupPage,
  NotFound404,
  AuthCallback,
  SetPassword,
} from "./pages";
import "./style/chatbox.css";

const AppContent = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");
  const isLoginPage =
    location.pathname === "/login" || location.pathname === "/admin/login";
  const isRegisterPage = location.pathname === "/register";
  const isForgotPasswordPage = location.pathname === "/forgot-password";
  const isResetPasswordPage = location.pathname === "/reset-password";
  const isSetPasswordPage = location.pathname === "/set-password";
  const isUserDashboardPage = location.pathname === "/account";
  const shouldHideHeaderFooter =
    isAdminPage ||
    isLoginPage ||
    isRegisterPage ||
    isForgotPasswordPage ||
    isResetPasswordPage ||
    isSetPasswordPage ||
    isUserDashboardPage;

  return (
    <>
      {!shouldHideHeaderFooter && <Header />}

      <Routes>
        <Route path={"/"} element={<Home />} />
        <Route path={"/room/:id"} element={<RoomDetails />} />
        <Route path={"/rooms"} element={<RoomsPage />} />
        <Route path={"/restaurant"} element={<RestaurantPage />} />
        <Route path={"/spa"} element={<SpaPage />} />
        <Route path={"/contact"} element={<Contact />} />
        <Route
          path={"/account"}
          element={
            <ProtectedRoute redirectTo="/login" disallowAdmin={true}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route path={"/login"} element={<Login />} />
        <Route path={"/register"} element={<Register />} />
        <Route path={"/forgot-password"} element={<ForgotPassword />} />
        <Route path={"/reset-password"} element={<ResetPassword />} />
        <Route path={"/set-password"} element={<SetPassword />} />
        <Route path={"/auth/callback"} element={<AuthCallback />} />
        <Route path={"/admin/login"} element={<Login />} />
        <Route
          path={"/admin"}
          element={
            <ProtectedRoute requireAdmin={true} redirectTo="/admin/login">
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route path={"/cleanup"} element={<CleanupPage />} />
        <Route path={"*"} element={<NotFound404 />} />
      </Routes>

      {!shouldHideHeaderFooter && <Footer />}
      {!shouldHideHeaderFooter && <ChatBox />}
    </>
  );
};

const App = () => {
  return (
    <main className="">
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </main>
  );
};

export default App;
