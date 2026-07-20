import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../models/customer_model.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';

class CustomersListPage extends StatefulWidget {
  const CustomersListPage({super.key});

  @override
  State<CustomersListPage> createState() => _CustomersListPageState();
}

class _CustomersListPageState extends State<CustomersListPage> {
  bool _isLoading = true;
  List<CustomerProfileModel> _customers = [];
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchCustomers();
  }

  Future<void> _fetchCustomers() async {
    setState(() => _isLoading = true);

    try {
      final apiService = Get.find<ApiService>();
      final response = await apiService.crm.getCustomers(
        search: _searchController.text.trim().isNotEmpty ? _searchController.text.trim() : null,
      );

      final List rawList = (response is Map && response.containsKey('results'))
          ? response['results']
          : (response is List ? response : []);

      setState(() {
        _customers = rawList.map((e) => CustomerProfileModel.fromJson(e)).toList();
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      Get.snackbar(
        'خطأ',
        'تعذر تحميل قائمة العملاء',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
    }
  }

  Color _getSegmentColor(String segment) {
    switch (segment) {
      case 'VIP':
        return Colors.amber;
      case 'Regular':
        return Colors.blue;
      case 'New':
        return Colors.green;
      case 'Inactive':
        return Colors.grey;
      default:
        return Colors.purple;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('إدارة العملاء (CRM)'),
      ),
      body: Column(
        children: [
          // Search box
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'بحث باسم العميل أو رقم الهاتف...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.clear),
                  onPressed: () {
                    _searchController.clear();
                    _fetchCustomers();
                  },
                ),
              ),
              onSubmitted: (_) => _fetchCustomers(),
            ),
          ),

          // Customers List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _customers.isEmpty
                    ? const Center(child: Text('لا يوجد عملاء مطابقين'))
                    : RefreshIndicator(
                        onRefresh: _fetchCustomers,
                        child: ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: _customers.length,
                          itemBuilder: (context, index) {
                            final customer = _customers[index];
                            final segmentColor = _getSegmentColor(customer.segment);

                            return Card(
                              margin: const EdgeInsets.only(bottom: 12),
                              child: ListTile(
                                leading: CircleAvatar(
                                  backgroundColor: segmentColor.withOpacity(0.2),
                                  child: Icon(Icons.person, color: segmentColor),
                                ),
                                title: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      customer.fullName,
                                      style: const TextStyle(fontWeight: FontWeight.bold),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: segmentColor.withOpacity(0.15),
                                        borderRadius: BorderRadius.circular(12),
                                        border: Border.all(color: segmentColor),
                                      ),
                                      child: Text(
                                        customer.segmentArabic,
                                        style: TextStyle(
                                          color: segmentColor,
                                          fontSize: 10,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                subtitle: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const SizedBox(height: 4),
                                    Text('الهاتف: ${customer.phone}'),
                                    const SizedBox(height: 4),
                                    Row(
                                      children: [
                                        Text('عدد الطلبات: ${customer.totalOrders}'),
                                        const SizedBox(width: 16),
                                        Text(
                                          'إجمالي المشتريات: ${customer.totalSpent.toStringAsFixed(2)} ر.س',
                                          style: const TextStyle(
                                            color: AppTheme.goldDark,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                                isThreeLine: true,
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
