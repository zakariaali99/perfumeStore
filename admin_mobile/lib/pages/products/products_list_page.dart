import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../models/product_model.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/card_container.dart';
import '../../widgets/page_header.dart';
import '../../widgets/search_input.dart';
import '../../widgets/pagination_widget.dart';
import '../../widgets/skeleton_loader.dart';

class ProductsListPage extends StatefulWidget {
  const ProductsListPage({super.key});

  @override
  State<ProductsListPage> createState() => _ProductsListPageState();
}

class _ProductsListPageState extends State<ProductsListPage> {
  bool _isLoading = true;
  List<ProductModel> _products = [];
  final _searchController = TextEditingController();
  int? _filterCategoryId;
  int _currentPage = 1;
  int _totalPages = 1;
  List<CategoryModel> _categories = [];

  Timer? _debounce;

  static const int _pageSize = 10;

  @override
  void initState() {
    super.initState();
    _fetchCategories();
    _fetchProducts();
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchCategories() async {
    try {
      final apiService = Get.find<ApiService>();
      final cats = await apiService.products.getCategories();
      setState(() => _categories = cats);
    } catch (_) {}
  }

  Future<void> _fetchProducts() async {
    setState(() => _isLoading = true);

    try {
      final apiService = Get.find<ApiService>();
      final response = await apiService.products.getAdminProducts(
        search: _searchController.text.trim().isNotEmpty
            ? _searchController.text.trim()
            : null,
        categoryId: _filterCategoryId,
        page: _currentPage,
      );

      final data = response as Map;
      final count = data['count'] as int;
      final results = data['results'] as List;

      setState(() {
        _products = results.map((e) => ProductModel.fromJson(e)).toList();
        _totalPages = (count / _pageSize).ceil();
        if (_totalPages < 1) _totalPages = 1;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      Get.snackbar(
        'خطأ',
        'تعذر تحميل قائمة المنتجات',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: AppColors.red600,
        colorText: AppColors.white,
      );
    }
  }

  void _onSearchChanged(String query) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () {
      setState(() {
        _currentPage = 1;
      });
      _fetchProducts();
    });
  }

  void _onPageChanged(int page) {
    setState(() => _currentPage = page);
    _fetchProducts();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            PageHeader(
              title: 'المنتجات',
              subtitle: 'إدارة الكتالوج، المخزون والأسعار.',
            ),
            const SizedBox(height: 24),
            _buildFilterBar(isDark),
            const SizedBox(height: 24),
            Expanded(child: _buildTable(isDark)),
          ],
        ),
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
              hintText: 'ابحث باسم المنتج، البراند أو SKU...',
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
              child: DropdownButton<int?>(
                value: _filterCategoryId,
                isExpanded: true,
                hint: Text(
                  'كل التصنيفات',
                  style: GoogleFonts.tajawal(
                    color: AppColors.textMuted,
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                dropdownColor: isDark ? AppColors.dark700 : AppColors.white,
                items: [
                  DropdownMenuItem<int?>(
                    value: null,
                    child: Text(
                      'كل التصنيفات',
                      style: GoogleFonts.tajawal(
                        color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  ..._categories.map(
                    (cat) => DropdownMenuItem<int?>(
                      value: cat.id,
                      child: Text(
                        cat.nameAr,
                        style: GoogleFonts.tajawal(
                          color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimary,
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                ],
                onChanged: (val) {
                  setState(() {
                    _filterCategoryId = val;
                    _currentPage = 1;
                  });
                  _fetchProducts();
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
          if (!_isLoading && _products.isNotEmpty)
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
          _headerCell('المنتج', flex: 3),
          _headerCell('التصنيف', flex: 2),
          _headerCell('الماركة', flex: 2),
          _headerCell('السعر', flex: 2),
          _headerCell('الحالة', flex: 2),
          _headerCell('إجراءات', flex: 2),
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
      return const TableSkeleton(rows: 5, columns: 6);
    }
    if (_products.isEmpty) {
      return _buildEmptyState(isDark);
    }
    return ListView.builder(
      itemCount: _products.length,
      itemBuilder: (context, index) {
        final product = _products[index];
        return _buildProductRow(product, isDark);
      },
    );
  }

  Widget _buildEmptyState(bool isDark) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.inventory_2_outlined,
            size: 48,
            color: isDark ? AppColors.textMuted : AppColors.gold300,
          ),
          const SizedBox(height: 8),
          Text(
            'لا توجد منتجات',
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

  Widget _buildProductRow(ProductModel product, bool isDark) {
    return Container(
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
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.dark600 : AppColors.cream50,
                      border: Border.all(
                        color: isDark ? AppColors.dark600 : AppColors.gold100,
                      ),
                    ),
                    child: product.mainImage != null
                        ? Image.network(
                            product.mainImage!,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => _productImagePlaceholder(isDark),
                          )
                        : _productImagePlaceholder(isDark),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        product.nameAr,
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
                        product.slug,
                        style: GoogleFonts.poppins(
                          fontSize: 10,
                          color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            flex: 2,
            child: product.category != null
                ? Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.dark600 : AppColors.gold50,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      product.category!.nameAr,
                      style: GoogleFonts.tajawal(
                        fontSize: 11,
                        fontWeight: FontWeight.w900,
                        color: isDark ? AppColors.gold400 : AppColors.gold700,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  )
                : const SizedBox(),
          ),
          Expanded(
            flex: 2,
            child: Text(
              product.brand?.nameAr ?? '-',
              style: GoogleFonts.tajawal(
                fontSize: 12,
                fontWeight: FontWeight.w900,
                color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondary,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          Expanded(
            flex: 2,
            child: Text(
              '${product.displayPrice.toStringAsFixed(2)} ر.س',
              style: GoogleFonts.poppins(
                fontSize: 12,
                fontWeight: FontWeight.w900,
                color: isDark ? AppColors.gold400 : AppColors.gold700,
              ),
            ),
          ),
          Expanded(
            flex: 2,
            child: _buildStatus(product.isActive),
          ),
          Expanded(
            flex: 2,
            child: Row(
              children: [
                _actionButton(
                  Icons.edit_outlined,
                  AppColors.blue600,
                  isDark,
                  () {},
                ),
                const SizedBox(width: 8),
                _actionButton(
                  Icons.delete_outline,
                  AppColors.red600,
                  isDark,
                  () {},
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _productImagePlaceholder(bool isDark) {
    return Center(
      child: Icon(
        Icons.spa,
        size: 24,
        color: isDark ? AppColors.gold400 : AppColors.gold300,
      ),
    );
  }

  Widget _buildStatus(bool isActive) {
    final color = isActive ? AppColors.green600 : AppColors.red600;
    return Row(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 6),
        Text(
          isActive ? 'نشط' : 'غير نشط',
          style: GoogleFonts.tajawal(
            fontSize: 12,
            fontWeight: FontWeight.w900,
            color: color,
          ),
        ),
      ],
    );
  }

  Widget _actionButton(IconData icon, Color color, bool isDark, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: isDark ? AppColors.dark600 : AppColors.gray50,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(icon, size: 18, color: color),
      ),
    );
  }
}
