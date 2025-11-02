// src/server/index.ts
import { 
  McpServer, 
  registerOpenAIWidget, 
  startOpenAIWidgetHttpServer 
} from '@fractal-mcp/oai-server';
import { z } from 'zod';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as db from './database.js';
import type { BookListProps, BookDetailProps, CartProps, OrderHistoryProps } from './types.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || '8000');
const DEFAULT_USER = 'user-chatgpt'; // Single user for demo
const PROJECT_ROOT = join(__dirname, '..', '..');

console.log('\n🔍 DEBUG Path Resolution:');
console.log('__dirname:', __dirname);
console.log('PROJECT_ROOT:', PROJECT_ROOT);
console.log('Expected widget path:', join(PROJECT_ROOT, 'dist', 'ui', 'book-list', 'index.html'));
console.log('');

// Read bundled widget HTML files
function readWidgetHTML(widgetName: string): string {
  // Absolute path from project root
  const widgetPath = join(PROJECT_ROOT, 'dist', 'ui', widgetName, 'index.html');
  
  console.log(`\n[Widget] Loading: ${widgetName}`);
  console.log(`[Widget] Path: ${widgetPath}`);
  console.log(`[Widget] Exists: ${existsSync(widgetPath)}`);

  if (existsSync(widgetPath)) {
    try {
      const html = readFileSync(widgetPath, 'utf-8');
      console.log(`✅ Loaded successfully (${html.length} bytes)\n`);
      return html;
    } catch (error) {
      console.error(`❌ Error reading file:`, error);
    }
  }

  console.warn(`⚠️  Widget not found, using placeholder\n`);
  return createPlaceholderWidget(widgetName);
}

