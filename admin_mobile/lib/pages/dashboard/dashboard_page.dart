import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../models/analytics_model.dart';
import '../../models/order_model.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/card_container.dart';
import '../../widgets/skeleton_loader.dart';
import '../../widgets/status_badge.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  bool _isLoading = true;
  AnalyticsStatsModel? _stats;
  List<OrderModel> _recentOrders = [];
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final apiService = Get.find<ApiService>();
      final results = await Future.wait([
        apiService.analytics.getStats(),
        apiService.orders.getOrders(page: 1),
      ]);

      final stats = results[0] as AnalyticsStatsModel;
      final ordersResponse = results[1];

      final List rawList = (ordersResponse is Map && ordersResponse.containsKey('results'))
          ? ordersResponse['results']
          : (ordersResponse is List ? ordersResponse : []);

      setState(() {
        _stats = stats;
        _recentOrders = rawList.take(5).map((e) => OrderModel.fromJson(e)).toList();
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'تعذر تحميل البيانات';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (_isLoading) {
      return RefreshIndicator(
        onRefresh: _fetchData,
        color: AppColors.gold500,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(16, 24, 16, 32),
          children: [
            _buildHeaderLoading(isDark),
            const SizedBox(height: 32),
            _buildStatsLoading(isDark),
            const SizedBox(height: 40),
            _buildTableLoading(isDark),
          ],
        ),
      );
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.cloud_off_rounded,
                size: 56,
                color: isDark ? AppColors.dark500 : AppColors.textMuted,
              ),
              const SizedBox(height: 16),
              Text(
                _error!,
                style: GoogleFonts.tajawal(
                  color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              SizedBox(
                height: 48,
                child: ElevatedButton.icon(
                  onPressed: _fetchData,
                  icon: const Icon(Icons.refresh_rounded, size: 18),
                  label: const Text('إعادة المحاولة'),
                ),
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _fetchData,
      color: AppColors.gold500,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 24, 16, 32),
        physics: const AlwaysScrollableScrollPhysics(),
        children: [
          _buildHeader(isDark),
          const SizedBox(height: 32),
          _buildStatGrid(isDark),
          const SizedBox(height: 40),
          _buildRecentOrders(isDark),
        ],
      ),
    );
  }

  Widget _buildHeaderLoading(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SkeletonLoader(height: 36, width: 200, borderRadius: 8),
        const SizedBox(height: 8),
        SkeletonLoader(height: 18, width: 160, borderRadius: 6),
      ],
    );
  }

  Widget _buildStatsLoading(bool isDark) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.25,
      children: List.generate(4, (_) => const CardSkeleton(height: 180)),
    );
  }

  Widget _buildTableLoading(bool isDark) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.dark700 : AppColors.white,
        borderRadius: BorderRadius.circular(40),
        border: Border.all(
          color: isDark ? AppColors.dark600 : AppColors.gold200,
          width: 1,
        ),
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(24),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                SkeletonLoader(height: 22, width: 120, borderRadius: 6),
                SkeletonLoader(height: 16, width: 80, borderRadius: 6),
              ],
            ),
          ),
          const TableSkeleton(rows: 5, columns: 5),
          const SizedBox(height: 8),
        ],
      ),
    );
  }

  Widget _buildHeader(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'لوحة التحكم',
          style: GoogleFonts.tajawal(
            fontSize: 30,
            fontWeight: FontWeight.w900,
            color: isDark ? AppColors.cream50 : AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'نظرة عامة على المتجر',
          style: GoogleFonts.tajawal(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: isDark ? AppColors.gold400 : AppColors.textSecondary,
          ),
        ),
      ],
    );
  }

  Widget _buildStatGrid(bool isDark) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.3,
      children: [
        _StatCard(
          isDark: isDark,
          title: 'إجمالي المبيعات',
          value: '${_stats!.totalRevenue.toStringAsFixed(2)} ر.س',
          icon: Icons.trending_up_rounded,
          iconBg: AppColors.green50,
          iconColor: AppColors.green600,
          trend: _stats!.revenueGrowth,
        ),
        _StatCard(
          isDark: isDark,
          title: 'الطلبات',
          value: '${_stats!.totalOrders}',
          icon: Icons.shopping_bag_rounded,
          iconBg: AppColors.gold50,
          iconColor: AppColors.gold600,
          trend: _stats!.ordersGrowth,
        ),
        _StatCard(
          isDark: isDark,
          title: 'العملاء',
          value: '${_stats!.totalCustomers}',
          icon: Icons.people_rounded,
          iconBg: AppColors.blue50,
          iconColor: AppColors.blue600,
          trend: _stats!.customersGrowth,
        ),
        _StatCard(
          isDark: isDark,
          title: 'المخزون المنخفض',
          value: '${_stats!.lowStockCount}',
          icon: Icons.warning_amber_rounded,
          iconBg: AppColors.purple50,
          iconColor: AppColors.purple600,
        ),
      ],
    );
  }

  Widget _buildRecentOrders(bool isDark) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.dark700 : AppColors.white,
        borderRadius: BorderRadius.circular(40),
        border: Border.all(
          color: isDark ? AppColors.dark600 : AppColors.gold200,
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.gold500.withValues(alpha: 0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
            decoration: BoxDecoration(
              border: Border(
                bottom: BorderSide(
                  color: isDark ? AppColors.dark600 : AppColors.gold100,
                  width: 1,
                ),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(Icons.access_time_rounded, size: 22, color: AppColors.gold500),
                    const SizedBox(width: 10),
                    Text(
                      'آخر الطلبات',
                      style: GoogleFonts.tajawal(
                        color: isDark ? AppColors.cream50 : AppColors.textPrimary,
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ],
                ),
                GestureDetector(
                  onTap: () => Get.toNamed('/orders'),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'عرض الكل',
                        style: GoogleFonts.tajawal(
                          color: isDark ? AppColors.gold400 : AppColors.gold600,
                          fontSize: 12,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Icon(
                        Icons.arrow_forward_ios,
                        size: 14,
                        color: isDark ? AppColors.gold400 : AppColors.gold600,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            color: isDark ? AppColors.dark800 : const Color(0xFFFAF9F6),
            child: Row(
              children: [
                _tableHeader('المعرف', flex: 2),
                _tableHeader('العميل', flex: 3),
                _tableHeader('المبلغ', flex: 2),
                _tableHeader('الحالة', flex: 2, align: TextAlign.left),
              ],
            ),
          ),
          if (_recentOrders.isEmpty)
            SizedBox(
              width: double.infinity,
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 48),
                child: Text(
                  'لا توجد طلبات حديثة',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.tajawal(
                    color: AppColors.textMuted,
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            )
          else
            ...List.generate(_recentOrders.length, (index) {
              final order = _recentOrders[index];
              final isLast = index == _recentOrders.length - 1;
              return Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 18),
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(
                      color: isLast
                          ? Colors.transparent
                          : (isDark ? AppColors.dark600 : AppColors.gold50),
                      width: 1,
                    ),
                  ),
                ),
                child: Row(
                  children: [
                    Expanded(
                      flex: 2,
                      child: Text(
                        '#${order.orderNumber}',
                        style: GoogleFonts.poppins(
                          color: AppColors.gold600,
                          fontSize: 13,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                    Expanded(
                      flex: 3,
                      child: Text(
                        order.customerName,
                        style: GoogleFonts.tajawal(
                          color: isDark ? AppColors.cream50 : AppColors.textPrimary,
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Expanded(
                      flex: 2,
                      child: Text(
                        '${order.total.toStringAsFixed(2)} ر.س',
                        style: GoogleFonts.poppins(
                          color: isDark ? AppColors.cream50 : AppColors.textPrimary,
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    Expanded(
                      flex: 2,
                      child: Align(
                        alignment: Alignment.centerLeft,
                        child: StatusBadge(status: order.status),
                      ),
                    ),
                  ],
                ),
              );
            }),
        ],
      ),
    );
  }

  Widget _tableHeader(String text, {int flex = 1, TextAlign align = TextAlign.right}) {
    return Expanded(
      flex: flex,
      child: Text(
        text,
        style: GoogleFonts.tajawal(
          color: AppColors.textSecondary,
          fontSize: 10,
          fontWeight: FontWeight.w900,
        ),
        textAlign: align,
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final bool isDark;
  final String title;
  final String value;
  final IconData icon;
  final Color iconBg;
  final Color iconColor;
  final double? trend;

  const _StatCard({
    required this.isDark,
    required this.title,
    required this.value,
    required this.icon,
    required this.iconBg,
    required this.iconColor,
    this.trend,
  });

  @override
  Widget build(BuildContext context) {
    final trendUp = (trend ?? 0) >= 0;
    return CardContainer(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: iconBg,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(icon, color: iconColor, size: 24),
              ),
              if (trend != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: trendUp ? AppColors.green50 : AppColors.red50,
                    borderRadius: BorderRadius.circular(100),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        trendUp ? Icons.trending_up_rounded : Icons.trending_down_rounded,
                        size: 12,
                        color: trendUp ? AppColors.green600 : AppColors.red600,
                      ),
                      const SizedBox(width: 2),
                      Text(
                        '${trend!.abs().toStringAsFixed(1)}%',
                        style: GoogleFonts.tajawal(
                          color: trendUp ? AppColors.green600 : AppColors.red600,
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
          const Spacer(),
          Text(
            title,
            style: GoogleFonts.tajawal(
              color: isDark ? AppColors.gold400 : AppColors.textSecondary,
              fontSize: 12,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: GoogleFonts.poppins(
              color: isDark ? AppColors.cream50 : AppColors.textPrimary,
              fontSize: 24,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}
