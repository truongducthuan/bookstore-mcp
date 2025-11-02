// src/server/index.ts
import { 
  McpServer, 
  registerOpenAIWidget, 
  startOpenAIWidgetHttpServer 
} from '@fractal-mcp/oai-server';
import { z } from 'zod';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as db from './database.js';
import type { BookListProps, BookDetailProps, CartProps, OrderHistoryProps } from './types.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || '8000');
const DEFAULT_USER = 'user-chatgpt'; // Single user for demo

// Read bundled widget HTML files
function readWidgetHTML(widgetName: string): string {
  try {
    const htmlPath = join(__dirname, '..', 'ui', widgetName, 'index.html');
    return readFileSync(htmlPath, 'utf-8');
  } catch (error) {
    console.warn(`Widget ${widgetName} not found, using placeholder`);
    return `<div>Widget ${widgetName} - Build UI first: npm run build:ui</div>`;
  }
}

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
      html: readWidgetHTML('book-list'),
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
      html: readWidgetHTML('book-detail'),
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
      templateUri: 'ui://widget/cart.html',
      invoking: '🛒 Đang thêm vào giỏ...',
      invoked: '✅ Đã thêm vào giỏ hàng!',
      html: readWidgetHTML('cart'),
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
      html: readWidgetHTML('cart'),
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
      templateUri: 'ui://widget/order-history.html',
      invoking: '💳 Đang xử lý thanh toán...',
      invoked: '✅ Đặt hàng thành công!',
      html: readWidgetHTML('order-history'),
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
      html: readWidgetHTML('order-history'),
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