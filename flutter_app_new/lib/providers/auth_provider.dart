import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/user_model.dart';
import '../services/firebase_service.dart';

class AuthProvider with ChangeNotifier {
  User? _user;
  UserModel? _userModel;
  bool _isLoading = false;

  User? get user => _user;
  UserModel? get userModel => _userModel;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _user != null;
  bool get isAdmin => _userModel?.role == 'admin';

  AuthProvider() {
    _init();
  }

  void _init() {
    FirebaseAuth.instance.authStateChanges().listen((User? user) async {
      _user = user;
      if (user != null) {
        _userModel = await FirebaseService.getUserData(user.uid);
      } else {
        _userModel = null;
      }
      notifyListeners();
    });
  }

  Future<bool> signIn(String email, String password) async {
    try {
      _isLoading = true;
      notifyListeners();
      
      await FirebaseService.signInWithEmail(email, password);
      return true;
    } catch (e) {
      debugPrint('Sign in error: $e');
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  String? _errorMessage;
  String? get errorMessage => _errorMessage;

  Future<bool> signUp(String email, String password, String displayName) async {
    try {
      _isLoading = true;
      _errorMessage = null;
      notifyListeners();
      
      UserCredential? result = await FirebaseService.signUpWithEmail(email, password);
      if (result?.user != null) {
        UserModel newUser = UserModel(
          id: result!.user!.uid,
          email: email,
          displayName: displayName,
          role: 'customer',
          timestampCreate: DateTime.now(),
        );
        await FirebaseService.createUserDocument(newUser);
        return true;
      }
      return false;
    } catch (e) {
      if (e is FirebaseAuthException) {
        switch (e.code) {
          case 'email-already-in-use':
            _errorMessage = 'This email is already registered. Please use a different email or try logging in.';
            break;
          case 'weak-password':
            _errorMessage = 'Password is too weak. Please use a stronger password.';
            break;
          case 'invalid-email':
            _errorMessage = 'Invalid email address. Please enter a valid email.';
            break;
          default:
            _errorMessage = 'Sign up failed: ${e.message}';
        }
      } else {
        _errorMessage = 'An unexpected error occurred. Please try again.';
      }
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> signOut() async {
    await FirebaseService.signOut();
  }
}