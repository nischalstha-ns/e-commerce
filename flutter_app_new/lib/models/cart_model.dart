class CartItem {
  final String id;
  final String productId;
  final String productName;
  final String productImage;
  final double price;
  int quantity;
  final String? selectedSize;
  final String? selectedColor;

  CartItem({
    required this.id,
    required this.productId,
    required this.productName,
    required this.productImage,
    required this.price,
    this.quantity = 1,
    this.selectedSize,
    this.selectedColor,
  });

  factory CartItem.fromMap(Map<String, dynamic> map, String id) {
    return CartItem(
      id: id,
      productId: map['productId'] ?? '',
      productName: map['productName'] ?? '',
      productImage: map['productImage'] ?? '',
      price: (map['price'] ?? 0).toDouble(),
      quantity: map['quantity'] ?? 1,
      selectedSize: map['selectedSize'],
      selectedColor: map['selectedColor'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'productId': productId,
      'productName': productName,
      'productImage': productImage,
      'price': price,
      'quantity': quantity,
      'selectedSize': selectedSize,
      'selectedColor': selectedColor,
    };
  }

  double get totalPrice => price * quantity;
}