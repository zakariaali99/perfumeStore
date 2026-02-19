import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, Search, Bell, Menu
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';

const SidebarLink = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-gold-500 text-white shadow-lg shadow-gold-100' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
        }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
};

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="flex bg-gray-50 min-h-screen font-tajawal relative" dir="rtl">
        {/* Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`w-72 bg-white border-l border-gray-100 p-6 flex flex-col fixed h-full z-30 transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-[100%]'}`}>
          <div className="mb-10 px-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
              <img src="/logo.png" alt="عطور مصطفى" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">عطور مصطفى</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">ADMIN PANEL</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            <SidebarLink to="/" icon={<LayoutDashboard size={20} />} label="الرئيسية" />
            <SidebarLink to="/categories" icon={<Menu size={20} />} label="الفئات" />
            <SidebarLink to="/products" icon={<Package size={20} />} label="المنتجات" />
            <SidebarLink to="/orders" icon={<ShoppingCart size={20} />} label="الطلبات" />
            <SidebarLink to="/customers" icon={<Users size={20} />} label="العملاء (CRM)" />
            <SidebarLink to="/settings" icon={<Settings size={20} />} label="الإعدادات" />
          </nav>

          <div className="pt-6 border-t border-gray-100">
            <button className="flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 w-full transition-colors">
              <LogOut size={20} />
              <span className="font-medium">تسجيل الخروج</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:mr-72 min-w-0">
          {/* Topbar */}
          <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 text-gray-500 hover:bg-gray-50 rounded-xl md:hidden"
              >
                <Menu size={24} />
              </button>
              <div className="relative w-48 sm:w-64 md:w-96">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="بحث..."
                  className="w-full bg-gray-50 border-none rounded-2xl py-2.5 pr-12 pl-4 focus:ring-2 focus:ring-gold-500 transition-all text-sm"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 md:space-x-6 space-x-reverse">
              <button className="relative p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="flex items-center space-x-3 space-x-reverse border-r border-gray-100 pr-3 md:pr-6 whitespace-nowrap">
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-bold text-gray-900">مصطفى محمد</div>
                  <div className="text-[10px] text-gray-500">المدير العام</div>
                </div>
                <div className="w-10 h-10 bg-gold-100 rounded-xl flex items-center justify-center text-gold-600 font-bold">م</div>
              </div>
            </div>
          </header>

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/products" element={<div className="p-8">صفحة إدارة المنتجات قيد التطوير</div>} />
            <Route path="/orders" element={<div className="p-8">صفحة إدارة الطلبات قيد التطوير</div>} />
            <Route path="/customers" element={<div className="p-8">صفحة العملاء CRM قيد التطوير</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
