import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../models/order_model.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';

class OrderDetailPage extends StatefulWidget {
  final String orderNumber;
  const OrderDetailPage({super.key, required this.orderNumber});

  @override
  State<OrderDetailPage> createState() => _OrderDetailPageState();
}

class _OrderDetailPageState extends State<OrderDetailPage> {
  bool _isLoading = true;
  OrderModel? _order;
  bool _isUpdating = false;

  final Map<String, String> _statuses = {
    'pending': 'قيد الانتظار',
    'processing': 'قيد المعالجة',
    'shipped': 'تم الشحن',
    'delivered': 'تم التسليم',
    'cancelled': 'ملغي',
  };

  @override
  void initState() {
    super.initState();
    _fetchDetail();
  }

  Future<void> _fetchDetail() async {
    setState(() => _isLoading = true);
    try {
      final apiService = Get.find<ApiService>();
      final order = await apiService.orders.getOrderDetail(widget.orderNumber);
      setState(() {
        _order = order;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      Get.snackbar(
        'خطأ',
        'تعذر تحميل تفاصيل الطلب',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
    }
  }

  Future<void> _updateStatus(String newStatus) async {
    if (_order == null) return;
    setState(() => _isUpdating = true);

    try {
      final apiService = Get.find<ApiService>();
      final updatedOrder = await apiService.orders.updateOrderStatus(
        _order!.id,
        {'status': newStatus},
      );
      setState(() {
        _order = updatedOrder;
        _isUpdating = false;
      });
      Get.snackbar(
        'تم التحديث',
        'تم تغيير حالة الطلب بنجاح',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.green,
        colorText: Colors.white,
      );
    } catch (e) {
      setState(() => _isUpdating = false);
      Get.snackbar(
        'خطأ',
        'فشل تحديث حالة الطلب',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('طلب رقم ${widget.orderNumber}'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _order == null
              ? const Center(child: Text('الطلب غير موجود'))
              : ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    // Status Card & Update Action
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'تحديث حالة الطلب',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                            const SizedBox(height: 12),
                            DropdownButtonFormField<String>(
                              value: _order!.status,
                              items: _statuses.entries.map((e) {
                                return DropdownMenuItem(
                                  value: e.key,
                                  child: Text(e.value),
                                );
                              }).toList(),
                              onChanged: _isUpdating ? null : (val) {
                                if (val != null && val != _order!.status) {
                                  _updateStatus(val);
                                }
                              },
                              decoration: const InputDecoration(
                                labelText: 'الحالة الحالية',
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Customer Info Card
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'بيانات العملاء والشحن',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                            const Divider(height: 24),
                            _buildInfoRow('اسم العميل', _order!.customerName),
                            _buildInfoRow('رقم الهاتف', _order!.customerPhone),
                            _buildInfoRow('المدينة والمنطقة', '${_order!.city} - ${_order!.area}'),
                            _buildInfoRow('العنوان', _order!.address),
                            if ((_order!.notes ?? '').isNotEmpty)
                              _buildInfoRow('ملاحظات الزبون', _order!.notes!),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Items Card
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'المنتجات المطلوبة',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                            const Divider(height: 24),
                            if (_order!.items == null || _order!.items!.isEmpty)
                              const Text('لا توجد عناصر مضافة')
                            else
                              ..._order!.items!.map((item) {
                                return Padding(
                                  padding: const EdgeInsets.only(bottom: 12.0),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              item.productName,
                                              style: const TextStyle(fontWeight: FontWeight.bold),
                                            ),
                                            Text(
                                              'حجم: ${item.variantSize} مل | العدد: ${item.quantity}',
                                              style: const TextStyle(color: Colors.grey, fontSize: 12),
                                            ),
                                          ],
                                        ),
                                      ),
                                      Text(
                                        '${item.totalPrice.toStringAsFixed(2)} ر.س',
                                        style: const TextStyle(fontWeight: FontWeight.bold),
                                      ),
                                    ],
                                  ),
                                );
                              }),
                            const Divider(height: 24),

                            // Total summary
                            _buildSummaryRow('المجموع الفرعي', '${_order!.subtotal.toStringAsFixed(2)} ر.س'),
                            _buildSummaryRow('رسوم الشحن', '${_order!.shippingCost.toStringAsFixed(2)} ر.س'),
                            if (_order!.discountAmount > 0)
                              _buildSummaryRow('الخصم', '-${_order!.discountAmount.toStringAsFixed(2)} ر.س'),
                            const SizedBox(height: 8),
                            _buildSummaryRow(
                              'الإجمالي',
                              '${_order!.total.toStringAsFixed(2)} ر.س',
                              isBold: true,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(label, style: const TextStyle(color: Colors.grey)),
          ),
          Expanded(
            child: Text(value, style: const TextStyle(fontWeight: FontWeight.w500)),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value, {bool isBold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
              fontSize: isBold ? 16 : 14,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
              color: isBold ? AppTheme.goldDark : null,
              fontSize: isBold ? 16 : 14,
            ),
          ),
        ],
      ),
    );
  }
}
