// src/server/database.ts
import type { Book, Cart, Order, CartItem } from './types.ts';

// Sample books data
export const books: Book[] = [
  {
    id: '1',
    title: 'TypeScript Deep Dive',
    author: 'Basarat Ali Syed',
    price: 29.99,
    category: 'Programming',
    description: 'Comprehensive guide to TypeScript with best practices and advanced patterns',
    coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300',
    rating: 4.8,
    reviews: 256,
    inStock: true,
    publishYear: 2023,
    pages: 450,
    language: 'English'
  },
  {
    id: '2',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    price: 39.99,
    category: 'Programming',
    description: 'A handbook of agile software craftsmanship',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300',
    rating: 4.9,
    reviews: 1203,
    inStock: true,
    publishYear: 2008,
    pages: 464,
    language: 'English'
  },
  {
    id: '3',
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    price: 49.99,
    category: 'Database',
    description: 'The big ideas behind reliable, scalable, and maintainable systems',
    coverImage: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=300',
    rating: 4.9,
    reviews: 892,
    inStock: true,
    publishYear: 2017,
    pages: 616,
    language: 'English'
  },
  {
    id: '4',
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt, David Thomas',
    price: 44.99,
    category: 'Programming',
    description: 'Your journey to mastery, 20th Anniversary Edition',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300',
    rating: 4.7,
    reviews: 567,
    inStock: true,
    publishYear: 2019,
    pages: 352,
    language: 'English'
  },
  {
    id: '5',
    title: 'Domain-Driven Design',
    author: 'Eric Evans',
    price: 54.99,
    category: 'Software Architecture',
    description: 'Tackling complexity in the heart of software',
    coverImage: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=300',
    rating: 4.6,
    reviews: 423,
    inStock: true,
    publishYear: 2003,
    pages: 560,
    language: 'English'
  },
  {
    id: '6',
    title: 'System Design Interview',
    author: 'Alex Xu',
    price: 34.99,
    category: 'System Design',
    description: 'An insider\'s guide, Volume 1 & 2',
    coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300',
    rating: 4.8,
    reviews: 678,
    inStock: true,
    publishYear: 2020,
    pages: 280,
    language: 'English'
  },
  {
    id: '7',
    title: 'Refactoring',
    author: 'Martin Fowler',
    price: 42.99,
    category: 'Programming',
    description: 'Improving the design of existing code',
    coverImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300',
    rating: 4.7,
    reviews: 512,
    inStock: false,
    publishYear: 2018,
    pages: 448,
    language: 'English'
  },
  {
    id: '8',
    title: 'Microservices Patterns',
    author: 'Chris Richardson',
    price: 47.99,
    category: 'Software Architecture',
    description: 'With examples in Java',
    coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300',
    rating: 4.5,
    reviews: 345,
    inStock: true,
    publishYear: 2018,
    pages: 520,
    language: 'English'
  }
];

// In-memory storage
export const carts = new Map<string, Cart>();
export const orders = new Map<string, Order[]>();

// Helper functions
export function getBookById(id: string): Book | undefined {
  return books.find(b => b.id === id);
}

export function searchBooks(query: string = '', filters: any = {}): Book[] {
  let results = books;

  // Text search
  if (query) {
    const lowerQuery = query.toLowerCase();
    results = results.filter(book =>
      book.title.toLowerCase().includes(lowerQuery) ||
      book.author.toLowerCase().includes(lowerQuery) ||
      book.category.toLowerCase().includes(lowerQuery)
    );
  }

  // Category filter
  if (filters.category) {
    results = results.filter(b => b.category === filters.category);
  }

  // Price range
  if (filters.minPrice !== undefined) {
    results = results.filter(b => b.price >= filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    results = results.filter(b => b.price <= filters.maxPrice);
  }

  // Rating filter
  if (filters.minRating !== undefined) {
    results = results.filter(b => b.rating >= filters.minRating);
  }

  // Stock filter
  if (filters.inStockOnly) {
    results = results.filter(b => b.inStock);
  }

  return results;
}

export function getCart(userId: string): Cart {
  if (!carts.has(userId)) {
    carts.set(userId, {
      userId,
      items: [],
      total: 0,
      updatedAt: new Date().toISOString()
    });
  }
  return carts.get(userId)!;
}

export function addToCart(userId: string, bookId: string, quantity: number = 1): Cart {
  const cart = getCart(userId);
  const existingItem = cart.items.find(item => item.bookId === bookId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      bookId,
      quantity,
      addedAt: new Date().toISOString()
    });
  }

  // Recalculate total
  cart.total = cart.items.reduce((sum, item) => {
    const book = getBookById(item.bookId);
    return sum + (book ? book.price * item.quantity : 0);
  }, 0);

  cart.updatedAt = new Date().toISOString();
  return cart;
}

export function createOrder(userId: string): Order | null {
  const cart = getCart(userId);
  if (cart.items.length === 0) return null;

  const order: Order = {
    id: `ORD-${Date.now()}`,
    userId,
    items: cart.items.map(item => {
      const book = getBookById(item.bookId)!;
      return {
        book,
        quantity: item.quantity,
        price: book.price
      };
    }),
    total: cart.total,
    status: 'completed',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString()
  };

  // Save order
  if (!orders.has(userId)) {
    orders.set(userId, []);
  }
  orders.get(userId)!.push(order);

  // Clear cart
  cart.items = [];
  cart.total = 0;
  cart.updatedAt = new Date().toISOString();

  return order;
}

export function getOrders(userId: string): Order[] {
  return orders.get(userId) || [];
}

export function getRelatedBooks(bookId: string, limit: number = 3): Book[] {
  const book = getBookById(bookId);
  if (!book) return [];

  return books
    .filter(b => b.id !== bookId && b.category === book.category)
    .slice(0, limit);
}