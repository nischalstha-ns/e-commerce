import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import 'product_management_screen.dart';

class AdminPanelScreen extends StatelessWidget {
  const AdminPanelScreen({super.key});

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
        title: const Text('Admin Panel'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: GridView.count(
          crossAxisCount: 2,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          children: [
            _buildAdminTile(
              context,
              'Product Management',
              Icons.inventory,
              Colors.blue,
              () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const ProductManagementScreen(),
                ),
              ),
            ),
            _buildAdminTile(
              context,
              'Order Management',
              Icons.shopping_bag,
              Colors.green,
              () {
                // Navigate to order management screen
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Order Management coming soon')),
                );
              },
            ),
            _buildAdminTile(
              context,
              'User Management',
              Icons.people,
              Colors.orange,
              () {
                // Navigate to user management screen
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('User Management coming soon')),
                );
              },
            ),
            _buildAdminTile(
              context,
              'Analytics',
              Icons.analytics,
              Colors.purple,
              () {
                // Navigate to analytics screen
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Analytics coming soon')),
                );
              },
            ),
            _buildAdminTile(
              context,
              'Settings',
              Icons.settings,
              Colors.grey,
              () {
                // Navigate to settings screen
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Settings coming soon')),
                );
              },
            ),
            _buildAdminTile(
              context,
              'Featured Products',
              Icons.star,
              Colors.amber,
              () {
                // Navigate to featured products screen
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Featured Products coming soon')),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildAdminTile(
    BuildContext context,
    String title,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withValues(alpha: 0.2),
              spreadRadius: 1,
              blurRadius: 5,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 40, color: color),
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}