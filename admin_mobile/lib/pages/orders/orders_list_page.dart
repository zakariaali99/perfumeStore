import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../models/order_model.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';
import 'order_detail_page.dart';

class OrdersListPage extends StatefulWidget {
  const OrdersListPage({super.key});

  @override
  State<OrdersListPage> createState() => _OrdersListPageState();
}

class _OrdersListPageState extends State<OrdersListPage> {
  bool _isLoading = true;
  List<OrderModel> _orders = [];
  String? _selectedStatus;
  final _searchController = TextEditingController();

  final List<Map<String, String?>> _statusFilters = const [
    {'label': 'الكل', 'value': null},
    {'label': 'قيد الانتظار', 'value': 'pending'},
    {'label': 'قيد المعالجة', 'value': 'processing'},
    {'label': 'تم الشحن', 'value': 'shipped'},
    {'label': 'تم التسليم', 'value': 'delivered'},
    {'label': 'ملغي', 'value': 'cancelled'},
  ];

  @override
  void initState() {
    super.initState();
    _fetchOrders();
  }

  Future<void> _fetchOrders() async {
    setState(() => _isLoading = true);

    try {
      final apiService = Get.find<ApiService>();
      final response = await apiService.orders.getOrders(
        status: _selectedStatus,
        search: _searchController.text.trim().isNotEmpty ? _searchController.text.trim() : null,
      );

      final List rawList = (response is Map && response.containsKey('results'))
          ? response['results']
          : (response is List ? response : []);

      setState(() {
        _orders = rawList.map((e) => OrderModel.fromJson(e)).toList();
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      Get.snackbar(
        'خطأ',
        'تعذر تحميل قائمة الطلبات',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'pending':
        return Colors.orange;
      case 'processing':
        return Colors.blue;
      case 'shipped':
        return Colors.purple;
      case 'delivered':
        return Colors.green;
      case 'cancelled':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('إدارة الطلبات'),
      ),
      body: Column(
        children: [
          // Filter chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: _statusFilters.map((filter) {
                final isSelected = _selectedStatus == filter['value'];
                return Padding(
                  padding: const EdgeInsets.only(left: 8.0),
                  child: ChoiceChip(
                    label: Text(filter['label']!),
                    selected: isSelected,
                    selectedColor: AppTheme.goldPrimary,
                    onSelected: (selected) {
                      if (selected) {
                        setState(() {
                          _selectedStatus = filter['value'];
                        });
                        _fetchOrders();
                      }
                    },
                  ),
                );
              }).toList(),
            ),
          ),

          // Search bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'بحث برقم الطلب أو اسم الزبون...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.clear),
                  onPressed: () {
                    _searchController.clear();
                    _fetchOrders();
                  },
                ),
              ),
              onSubmitted: (_) => _fetchOrders(),
            ),
          ),
          const SizedBox(height: 8),

          // Orders List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _orders.isEmpty
                    ? const Center(child: Text('لا توجد طلبات تطابق البحث'))
                    : RefreshIndicator(
                        onRefresh: _fetchOrders,
                        child: ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: _orders.length,
                          itemBuilder: (context, index) {
                            final order = _orders[index];
                            final statusColor = _getStatusColor(order.status);

                            return Card(
                              margin: const EdgeInsets.only(bottom: 12),
                              child: ListTile(
                                contentPadding: const EdgeInsets.all(16),
                                title: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      'رقم: ${order.orderNumber}',
                                      style: const TextStyle(fontWeight: FontWeight.bold),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: statusColor.withOpacity(0.15),
                                        borderRadius: BorderRadius.circular(20),
                                        border: Border.all(color: statusColor),
                                      ),
                                      child: Text(
                                        order.statusArabic,
                                        style: TextStyle(
                                          color: statusColor,
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                subtitle: Padding(
                                  padding: const EdgeInsets.only(top: 8.0),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text('الزبون: ${order.customerName} (${order.customerPhone})'),
                                      const SizedBox(height: 4),
                                      Text('المدينة: ${order.city} - ${order.area}'),
                                      const SizedBox(height: 4),
                                      Text(
                                        'الإجمالي: ${order.total.toStringAsFixed(2)} ر.س',
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          color: AppTheme.goldDark,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                                onTap: () async {
                                  final updated = await Get.to(() => OrderDetailPage(orderNumber: order.orderNumber));
                                  if (updated == true) {
                                    _fetchOrders();
                                  }
                                },
                              ),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}
