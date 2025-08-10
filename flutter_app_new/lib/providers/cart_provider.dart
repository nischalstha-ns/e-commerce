import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import '../models/cart_model.dart';
import '../models/product_model.dart';
import '../services/firebase_service.dart';

class CartProvider with ChangeNotifier {
  List<CartItem> _items = [];
  bool _isLoading = false;

  List<CartItem> get items => _items;
  bool get isLoading => _isLoading;
  int get itemCount => _items.length;
  double get totalAmount => _items.fold(0.0, (sum, item) => sum + item.totalPrice);

  void loadCart(String userId) {
    _isLoading = true;
    notifyListeners();

    FirebaseService.getCartItems(userId).listen((snapshot) {
      if (snapshot.exists) {
        Map<String, dynamic> data = snapshot.data() as Map<String, dynamic>;
        List<dynamic> itemsData = data['items'] ?? [];
        _items = itemsData.asMap().entries
            .map((entry) => CartItem.fromMap(entry.value, entry.key.toString()))
            .toList();
      } else {
        _items = [];
      }
      _isLoading = false;
      notifyListeners();
    });
  }

  Future<void> addToCart(
    String userId, 
    ProductModel product, {
    int quantity = 1,
    String? selectedSize,
    String? selectedColor,
  }) async {
    try {
      // Check if the same product with the same options exists
      int existingIndex = _items.indexWhere((item) => 
        item.productId == product.id && 
        item.selectedSize == selectedSize && 
        item.selectedColor == selectedColor
      );
      
      if (existingIndex >= 0) {
        await FirebaseService.updateCartItem(
          userId, 
          existingIndex, 
          _items[existingIndex].quantity + quantity
        );
      } else {
        Map<String, dynamic> cartItem = {
          'productId': product.id,
          'productName': product.name,
          'productImage': product.imageURL,
          'price': product.displayPrice,
          'quantity': quantity,
          'selectedSize': selectedSize,
          'selectedColor': selectedColor,
        };
        await FirebaseService.addToCart(userId, cartItem);
      }
    } catch (e) {
      debugPrint('Add to cart error: $e');
    }
  }

  Future<void> removeFromCart(String userId, int itemIndex) async {
    try {
      await FirebaseService.removeFromCart(userId, itemIndex);
    } catch (e) {
      // Handle error
    }
  }

  Future<void> updateQuantity(String userId, int itemIndex, int quantity) async {
    try {
      if (quantity <= 0) {
        await removeFromCart(userId, itemIndex);
      } else {
        await FirebaseService.updateCartItem(userId, itemIndex, quantity);
      }
    } catch (e) {
      // Handle error
    }
  }

  void clearCart() {
    _items.clear();
    notifyListeners();
  }
}