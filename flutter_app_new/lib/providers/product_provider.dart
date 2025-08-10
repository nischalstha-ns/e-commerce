import 'package:flutter/material.dart';
import '../models/product_model.dart';
import '../services/firebase_service.dart';

class ProductProvider with ChangeNotifier {
  List<ProductModel> _products = [];
  bool _isLoading = false;

  List<ProductModel> get products => _products;
  bool get isLoading => _isLoading;

  ProductProvider() {
    _loadProducts();
  }

  void _loadProducts() {
    _isLoading = true;
    notifyListeners();

    FirebaseService.getProducts().listen((products) {
      _products = products;
      _isLoading = false;
      notifyListeners();
    });
  }

  List<ProductModel> searchProducts(String query) {
    if (query.isEmpty) return _products;
    return _products
        .where((product) =>
            product.name.toLowerCase().contains(query.toLowerCase()) ||
            product.description.toLowerCase().contains(query.toLowerCase()))
        .toList();
  }

  ProductModel? getProductById(String id) {
    try {
      return _products.firstWhere((product) => product.id == id);
    } catch (e) {
      return null;
    }
  }
}