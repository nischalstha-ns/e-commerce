import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/product_model.dart';
import '../providers/auth_provider.dart';
import '../providers/cart_provider.dart';
import '../services/firebase_service.dart';

class ProductDetailScreen extends StatefulWidget {
  final String productId;
  final ProductModel? product; // Optional product model if already available

  const ProductDetailScreen({
    super.key,
    required this.productId,
    this.product,
  });

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  ProductModel? _product;
  bool _isLoading = true;
  int _selectedImageIndex = 0;
  int _quantity = 1;
  String? _selectedSize;
  String? _selectedColor;

  @override
  void initState() {
    super.initState();
    _loadProduct();
  }

  Future<void> _loadProduct() async {
    if (widget.product != null) {
      setState(() {
        _product = widget.product;
        _isLoading = false;
      });
      return;
    }

    try {
      final product = await FirebaseService.getProduct(widget.productId);
      setState(() {
        _product = product;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading product: ${e.toString()}'))
        );
      }
    }
  }

  void _addToCart() {
    if (_product == null) return;

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final cartProvider = Provider.of<CartProvider>(context, listen: false);

    if (authProvider.user != null) {
      cartProvider.addToCart(
        authProvider.user!.uid,
        _product!,
        quantity: _quantity,
        selectedSize: _selectedSize,
        selectedColor: _selectedColor,
      );
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('${_product!.name} added to cart'),
          duration: const Duration(seconds: 2),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please login to add items to cart'),
          duration: Duration(seconds: 2),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_isLoading ? 'Product Details' : _product?.name ?? 'Product Details'),
        actions: [
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: () {
              // Share functionality would be implemented here
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Share functionality coming soon'))
              );
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _product == null
              ? const Center(child: Text('Product not found'))
              : _buildProductDetails(),
      bottomNavigationBar: _isLoading || _product == null
          ? null
          : _buildBottomBar(),
    );
  }

