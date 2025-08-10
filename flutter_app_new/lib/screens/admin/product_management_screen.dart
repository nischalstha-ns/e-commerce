import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'dart:io';
import '../../models/product_model.dart';
import '../../providers/auth_provider.dart';

import '../product_detail_screen.dart';

class ProductManagementScreen extends StatefulWidget {
  const ProductManagementScreen({super.key});

  @override
  State<ProductManagementScreen> createState() => _ProductManagementScreenState();
}

class _ProductManagementScreenState extends State<ProductManagementScreen> {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseStorage _storage = FirebaseStorage.instance;
  final ImagePicker _picker = ImagePicker();
  
  List<ProductModel> _products = [];
  bool _isLoading = true;
  bool _isEditing = false;
  ProductModel? _selectedProduct;
  
  // Form controllers
  final _nameController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _priceController = TextEditingController();
  final _salePriceController = TextEditingController();
  final _stockController = TextEditingController();
  String _status = 'active';
  List<String> _imageURLs = [];
  List<File> _newImages = [];
  List<String> _sizes = [];
  List<String> _colors = [];
  final _newSizeController = TextEditingController();
  final _newColorController = TextEditingController();
  
  @override
  void initState() {
    super.initState();
    _loadProducts();
  }
  
  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    _priceController.dispose();
    _salePriceController.dispose();
    _stockController.dispose();
    _newSizeController.dispose();
    _newColorController.dispose();
    super.dispose();
  }
  
  Future<void> _loadProducts() async {
    setState(() {
      _isLoading = true;
    });
    
    try {
      final snapshot = await _firestore.collection('products').get();
      _products = snapshot.docs
          .map((doc) => ProductModel.fromMap(doc.data(), doc.id))
          .toList();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading products: ${e.toString()}'))
        );
      }
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }
  
  void _editProduct(ProductModel product) {
    setState(() {
      _isEditing = true;
      _selectedProduct = product;
      _nameController.text = product.name;
      _descriptionController.text = product.description;
      _priceController.text = product.price.toString();
      _salePriceController.text = product.salePrice?.toString() ?? '';
      _stockController.text = product.stock.toString();
      _status = product.status;
      _imageURLs = List<String>.from(product.imageURLs);
      _sizes = product.sizes != null ? List<String>.from(product.sizes!) : [];
      _colors = product.colors != null ? List<String>.from(product.colors!) : [];
      _newImages = [];
    });
  }
  
  void _resetForm() {
    setState(() {
      _isEditing = false;
      _selectedProduct = null;
      _nameController.clear();
      _descriptionController.clear();
      _priceController.clear();
      _salePriceController.clear();
      _stockController.clear();
      _status = 'active';
      _imageURLs = [];
      _newImages = [];
      _sizes = [];
      _colors = [];
      _newSizeController.clear();
      _newColorController.clear();
    });
  }
  
  Future<void> _pickImages() async {
    final List<XFile> images = await _picker.pickMultiImage();
    if (images.isNotEmpty) {
      setState(() {
        _newImages.addAll(images.map((image) => File(image.path)).toList());
      });
    }
  }
  
  Future<List<String>> _uploadImages() async {
    List<String> urls = [];
    
    // Keep existing images
    urls.addAll(_imageURLs);
    
    // Upload new images
    for (var image in _newImages) {
      final ref = _storage.ref().child('products/${DateTime.now().millisecondsSinceEpoch}_${urls.length}.jpg');
      await ref.putFile(image);
      final url = await ref.getDownloadURL();
      urls.add(url);
    }
    
    return urls;
  }
  
  Future<void> _saveProduct() async {
    if (_nameController.text.isEmpty ||
        _descriptionController.text.isEmpty ||
        _priceController.text.isEmpty ||
        _stockController.text.isEmpty) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please fill all required fields'))
        );
      }
      return;
    }
    
    try {
      setState(() => _isLoading = true);
      
      final List<String> imageUrls = await _uploadImages();
      
      final Map<String, dynamic> productData = {
        'name': _nameController.text,
        'description': _descriptionController.text,
        'price': double.parse(_priceController.text),
        'salePrice': _salePriceController.text.isNotEmpty 
            ? double.parse(_salePriceController.text) 
            : null,
        'stock': int.parse(_stockController.text),
        'status': _status,
        'imageURLs': imageUrls,
        'sizes': _sizes.isNotEmpty ? _sizes : null,
        'colors': _colors.isNotEmpty ? _colors : null,
        'timestampUpdate': FieldValue.serverTimestamp(),
      };
      
      if (_isEditing && _selectedProduct != null) {
        // Update existing product
        await _firestore.collection('products').doc(_selectedProduct!.id).update(productData);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Product updated successfully'))
          );
        }
      } else {
        // Create new product
        productData['timestampCreate'] = FieldValue.serverTimestamp();
        await _firestore.collection('products').add(productData);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Product created successfully'))
          );
        }
      }
      
      _resetForm();
      _loadProducts();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error saving product: ${e.toString()}'))
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }
  
  Future<void> _deleteProduct(String productId) async {
    try {
      await _firestore.collection('products').doc(productId).delete();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Product deleted successfully'))
        );
      }
      _loadProducts();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error deleting product: ${e.toString()}'))
        );
      }
    }
  }
  
  void _confirmDelete(String productId, String productName) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Product'),
        content: Text('Are you sure you want to delete "$productName"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _deleteProduct(productId);
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }
  
  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    
    if (!authProvider.isAdmin) {
      return Scaffold(
        appBar: AppBar(title: const Text('Access Denied')),
        body: const Center(
          child: Text('You do not have permission to access this page.'),
        ),
      );
    }
    
    return Scaffold(
      appBar: AppBar(
        title: Text(_isEditing ? 'Edit Product' : 'Product Management'),
        actions: [
          if (_isEditing)
            IconButton(
              icon: const Icon(Icons.close),
              onPressed: _resetForm,
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _isEditing
              ? _buildProductForm()
              : _buildProductList(),
      floatingActionButton: _isEditing
          ? null
          : FloatingActionButton(
              onPressed: () {
                setState(() {
                  _isEditing = true;
                  _selectedProduct = null;
                });
              },
              child: const Icon(Icons.add),
            ),
    );
  }
  
  Widget _buildProductList() {
    return ListView.builder(
      itemCount: _products.length,
      padding: const EdgeInsets.all(16),
      itemBuilder: (context, index) {
        final product = _products[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 16),
          child: ListTile(
            contentPadding: const EdgeInsets.all(8),
            leading: ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: product.imageURLs.isNotEmpty
                  ? CachedNetworkImage(
                      imageUrl: product.imageURLs[0],
                      width: 60,
                      height: 60,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Container(
                        color: Colors.grey[200],
                        child: const Center(child: CircularProgressIndicator()),
                      ),
                      errorWidget: (context, url, error) => Container(
                        color: Colors.grey[200],
                        child: const Icon(Icons.error),
                      ),
                    )
                  : Container(
                      width: 60,
                      height: 60,
                      color: Colors.grey[300],
                      child: const Icon(Icons.image_not_supported),
                    ),
            ),
            title: Text(product.name),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Price: \$${product.price.toStringAsFixed(2)}'),
                Text('Stock: ${product.stock}'),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: product.status == 'active' ? Colors.green[100] : Colors.grey[300],
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    product.status.toUpperCase(),
                    style: TextStyle(
                      fontSize: 10,
                      color: product.status == 'active' ? Colors.green[800] : Colors.grey[700],
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  icon: const Icon(Icons.visibility, color: Colors.blue),
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => ProductDetailScreen(
                          productId: product.id,
                          product: product,
                        ),
                      ),
                    );
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.edit, color: Colors.orange),
                  onPressed: () => _editProduct(product),
                ),
                IconButton(
                  icon: const Icon(Icons.delete, color: Colors.red),
                  onPressed: () => _confirmDelete(product.id, product.name),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
  
  Widget _buildProductForm() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Product Images
          const Text(
            'Product Images',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          
          // Existing Images
          if (_imageURLs.isNotEmpty)
            SizedBox(
              height: 100,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: _imageURLs.length,
                itemBuilder: (context, index) {
                  return Stack(
                    children: [
                      Container(
                        width: 100,
                        height: 100,
                        margin: const EdgeInsets.only(right: 8),
                        decoration: BoxDecoration(
                          border: Border.all(color: Colors.grey),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: CachedNetworkImage(
                            imageUrl: _imageURLs[index],
                            fit: BoxFit.cover,
                            placeholder: (context, url) => const Center(
                              child: CircularProgressIndicator(),
                            ),
                            errorWidget: (context, url, error) => const Icon(Icons.error),
                          ),
                        ),
                      ),
                      Positioned(
                        top: 0,
                        right: 8,
                        child: GestureDetector(
                          onTap: () {
                            setState(() {
                              _imageURLs.removeAt(index);
                            });
                          },
                          child: Container(
                            padding: const EdgeInsets.all(2),
                            decoration: const BoxDecoration(
                              color: Colors.red,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.close,
                              color: Colors.white,
                              size: 16,
                            ),
                          ),
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),
          
          // New Images
          if (_newImages.isNotEmpty)
            SizedBox(
              height: 100,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: _newImages.length,
                itemBuilder: (context, index) {
                  return Stack(
                    children: [
                      Container(
                        width: 100,
                        height: 100,
                        margin: const EdgeInsets.only(right: 8, top: 8),
                        decoration: BoxDecoration(
                          border: Border.all(color: Colors.grey),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.file(
                            _newImages[index],
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                      Positioned(
                        top: 8,
                        right: 8,
                        child: GestureDetector(
                          onTap: () {
                            setState(() {
                              _newImages.removeAt(index);
                            });
                          },
                          child: Container(
                            padding: const EdgeInsets.all(2),
                            decoration: const BoxDecoration(
                              color: Colors.red,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.close,
                              color: Colors.white,
                              size: 16,
                            ),
                          ),
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),
          
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: _pickImages,
            icon: const Icon(Icons.add_photo_alternate),
            label: const Text('Add Images'),
          ),
          const SizedBox(height: 24),
          
          // Product Details Form
          TextField(
            controller: _nameController,
            decoration: const InputDecoration(
              labelText: 'Product Name *',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 16),
          
          TextField(
            controller: _descriptionController,
            decoration: const InputDecoration(
              labelText: 'Description *',
              border: OutlineInputBorder(),
            ),
            maxLines: 3,
          ),
          const SizedBox(height: 16),
          
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _priceController,
                  decoration: const InputDecoration(
                    labelText: 'Price *',
                    border: OutlineInputBorder(),
                    prefixText: '\$',
                  ),
                  keyboardType: TextInputType.number,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: TextField(
                  controller: _salePriceController,
                  decoration: const InputDecoration(
                    labelText: 'Sale Price (optional)',
                    border: OutlineInputBorder(),
                    prefixText: '\$',
                  ),
                  keyboardType: TextInputType.number,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          
          TextField(
            controller: _stockController,
            decoration: const InputDecoration(
              labelText: 'Stock *',
              border: OutlineInputBorder(),
            ),
            keyboardType: TextInputType.number,
          ),
          const SizedBox(height: 16),
          
          DropdownButtonFormField<String>(
            value: _status,
            decoration: const InputDecoration(
              labelText: 'Status',
              border: OutlineInputBorder(),
            ),
            items: const [
              DropdownMenuItem(value: 'active', child: Text('Active')),
              DropdownMenuItem(value: 'inactive', child: Text('Inactive')),
              DropdownMenuItem(value: 'draft', child: Text('Draft')),
            ],
            onChanged: (value) {
              if (value != null) {
                setState(() {
                  _status = value;
                });
              }
            },
          ),
          const SizedBox(height: 24),
          
          // Sizes
          const Text(
            'Sizes',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              ..._sizes.map((size) => Chip(
                    label: Text(size),
                    deleteIcon: const Icon(Icons.close, size: 16),
                    onDeleted: () {
                      setState(() {
                        _sizes.remove(size);
                      });
                    },
                  )),
              SizedBox(
                width: 200,
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _newSizeController,
                        decoration: const InputDecoration(
                          hintText: 'Add size',
                          isDense: true,
                          contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 12),
                        ),
                        onSubmitted: (value) {
                          if (value.isNotEmpty && !_sizes.contains(value)) {
                            setState(() {
                              _sizes.add(value);
                              _newSizeController.clear();
                            });
                          }
                        },
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.add_circle),
                      onPressed: () {
                        final value = _newSizeController.text;
                        if (value.isNotEmpty && !_sizes.contains(value)) {
                          setState(() {
                            _sizes.add(value);
                            _newSizeController.clear();
                          });
                        }
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          
          // Colors
          const Text(
            'Colors',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              ..._colors.map((color) => Chip(
                    label: Text(color),
                    deleteIcon: const Icon(Icons.close, size: 16),
                    onDeleted: () {
                      setState(() {
                        _colors.remove(color);
                      });
                    },
                  )),
              SizedBox(
                width: 200,
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _newColorController,
                        decoration: const InputDecoration(
                          hintText: 'Add color',
                          isDense: true,
                          contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 12),
                        ),
                        onSubmitted: (value) {
                          if (value.isNotEmpty && !_colors.contains(value)) {
                            setState(() {
                              _colors.add(value);
                              _newColorController.clear();
                            });
                          }
                        },
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.add_circle),
                      onPressed: () {
                        final value = _newColorController.text;
                        if (value.isNotEmpty && !_colors.contains(value)) {
                          setState(() {
                            _colors.add(value);
                            _newColorController.clear();
                          });
                        }
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 32),
          
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: _saveProduct,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue,
                foregroundColor: Colors.white,
              ),
              child: Text(
                _isEditing && _selectedProduct != null ? 'Update Product' : 'Create Product',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
    );
  }
}