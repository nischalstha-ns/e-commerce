class ProductModel {
  final String id;
  final String name;
  final String description;
  final double price;
  final double? salePrice;
  final List<String> imageURLs;
  final String categoryId;
  final String? brandId;
  final int stock;
  final String status;
  final DateTime? timestampCreate;
  final List<String>? sizes;
  final List<String>? colors;

  ProductModel({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    this.salePrice,
    required this.imageURLs,
    required this.categoryId,
    this.brandId,
    this.stock = 0,
    this.status = 'active',
    this.timestampCreate,
    this.sizes,
    this.colors,
  });

  String get imageURL => imageURLs.isNotEmpty ? imageURLs.first : '';
  bool get isActive => status == 'active';
  double get displayPrice => salePrice ?? price;

  factory ProductModel.fromMap(Map<String, dynamic> map, String id) {
    return ProductModel(
      id: id,
      name: map['name'] ?? '',
      description: map['description'] ?? '',
      price: (map['price'] ?? 0).toDouble(),
      salePrice: map['salePrice']?.toDouble(),
      imageURLs: List<String>.from(map['imageURLs'] ?? []),
      categoryId: map['categoryId'] ?? '',
      brandId: map['brandId'],
      stock: map['stock'] ?? 0,
      status: map['status'] ?? 'active',
      timestampCreate: map['timestampCreate']?.toDate(),
      sizes: map['sizes'] != null ? List<String>.from(map['sizes']) : null,
      colors: map['colors'] != null ? List<String>.from(map['colors']) : null,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'name': name,
      'description': description,
      'price': price,
      'salePrice': salePrice,
      'imageURLs': imageURLs,
      'categoryId': categoryId,
      'brandId': brandId,
      'stock': stock,
      'status': status,
      'timestampCreate': timestampCreate,
      'sizes': sizes,
      'colors': colors,
    };
  }
}