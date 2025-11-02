# 📚 BookStore MCP - Full Project Structure

```
bookstore-mcp/
├── src/
│   ├── ui/                          # React Widget Components
│   │   ├── BookListWidget.tsx       # Danh sách sách
│   │   ├── BookDetailWidget.tsx     # Chi tiết sách
│   │   ├── CartWidget.tsx           # Giỏ hàng
│   │   └── OrderHistoryWidget.tsx   # Lịch sử đơn hàng
│   │
│   └── server/
│       ├── index.ts                 # Main MCP Server
│       ├── database.ts              # In-memory Database
│       └── types.ts                 # TypeScript Types
│
├── dist/
│   ├── ui/                          # Bundled widgets
│   │   ├── book-list.html
│   │   ├── book-detail.html
│   │   ├── cart.html
│   │   └── order-history.html
│   │
│   └── server/
│       └── index.js
│
├── package.json
├── tsconfig.json
├── vite.config.ts                   # Vite bundling config
├── .env
└── README.md
```

## 🎯 Features

### Server Tools (6 tools):

1. **search-books** - Tìm kiếm sách theo từ khóa
2. **get-book-details** - Xem chi tiết 1 cuốn sách
3. **add-to-cart** - Thêm sách vào giỏ hàng
4. **view-cart** - Xem giỏ hàng hiện tại
5. **checkout** - Thanh toán đơn hàng
6. **order-history** - Xem lịch sử mua hàng

### UI Widgets (4 widgets):

1. **BookListWidget** - Grid view với filters & search
2. **BookDetailWidget** - Thông tin chi tiết + reviews
3. **CartWidget** - Interactive shopping cart
4. **OrderHistoryWidget** - Transaction history

### Advanced Features:

- ✅ useWidgetProps - Nhận data từ server
- ✅ useWidgetState - Persistent state (filters, cart)
- ✅ useLayout - Responsive design
- ✅ useGlobalContext - Theme support (dark/light)
- ✅ Zod validation - Input schema
- ✅ Structured content - Type-safe props
- ✅ Multiple widgets - Different UI cho mỗi tool

## 🚀 Quick Start

```bash
# Install
npm install

# Build widgets
npm run build:ui

# Build server
npm run build:server

# Start
npm start

# Visit
http://localhost:8000
```

## 🔗 Connect to ChatGPT

1. Deploy to Render/Railway
2. Get HTTPS URL: `https://bookstore-mcp.onrender.com`
3. Add to ChatGPT Apps SDK
4. Test: "Tìm sách về TypeScript"
