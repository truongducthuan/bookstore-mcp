// src/ui/BookListWidget.tsx
import React, { useState } from 'react';
import { useWidgetProps, useWidgetState, useTheme } from '@fractal-mcp/oai-hooks';

interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  category: string;
  coverImage: string;
  rating: number;
  reviews: number;
  inStock: boolean;
}

interface Props extends Record<string, unknown> {
  books: Book[];
  total: number;
  filters: any;
  query?: string;
}

export default function BookListWidget() {
  const props = useWidgetProps<Props>();
  const [state, setState] = useWidgetState({ sortBy: 'rating', view: 'grid' });
  const theme = useTheme();

  const [selectedCategory, setSelectedCategory] = useState(props?.filters?.category || 'all');

  if (!props) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading books...</p>
      </div>
    );
  }

  const isDark = theme === 'dark';
  const { books, total, query } = props;

  // Sort books
  let sortedBooks = [...books];
  if (state.sortBy === 'price-asc') {
    sortedBooks.sort((a, b) => a.price - b.price);
  } else if (state.sortBy === 'price-desc') {
    sortedBooks.sort((a, b) => b.price - a.price);
  } else if (state.sortBy === 'rating') {
    sortedBooks.sort((a, b) => b.rating - a.rating);
  } else if (state.sortBy === 'title') {
    sortedBooks.sort((a, b) => a.title.localeCompare(b.title));
  }

  // Categories
  const categories = ['all', ...Array.from(new Set(books.map(b => b.category)))];

  // Filter by category
  if (selectedCategory !== 'all') {
    sortedBooks = sortedBooks.filter(b => b.category === selectedCategory);
  }

  const styles = {
    container: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      background: isDark ? '#1a1a1a' : '#f9fafb',
      color: isDark ? '#fff' : '#111',
      minHeight: '100vh',
      padding: '20px'
    },
    header: {
      marginBottom: '24px'
    },
    title: {
      fontSize: '24px',
      fontWeight: '700',
      marginBottom: '8px',
      color: isDark ? '#fff' : '#111'
    },
    subtitle: {
      fontSize: '14px',
      color: isDark ? '#9ca3af' : '#6b7280'
    },
    controls: {
      display: 'flex',
      gap: '12px',
      marginBottom: '20px',
      flexWrap: 'wrap' as const
    },
    select: {
      padding: '8px 12px',
      borderRadius: '8px',
      border: isDark ? '1px solid #374151' : '1px solid #d1d5db',
      background: isDark ? '#374151' : '#fff',
      color: isDark ? '#fff' : '#111',
      fontSize: '14px',
      cursor: 'pointer'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: state.view === 'grid' 
        ? 'repeat(auto-fill, minmax(200px, 1fr))' 
        : '1fr',
      gap: '16px'
    },
    card: {
      background: isDark ? '#374151' : '#fff',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer',
      border: isDark ? '1px solid #4b5563' : '1px solid #e5e7eb'
    },
    cardImage: {
      width: '100%',
      height: state.view === 'grid' ? '200px' : '150px',
      objectFit: 'cover' as const,
      background: '#e5e7eb'
    },
    cardBody: {
      padding: '16px'
    },
    cardTitle: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '4px',
      color: isDark ? '#fff' : '#111',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const
    },
    cardAuthor: {
      fontSize: '13px',
      color: isDark ? '#9ca3af' : '#6b7280',
      marginBottom: '8px'
    },
    cardFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '12px'
    },
    price: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#10b981'
    },
    rating: {
      fontSize: '13px',
      color: '#f59e0b',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    badge: {
      display: 'inline-block',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600',
      marginTop: '8px'
    },
    inStock: {
      background: '#d1fae5',
      color: '#065f46'
    },
    outOfStock: {
      background: '#fee2e2',
      color: '#991b1b'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📚 Book Store</h1>
        <p style={styles.subtitle}>
          {query && `Kết quả cho "${query}" • `}
          Tìm thấy {sortedBooks.length} / {total} cuốn sách
        </p>
      </div>

      <div style={styles.controls}>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={styles.select}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'Tất cả danh mục' : cat}
            </option>
          ))}
        </select>

        <select
          value={state.sortBy}
          onChange={(e) => setState({ ...state, sortBy: e.target.value })}
          style={styles.select}
        >
          <option value="rating">Đánh giá cao nhất</option>
          <option value="price-asc">Giá thấp đến cao</option>
          <option value="price-desc">Giá cao đến thấp</option>
          <option value="title">Tên A-Z</option>
        </select>

        <select
          value={state.view}
          onChange={(e) => setState({ ...state, view: e.target.value })}
          style={styles.select}
        >
          <option value="grid">📱 Grid View</option>
          <option value="list">📋 List View</option>
        </select>
      </div>

      <div style={styles.grid}>
        {sortedBooks.map(book => (
          <div
            key={book.id}
            style={styles.card}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}
          >
            <img
              src={book.coverImage}
              alt={book.title}
              style={styles.cardImage}
            />
            <div style={styles.cardBody}>
              <h3 style={styles.cardTitle} title={book.title}>
                {book.title}
              </h3>
              <p style={styles.cardAuthor}>{book.author}</p>

              <div style={styles.cardFooter}>
                <span style={styles.price}>${book.price}</span>
                <span style={styles.rating}>
                  ⭐ {book.rating} ({book.reviews})
                </span>
              </div>

              <span style={{
                ...styles.badge,
                ...(book.inStock ? styles.inStock : styles.outOfStock)
              }}>
                {book.inStock ? '✓ Còn hàng' : '✗ Hết hàng'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {sortedBooks.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          color: isDark ? '#9ca3af' : '#6b7280'
        }}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>📚</p>
          <p style={{ fontSize: '18px', fontWeight: '600' }}>
            Không tìm thấy sách nào
          </p>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
          </p>
        </div>
      )}
    </div>
  );
}