// src/ui/OrderHistoryWidget.tsx
import React, { useState } from 'react';
import { useWidgetProps, useTheme } from '@fractal-mcp/oai-hooks';

interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  coverImage: string;
}

interface OrderItem {
  book: Book;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
}

interface Props extends Record<string, unknown> {
  orders: Order[];
  totalOrders: number;
  totalSpent: number;
}

export default function OrderHistoryWidget() {
  const props = useWidgetProps<Props>();
  const theme = useTheme();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  if (!props) {
    return <div style={{ padding: '20px' }}>Loading orders...</div>;
  }

  const { orders, totalOrders, totalSpent } = props;
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
      maxWidth: '900px',
      margin: '0 auto'
    },
    header: {
      marginBottom: '32px'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      marginBottom: '8px'
    },
    stats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '16px',
      marginTop: '16px'
    },
    statCard: {
      padding: '20px',
      background: isDark ? '#374151' : '#fff',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: isDark ? '1px solid #4b5563' : '1px solid #e5e7eb'
    },
    statLabel: {
      fontSize: '13px',
      color: isDark ? '#9ca3af' : '#6b7280',
      marginBottom: '8px'
    },
    statValue: {
      fontSize: '28px',
      fontWeight: '700'
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
      fontWeight: '600'
    },
    ordersList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px'
    },
    orderCard: {
      background: isDark ? '#374151' : '#fff',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: isDark ? '1px solid #4b5563' : '1px solid #e5e7eb',
      overflow: 'hidden',
      transition: 'box-shadow 0.2s'
    },
    orderHeader: {
      padding: '20px',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    orderInfo: {
      flex: 1
    },
    orderId: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '8px',
      color: isDark ? '#fff' : '#111'
    },
    orderMeta: {
      fontSize: '13px',
      color: isDark ? '#9ca3af' : '#6b7280',
      display: 'flex',
      gap: '16px',
      flexWrap: 'wrap' as const
    },
    orderTotal: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#10b981',
      textAlign: 'right' as const
    },
    statusBadge: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      background: '#d1fae5',
      color: '#065f46'
    },
    orderDetails: {
      padding: '0 20px 20px 20px',
      borderTop: isDark ? '1px solid #4b5563' : '1px solid #e5e7eb'
    },
    itemsList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '12px',
      marginTop: '16px'
    },
    item: {
      display: 'grid',
      gridTemplateColumns: '60px 1fr auto',
      gap: '12px',
      padding: '12px',
      background: isDark ? '#1f2937' : '#f9fafb',
      borderRadius: '8px'
    },
    itemImage: {
      width: '60px',
      height: '80px',
      objectFit: 'cover' as const,
      borderRadius: '4px'
    },
    itemInfo: {
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center'
    },
    itemTitle: {
      fontSize: '14px',
      fontWeight: '600',
      marginBottom: '4px'
    },
    itemMeta: {
      fontSize: '12px',
      color: isDark ? '#9ca3af' : '#6b7280'
    },
    itemPrice: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'flex-end',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: '600',
      color: '#10b981'
    }
  };

  if (orders.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.main}>
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📦</div>
            <p style={styles.emptyText}>No orders yet</p>
            <p style={{ fontSize: '14px', marginTop: '8px', color: isDark ? '#9ca3af' : '#6b7280' }}>
              Start shopping to see your order history here
            </p>
          </div>
        </div>
      </div>
    );
  }

  const avgOrderValue = totalSpent / totalOrders;

  return (
    <div style={styles.container}>
      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>📦 Order History</h1>

          <div style={styles.stats}>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Total Orders</div>
              <div style={styles.statValue}>{totalOrders}</div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statLabel}>Total Spent</div>
              <div style={{ ...styles.statValue, color: '#10b981' }}>
                ${totalSpent.toFixed(2)}
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statLabel}>Avg Order</div>
              <div style={styles.statValue}>
                ${avgOrderValue.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <div style={styles.ordersList}>
          {orders.map((order) => {
            const isExpanded = expandedOrder === order.id;
            const orderDate = new Date(order.createdAt);

            return (
              <div
                key={order.id}
                style={styles.orderCard}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }}
              >
                <div
                  style={styles.orderHeader}
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                >
                  <div style={styles.orderInfo}>
                    <div style={styles.orderId}>
                      {isExpanded ? '▼' : '▶'} {order.id}
                    </div>
                    <div style={styles.orderMeta}>
                      <span>📅 {orderDate.toLocaleDateString('vi-VN')}</span>
                      <span>📦 {order.items.length} items</span>
                      <span style={styles.statusBadge}>
                        ✓ {order.status}
                      </span>
                    </div>
                  </div>

                  <div style={styles.orderTotal}>
                    ${order.total.toFixed(2)}
                  </div>
                </div>

                {isExpanded && (
                  <div style={styles.orderDetails}>
                    <div style={styles.itemsList}>
                      {order.items.map((item, idx) => (
                        <div key={idx} style={styles.item}>
                          <img
                            src={item.book.coverImage}
                            alt={item.book.title}
                            style={styles.itemImage}
                          />

                          <div style={styles.itemInfo}>
                            <div style={styles.itemTitle}>
                              {item.book.title}
                            </div>
                            <div style={styles.itemMeta}>
                              {item.book.author} • Qty: {item.quantity}
                            </div>
                          </div>

                          <div style={styles.itemPrice}>
                            <div>${(item.price * item.quantity).toFixed(2)}</div>
                            <div style={{ 
                              fontSize: '11px', 
                              color: isDark ? '#9ca3af' : '#6b7280',
                              marginTop: '4px'
                            }}>
                              ${item.price} each
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{
                      marginTop: '16px',
                      padding: '16px',
                      background: isDark ? '#1f2937' : '#f0fdf4',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ fontSize: '14px', fontWeight: '600' }}>
                        Order Total
                      </span>
                      <span style={{ fontSize: '20px', fontWeight: '700', color: '#10b981' }}>
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}