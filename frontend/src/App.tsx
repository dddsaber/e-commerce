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
import HomePage from "./page/users/home/HomePage";
import ProductDetailPage from "./page/users/products/ProductDetailPage";
import OrdersManagePage from "./page/admin/order_management/OrdersManagePage";
import StorePage from "./page/users/store/StorePage";
import RegistStore from "./page/users/store/RegistStore";
import StoreManagement from "./page/users/store/StoreManagement";
import AllOrdersPage from "./page/users/store/orders/AllOrdersPage";
import CancelOrdersPage from "./page/users/store/orders/CancelOrdersPage";
import StoreProductsManagePage from "./page/users/store/shop/StoreProductsManagePage";
import StoreCampaignsPage from "./page/users/store/marketing/StoreCampaignsPage";
import StoreCouponsPage from "./page/users/store/marketing/StoreCouponsPage";
import StoreReviewsManagePage from "./page/users/store/customers-services/StoreReviewsManagePage";
import StoreChatPage from "./page/users/store/customers-services/StoreChatPage";
import StoreRevenuePage from "./page/users/store/finance/StoreRevenuePage";
import StoreBankAccountPage from "./page/users/store/finance/StoreBankAccountPage";
import StoreProfilePage from "./page/users/store/shop/StoreProfilePage";
import StoreDecorationPage from "./page/users/store/shop/StoreDecorationPage";
import UserProfilePage from "./page/users/profile/UserProfilePage";
import MyOrdersPage from "./page/users/orders/MyOrdersPage";
import SearchPage from "./page/users/home/SearchPage";
import DispatchedOrdersPage from "./page/users/store/orders/DispatchedOrdersPage";
import CreateOrdersPage from "./page/users/orders/CreateOrdersPage";
import PendingOrdersPage from "./page/users/store/orders/PendingOrdersPage";
import TableSkeleton from "./components/layout/TableSkeleton";
import UnAuthorizedPage from "./page/error/UnAuthorizedPage";
import NotFoundPage from "./page/error/NotFoundPage";
import SuccessOrdered from "./page/users/orders/SuccessOrdered";
import SettingLayoutPage from "./page/users/SettingLayoutPage";
import NotificationsPage from "./page/users/notification/NotificationsPage";
import UserAddressPage from "./page/users/profile/UserAddressPage";
import ChangePasswordPage from "./page/users/profile/ChangePasswordPage";
import StoreAddressPage from "./page/users/store/shop/StoreAddressPage";
import OrdersPage from "./page/users/store/orders/OrdersPage";
import StoresRevenuePage from "./page/admin/store_management/StoresRevenuePage";
import ChatPage from "./page/users/chat/ChatPage";
import "./App.css";
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
            path="chat"
            element={<PrivateRoute element={<ChatPage />} />}
          />
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
                requiredPermission={[TYPE_USER.admin]}
              />
            }
          />
          <Route
            path="stores-revenue"
            element={
              <PrivateRoute
                element={<StoresRevenuePage />}
                requiredPermission={[TYPE_USER.admin]}
              />
            }
          />
          <Route
            path=""
            element={
              <PrivateRoute
                element={<DashboardPage />}
                requiredPermission={[TYPE_USER.admin]}
              />
            }
          />
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
                requiredPermission={[TYPE_USER.admin]}
              />
            }
          />
          <Route
            path="manage-products"
            element={
              <PrivateRoute
                element={<ProductsManagePage />}
                requiredPermission={[TYPE_USER.admin]}
              />
            }
          />
          <Route
            path="manage-coupons"
            element={
              <PrivateRoute
                element={<CouponsManagePage />}
                requiredPermission={[TYPE_USER.admin]}
              />
            }
          />
          <Route
            path="manage-orders"
            element={
              <PrivateRoute
                element={<OrdersManagePage />}
                requiredPermission={[TYPE_USER.admin]}
              />
            }
          />
        </Route>

        {/* Users  */}
        <Route path="/" element={<LayoutPage />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/product/:productId" element={<ProductDetailPage />} />
          {/* not-done-yet */}
          <Route path="/store/:storeId" element={<StorePage />} />
          {/* not-done-yet */}
          <Route path="/search" element={<SearchPage />} />
          <Route path="/create-orders" element={<CreateOrdersPage />} />
          {/* not-done-yet */}
          <Route path="/success-create-order" element={<SuccessOrdered />} />
          <Route path="/test" element={<SettingLayoutPage />} />
          <Route path="/account" element={<SettingLayoutPage />}>
            {/* not-done-yet */}
            <Route path="profile" element={<UserProfilePage />} />
            {/* not-done-yet */}
            <Route path="notifications" element={<NotificationsPage />} />
            {/* not-done-yet */}
            <Route path="security" element={<SettingLayoutPage />} />
            {/* not-done-yet */}
            <Route path="manage-address" element={<UserAddressPage />} />
            <Route path="my-orders" element={<MyOrdersPage />} />
            <Route path="change-password" element={<ChangePasswordPage />} />
          </Route>
        </Route>

        {/* Sales  */}
        <Route path="/store-manage" element={<AdminLayoutPage />}>
          <Route
            path="chat"
            element={<PrivateRoute element={<ChatPage />} />}
          />
          {/* not-done-yet */}
          <Route path="dashboard" element={<StoreManagement />} />
          <Route path="all-orders" element={<AllOrdersPage />} />
          <Route path="pending-orders" element={<PendingOrdersPage />} />
          <Route path="dispatched-orders" element={<DispatchedOrdersPage />} />
          <Route path="cancel-orders" element={<CancelOrdersPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="products" element={<StoreProductsManagePage />} />
          <Route path="campaigns" element={<StoreCampaignsPage />} />
          <Route path="coupons" element={<StoreCouponsPage />} />
          <Route path="reviews" element={<StoreReviewsManagePage />} />
          {/* not-done-yet */}
          <Route path="chat" element={<StoreChatPage />} />
          {/* not-done-yet */}
          <Route path="revenue" element={<StoreRevenuePage />} />
          {/* not-done-yet */}
          <Route path="bank-account" element={<StoreBankAccountPage />} />
          <Route path="shop-profile" element={<StoreProfilePage />} />
          {/* not-done-yet */}
          <Route path="shop-decoration" element={<StoreDecorationPage />} />
          {/* not-done-yet */}
          <Route path="shop-address" element={<StoreAddressPage />} />
          <Route path="skeleton" element={<TableSkeleton />} />
        </Route>
        <Route path="/regist-store" element={<RegistStore />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/logout" element={<LogoutPage userId={userId} />} />
        <Route path="/unauthorized" element={<UnAuthorizedPage />} />
        <Route path="/not-found" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
