import 'dart:async';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../models/order_model.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/card_container.dart';
import '../../widgets/drawer_modal.dart';
import '../../widgets/page_header.dart';
import '../../widgets/pagination_widget.dart';
import '../../widgets/search_input.dart';
import '../../widgets/skeleton_loader.dart';
import '../../widgets/status_badge.dart';
import 'order_detail_page.dart';

class OrdersListController extends GetxController {
  final isLoading = true.obs;
  final orders = <OrderModel>[].obs;
  final currentPage = 1.obs;
  final totalPages = 1.obs;
  final searchTerm = ''.obs;
  final filterStatus = Rxn<String>(null);
  final selectedOrder = Rxn<OrderModel>(null);

  final searchController = TextEditingController();
  Timer? _debounce;

  @override
  void onInit() {
    super.onInit();
    fetchOrders();
  }

  Future<void> fetchOrders() async {
    isLoading.value = true;
    try {
      final apiService = Get.find<ApiService>();
      final response = await apiService.orders.getOrders(
        status: filterStatus.value,
        search: searchTerm.value.isNotEmpty ? searchTerm.value : null,
        page: currentPage.value,
      );

      final List rawList = (response is Map && response.containsKey('results'))
          ? response['results']
          : (response is List ? response : []);

      orders.value = rawList.map((e) => OrderModel.fromJson(e)).toList();
      final count = response is Map ? (response['count'] ?? 0) : orders.length;
      totalPages.value = (count / 15).ceil();
      if (totalPages.value < 1) totalPages.value = 1;
    } catch (e) {
      Get.snackbar(
        'خطأ',
        'تعذر تحميل قائمة الطلبات',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
    } finally {
      isLoading.value = false;
    }
  }

  void onSearchChanged(String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () {
      searchTerm.value = value;
      currentPage.value = 1;
      fetchOrders();
    });
  }

  void onStatusFilterChanged(String? status) {
    filterStatus.value = status;
    currentPage.value = 1;
    fetchOrders();
  }

  void onPageChanged(int page) {
    currentPage.value = page;
    fetchOrders();
  }

  void openDetail(OrderModel order) {
    selectedOrder.value = order;
  }

  void closeDetail() {
    selectedOrder.value = null;
  }

  void navigateToDetail(OrderModel order) async {
    closeDetail();
    final updated = await Get.to(() => OrderDetailPage(orderNumber: order.orderNumber));
    if (updated == true) fetchOrders();
  }

  @override
  void onClose() {
    _debounce?.cancel();
    searchController.dispose();
    super.onClose();
  }
}

class OrdersListPage extends StatefulWidget {
  const OrdersListPage({super.key});

  @override
  State<OrdersListPage> createState() => _OrdersListPageState();
}

class _OrdersListPageState extends State<OrdersListPage> {
  late final OrdersListController _controller;

  @override
  void initState() {
    super.initState();
    _controller = Get.put(OrdersListController());
  }

