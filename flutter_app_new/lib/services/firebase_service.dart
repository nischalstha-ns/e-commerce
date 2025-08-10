import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/user_model.dart';
import '../models/product_model.dart';

class FirebaseService {
  static final FirebaseAuth _auth = FirebaseAuth.instance;
  static final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Auth methods
  static Future<UserCredential?> signInWithEmail(String email, String password) async {
    try {
      return await _auth.signInWithEmailAndPassword(email: email, password: password);
    } catch (e) {
      throw e.toString();
    }
  }

  static Future<UserCredential?> signUpWithEmail(String email, String password) async {
    try {
      return await _auth.createUserWithEmailAndPassword(email: email, password: password);
    } catch (e) {
      throw e.toString();
    }
  }

  static Future<void> signOut() async {
    await _auth.signOut();
  }

  static User? get currentUser => _auth.currentUser;

  // User methods
  static Future<void> createUserDocument(UserModel user) async {
    await _firestore.collection('users').doc(user.id).set(user.toMap());
  }

  static Future<UserModel?> getUserData(String uid) async {
    try {
      DocumentSnapshot doc = await _firestore.collection('users').doc(uid).get();
      if (doc.exists) {
        return UserModel.fromMap(doc.data() as Map<String, dynamic>, doc.id);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // Product methods
  static Stream<List<ProductModel>> getProducts() {
    return _firestore
        .collection('products')
        .where('status', isEqualTo: 'active')
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => ProductModel.fromMap(doc.data(), doc.id))
            .toList());
  }

  static Future<ProductModel?> getProduct(String id) async {
    try {
      DocumentSnapshot doc = await _firestore.collection('products').doc(id).get();
      if (doc.exists) {
        return ProductModel.fromMap(doc.data() as Map<String, dynamic>, doc.id);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // Cart methods
  static Future<void> addToCart(String userId, Map<String, dynamic> cartItem) async {
    DocumentReference cartRef = _firestore.collection('carts').doc(userId);
    DocumentSnapshot cartDoc = await cartRef.get();
    
    if (cartDoc.exists) {
      Map<String, dynamic> data = cartDoc.data() as Map<String, dynamic>;
      List<dynamic> items = data['items'] ?? [];
      items.add(cartItem);
      await cartRef.update({'items': items});
    } else {
      await cartRef.set({'items': [cartItem]});
    }
  }

  static Stream<DocumentSnapshot> getCartItems(String userId) {
    return _firestore.collection('carts').doc(userId).snapshots();
  }

  static Future<void> removeFromCart(String userId, int itemIndex) async {
    DocumentReference cartRef = _firestore.collection('carts').doc(userId);
    DocumentSnapshot cartDoc = await cartRef.get();
    
    if (cartDoc.exists) {
      Map<String, dynamic> data = cartDoc.data() as Map<String, dynamic>;
      List<dynamic> items = data['items'] ?? [];
      if (itemIndex < items.length) {
        items.removeAt(itemIndex);
        await cartRef.update({'items': items});
      }
    }
  }

  static Future<void> updateCartItem(String userId, int itemIndex, int quantity) async {
    DocumentReference cartRef = _firestore.collection('carts').doc(userId);
    DocumentSnapshot cartDoc = await cartRef.get();
    
    if (cartDoc.exists) {
      Map<String, dynamic> data = cartDoc.data() as Map<String, dynamic>;
      List<dynamic> items = data['items'] ?? [];
      if (itemIndex < items.length) {
        items[itemIndex]['quantity'] = quantity;
        await cartRef.update({'items': items});
      }
    }
  }

  static Future<void> clearCart(String userId) async {
    await _firestore.collection('carts').doc(userId).update({'items': []});
  }
}