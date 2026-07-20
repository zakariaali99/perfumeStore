import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../models/product_model.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';

class ProductsListPage extends StatefulWidget {
  const ProductsListPage({super.key});

  @override
  State<ProductsListPage> createState() => _ProductsListPageState();
}

class _ProductsListPageState extends State<ProductsListPage> {
  bool _isLoading = true;
  List<ProductModel> _products = [];
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchProducts();
  }

  Future<void> _fetchProducts() async {
    setState(() => _isLoading = true);

    try {
      final apiService = Get.find<ApiService>();
      final response = await apiService.products.getAdminProducts(
        search: _searchController.text.trim().isNotEmpty ? _searchController.text.trim() : null,
      );

      final List rawList = (response is Map && response.containsKey('results'))
          ? response['results']
          : (response is List ? response : []);

      setState(() {
        _products = rawList.map((e) => ProductModel.fromJson(e)).toList();
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      Get.snackbar(
        'خطأ',
        'تعذر تحميل قائمة المنتجات',
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
        title: const Text('إدارة المنتجات'),
      ),
      body: Column(
        children: [
          // Search box
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'بحث باسم المنتج...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.clear),
                  onPressed: () {
                    _searchController.clear();
                    _fetchProducts();
                  },
                ),
              ),
              onSubmitted: (_) => _fetchProducts(),
            ),
          ),

          // Products List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _products.isEmpty
                    ? const Center(child: Text('لا توجد منتجات مطابقة'))
                    : RefreshIndicator(
                        onRefresh: _fetchProducts,
                        child: ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: _products.length,
                          itemBuilder: (context, index) {
                            final product = _products[index];

                            return Card(
                              margin: const EdgeInsets.only(bottom: 12),
                              child: ListTile(
                                leading: CircleAvatar(
                                  backgroundColor: AppTheme.goldPrimary.withOpacity(0.2),
                                  child: const Icon(Icons.spa, color: AppTheme.goldDark),
                                ),
                                title: Text(
                                  product.nameAr,
                                  style: const TextStyle(fontWeight: FontWeight.bold),
                                ),
                                subtitle: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    if (product.category != null)
                                      Text(
                                        'القسم: ${product.category!.nameAr}',
                                        style: const TextStyle(fontSize: 12),
                                      ),
                                    const SizedBox(height: 4),
                                    Row(
                                      children: [
                                        Text(
                                          'السعر: ${product.displayPrice.toStringAsFixed(2)} ر.س',
                                          style: const TextStyle(
                                            color: AppTheme.goldDark,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                        const SizedBox(width: 16),
                                        Text(
                                          'المخزون الإجمالي: ${product.totalStock}',
                                          style: TextStyle(
                                            color: product.totalStock < 5 ? Colors.red : Colors.green,
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
