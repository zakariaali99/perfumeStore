import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dashboard/dashboard_page.dart';
import 'orders/orders_list_page.dart';
import 'products/products_list_page.dart';
import 'customers/customers_list_page.dart';
import 'settings/settings_page.dart';
import 'categories/categories_page.dart';
import 'brands/brands_page.dart';
import 'coupons/coupons_page.dart';
import 'cms/cms_page.dart';
import 'backup/backup_page.dart';
import '../theme/app_theme.dart';
import '../config/dimensions.dart';
import '../services/auth_service.dart';

class _DrawerItem {
  final IconData icon;
  final String label;
  final int? tabIndex;

  const _DrawerItem({required this.icon, required this.label, this.tabIndex});
}

class MainNavPage extends StatefulWidget {
  const MainNavPage({super.key});

  @override
  State<MainNavPage> createState() => _MainNavPageState();
}

class _MainNavPageState extends State<MainNavPage> {
  int _currentIndex = 0;
  bool _drawerOpen = false;

  static const _titles = ['لوحة التحكم', 'الطلبات', 'المنتجات', 'العملاء', 'الإعدادات'];
  static const _subtitles = [
    'نظرة عامة على المتجر',
    'إدارة الطلبات والتوصيل',
    'إدارة الكتالوج والمخزون',
    'إدارة العملاء والتواصل',
    'إعدادات المتجر',
  ];

  final List<_DrawerItem> _drawerItems = [
    _DrawerItem(icon: Icons.dashboard, label: 'لوحة التحكم', tabIndex: 0),
    _DrawerItem(icon: Icons.shopping_bag, label: 'الطلبات', tabIndex: 1),
    _DrawerItem(icon: Icons.inventory_2, label: 'المنتجات', tabIndex: 2),
    _DrawerItem(icon: Icons.people, label: 'العملاء', tabIndex: 3),
    _DrawerItem(icon: Icons.category, label: 'التصنيفات'),
    _DrawerItem(icon: Icons.branding_watermark, label: 'الماركات'),
    _DrawerItem(icon: Icons.local_offer, label: 'كوبونات الخصم'),
    _DrawerItem(icon: Icons.dashboard_customize, label: 'إدارة المحتوى'),
    _DrawerItem(icon: Icons.backup, label: 'النسخ الاحتياطي'),
    _DrawerItem(icon: Icons.settings, label: 'الإعدادات', tabIndex: 4),
  ];

  Widget _pageForType(_DrawerItem item) {
    switch (item.label) {
      case 'التصنيفات': return const CategoriesPage();
      case 'الماركات': return const BrandsPage();
      case 'كوبونات الخصم': return const CouponsPage();
      case 'إدارة المحتوى': return const CMSPage();
      case 'النسخ الاحتياطي': return const BackupPage();
      default: return const SettingsPage();
    }
  }

  final List<Widget> _pages = const [
    DashboardPage(),
    OrdersListPage(),
    ProductsListPage(),
    CustomersListPage(),
    SettingsPage(),
  ];

