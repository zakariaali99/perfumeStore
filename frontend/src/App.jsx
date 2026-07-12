import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import { About, Contact, Terms, Privacy } from './pages/StaticPages';
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import DashboardProducts from './pages/dashboard/DashboardProducts';
import ProductEdit from './pages/dashboard/ProductEdit';
import DashboardOrders from './pages/dashboard/DashboardOrders';
import DashboardCustomers from './pages/dashboard/DashboardCustomers';
import DashboardCMS from './pages/dashboard/DashboardCMS';
import DashboardCoupons from './pages/dashboard/DashboardCoupons';
import DashboardSettings from './pages/dashboard/DashboardSettings';
import DashboardAnalytics from './pages/dashboard/DashboardAnalytics';
import DashboardLogin from './pages/dashboard/DashboardLogin';
import { Toaster } from 'react-hot-toast';
import useThemeStore from './store/themeStore';
import useCartStore from './store/cartStore';
import { useEffect } from 'react';

// Protected Route for Admin
const ProtectedRoute = () => {
  const token = localStorage.getItem('access_token');
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  if (!token || !user || !user.is_staff) {
    return <Navigate to="/dashboard/login" replace />;
  }

  return <Outlet />;
};

// Layout wrapper to conditionally show header/footer
const AppLayout = ({ children }) => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const fetchCart = useCartStore(state => state.fetchCart);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <div className="min-h-screen flex flex-col">
      {!isDashboard && <Header />}
      <main className={isDashboard ? '' : 'flex-1'}>
        {children}
      </main>
      {!isDashboard && <Footer />}
      <Toaster position="bottom-center" />
    </div>
  );
};

function App() {
  const isDark = useThemeStore(state => state.isDark);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/track" element={<OrderTracking />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* Dashboard Route (Unprotected login) */}
          <Route path="/dashboard/login" element={<DashboardLogin />} />

          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="analytics" element={<DashboardAnalytics />} />
              <Route path="products" element={<DashboardProducts />} />
              <Route path="products/new" element={<ProductEdit />} />
              <Route path="products/edit/:id" element={<ProductEdit />} />
              <Route path="orders" element={<DashboardOrders />} />
              <Route path="customers" element={<DashboardCustomers />} />
              <Route path="cms" element={<DashboardCMS />} />
              <Route path="coupons" element={<DashboardCoupons />} />
              <Route path="settings" element={<DashboardSettings />} />
            </Route>
          </Route>
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
