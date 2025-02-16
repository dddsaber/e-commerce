import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import UsersManagePage from "./page/admin/user_management/UsersManagePage";
import AdminLayoutPage from "./page/admin/AdminLayoutPage";
import LoginPage from "./page/auth/LoginPage";
import { logoutAuth, reloginAuth } from "./redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { ReactElement, useEffect } from "react";
import { AppDispatch, RootState } from "./redux/store";
import DashboardPage from "./page/admin/dashboard/DashboardPage";
import StoresManagePage from "./page/admin/store_management/StoresManagePage";
import CategoryManagePage from "./page/admin/category_management/CategoryManagePage";
import RegisterPage from "./page/auth/RegisterPage";
import ReportsManagePage from "./page/admin/report_management/ReportsManagePage";
import ReviewsManagePage from "./page/admin/review_management/ReviewsManagePage";
import ProductsManagePage from "./page/admin/product_management/ProductsManagePage";
import CouponsManagePage from "./page/admin/coupon_management/CouponManagePage";
import LayoutPage from "./page/users/LayoutPage";
import { TYPE_USER } from "./utils/constant";
import CartPage from "./page/users/cart/CartPage";

interface PrivateRouteProps {
  element: ReactElement;
  requiredPermission?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  element,
  requiredPermission = [],
}) => {
  const role = useSelector((state: RootState) => state.auth?.user?.role);
  const loading = useSelector((state: RootState) => state.auth?.loading);
  const hasPermission =
    requiredPermission.length === 0 || requiredPermission.includes(role);

  return hasPermission || loading ? (
    element
  ) : (
    <Navigate
      to="/unauthorized"
      replace
      state={{ from: window.location.pathname }}
    />
  );
};

interface LogoutPageProps {
  userId: string;
}

const LogoutPage: React.FC<LogoutPageProps> = ({ userId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  useEffect(() => {
    if (userId) {
      dispatch(logoutAuth(userId));
      navigate("/login", { replace: true });
    }
  }, [dispatch, userId]);

  return <Navigate to="/" replace />;
};

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const userId = useSelector((state: RootState) => state.auth?.user?._id);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const refreshToken: string | null = localStorage.getItem("refreshToken");
    const path = window.location.pathname;
    console.log(userId, refreshToken);
    if (!userId && refreshToken) {
      dispatch(reloginAuth({ refreshToken }));
    } else if (!token) {
      if (!refreshToken) {
        const allowedPaths = [
          "/login",
          "/register",
          "/forgot-password",
          "/change-password",
        ];
        if (!allowedPaths.some((p) => path.startsWith(p))) {
          navigate("/login", { replace: true });
        }
      } else {
        dispatch(reloginAuth({ refreshToken }));
      }
    }
  }, [dispatch, navigate, userId]);
  return (
    <>
      <Routes>
        <Route path="/admin" element={<AdminLayoutPage />}>
          <Route
            path="manage-users"
            element={
              <PrivateRoute
                element={<UsersManagePage />}
                requiredPermission={[TYPE_USER.admin]}
              />
            }
          />
          <Route
            path="manage-stores"
            element={
              <PrivateRoute
                element={<StoresManagePage />}
                requiredPermission={[TYPE_USER.admin, TYPE_USER.sales]}
              />
            }
          />
          <Route path="" element={<DashboardPage />} />
          <Route
            path="manage-category"
            element={
              <PrivateRoute
                element={<CategoryManagePage />}
                requiredPermission={[TYPE_USER.admin]}
              />
            }
          />
          <Route
            path="manage-reports"
            element={
              <PrivateRoute
                element={<ReportsManagePage />}
                requiredPermission={[TYPE_USER.admin]}
              />
            }
          />
          <Route
            path="manage-reviews"
            element={
              <PrivateRoute
                element={<ReviewsManagePage />}
                requiredPermission={[TYPE_USER.admin, TYPE_USER.sales]}
              />
            }
          />
          <Route
            path="manage-products"
            element={
              <PrivateRoute
                element={<ProductsManagePage />}
                requiredPermission={[TYPE_USER.admin, TYPE_USER.sales]}
              />
            }
          />
          <Route
            path="manage-coupons"
            element={
              <PrivateRoute
                element={<CouponsManagePage />}
                requiredPermission={[TYPE_USER.admin, TYPE_USER.sales]}
              />
            }
          />
        </Route>
        <Route path="/" element={<LayoutPage />}>
          <Route path="" element={<UsersManagePage />} />
          <Route path="cart" element={<CartPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/logout" element={<LogoutPage userId={userId} />} />
        <Route path="/home" element={<p>Hello</p>} />
      </Routes>
    </>
  );
}

export default App;
