import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../models/customer_model.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/card_container.dart';
import '../../widgets/page_header.dart';
import '../../widgets/search_input.dart';
import '../../widgets/pagination_widget.dart';
import '../../widgets/segment_badge.dart';
import '../../widgets/drawer_modal.dart';
import '../../widgets/skeleton_loader.dart';

class CustomersListPage extends StatefulWidget {
  const CustomersListPage({super.key});

  @override
  State<CustomersListPage> createState() => _CustomersListPageState();
}

class _CustomersListPageState extends State<CustomersListPage> {
  bool _isLoading = true;
  List<CustomerProfileModel> _customers = [];
  final _searchController = TextEditingController();
  String? _filterSegment;
  int _currentPage = 1;
  int _totalPages = 1;
  CustomerProfileModel? _selectedCustomer;
  CustomerProfileModel? _customerDetail;
  bool _detailLoading = false;

  final _subjectController = TextEditingController();
  final _contentController = TextEditingController();

  Timer? _debounce;

  static const int _pageSize = 10;

  @override
  void initState() {
    super.initState();
    _fetchCustomers();
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();
    _subjectController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  Future<void> _fetchCustomers() async {
    setState(() => _isLoading = true);

    try {
      final apiService = Get.find<ApiService>();
      final response = await apiService.crm.getCustomers(
        search: _searchController.text.trim().isNotEmpty
            ? _searchController.text.trim()
            : null,
        segment: _filterSegment,
        page: _currentPage,
      );

      final data = response as Map;
      final count = data['count'] as int;
      final results = data['results'] as List;

      setState(() {
        _customers = results.map((e) => CustomerProfileModel.fromJson(e)).toList();
        _totalPages = (count / _pageSize).ceil();
        if (_totalPages < 1) _totalPages = 1;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      Get.snackbar(
        'خطأ',
        'تعذر تحميل قائمة العملاء',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: AppColors.red600,
        colorText: AppColors.white,
      );
    }
  }

  Future<void> _fetchCustomerDetail(int id) async {
    setState(() => _detailLoading = true);
    try {
      final apiService = Get.find<ApiService>();
      final detail = await apiService.crm.getCustomerDetail(id);
      setState(() {
        _customerDetail = detail;
        _detailLoading = false;
      });
    } catch (e) {
      setState(() {
        _customerDetail = null;
        _detailLoading = false;
        _selectedCustomer = null;
      });
      Get.snackbar(
        'خطأ',
        'تعذر تحميل تفاصيل العميل',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: AppColors.red600,
        colorText: AppColors.white,
      );
    }
  }

  void _onSearchChanged(String query) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () {
      setState(() => _currentPage = 1);
      _fetchCustomers();
    });
  }

  void _onPageChanged(int page) {
    setState(() => _currentPage = page);
    _fetchCustomers();
  }

  void _viewCustomer(CustomerProfileModel customer) {
    setState(() => _selectedCustomer = customer);
    _fetchCustomerDetail(customer.id);
  }

  void _closeDrawer() {
    setState(() {
      _selectedCustomer = null;
      _customerDetail = null;
    });
    _subjectController.clear();
    _contentController.clear();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      body: Stack(
        children: [
          Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                PageHeader(
                  title: 'إدارة العملاء (CRM)',
                  subtitle: 'متابعة سجل المشتريات وتصنيف العملاء.',
                ),
                const SizedBox(height: 24),
                _buildFilterBar(isDark),
                const SizedBox(height: 24),
                Expanded(child: _buildTable(isDark)),
              ],
            ),
          ),
          DrawerModal(
            isOpen: _selectedCustomer != null,
            onClose: _closeDrawer,
            title: _selectedCustomer?.fullName ?? '',
            subtitle: _selectedCustomer?.phone,
            child: _buildDrawerContent(isDark),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterBar(bool isDark) {
    return CardContainer(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Expanded(
            child: SearchInput(
              hintText: 'ابحث بالاسم، الهاتف أو البريد...',
              controller: _searchController,
              onChanged: _onSearchChanged,
            ),
          ),
          const SizedBox(width: 12),
          Container(
            constraints: const BoxConstraints(minWidth: 160),
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              color: isDark ? AppColors.dark800 : AppColors.cream50,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isDark ? AppColors.dark600 : AppColors.gold100,
              ),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String?>(
                value: _filterSegment,
                isExpanded: true,
                hint: Text(
                  'كل القطاعات',
                  style: GoogleFonts.tajawal(
                    color: AppColors.textMuted,
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                dropdownColor: isDark ? AppColors.dark700 : AppColors.white,
                items: [
                  DropdownMenuItem<String?>(
                    value: null,
                    child: Text(
                      'كل القطاعات',
                      style: GoogleFonts.tajawal(
                        color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  DropdownMenuItem<String?>(
                    value: 'new',
                    child: Text(
                      'عملاء جدد',
                      style: GoogleFonts.tajawal(
                        color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  DropdownMenuItem<String?>(
                    value: 'regular',
                    child: Text(
                      'عملاء منتظمين',
                      style: GoogleFonts.tajawal(
                        color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  DropdownMenuItem<String?>(
                    value: 'vip',
                    child: Text(
                      'عملاء VIP',
                      style: GoogleFonts.tajawal(
                        color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
                onChanged: (val) {
                  setState(() {
                    _filterSegment = val;
                    _currentPage = 1;
                  });
                  _fetchCustomers();
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTable(bool isDark) {
    return CardTableContainer(
      child: Column(
        children: [
          _buildTableHeader(isDark),
          Container(height: 1, color: isDark ? AppColors.dark600 : AppColors.gold50),
          Expanded(child: _buildTableBody(isDark)),
          if (!_isLoading && _customers.isNotEmpty)
            PaginationWidget(
              currentPage: _currentPage,
              totalPages: _totalPages,
              onPageChanged: _onPageChanged,
            ),
        ],
      ),
    );
  }

  Widget _buildTableHeader(bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 20),
      color: isDark ? AppColors.dark800 : AppColors.cream50,
      child: Row(
        children: [
          _headerCell('العميل', flex: 3),
          _headerCell('الموقع', flex: 2),
          _headerCell('إجمالي الإنفاق', flex: 2),
          _headerCell('التصنيف', flex: 2),
          _headerCell('إجراءات', flex: 1),
        ],
      ),
    );
  }

  Widget _headerCell(String text, {int flex = 1}) {
    return Expanded(
      flex: flex,
      child: Text(
        text,
        style: GoogleFonts.tajawal(
          fontSize: 10,
          fontWeight: FontWeight.w900,
          color: AppColors.textSecondary,
        ),
      ),
    );
  }

  Widget _buildTableBody(bool isDark) {
    if (_isLoading) {
      return const TableSkeleton(rows: 5, columns: 5);
    }
    if (_customers.isEmpty) {
      return _buildEmptyState(isDark);
    }
    return ListView.builder(
      itemCount: _customers.length,
      itemBuilder: (context, index) {
        final customer = _customers[index];
        return _buildCustomerRow(customer, isDark);
      },
    );
  }

  Widget _buildEmptyState(bool isDark) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.people_outline,
            size: 48,
            color: isDark ? AppColors.textMuted : AppColors.gold300,
          ),
          const SizedBox(height: 8),
          Text(
            'لا يوجد عملاء',
            style: GoogleFonts.tajawal(
              fontSize: 14,
              fontWeight: FontWeight.w900,
              color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCustomerRow(CustomerProfileModel customer, bool isDark) {
    return GestureDetector(
      onTap: () => _viewCustomer(customer),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 20),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: isDark ? AppColors.dark600 : AppColors.gold50,
              width: 1,
            ),
          ),
        ),
        child: Row(
          children: [
            Expanded(
              flex: 3,
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.dark600 : AppColors.gold50,
                      shape: BoxShape.circle,
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      customer.fullName.isNotEmpty
                          ? customer.fullName[0]
                          : '?',
                      style: GoogleFonts.poppins(
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        color: isDark ? AppColors.gold400 : AppColors.gold600,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          customer.fullName,
                          style: GoogleFonts.tajawal(
                            fontSize: 13,
                            fontWeight: FontWeight.w900,
                            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          customer.phone,
                          style: GoogleFonts.poppins(
                            fontSize: 10,
                            color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              flex: 2,
              child: Row(
                children: [
                  Icon(
                    Icons.location_on_outlined,
                    size: 14,
                    color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondary,
                  ),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      customer.city ?? '-',
                      style: GoogleFonts.tajawal(
                        fontSize: 12,
                        fontWeight: FontWeight.w900,
                        color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              flex: 2,
              child: Text(
                '${customer.totalSpent.toStringAsFixed(2)} ر.س',
                style: GoogleFonts.poppins(
                  fontSize: 12,
                  fontWeight: FontWeight.w900,
                  color: isDark ? AppColors.gold400 : AppColors.gold700,
                ),
              ),
            ),
            Expanded(
              flex: 2,
              child: SegmentBadge(segment: customer.segment),
            ),
            Expanded(
              flex: 1,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.dark600 : AppColors.gold50,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      Icons.chevron_left,
                      size: 20,
                      color: isDark ? AppColors.gold400 : AppColors.gold600,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawerContent(bool isDark) {
    if (_detailLoading) {
      return Column(
        children: [
          _buildSkeleton(120),
          const SizedBox(height: 24),
          _buildSkeleton(200),
          const SizedBox(height: 24),
          _buildSkeleton(300),
        ],
      );
    }

    final detail = _customerDetail;
    if (detail == null) return const SizedBox();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _buildStatCards(detail, isDark),
        const SizedBox(height: 32),
        _buildInteractionSection(isDark),
        const SizedBox(height: 32),
        _buildOrdersSection(detail, isDark),
      ],
    );
  }

  Widget _buildSkeleton(double height) {
    return Container(
      height: height,
      decoration: BoxDecoration(
        color: AppColors.gold50,
        borderRadius: BorderRadius.circular(24),
      ),
    );
  }

  Widget _buildStatCards(CustomerProfileModel detail, bool isDark) {
    return Row(
      children: [
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: isDark ? AppColors.dark800 : AppColors.gold50,
              borderRadius: BorderRadius.circular(32),
              border: Border.all(
                color: isDark ? AppColors.dark600 : AppColors.gold200,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'إجمالي الإنفاق',
                  style: GoogleFonts.tajawal(
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                    color: isDark ? AppColors.gold400 : AppColors.gold600,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${detail.totalSpent.toStringAsFixed(2)} ر.س',
                  style: GoogleFonts.poppins(
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                    color: isDark ? AppColors.gold400 : AppColors.gold700,
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: isDark ? AppColors.dark800 : AppColors.blue50,
              borderRadius: BorderRadius.circular(32),
              border: Border.all(
                color: isDark ? AppColors.dark600 : AppColors.blue50,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'الطلبات',
                  style: GoogleFonts.tajawal(
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                    color: isDark ? AppColors.gold400 : AppColors.blue600,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${detail.totalOrders}',
                  style: GoogleFonts.poppins(
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                    color: AppColors.blue600,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildInteractionSection(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Icon(Icons.message_outlined, size: 18, color: AppColors.gold500),
            const SizedBox(width: 8),
            Text(
              'سجل التفاعلات',
              style: GoogleFonts.tajawal(
                fontSize: 16,
                fontWeight: FontWeight.w900,
                color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _subjectController,
          textDirection: TextDirection.rtl,
          style: GoogleFonts.tajawal(
            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
            fontSize: 14,
            fontWeight: FontWeight.w700,
          ),
          decoration: InputDecoration(
            hintText: 'الموضوع',
            hintStyle: GoogleFonts.tajawal(
              color: AppColors.textMuted,
              fontSize: 14,
              fontWeight: FontWeight.w700,
            ),
            filled: true,
            fillColor: isDark ? AppColors.dark800 : AppColors.cream50,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide(
                color: isDark ? AppColors.dark600 : AppColors.gold100,
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide(
                color: isDark ? AppColors.dark600 : AppColors.gold100,
              ),
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          ),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _contentController,
          textDirection: TextDirection.rtl,
          maxLines: 3,
          style: GoogleFonts.tajawal(
            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
            fontSize: 14,
            fontWeight: FontWeight.w700,
          ),
          decoration: InputDecoration(
            hintText: 'تفاصيل التفاعل...',
            hintStyle: GoogleFonts.tajawal(
              color: AppColors.textMuted,
              fontSize: 14,
              fontWeight: FontWeight.w700,
            ),
            filled: true,
            fillColor: isDark ? AppColors.dark800 : AppColors.cream50,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide(
                color: isDark ? AppColors.dark600 : AppColors.gold100,
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide(
                color: isDark ? AppColors.dark600 : AppColors.gold100,
              ),
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.gold600,
              foregroundColor: AppColors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              elevation: 0,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.add, size: 18),
                const SizedBox(width: 8),
                Text(
                  'تسجيل التفاعل',
                  style: GoogleFonts.tajawal(
                    fontSize: 15,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 20),
        if (_customerDetail?.interactions != null)
          ..._customerDetail!.interactions!.map(
            (interaction) => _buildInteractionCard(interaction, isDark),
          ),
      ],
    );
  }

  Widget _buildInteractionCard(dynamic interaction, bool isDark) {
    final Map<String, dynamic> intMap = interaction as Map<String, dynamic>;
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? AppColors.dark800 : AppColors.white,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(
          color: isDark ? AppColors.dark600 : AppColors.gold100,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.dark600 : AppColors.gold50,
                  borderRadius: BorderRadius.circular(100),
                ),
                child: Text(
                  intMap['interaction_type'] ?? '',
                  style: GoogleFonts.tajawal(
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                    color: isDark ? AppColors.gold400 : AppColors.gold700,
                  ),
                ),
              ),
              const Spacer(),
              Text(
                intMap['created_at'] != null
                    ? _formatDate(intMap['created_at'].toString())
                    : '',
                style: GoogleFonts.poppins(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textMuted,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            intMap['subject'] ?? '',
            style: GoogleFonts.tajawal(
              fontSize: 13,
              fontWeight: FontWeight.w900,
              color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            intMap['content'] ?? '',
            style: GoogleFonts.tajawal(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOrdersSection(CustomerProfileModel detail, bool isDark) {
    final orders = detail.orders;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Icon(Icons.shopping_bag_outlined, size: 18, color: AppColors.gold500),
            const SizedBox(width: 8),
            Text(
              'سجل الطلبات',
              style: GoogleFonts.tajawal(
                fontSize: 16,
                fontWeight: FontWeight.w900,
                color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        if (orders == null || orders.isEmpty)
          Text(
            'لا توجد طلبات',
            style: GoogleFonts.tajawal(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: AppColors.textMuted,
            ),
          )
        else
          ...orders.map(
            (order) => _buildOrderCard(order, isDark),
          ),
      ],
    );
  }

  Widget _buildOrderCard(dynamic order, bool isDark) {
    final Map<String, dynamic> orderMap = order as Map<String, dynamic>;
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? AppColors.dark800 : AppColors.gray50,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(
          color: isDark ? AppColors.dark600 : AppColors.gray50,
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '#${orderMap['order_number'] ?? ''}',
                  style: GoogleFonts.poppins(
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                    color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  orderMap['created_at'] != null
                      ? _formatDate(orderMap['created_at'].toString())
                      : '',
                  style: GoogleFonts.poppins(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textMuted,
                  ),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '${orderMap['total'] ?? '0'} ر.س',
                style: GoogleFonts.poppins(
                  fontSize: 13,
                  fontWeight: FontWeight.w900,
                  color: isDark ? AppColors.gold400 : AppColors.gold700,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                _orderStatus(orderMap['status']?.toString() ?? ''),
                style: GoogleFonts.tajawal(
                  fontSize: 8,
                  fontWeight: FontWeight.w900,
                  color: AppColors.green600,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _formatDate(String dateStr) {
    try {
      final dt = DateTime.parse(dateStr);
      return '${dt.year}/${dt.month}/${dt.day}';
    } catch (_) {
      return dateStr;
    }
  }

  String _orderStatus(String status) {
    switch (status) {
      case 'pending':
        return 'قيد الانتظار';
      case 'processing':
        return 'قيد المعالجة';
      case 'shipped':
        return 'تم الشحن';
      case 'delivered':
        return 'تم التوصيل';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  }
}
