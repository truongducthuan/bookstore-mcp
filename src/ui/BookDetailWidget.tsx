// src/ui/BookDetailWidget.tsx
import React from 'react';
import { useWidgetProps, useTheme } from '@fractal-mcp/oai-hooks';

interface Book {
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

interface Props extends Record<string, unknown> {
  book: Book;
  relatedBooks: Book[];
  inCart: boolean;
  cartQuantity: number;
}

export default function BookDetailWidget() {
  const props = useWidgetProps<Props>();
  const theme = useTheme();

  if (!props) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  const { book, relatedBooks, inCart, cartQuantity } = props;
  const isDark = theme === 'dark';

  const styles = {
    container: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      background: isDark ? '#1a1a1a' : '#fff',
      color: isDark ? '#fff' : '#111',
      minHeight: '100vh',
      padding: '24px'
    },
    main: {
      maxWidth: '900px',
      margin: '0 auto'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '300px 1fr',
      gap: '32px',
      marginBottom: '40px'
    } as React.CSSProperties,
    cover: {
      width: '100%',
      borderRadius: '12px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
    },
    info: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px'
    },
    title: {
      fontSize: '32px',
      fontWeight: '700',
      lineHeight: '1.2',
      marginBottom: '8px'
    },
    author: {
      fontSize: '18px',
      color: isDark ? '#9ca3af' : '#6b7280',
      marginBottom: '16px'
    },
    priceSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '16px',
      background: isDark ? '#374151' : '#f9fafb',
      borderRadius: '12px',
      marginBottom: '16px'
    },
    price: {
      fontSize: '36px',
      fontWeight: '700',
      color: '#10b981'
    },
    rating: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '16px'
    },
    badge: {
      display: 'inline-block',
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: '600'
    },
    inStock: {
      background: '#d1fae5',
      color: '#065f46'
    },
    outOfStock: {
      background: '#fee2e2',
      color: '#991b1b'
    },
    inCartBadge: {
      background: '#dbeafe',
      color: '#1e40af'
    },
    section: {
      marginTop: '24px'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '12px'
    },
    description: {
      fontSize: '15px',
      lineHeight: '1.6',
      color: isDark ? '#d1d5db' : '#374151'
    },
    specs: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px',
      marginTop: '16px'
    },
    spec: {
      padding: '12px',
      background: isDark ? '#374151' : '#f9fafb',
      borderRadius: '8px'
    },
    specLabel: {
      fontSize: '12px',
      color: isDark ? '#9ca3af' : '#6b7280',
      marginBottom: '4px'
    },
    specValue: {
      fontSize: '15px',
      fontWeight: '600'
    },
    related: {
      borderTop: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
      paddingTop: '32px',
      marginTop: '32px'
    },
    relatedGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '16px',
      marginTop: '16px'
    },
    relatedCard: {
      background: isDark ? '#374151' : '#f9fafb',
      borderRadius: '8px',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'transform 0.2s'
    },
    relatedImage: {
      width: '100%',
      height: '150px',
      objectFit: 'cover' as const
    },
    relatedInfo: {
      padding: '12px'
    },
    relatedTitle: {
      fontSize: '14px',
      fontWeight: '600',
      marginBottom: '4px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const
    },
    relatedPrice: {
      fontSize: '16px',
      fontWeight: '700',
      color: '#10b981'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.main}>
        <div style={styles.grid}>
          <div>
            <img 
              src={book.coverImage} 
              alt={book.title}
              style={styles.cover}
            />
          </div>

          <div style={styles.info}>
            <div>
              <h1 style={styles.title}>{book.title}</h1>
              <p style={styles.author}>by {book.author}</p>
            </div>

            <div style={styles.priceSection}>
              <span style={styles.price}>${book.price}</span>
              <div style={styles.rating}>
                <span>⭐ {book.rating}</span>
                <span style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                  ({book.reviews} reviews)
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
              <span style={{
                ...styles.badge,
                ...(book.inStock ? styles.inStock : styles.outOfStock)
              }}>
                {book.inStock ? '✓ In Stock' : '✗ Out of Stock'}
              </span>

              {inCart && (
                <span style={{ ...styles.badge, ...styles.inCartBadge }}>
                  🛒 In Cart ({cartQuantity})
                </span>
              )}

              <span style={{
                ...styles.badge,
                background: isDark ? '#374151' : '#e5e7eb',
                color: isDark ? '#d1d5db' : '#374151'
              }}>
                📚 {book.category}
              </span>
            </div>

            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Description</h2>
              <p style={styles.description}>{book.description}</p>
            </div>

            <div style={styles.specs}>
              <div style={styles.spec}>
                <div style={styles.specLabel}>Published</div>
                <div style={styles.specValue}>{book.publishYear}</div>
              </div>
              <div style={styles.spec}>
                <div style={styles.specLabel}>Pages</div>
                <div style={styles.specValue}>{book.pages}</div>
              </div>
              <div style={styles.spec}>
                <div style={styles.specLabel}>Language</div>
                <div style={styles.specValue}>{book.language}</div>
              </div>
              <div style={styles.spec}>
                <div style={styles.specLabel}>Category</div>
                <div style={styles.specValue}>{book.category}</div>
              </div>
            </div>
          </div>
        </div>

        {relatedBooks.length > 0 && (
          <div style={styles.related}>
            <h2 style={styles.sectionTitle}>You May Also Like</h2>
            <div style={styles.relatedGrid}>
              {relatedBooks.map(relBook => (
                <div
                  key={relBook.id}
                  style={styles.relatedCard}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <img
                    src={relBook.coverImage}
                    alt={relBook.title}
                    style={styles.relatedImage}
                  />
                  <div style={styles.relatedInfo}>
                    <h3 style={styles.relatedTitle} title={relBook.title}>
                      {relBook.title}
                    </h3>
                    <p style={styles.relatedPrice}>${relBook.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}