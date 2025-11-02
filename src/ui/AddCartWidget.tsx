// src/ui/CartWidget.tsx
import React from 'react';
import { useWidgetProps, useTheme } from '@fractal-mcp/oai-hooks';

interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  coverImage: string;
}

interface CartItem {
  book: Book;
  quantity: number;
  subtotal: number;
}

interface Props extends Record<string, unknown> {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export default function AddCartWidget() {
  const props = useWidgetProps<Props>();
  const theme = useTheme();

  if (!props) {
    return <div style={{ padding: '20px' }}>Loading cart...</div>;
  }

  const { items, total, itemCount } = props;
  const isDark = theme === 'dark';

  const styles = {
    container: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      background: isDark ? '#1a1a1a' : '#f9fafb',
      color: isDark ? '#fff' : '#111',
      minHeight: '100vh',
      padding: '24px'
    },
    main: {
      maxWidth: '800px',
      margin: '0 auto'
    },
    header: {
      marginBottom: '24px'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    subtitle: {
      fontSize: '15px',
      color: isDark ? '#9ca3af' : '#6b7280'
    },
    emptyState: {
      textAlign: 'center' as const,
      padding: '80px 20px',
      color: isDark ? '#9ca3af' : '#6b7280'
    },
    emptyIcon: {
      fontSize: '64px',
      marginBottom: '16px'
    },
    emptyText: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '8px'
    },
    itemsList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px',
      marginBottom: '24px'
    },
    item: {
      display: 'grid',
      gridTemplateColumns: '100px 1fr auto',
      gap: '16px',
      padding: '16px',
      background: isDark ? '#374151' : '#fff',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: isDark ? '1px solid #4b5563' : '1px solid #e5e7eb'
    },
    itemImage: {
      width: '100px',
      height: '130px',
      objectFit: 'cover' as const,
      borderRadius: '8px'
    },
    itemInfo: {
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'space-between'
    },
    itemTitle: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '4px',
      color: isDark ? '#fff' : '#111'
    },
    itemAuthor: {
      fontSize: '14px',
      color: isDark ? '#9ca3af' : '#6b7280',
      marginBottom: '8px'
    },
    itemPrice: {
      fontSize: '14px',
      color: isDark ? '#d1d5db' : '#6b7280'
    },
    itemRight: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'flex-end',
      justifyContent: 'space-between'
    },
    quantity: {
      padding: '6px 12px',
      background: isDark ? '#1f2937' : '#f3f4f6',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      color: isDark ? '#fff' : '#111'
    },
    subtotal: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#10b981'
    },
    summary: {
      padding: '24px',
      background: isDark ? '#374151' : '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      border: isDark ? '1px solid #4b5563' : '1px solid #e5e7eb'
    },
    summaryRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: isDark ? '1px solid #4b5563' : '1px solid #e5e7eb'
    },
    summaryLabel: {
      fontSize: '15px',
      color: isDark ? '#9ca3af' : '#6b7280'
    },
    summaryValue: {
      fontSize: '15px',
      fontWeight: '600'
    },
    summaryTotal: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '16px 0 0 0',
      fontSize: '18px',
      fontWeight: '700'
    },
    totalAmount: {
      fontSize: '28px',
      color: '#10b981'
    },
    checkoutButton: {
      width: '100%',
      padding: '16px',
      marginTop: '20px',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s'
    }
  };

  if (items.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.main}>
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🛒</div>
            <p style={styles.emptyText}>Your cart is empty</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>
              Add some books to get started!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            🛒 Shopping Cart
          </h1>
          <p style={styles.subtitle}>
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div style={styles.itemsList}>
          {items.map((item, index) => (
            <div key={index} style={styles.item}>
              <img
                src={item.book.coverImage}
                alt={item.book.title}
                style={styles.itemImage}
              />

              <div style={styles.itemInfo}>
                <div>
                  <h3 style={styles.itemTitle}>{item.book.title}</h3>
                  <p style={styles.itemAuthor}>{item.book.author}</p>
                </div>
                <p style={styles.itemPrice}>
                  ${item.book.price.toFixed(2)} each
                </p>
              </div>

              <div style={styles.itemRight}>
                <span style={styles.quantity}>
                  Qty: {item.quantity}
                </span>
                <span style={styles.subtotal}>
                  ${item.subtotal.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.summary}>
          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Subtotal</span>
            <span style={styles.summaryValue}>${total.toFixed(2)}</span>
          </div>

          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Shipping</span>
            <span style={styles.summaryValue}>FREE</span>
          </div>

          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Tax (10%)</span>
            <span style={styles.summaryValue}>${(total * 0.1).toFixed(2)}</span>
          </div>

          <div style={styles.summaryTotal}>
            <span>Total</span>
            <span style={styles.totalAmount}>
              ${(total * 1.1).toFixed(2)}
            </span>
          </div>

          <button
            style={styles.checkoutButton}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(16, 185, 129, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => alert('Use "checkout" command in ChatGPT to complete order!')}
          >
            💳 Proceed to Checkout
          </button>
        </div>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: isDark ? '#374151' : '#f0f9ff',
          borderRadius: '8px',
          fontSize: '13px',
          color: isDark ? '#9ca3af' : '#1e40af',
          textAlign: 'center' as const
        }}>
          💡 Tip: Use the command "checkout" in ChatGPT to complete your order
        </div>
      </div>
    </div>
  );
}