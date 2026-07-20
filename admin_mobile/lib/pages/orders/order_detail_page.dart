import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../models/order_model.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/card_container.dart';
import '../../widgets/status_badge.dart';

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
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text('طلب #${widget.orderNumber}'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _order == null
              ? const Center(child: Text('الطلب غير موجود'))
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      CardContainer(
                        padding: const EdgeInsets.all(16),
                        borderRadius: 32,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                StatusBadge(status: _order!.status),
                                const Spacer(),
                                Text(
                                  'طلب #${_order!.orderNumber}',
                                  style: GoogleFonts.poppins(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w900,
                                    color: AppColors.gold600,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'تحديث حالة الطلب',
                              style: GoogleFonts.tajawal(
                                fontSize: 14,
                                fontWeight: FontWeight.w900,
                                color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 12),
                            DropdownButtonFormField<String>(
                              value: _order!.status,
                              items: const [
                                DropdownMenuItem(value: 'pending', child: Text('قيد الانتظار')),
                                DropdownMenuItem(value: 'confirmed', child: Text('مؤكد')),
                                DropdownMenuItem(value: 'processing', child: Text('قيد التجهيز')),
                                DropdownMenuItem(value: 'shipped', child: Text('تم الشحن')),
                                DropdownMenuItem(value: 'delivered', child: Text('تم التوصيل')),
                                DropdownMenuItem(value: 'cancelled', child: Text('ملغي')),
                              ],
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
                      const SizedBox(height: 20),
                      Text(
                        'بيانات العميل',
                        style: GoogleFonts.tajawal(
                          fontSize: 14,
                          fontWeight: FontWeight.w900,
                          color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 12),
                      _buildLabel('رقم الهاتف'),
                      Text(
                        _order!.customerPhone,
                        style: GoogleFonts.poppins(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 12),
                      _buildLabel('العنوان'),
                      Text(
                        '${_order!.city} - ${_order!.area}',
                        style: GoogleFonts.tajawal(
                          fontSize: 12,
                          color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondary,
                        ),
                      ),
                      Text(
                        _order!.address,
                        style: GoogleFonts.tajawal(
                          fontSize: 12,
                          color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondary,
                        ),
                      ),
                      if (_order!.notes != null && _order!.notes!.isNotEmpty) ...[
                        const SizedBox(height: 16),
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: isDark ? AppColors.dark800 : AppColors.cream50,
                            borderRadius: BorderRadius.circular(32),
                            border: Border.all(
                              color: isDark ? AppColors.dark600 : AppColors.gold100,
                            ),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Icon(Icons.notes_rounded, size: 16, color: AppColors.textMuted),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  _order!.notes!,
                                  style: GoogleFonts.tajawal(
                                    fontSize: 12,
                                    color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                      const SizedBox(height: 24),
                      Text(
                        'المنتجات',
                        style: GoogleFonts.tajawal(
                          fontSize: 14,
                          fontWeight: FontWeight.w900,
                          color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 12),
                      if (_order!.items != null)
                        ..._order!.items!.map(
                          (item) => Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        item.productName,
                                        style: GoogleFonts.tajawal(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w900,
                                          color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
                                        ),
                                      ),
                                      Text(
                                        '${item.variantSize} مل | ${item.quantity} قطع',
                                        style: GoogleFonts.tajawal(
                                          fontSize: 10,
                                          color: AppColors.textMuted,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                Text(
                                  '${item.totalPrice.toStringAsFixed(2)} ر.س',
                                  style: GoogleFonts.tajawal(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w900,
                                    color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      const SizedBox(height: 24),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: AppColors.gold600,
                          borderRadius: BorderRadius.circular(40),
                        ),
                        child: Column(
                          children: [
                            _totalRow('المجموع الفرعي', _order!.subtotal.toStringAsFixed(2)),
                            const SizedBox(height: 8),
                            _totalRow('رسوم الشحن', _order!.shippingCost.toStringAsFixed(2)),
                            if (_order!.discountAmount > 0) ...[
                              const SizedBox(height: 8),
                              _totalRow('الخصم', '-${_order!.discountAmount.toStringAsFixed(2)}'),
                            ],
                            const SizedBox(height: 12),
                            Divider(color: AppColors.white.withValues(alpha: 0.3), height: 1),
                            const SizedBox(height: 12),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'الإجمالي',
                                  style: GoogleFonts.tajawal(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w900,
                                    color: AppColors.white,
                                  ),
                                ),
                                Text(
                                  '${_order!.total.toStringAsFixed(2)} ر.س',
                                  style: GoogleFonts.poppins(
                                    fontSize: 28,
                                    fontWeight: FontWeight.w900,
                                    color: AppColors.white,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 32),
                    ],
                  ),
                ),
    );
  }

  Widget _buildLabel(String text) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Text(
        text,
        style: GoogleFonts.tajawal(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: isDark ? AppColors.textSecondaryDark : AppColors.textMuted,
        ),
      ),
    );
  }

  Widget _totalRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: GoogleFonts.tajawal(
            fontSize: 12,
            color: AppColors.white.withValues(alpha: 0.8),
          ),
        ),
        Text(
          '$value ر.س',
          style: GoogleFonts.poppins(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: AppColors.white,
          ),
        ),
      ],
    );
  }
}
