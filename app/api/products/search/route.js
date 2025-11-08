import { NextResponse } from 'next/server';
import { db } from '@/lib/firestore/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { sanitizeInput } from '@/lib/validation';
import { withSecurity } from '@/lib/middleware/security';

async function handler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('q');
    const limitParam = searchParams.get('limit') || '20';

    if (!searchTerm || searchTerm.length < 3) {
      return NextResponse.json({ products: [] });
    }

    const sanitizedTerm = sanitizeInput(searchTerm);
    if (!sanitizedTerm) {
      return NextResponse.json({ products: [] });
    }

    const searchLimit = Math.min(parseInt(limitParam), 50); // Max 50 results

    if (!db) {
      return NextResponse.json(
        { error: 'Database unavailable' },
        { status: 503 }
      );
    }

    try {
      // Server-side search using Firestore queries
      const searchLower = sanitizedTerm.toLowerCase();
      
      // Search by name prefix (more efficient than contains)
      const nameQuery = query(
        collection(db, 'products'),
        where('status', '==', 'active'),
        where('name', '>=', searchLower),
        where('name', '<=', searchLower + '\uf8ff'),
        orderBy('name'),
        limit(searchLimit)
      );

      const nameSnapshot = await getDocs(nameQuery);
      const nameResults = nameSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // If we have enough results from name search, return them
      if (nameResults.length >= searchLimit) {
        return NextResponse.json({ products: nameResults });
      }

      // Otherwise, get additional results from category search
      const categoryQuery = query(
        collection(db, 'products'),
        where('status', '==', 'active'),
        orderBy('timestampCreate', 'desc'),
        limit(searchLimit * 2) // Get more to filter client-side
      );

      const categorySnapshot = await getDocs(categoryQuery);
      const allProducts = categorySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter by description and other fields
      const filteredProducts = allProducts.filter(product => {
        const nameMatch = product.name?.toLowerCase().includes(searchLower);
        const descMatch = product.description?.toLowerCase().includes(searchLower);
        
        // Avoid duplicates from name search
        const isDuplicate = nameResults.some(nr => nr.id === product.id);
        
        return !isDuplicate && (nameMatch || descMatch);
      });

      // Combine and limit results
      const combinedResults = [...nameResults, ...filteredProducts]
        .slice(0, searchLimit);

      return NextResponse.json({ products: combinedResults });

    } catch (firestoreError) {
      return NextResponse.json(
        { error: 'Search failed' },
        { status: 500 }
      );
    }

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withSecurity(handler);