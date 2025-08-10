import 'package:fluttertoast/fluttertoast.dart';
import 'package:flutter/material.dart';

class ErrorHandler {
  static void showError(String message) {
    Fluttertoast.showToast(
      msg: message,
      toastLength: Toast.LENGTH_SHORT,
      gravity: ToastGravity.BOTTOM,
      backgroundColor: Colors.red,
      textColor: Colors.white,
    );
  }

  static void showSuccess(String message) {
    Fluttertoast.showToast(
      msg: message,
      toastLength: Toast.LENGTH_SHORT,
      gravity: ToastGravity.BOTTOM,
      backgroundColor: Colors.green,
      textColor: Colors.white,
    );
  }

  static String getFirebaseErrorMessage(String error) {
    if (error.contains('user-not-found')) {
      return 'No user found with this email';
    } else if (error.contains('wrong-password')) {
      return 'Incorrect password';
    } else if (error.contains('email-already-in-use')) {
      return 'Email is already registered';
    } else if (error.contains('weak-password')) {
      return 'Password is too weak';
    } else if (error.contains('invalid-email')) {
      return 'Invalid email address';
    } else if (error.contains('permission-denied')) {
      return 'Access denied';
    }
    return 'An error occurred. Please try again';
  }
}