  Widget _buildProductDetails() {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Product Images
          _buildProductImages(),
          
          // Product Info
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Product Name
                Text(
                  _product!.name,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                
                // Price
                Row(
                  children: [
                    Text(
                      '\$${_product!.displayPrice.toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Colors.blue,
                      ),
                    ),
                    if (_product!.salePrice != null)
                      Padding(
                        padding: const EdgeInsets.only(left: 8.0),
                        child: Text(
                          '\$${_product!.price.toStringAsFixed(2)}',
                          style: const TextStyle(
                            fontSize: 16,
                            decoration: TextDecoration.lineThrough,
                            color: Colors.grey,
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 16),
                
                // Rating (placeholder for now)
                Row(
                  children: [
                    const Icon(Icons.star, color: Colors.amber, size: 20),
                    const Icon(Icons.star, color: Colors.amber, size: 20),
                    const Icon(Icons.star, color: Colors.amber, size: 20),
                    const Icon(Icons.star, color: Colors.amber, size: 20),
                    const Icon(Icons.star_half, color: Colors.amber, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      '4.5 (122 reviews)',
                      style: TextStyle(color: Colors.grey[600]),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                
                // Size Selector
                if (_product!.sizes?.isNotEmpty == true)
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Size:',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      _buildSizeSelector(),
                      const SizedBox(height: 24),
                    ],
                  ),
                
                // Color Selector
                if (_product!.colors?.isNotEmpty == true)
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Color:',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      _buildColorSelector(),
                      const SizedBox(height: 24),
                    ],
                  ),
                
                // Quantity Selector
                Row(
                  children: [
                    const Text(
                      'Quantity:',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(width: 16),
                    _buildQuantitySelector(),
                  ],
                ),
                const SizedBox(height: 24),
                
                // Description
                const Text(
                  'Description',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text(
                  _product!.description,
                  style: const TextStyle(fontSize: 16, height: 1.5),
                ),
                const SizedBox(height: 24),
                
                // Stock Status
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: _product!.stock > 0 ? Colors.green[50] : Colors.red[50],
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    _product!.stock > 0 
                        ? 'In Stock (${_product!.stock} available)' 
                        : 'Out of Stock',
                    style: TextStyle(
                      color: _product!.stock > 0 ? Colors.green[700] : Colors.red[700],
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProductImages() {
    return Column(
      children: [
        // Main Image
        AspectRatio(
          aspectRatio: 1,
          child: CachedNetworkImage(
            imageUrl: _product!.imageURLs.isNotEmpty 
                ? _product!.imageURLs[_selectedImageIndex]
                : 'https://via.placeholder.com/400',
            fit: BoxFit.cover,
            placeholder: (context, url) => Container(
              color: Colors.grey[200],
              child: const Center(child: CircularProgressIndicator()),
            ),
            errorWidget: (context, url, error) => Container(
              color: Colors.grey[200],
              child: const Icon(Icons.error, color: Colors.red, size: 50),
            ),
          ),
        ),
        
        // Thumbnail Images
        if (_product!.imageURLs.length > 1)
          Container(
            height: 80,
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: _product!.imageURLs.length,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemBuilder: (context, index) {
                return GestureDetector(
                  onTap: () => setState(() => _selectedImageIndex = index),
                  child: Container(
                    width: 64,
                    height: 64,
                    margin: const EdgeInsets.only(right: 8),
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: _selectedImageIndex == index 
                            ? Colors.blue 
                            : Colors.grey[300]!,
                        width: 2,
                      ),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(6),
                      child: CachedNetworkImage(
                        imageUrl: _product!.imageURLs[index],
                        fit: BoxFit.cover,
                        placeholder: (context, url) => Container(
                          color: Colors.grey[200],
                          child: const Center(child: CircularProgressIndicator(strokeWidth: 2)),
                        ),
                        errorWidget: (context, url, error) => Container(
                          color: Colors.grey[200],
                          child: const Icon(Icons.error, color: Colors.red),
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
      ],
    );
  }

  Widget _buildQuantitySelector() {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Decrease button
          IconButton(
            icon: const Icon(Icons.remove),
            onPressed: _quantity > 1 
                ? () => setState(() => _quantity--)
                : null,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
          ),
          
          // Quantity display
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            child: Text(
              _quantity.toString(),
              style: const TextStyle(fontSize: 16),
            ),
          ),
          
          // Increase button
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: _quantity < (_product?.stock ?? 10) 
                ? () => setState(() => _quantity++)
                : null,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomBar() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withValues(alpha: 0.3),
            spreadRadius: 1,
            blurRadius: 5,
            offset: const Offset(0, -3),
          ),
        ],
      ),
      child: Row(
        children: [
          // Wishlist button
          Container(
            width: 50,
            height: 50,
            margin: const EdgeInsets.only(right: 16),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey[300]!),
              borderRadius: BorderRadius.circular(8),
            ),
            child: IconButton(
              icon: const Icon(Icons.favorite_border),
              onPressed: () {
                // Wishlist functionality would be implemented here
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Wishlist functionality coming soon'))
                );
              },
            ),
          ),
          
          // Add to Cart button
          Expanded(
            child: SizedBox(
              height: 50,
              child: ElevatedButton(
                onPressed: _product!.stock > 0 ? _addToCart : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: const Text(
                  'Add to Cart',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildSizeSelector() {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: _product!.sizes?.map((size) {
        final isSelected = _selectedSize == size;
        return GestureDetector(
          onTap: () {
            setState(() {
              _selectedSize = size;
            });
          },
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: isSelected ? Colors.blue : Colors.white,
              border: Border.all(color: isSelected ? Colors.blue : Colors.grey[300]!),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              size,
              style: TextStyle(
                color: isSelected ? Colors.white : Colors.black,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ),
        );
      }).toList() ?? [],
    );
  }
  
  Widget _buildColorSelector() {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: _product!.colors?.map((color) {
        final isSelected = _selectedColor == color;
        return GestureDetector(
          onTap: () {
            setState(() {
              _selectedColor = color;
            });
          },
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: isSelected ? Colors.blue : Colors.white,
              border: Border.all(color: isSelected ? Colors.blue : Colors.grey[300]!),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              color,
              style: TextStyle(
                color: isSelected ? Colors.white : Colors.black,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ),
        );
      }).toList() ?? [],
    );
  }
}