// src/ui/BookListWidget.tsx - FIXED VERSION
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
    // FIX: Root container với constraints
    root: {
      width: '100%',
      height: '100vh', // Giới hạn chiều cao
      maxHeight: '100vh',
      overflow: 'hidden', // Ngăn scroll ở root
      display: 'flex',
      flexDirection: 'column' as const
    },
    container: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      background: isDark ? '#1a1a1a' : '#f9fafb',
      color: isDark ? '#fff' : '#111',
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      overflow: 'hidden', // Quan trọng!
      padding: '20px',
      boxSizing: 'border-box' as const
    },
    header: {
      flexShrink: 0, // Không co lại
      marginBottom: '20px'
    },
    title: {
      fontSize: '24px',
      fontWeight: '700',
      marginBottom: '8px',
      margin: '0 0 8px 0',
      color: isDark ? '#fff' : '#111'
    },
    subtitle: {
      fontSize: '14px',
      margin: 0,
      color: isDark ? '#9ca3af' : '#6b7280'
    },
    controls: {
      display: 'flex',
      gap: '12px',
      marginBottom: '16px',
      flexWrap: 'wrap' as const,
      flexShrink: 0 // Không co lại
    },
    select: {
      padding: '8px 12px',
      borderRadius: '8px',
      border: isDark ? '1px solid #374151' : '1px solid #d1d5db',
      background: isDark ? '#374151' : '#fff',
      color: isDark ? '#fff' : '#111',
      fontSize: '14px',
      cursor: 'pointer',
      outline: 'none'
    },
    // FIX: Scrollable content area
    scrollContainer: {
      flex: 1,
      overflowY: 'auto' as const,
      overflowX: 'hidden' as const,
      paddingRight: '4px', // Space for scrollbar
      marginRight: '-4px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: state.view === 'grid' 
        ? 'repeat(auto-fill, minmax(200px, 1fr))' 
        : '1fr',
      gap: '16px',
      paddingBottom: '20px' // Space at bottom
    },
    card: {
      background: isDark ? '#374151' : '#fff',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer',
      border: isDark ? '1px solid #4b5563' : '1px solid #e5e7eb',
      height: 'fit-content' // FIX: Prevent infinite height
    },
    cardImage: {
      width: '100%',
      height: state.view === 'grid' ? '200px' : '120px', // Reduced list view height
      objectFit: 'cover' as const,
      background: isDark ? '#4b5563' : '#e5e7eb',
      display: 'block' // Remove extra space below image
    },
    cardBody: {
      padding: '16px'
    },
    cardTitle: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '4px',
      margin: '0 0 4px 0',
      color: isDark ? '#fff' : '#111',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const
    },
    cardAuthor: {
      fontSize: '13px',
      color: isDark ? '#9ca3af' : '#6b7280',
      marginBottom: '8px',
      margin: '0 0 8px 0'
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
    },
    emptyState: {
      textAlign: 'center' as const,
      padding: '60px 20px',
      color: isDark ? '#9ca3af' : '#6b7280'
    }
  };

  return (
    <div style={styles.root}>
      <div style={styles.container}>
        {/* Fixed Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>📚 Book Store</h1>
          <p style={styles.subtitle}>
            {query && `Kết quả cho "${query}" • `}
            Tìm thấy {sortedBooks.length} / {total} cuốn sách
          </p>
        </div>

        {/* Fixed Controls */}
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

        {/* Scrollable Content */}
        <div style={styles.scrollContainer}>
          {sortedBooks.length > 0 ? (
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
                    src={book.coverImage || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="sans-serif" font-size="16"%3ENo Image%3C/text%3E%3C/svg%3E'}
                    alt={book.title}
                    style={styles.cardImage}
                    onError={(e) => {
                      // Fallback if image fails to load
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="sans-serif" font-size="16"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }}
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
          ) : (
            <div style={styles.emptyState}>
              <p style={{ fontSize: '48px', marginBottom: '16px', margin: '0 0 16px 0' }}>📚</p>
              <p style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
                Không tìm thấy sách nào
              </p>
              <p style={{ fontSize: '14px', marginTop: '8px', margin: '8px 0 0 0' }}>
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}