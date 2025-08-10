class UserModel {
  final String id;
  final String email;
  final String? displayName;
  final String? photoURL;
  final String role;
  final DateTime? timestampCreate;

  UserModel({
    required this.id,
    required this.email,
    this.displayName,
    this.photoURL,
    this.role = 'customer',
    this.timestampCreate,
  });

  factory UserModel.fromMap(Map<String, dynamic> map, String id) {
    return UserModel(
      id: id,
      email: map['email'] ?? '',
      displayName: map['displayName'],
      photoURL: map['photoURL'],
      role: map['role'] ?? 'customer',
      timestampCreate: map['timestampCreate']?.toDate(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'email': email,
      'displayName': displayName,
      'photoURL': photoURL,
      'role': role,
      'timestampCreate': timestampCreate,
    };
  }
}