// Create placeholder widget for development
function createPlaceholderWidget(widgetName: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 40px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container {
      background: white;
      border-radius: 20px;
      padding: 40px;
      max-width: 500px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    h1 { color: #667eea; margin-bottom: 16px; }
    p { color: #6b7280; line-height: 1.6; margin-bottom: 12px; }
    code {
      background: #f3f4f6;
      padding: 2px 8px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 14px;
    }
    .emoji { font-size: 48px; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="emoji">🎨</div>
    <h1>Widget: ${widgetName}</h1>
    <p><strong>Status:</strong> Widget HTML not found</p>
    <p>Build the widgets first:</p>
    <p><code>npm run build:ui</code></p>
    <p style="margin-top: 24px; font-size: 14px; color: #9ca3af;">
      The server is working! Once you build the UI, this placeholder will be replaced with the actual widget.
    </p>
  </div>
</body>
</html>`;
}

console.log('🎨 PRE-LOADING ALL WIDGETS...\n');

const WIDGET_HTMLS = {
  'book-list': readWidgetHTML('book-list'),
  'book-detail': readWidgetHTML('book-detail'),
  'cart': readWidgetHTML('cart'),
  'add-cart': readWidgetHTML('cart'),
  'order-history': readWidgetHTML('order-history')
};

console.log('📊 WIDGET LOADING SUMMARY:');
Object.entries(WIDGET_HTMLS).forEach(([name, html]) => {
  const isPlaceholder = html.includes('Widget HTML not found');
  console.log(`  ${isPlaceholder ? '⚠️' : '✅'} ${name}: ${html.length} bytes ${isPlaceholder ? '(placeholder)' : ''}`);
});
console.log('\n');

// Create MCP Server
function createServer(): McpServer {
  const server = new McpServer({
    name: 'bookstore-mcp',
    version: '1.0.0'
  });

  // ===== Tool 1: Search Books =====
  registerOpenAIWidget(
    server,
    {
      id: 'search-books',
      title: 'Search Books',
      description: 'Tìm kiếm sách theo từ khóa và bộ lọc',
      templateUri: 'ui://widget/book-list.html',
      invoking: '🔍 Đang tìm kiếm sách...',
      invoked: '📚 Tìm thấy sách!',
      html: WIDGET_HTMLS['book-list'],
      responseText: 'Đây là kết quả tìm kiếm sách',
      inputSchema: z.object({
        query: z.string().optional().describe('Từ khóa tìm kiếm (title, author, category)'),
        category: z.string().optional().describe('Danh mục: Programming, Database, System Design, Software Architecture'),
        minPrice: z.number().optional().describe('Giá tối thiểu ($)'),
        maxPrice: z.number().optional().describe('Giá tối đa ($)'),
        minRating: z.number().optional().describe('Đánh giá tối thiểu (1-5)'),
        inStockOnly: z.boolean().optional().describe('Chỉ hiển thị sách còn hàng')
      })
    },
    async (args) => {
      const books = db.searchBooks(args.query, {
        category: args.category,
        minPrice: args.minPrice,
        maxPrice: args.maxPrice,
        minRating: args.minRating,
        inStockOnly: args.inStockOnly
      });

      const props: BookListProps = {
        books,
        total: books.length,
        filters: {
          category: args.category,
          minPrice: args.minPrice,
          maxPrice: args.maxPrice,
          minRating: args.minRating,
          inStockOnly: args.inStockOnly
        },
        query: args.query
      };

      // Text summary
      let summary = `Tìm thấy ${books.length} cuốn sách`;
      if (args.query) summary += ` cho "${args.query}"`;
      if (args.category) summary += ` trong danh mục ${args.category}`;
      
      const bookList = books.slice(0, 5).map(b => 
        `• ${b.title} - ${b.author} ($${b.price}) ⭐${b.rating}`
      ).join('\n');

      return {
        content: [{
          type: 'text',
          text: `${summary}\n\n${bookList}\n\n${books.length > 5 ? `...và ${books.length - 5} cuốn khác` : ''}`
        }],
        structuredContent: props
      };
    }
  );

  // ===== Tool 2: Get Book Details =====
  registerOpenAIWidget(
    server,
    {
      id: 'get-book-details',
      title: 'Book Details',
      description: 'Xem chi tiết thông tin một cuốn sách',
      templateUri: 'ui://widget/book-detail.html',
      invoking: '📖 Đang tải thông tin sách...',
      invoked: '✅ Đã tải xong!',
      html: WIDGET_HTMLS['book-detail'],
      responseText: 'Thông tin chi tiết sách',
      inputSchema: z.object({
        bookId: z.string().describe('ID của sách')
      })
    },
    async (args) => {
      const book = db.getBookById(args.bookId);
      
      if (!book) {
        return {
          content: [{
            type: 'text',
            text: `❌ Không tìm thấy sách với ID: ${args.bookId}`
          }],
          structuredContent: undefined
        };
      }

      const relatedBooks = db.getRelatedBooks(args.bookId);
      const cart = db.getCart(DEFAULT_USER);
      const cartItem = cart.items.find(item => item.bookId === args.bookId);

      const props: BookDetailProps = {
        book,
        relatedBooks,
        inCart: !!cartItem,
        cartQuantity: cartItem?.quantity || 0
      };

      return {
        content: [{
          type: 'text',
          text: `📖 **${book.title}**\n` +
                `👤 Tác giả: ${book.author}\n` +
                `💰 Giá: $${book.price}\n` +
                `⭐ Đánh giá: ${book.rating}/5 (${book.reviews} reviews)\n` +
                `📦 Tình trạng: ${book.inStock ? 'Còn hàng' : 'Hết hàng'}\n` +
                `📄 Mô tả: ${book.description}`
        }],
        structuredContent: props
      };
    }
  );

  // ===== Tool 3: Add to Cart =====
  registerOpenAIWidget(
    server,
    {
      id: 'add-to-cart',
      title: 'Add to Cart',
      description: 'Thêm sách vào giỏ hàng',
      templateUri: 'ui://widget/add-cart.html',
      invoking: '🛒 Đang thêm vào giỏ...',
      invoked: '✅ Đã thêm vào giỏ hàng!',
      html: WIDGET_HTMLS['add-cart'],
      responseText: 'Sách đã được thêm vào giỏ hàng',
      inputSchema: z.object({
        bookId: z.string().describe('ID của sách'),
        quantity: z.number().min(1).default(1).describe('Số lượng (mặc định: 1)')
      })
    },
    async (args) => {
      const book = db.getBookById(args.bookId);
      
      if (!book) {
        return {
          content: [{
            type: 'text',
            text: `❌ Không tìm thấy sách với ID: ${args.bookId}`
          }],
          structuredContent: undefined
        };
      }

      if (!book.inStock) {
        return {
          content: [{
            type: 'text',
            text: `❌ Sách "${book.title}" hiện đang hết hàng`
          }],
          structuredContent: undefined
        };
      }

      const cart = db.addToCart(DEFAULT_USER, args.bookId, args.quantity);
      
      const cartItems = cart.items.map(item => {
        const b = db.getBookById(item.bookId)!;
        return {
          book: b,
          quantity: item.quantity,
          subtotal: b.price * item.quantity
        };
      });

      const props: CartProps = {
        items: cartItems,
        total: cart.total,
        itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0)
      };

      return {
        content: [{
          type: 'text',
          text: `✅ Đã thêm ${args.quantity}x "${book.title}" vào giỏ hàng\n` +
                `🛒 Tổng giỏ hàng: $${cart.total.toFixed(2)} (${props.itemCount} sản phẩm)`
        }],
        structuredContent: props
      };
    }
  );

  // ===== Tool 4: View Cart =====
  registerOpenAIWidget(
    server,
    {
      id: 'view-cart',
      title: 'View Cart',
      description: 'Xem giỏ hàng hiện tại',
      templateUri: 'ui://widget/cart.html',
      invoking: '🛒 Đang tải giỏ hàng...',
      invoked: '✅ Giỏ hàng của bạn',
      html: WIDGET_HTMLS['cart'],
      responseText: 'Giỏ hàng hiện tại',
      inputSchema: z.object({})
    },
    async () => {
      const cart = db.getCart(DEFAULT_USER);
      
      if (cart.items.length === 0) {
        return {
          content: [{
            type: 'text',
            text: '🛒 Giỏ hàng trống'
          }],
          structuredContent: {
            items: [],
            total: 0,
            itemCount: 0
          }
        };
      }

      const cartItems = cart.items.map(item => {
        const book = db.getBookById(item.bookId)!;
        return {
          book,
          quantity: item.quantity,
          subtotal: book.price * item.quantity
        };
      });

      const props: CartProps = {
        items: cartItems,
        total: cart.total,
        itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0)
      };

      const itemsList = cartItems.map(item => 
        `• ${item.book.title} x${item.quantity} = $${item.subtotal.toFixed(2)}`
      ).join('\n');

      return {
        content: [{
          type: 'text',
          text: `🛒 **Giỏ hàng của bạn** (${props.itemCount} sản phẩm)\n\n${itemsList}\n\n💰 **Tổng: $${cart.total.toFixed(2)}**`
        }],
        structuredContent: props
      };
    }
  );

  // ===== Tool 5: Checkout =====
  registerOpenAIWidget(
    server,
    {
      id: 'checkout',
      title: 'Checkout',
      description: 'Thanh toán đơn hàng',
      templateUri: 'ui://widget/checkout.html',
      invoking: '💳 Đang xử lý thanh toán...',
      invoked: '✅ Đặt hàng thành công!',
      html: WIDGET_HTMLS['order-history'],
      responseText: 'Đơn hàng đã được tạo thành công',
      inputSchema: z.object({})
    },
    async () => {
      const order = db.createOrder(DEFAULT_USER);
      
      if (!order) {
        return {
          content: [{
            type: 'text',
            text: '❌ Giỏ hàng trống. Vui lòng thêm sách trước khi thanh toán.'
          }],
          structuredContent: undefined
        };
      }

      const allOrders = db.getOrders(DEFAULT_USER);
      const totalSpent = allOrders.reduce((sum, o) => sum + o.total, 0);

      const props: OrderHistoryProps = {
        orders: allOrders,
        totalOrders: allOrders.length,
        totalSpent
      };

      const itemsList = order.items.map(item => 
        `• ${item.book.title} x${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`
      ).join('\n');

      return {
        content: [{
          type: 'text',
          text: `✅ **Đặt hàng thành công!**\n\n` +
                `🔖 Mã đơn hàng: ${order.id}\n` +
                `📦 Sản phẩm:\n${itemsList}\n\n` +
                `💰 Tổng thanh toán: $${order.total.toFixed(2)}\n` +
                `🎉 Cảm ơn bạn đã mua hàng!`
        }],
        structuredContent: props
      };
    }
  );

  // ===== Tool 6: Order History =====
  registerOpenAIWidget(
    server,
    {
      id: 'order-history',
      title: 'Order History',
      description: 'Xem lịch sử đơn hàng',
      templateUri: 'ui://widget/order-history.html',
      invoking: '📜 Đang tải lịch sử...',
      invoked: '✅ Lịch sử đơn hàng',
      html: WIDGET_HTMLS['order-history'],
      responseText: 'Lịch sử đơn hàng của bạn',
      inputSchema: z.object({})
    },
    async () => {
      const orders = db.getOrders(DEFAULT_USER);
      
      if (orders.length === 0) {
        return {
          content: [{
            type: 'text',
            text: '📜 Chưa có đơn hàng nào'
          }],
          structuredContent: {
            orders: [],
            totalOrders: 0,
            totalSpent: 0
          }
        };
      }

      const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

      const props: OrderHistoryProps = {
        orders,
        totalOrders: orders.length,
        totalSpent
      };

      const ordersList = orders.slice(0, 5).map(order => 
        `🔖 ${order.id} - $${order.total.toFixed(2)} - ${new Date(order.createdAt).toLocaleDateString('vi-VN')}`
      ).join('\n');

      return {
        content: [{
          type: 'text',
          text: `📜 **Lịch sử đơn hàng** (${orders.length} đơn)\n\n${ordersList}\n\n💰 Tổng chi tiêu: $${totalSpent.toFixed(2)}`
        }],
        structuredContent: props
      };
    }
  );

  return server;
}

// Start HTTP Server
console.log('🚀 Starting BookStore MCP Server...\n');

startOpenAIWidgetHttpServer({
  port: PORT,
  serverFactory: createServer
});

console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║  📚 BOOKSTORE MCP SERVER                                   ║
║                                                            ║
║  Status: ✅ Running                                        ║
║  Port: ${PORT}                                             ║
║  Environment: ${process.env.NODE_ENV || 'development'}    ║
║                                                            ║
║  📚 Available Tools (6):                                   ║
║    1. search-books      - Tìm kiếm sách                   ║
║    2. get-book-details  - Chi tiết sách                   ║
║    3. add-to-cart       - Thêm vào giỏ                    ║
║    4. view-cart         - Xem giỏ hàng                    ║
║    5. checkout          - Thanh toán                      ║
║    6. order-history     - Lịch sử đơn hàng               ║
║                                                            ║
║  🎨 Widget UI (4):                                         ║
║    • BookListWidget     - Danh sách sách                  ║
║    • BookDetailWidget   - Chi tiết + Reviews              ║
║    • CartWidget         - Giỏ hàng interactive            ║
║    • OrderHistoryWidget - Lịch sử mua hàng               ║
║                                                            ║
║  🔗 Endpoints:                                             ║
║    • MCP: http://localhost:${PORT}/mcp                     ║
║    • Health: http://localhost:${PORT}/health               ║
║                                                            ║
║  💡 Test Commands:                                         ║
║    "Tìm sách về TypeScript"                               ║
║    "Cho tôi xem sách có ID là 1"                          ║
║    "Thêm sách ID 2 vào giỏ hàng"                          ║
║    "Xem giỏ hàng của tôi"                                 ║
║    "Thanh toán đơn hàng"                                  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);