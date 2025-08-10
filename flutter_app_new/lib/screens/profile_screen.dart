import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import 'auth/login_screen.dart';
import 'admin/admin_panel_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        final user = authProvider.userModel;
        
        return Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              const SizedBox(height: 20),
              CircleAvatar(
                radius: 50,
                backgroundColor: Colors.blue,
                child: user?.photoURL != null
                    ? ClipOval(
                        child: Image.network(
                          user!.photoURL!,
                          width: 100,
                          height: 100,
                          fit: BoxFit.cover,
                        ),
                      )
                    : Text(
                        user?.displayName?.substring(0, 1).toUpperCase() ?? 'U',
                        style: const TextStyle(fontSize: 40, color: Colors.white),
                      ),
              ),
              const SizedBox(height: 20),
              Text(
                user?.displayName ?? 'User',
                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                user?.email ?? '',
                style: const TextStyle(fontSize: 16, color: Colors.grey),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: authProvider.isAdmin ? Colors.red : Colors.blue,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  user?.role.toUpperCase() ?? 'CUSTOMER',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(height: 40),
              _buildProfileOption(
                icon: Icons.person,
                title: 'Edit Profile',
                onTap: () {
                  // Navigate to edit profile screen
                },
              ),
              _buildProfileOption(
                icon: Icons.shopping_bag,
                title: 'My Orders',
                onTap: () {
                  // Navigate to orders screen
                },
              ),
              _buildProfileOption(
                icon: Icons.favorite,
                title: 'Wishlist',
                onTap: () {
                  // Navigate to wishlist screen
                },
              ),
              _buildProfileOption(
                icon: Icons.settings,
                title: 'Settings',
                onTap: () {
                  // Navigate to settings screen
                },
              ),
              if (authProvider.isAdmin)
                _buildProfileOption(
                  icon: Icons.admin_panel_settings,
                  title: 'Admin Panel',
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const AdminPanelScreen(),
                      ),
                    );
                  },
                ),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: () => _signOut(context, authProvider),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red,
                    foregroundColor: Colors.white,
                  ),
                  child: const Text('Sign Out', style: TextStyle(fontSize: 18)),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildProfileOption({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(icon, color: Colors.blue),
      title: Text(title),
      trailing: const Icon(Icons.arrow_forward_ios, size: 16),
      onTap: onTap,
    );
  }

  void _signOut(BuildContext context, AuthProvider authProvider) async {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Sign Out'),
        content: const Text('Are you sure you want to sign out?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.of(context).pop();
              await authProvider.signOut();
              if (context.mounted) {
                Navigator.of(context).pushReplacement(
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                );
              }
            },
            child: const Text('Sign Out'),
          ),
        ],
      ),
    );
  }
}