  @override
  void dispose() {
    Get.delete<OrdersListController>();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: SafeArea(
        child: Stack(
          children: [
            Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(24, 24, 24, 0),
                  child: PageHeader(
                    title: 'الطلبات',
                    subtitle: 'متابعة المبيعات، الشحن وتحديث حالات الطلب',
                  ),
                ),
                const SizedBox(height: 20),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: CardContainer(
                    padding: const EdgeInsets.all(16),
                    borderRadius: 32,
                    child: Row(
                      children: [
                        Expanded(
                          child: SearchInput(
                            hintText: 'ابحث برقم الطلب، اسم العميل أو الهاتف...',
                            onChanged: _controller.onSearchChanged,
                            controller: _controller.searchController,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Obx(() => _buildStatusDropdown(isDark)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: CardTableContainer(
                      child: Column(
                        children: [
                          _buildTableHeader(isDark),
                          const Divider(height: 1, thickness: 1),
                          Expanded(
                            child: Obx(() {
                              if (_controller.isLoading.value) {
                                return const TableSkeleton(rows: 6, columns: 6);
                              }
                              if (_controller.orders.isEmpty) {
                                return _buildEmptyState();
                              }
                              return SingleChildScrollView(
                                scrollDirection: Axis.horizontal,
                                child: SizedBox(
                                  width: 700,
                                  child: ListView.builder(
                                    itemCount: _controller.orders.length,
                                    itemBuilder: (_, i) => _buildOrderRow(
                                      _controller.orders[i],
                                      isDark,
                                    ),
                                  ),
                                ),
                              );
                            }),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                Obx(() => Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: PaginationWidget(
                    currentPage: _controller.currentPage.value,
                    totalPages: _controller.totalPages.value,
                    onPageChanged: _controller.onPageChanged,
                  ),
                )),
                const SizedBox(height: 16),
              ],
            ),
            Obx(() {
              final order = _controller.selectedOrder.value;
              return DrawerModal(
                isOpen: order != null,
                onClose: _controller.closeDetail,
                title: 'طلب #${order?.orderNumber ?? ''}',
                subtitle: order?.customerName,
                child: order != null
                    ? _buildDetailContent(order, isDark, _controller)
                    : const SizedBox.shrink(),
              );
            }),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusDropdown(bool isDark) {
    return Container(
      width: 150,
      decoration: BoxDecoration(
        color: isDark ? AppColors.dark800 : AppColors.cream50,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? AppColors.dark600 : AppColors.gold100,
        ),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 8),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String?>(
          value: _controller.filterStatus.value,
          isExpanded: true,
          icon: Icon(
            Icons.arrow_drop_down,
            color: isDark ? AppColors.gold400 : AppColors.textMuted,
            size: 20,
          ),
          style: GoogleFonts.tajawal(
            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
            fontSize: 12,
            fontWeight: FontWeight.w700,
          ),
          hint: Text(
            'كل الحالات',
            style: GoogleFonts.tajawal(
              color: AppColors.textMuted,
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
          ),
          items: const [
            DropdownMenuItem(value: null, child: Text('كل الحالات')),
            DropdownMenuItem(value: 'pending', child: Text('قيد الانتظار')),
            DropdownMenuItem(value: 'confirmed', child: Text('مؤكد')),
            DropdownMenuItem(value: 'processing', child: Text('قيد التجهيز')),
            DropdownMenuItem(value: 'shipped', child: Text('تم الشحن')),
            DropdownMenuItem(value: 'delivered', child: Text('تم التوصيل')),
            DropdownMenuItem(value: 'cancelled', child: Text('ملغي')),
          ],
          onChanged: _controller.onStatusFilterChanged,
        ),
      ),
    );
  }

  Widget _buildTableHeader(bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      decoration: BoxDecoration(
        color: isDark ? AppColors.dark800 : AppColors.cream50,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
      ),
      child: Row(
        children: [
          _headerCell('الطلب', 2),
          _headerCell('العميل', 3),
          _headerCell('تاريخ الطلب', 3),
          _headerCell('الإجمالي', 2),
          _headerCell('الحالة', 2),
          _headerCell('إجراءات', 2),
        ],
      ),
    );
  }

  Widget _headerCell(String text, int flex) {
    return Expanded(
      flex: flex,
      child: Text(
        text,
        style: GoogleFonts.tajawal(
          fontSize: 10,
          fontWeight: FontWeight.w900,
          color: AppColors.textMuted,
        ),
      ),
    );
  }

  Widget _buildOrderRow(OrderModel order, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(
            color: isDark ? AppColors.dark600 : AppColors.gold100,
            width: 0.5,
          ),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            flex: 2,
            child: Text(
              order.orderNumber,
              style: GoogleFonts.poppins(
                fontSize: 11,
                fontWeight: FontWeight.w900,
                color: AppColors.gold600,
              ),
            ),
          ),
          Expanded(
            flex: 3,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  order.customerName,
                  style: GoogleFonts.tajawal(
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                    color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
                  ),
                ),
                Text(
                  order.customerPhone,
                  style: GoogleFonts.poppins(
                    fontSize: 10,
                    color: AppColors.textMuted,
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            flex: 3,
            child: Text(
              _formatDate(order.createdAt),
              style: GoogleFonts.tajawal(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondary,
              ),
            ),
          ),
          Expanded(
            flex: 2,
            child: Text(
              '${order.total.toStringAsFixed(2)} ر.س',
              style: GoogleFonts.poppins(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: AppColors.gold600,
              ),
            ),
          ),
          Expanded(
            flex: 2,
            child: StatusBadge(status: order.status, fontSize: 10),
          ),
          Expanded(
            flex: 2,
            child: GestureDetector(
              onTap: () => _controller.openDetail(order),
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.dark600 : AppColors.gray50,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  Icons.visibility_outlined,
                  size: 16,
                  color: isDark ? AppColors.gold400 : AppColors.textSecondary,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.inbox_outlined,
            size: 48,
            color: AppColors.textMuted.withValues(alpha: 0.5),
          ),
          const SizedBox(height: 12),
          Text(
            'لا توجد طلبات',
            style: GoogleFonts.tajawal(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: AppColors.textMuted,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailContent(
    OrderModel order,
    bool isDark,
    OrdersListController controller,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          order.customerPhone,
          style: GoogleFonts.poppins(
            fontSize: 13,
            fontWeight: FontWeight.w700,
            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          '${order.city} - ${order.area}',
          style: GoogleFonts.tajawal(
            fontSize: 12,
            color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondary,
          ),
        ),
        Text(
          order.address,
          style: GoogleFonts.tajawal(
            fontSize: 12,
            color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondary,
          ),
        ),
        if (order.notes != null && order.notes!.isNotEmpty) ...[
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
                    order.notes!,
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
        const SizedBox(height: 20),
        Text(
          'المنتجات',
          style: GoogleFonts.tajawal(
            fontSize: 14,
            fontWeight: FontWeight.w900,
            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 12),
        if (order.items != null)
          ...order.items!.map(
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
        const SizedBox(height: 20),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.gold600,
            borderRadius: BorderRadius.circular(40),
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'المجموع الفرعي',
                    style: GoogleFonts.tajawal(
                      fontSize: 12,
                      color: AppColors.white.withValues(alpha: 0.8),
                    ),
                  ),
                  Text(
                    '${order.subtotal.toStringAsFixed(2)} ر.س',
                    style: GoogleFonts.poppins(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: AppColors.white,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'رسوم الشحن',
                    style: GoogleFonts.tajawal(
                      fontSize: 12,
                      color: AppColors.white.withValues(alpha: 0.8),
                    ),
                  ),
                  Text(
                    '${order.shippingCost.toStringAsFixed(2)} ر.س',
                    style: GoogleFonts.poppins(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: AppColors.white,
                    ),
                  ),
                ],
              ),
              if (order.discountAmount > 0) ...[
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'الخصم',
                      style: GoogleFonts.tajawal(
                        fontSize: 12,
                        color: AppColors.white.withValues(alpha: 0.8),
                      ),
                    ),
                    Text(
                      '-${order.discountAmount.toStringAsFixed(2)} ر.س',
                      style: GoogleFonts.poppins(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: AppColors.white,
                      ),
                    ),
                  ],
                ),
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
                    '${order.total.toStringAsFixed(2)} ر.س',
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
        const SizedBox(height: 12),
        Center(
          child: TextButton.icon(
            onPressed: () => controller.navigateToDetail(order),
            icon: Icon(
              Icons.open_in_new_rounded,
              size: 14,
              color: isDark ? AppColors.gold400 : AppColors.gold600,
            ),
            label: Text(
              'عرض التفاصيل كاملة',
              style: GoogleFonts.tajawal(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: isDark ? AppColors.gold400 : AppColors.gold600,
              ),
            ),
          ),
        ),
        const SizedBox(height: 24),
      ],
    );
  }

  String _formatDate(String isoDate) {
    try {
      final date = DateTime.parse(isoDate);
      final months = <int, String>{
        1: 'يناير', 2: 'فبراير', 3: 'مارس', 4: 'أبريل',
        5: 'مايو', 6: 'يونيو', 7: 'يوليو', 8: 'أغسطس',
        9: 'سبتمبر', 10: 'أكتوبر', 11: 'نوفمبر', 12: 'ديسمبر',
      };
      final month = months[date.month] ?? '';
      final hour = date.hour > 12 ? date.hour - 12 : (date.hour == 0 ? 12 : date.hour);
      final amPm = date.hour >= 12 ? 'م' : 'ص';
      final minute = date.minute.toString().padLeft(2, '0');
      return '${date.day} $month ${date.year}\n$hour:$minute $amPm';
    } catch (_) {
      return isoDate;
    }
  }
}
