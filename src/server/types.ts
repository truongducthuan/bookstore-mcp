// src/server/types.ts

export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  category: string;
  description: string;
  coverImage: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  publishYear: number;
  pages: number;
  language: string;
}

export interface CartItem {
  bookId: string;
  quantity: number;
  addedAt: string;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  total: number;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  items: Array<{
    book: Book;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
}

export interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
}

// Widget Props Types
export interface BookListProps {
  books: Book[];
  total: number;
  filters: SearchFilters;
  query?: string;
}

export interface BookDetailProps {
  book: Book;
  relatedBooks: Book[];
  inCart: boolean;
  cartQuantity: number;
}

export interface CartProps {
  items: Array<{
    book: Book;
    quantity: number;
    subtotal: number;
  }>;
  total: number;
  itemCount: number;
}

export interface OrderHistoryProps {
  orders: Order[];
  totalOrders: number;
  totalSpent: number;
}