  void _openDrawerPage(Widget page) {
    setState(() => _drawerOpen = false);
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => page),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Stack(
      children: [
        Scaffold(
          body: SafeArea(
            child: Column(
              children: [
                _buildHeader(isDark),
                Expanded(
                  child: IndexedStack(
                    index: _currentIndex,
                    children: _pages,
                  ),
                ),
              ],
            ),
          ),
          bottomNavigationBar: Container(
            decoration: BoxDecoration(
              border: Border(
                top: BorderSide(
                  color: isDark ? AppColors.dark600 : AppColors.gold100,
                  width: 1,
                ),
              ),
            ),
            child: BottomNavigationBar(
              currentIndex: _currentIndex,
              onTap: (index) => setState(() => _currentIndex = index),
              backgroundColor: isDark ? AppColors.dark800 : AppColors.white,
              selectedItemColor: AppColors.gold500,
              unselectedItemColor: AppColors.textMuted,
              selectedFontSize: 11,
              unselectedFontSize: 11,
              selectedLabelStyle: GoogleFonts.tajawal(fontWeight: FontWeight.w900),
              unselectedLabelStyle: GoogleFonts.tajawal(fontWeight: FontWeight.w700),
              type: BottomNavigationBarType.fixed,
              items: const [
                BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), activeIcon: Icon(Icons.dashboard), label: 'الرئيسية'),
                BottomNavigationBarItem(icon: Icon(Icons.shopping_bag_outlined), activeIcon: Icon(Icons.shopping_bag), label: 'الطلبات'),
                BottomNavigationBarItem(icon: Icon(Icons.inventory_2_outlined), activeIcon: Icon(Icons.inventory_2), label: 'المنتجات'),
                BottomNavigationBarItem(icon: Icon(Icons.people_outline), activeIcon: Icon(Icons.people), label: 'العملاء'),
                BottomNavigationBarItem(icon: Icon(Icons.settings_outlined), activeIcon: Icon(Icons.settings), label: 'الإعدادات'),
              ],
            ),
          ),
        ),
        if (_drawerOpen)
          GestureDetector(
            onTap: () => setState(() => _drawerOpen = false),
            child: Container(color: Colors.black38),
          ),
        if (_drawerOpen)
          Align(
            alignment: Alignment.centerRight,
            child: _buildDrawer(isDark),
          ),
      ],
    );
  }

  Widget _buildDrawer(bool isDark) {
    return GestureDetector(
      onTap: () {},
      child: Container(
        width: MediaQuery.of(context).size.width * 0.75,
        height: double.infinity,
        decoration: BoxDecoration(
          color: isDark ? AppColors.dark800 : AppColors.white,
          border: Border(
            right: BorderSide(
              color: isDark ? AppColors.dark600 : AppColors.gold200,
              width: 1,
            ),
          ),
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                border: Border(
                  bottom: BorderSide(
                    color: isDark ? AppColors.dark600 : AppColors.gold100,
                  ),
                ),
              ),
              child: Column(
                children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      color: AppColors.gold500,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Icon(Icons.store, color: AppColors.white, size: 32),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'متجر مصطفى',
                    style: GoogleFonts.tajawal(
                      color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  Text(
                    'لوحة التحكم',
                    style: GoogleFonts.tajawal(
                      color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondary,
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: _drawerItems.map((item) {
                  final isActive = item.tabIndex != null && item.tabIndex == _currentIndex;
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 2),
                    child: Material(
                      color: Colors.transparent,
                      child: InkWell(
                        onTap: () {
                          if (item.tabIndex != null) {
                            setState(() {
                              _currentIndex = item.tabIndex!;
                              _drawerOpen = false;
                            });
                          } else {
                            _openDrawerPage(_pageForType(item));
                          }
                        },
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          decoration: BoxDecoration(
                            color: isActive ? AppColors.gold500 : Colors.transparent,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                item.icon,
                                size: 20,
                                color: isActive ? AppColors.white : (isDark ? AppColors.gold400 : AppColors.textSecondary),
                              ),
                              const SizedBox(width: 12),
                              Text(
                                item.label,
                                style: GoogleFonts.tajawal(
                                  color: isActive ? AppColors.white : (isDark ? AppColors.textPrimaryDark : AppColors.textPrimary),
                                  fontSize: 14,
                                  fontWeight: isActive ? FontWeight.w900 : FontWeight.w700,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                border: Border(
                  top: BorderSide(
                    color: isDark ? AppColors.dark600 : AppColors.gold100,
                  ),
                ),
              ),
              child: InkWell(
                onTap: () {
                  setState(() => _drawerOpen = false);
                  Get.find<AuthService>().logout();
                },
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Row(
                    children: [
                      Icon(Icons.logout, size: 20, color: AppColors.red600),
                      const SizedBox(width: 12),
                      Text(
                        'تسجيل الخروج',
                        style: GoogleFonts.tajawal(
                          color: AppColors.red600,
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: isDark ? AppColors.dark800 : AppColors.white,
        border: Border(
          bottom: BorderSide(
            color: isDark ? AppColors.dark600 : AppColors.gold100,
            width: 1,
          ),
        ),
      ),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => setState(() => _drawerOpen = !_drawerOpen),
            child: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: isDark ? AppColors.dark600 : AppColors.gray50,
                borderRadius: BorderRadius.circular(Dimens.radiusLg),
              ),
              child: Icon(
                Icons.menu,
                color: isDark ? AppColors.gold400 : AppColors.textSecondary,
                size: 20,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Text(
                  _titles[_currentIndex],
                  style: GoogleFonts.tajawal(
                    color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
                    fontSize: 15,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                Text(
                  _subtitles[_currentIndex],
                  style: GoogleFonts.tajawal(
                    color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondary,
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.gold50,
              borderRadius: BorderRadius.circular(Dimens.radiusLg),
            ),
            alignment: Alignment.center,
            child: Text(
              'AD',
              style: GoogleFonts.tajawal(
                color: AppColors.gold600,
                fontSize: 12,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
