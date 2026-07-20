import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../models/analytics_model.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  bool _isLoading = true;
  AnalyticsStatsModel? _stats;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchStats();
  }

  Future<void> _fetchStats() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final apiService = Get.find<ApiService>();
      final stats = await apiService.analytics.getStats();
      setState(() {
        _stats = stats;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'تعذر تحميل الإحصائيات';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('لوحة التحكم - الإحصائيات'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchStats,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(_error!, style: const TextStyle(color: Colors.redAccent)),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        onPressed: _fetchStats,
                        child: const Text('إعادة المحاولة'),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _fetchStats,
                  child: ListView(
                    padding: const EdgeInsets.all(16.0),
                    children: [
                      // Revenue Header Card
                      Card(
                        color: isDark ? AppTheme.dark700 : AppTheme.goldPrimary,
                        child: Padding(
                          padding: const EdgeInsets.all(20.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'إجمالي المبيعات',
                                style: TextStyle(
                                  color: Colors.white.withOpacity(0.85),
                                  fontSize: 14,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                '${_stats?.totalRevenue.toStringAsFixed(2) ?? '0.00'} ر.س',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 28,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Metrics Grid
                      GridView.count(
                        crossAxisCount: 2,
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                        childAspectRatio: 1.3,
                        children: [
                          _buildStatCard(
                            context: context,
                            title: 'عدد الطلبات',
                            value: '${_stats?.totalOrders ?? 0}',
                            icon: Icons.shopping_bag,
                            color: Colors.blueAccent,
                          ),
                          _buildStatCard(
                            context: context,
                            title: 'عدد العملاء',
                            value: '${_stats?.totalCustomers ?? 0}',
                            icon: Icons.people,
                            color: Colors.green,
                          ),
                          _buildStatCard(
                            context: context,
                            title: 'متوسط قيمة الطلب',
                            value: '${_stats?.averageOrderValue.toStringAsFixed(1) ?? '0'} ر.س',
                            icon: Icons.monetization_on,
                            color: Colors.amber,
                          ),
                          _buildStatCard(
                            context: context,
                            title: 'منتجات منخفضة المخزون',
                            value: '${_stats?.lowStockCount ?? 0}',
                            icon: Icons.warning_amber_rounded,
                            color: Colors.deepOrange,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
    );
  }

  Widget _buildStatCard({
    required BuildContext context,
    required String title,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                ),
                Icon(icon, color: color, size: 22),
              ],
            ),
            Text(
              value,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
