import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

// Stores
import useThemeStore from './store/themeStore';
import useCartStore from './store/cartStore';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ErrorBoundary from './components/common/ErrorBoundary';
import DashboardLayout from './components/dashboard/DashboardLayout';

// Store Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import { About, Contact, Terms, Privacy } from './pages/StaticPages';

// Dashboard Pages
import DashboardLogin from './pages/dashboard/DashboardLogin';
import DashboardHome from './pages/dashboard/DashboardHome';
import DashboardCategories from './pages/dashboard/DashboardCategories';
import DashboardBrands from './pages/dashboard/DashboardBrands';
import DashboardProducts from './pages/dashboard/DashboardProducts';
import ProductEdit from './pages/dashboard/ProductEdit';
import DashboardOrders from './pages/dashboard/DashboardOrders';
import DashboardCustomers from './pages/dashboard/DashboardCustomers';
import DashboardCMS from './pages/dashboard/DashboardCMS';
import DashboardCoupons from './pages/dashboard/DashboardCoupons';
import DashboardSettings from './pages/dashboard/DashboardSettings';
import DashboardAnalytics from './pages/dashboard/DashboardAnalytics';

// Protected Route for Admin
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  if (!token || !user || !user.is_staff) {
    return <Navigate to="/dashboard/login" replace />;
  }

  return children ? children : <Outlet />;
};

// Store Layout
const StoreLayout = () => {
  const fetchCart = useCartStore(state => state.fetchCart);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <div className="min-h-screen flex flex-col bg-cream-50 dark:bg-dark-900 text-text-primary dark:text-cream-50 font-tajawal transition-colors duration-300">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  const { isDark } = useThemeStore();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <Router>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: isDark ? '#1F1F1F' : '#fff',
            color: isDark ? '#fff' : '#000',
            direction: 'rtl',
            fontFamily: 'Tajawal, sans-serif'
          },
        }}
      />
      <ErrorBoundary>
        <Routes>
          {/* Public Store Routes */}
          <Route element={<StoreLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/track" element={<OrderTracking />} />

            {/* Static Pages */}
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
          </Route>

          {/* Dashboard Routes */}
          <Route path="/dashboard/login" element={<DashboardLogin />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardHome />} />
            <Route path="categories" element={<DashboardCategories />} />
            <Route path="brands" element={<DashboardBrands />} />
            <Route path="products" element={<DashboardProducts />} />
            <Route path="product/new" element={<ProductEdit />} />
            <Route path="product/edit/:id" element={<ProductEdit />} />
            <Route path="orders" element={<DashboardOrders />} />
            <Route path="customers" element={<DashboardCustomers />} />
            <Route path="analytics" element={<DashboardAnalytics />} />
            <Route path="cms" element={<DashboardCMS />} />
            <Route path="coupons" element={<DashboardCoupons />} />
            <Route path="settings" element={<DashboardSettings />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
