# 📚 BookStore MCP - Complete Setup Guide

## 🎯 Project Overview

Full-featured bookstore MCP server với 6 tools và 4 interactive widgets, sử dụng **Fractal MCP SDK** chính thống.

### Features:

- ✅ **6 MCP Tools**: search, detail, cart, checkout, history
- ✅ **4 React Widgets**: với useWidgetProps, useWidgetState, useLayout, useGlobalContext
- ✅ **Zod Validation**: Type-safe input schemas
- ✅ **Structured Content**: Proper widget props
- ✅ **Dark/Light Theme**: Responsive design
- ✅ **In-Memory Database**: 8 sample books

---

## 📦 Step 1: Create Project

```bash
# Create directory
mkdir bookstore-mcp
cd bookstore-mcp

# Initialize npm
npm init -y
```

---

## 📝 Step 2: Create File Structure

```bash
# Create directories
mkdir -p src/ui
mkdir -p src/server
mkdir -p dist/ui
mkdir -p dist/server

# Create files (copy from artifacts)
touch src/server/index.ts
touch src/server/database.ts
touch src/server/types.ts
touch src/ui/BookListWidget.tsx
touch src/ui/BookDetailWidget.tsx
touch src/ui/CartWidget.tsx
touch src/ui/OrderHistoryWidget.tsx
touch package.json
touch tsconfig.json
```

**Sao chép nội dung từ các artifacts vào files tương ứng:**

1. `package.json` - từ artifact "package.json"
2. `tsconfig.json` - từ artifact "tsconfig.json"
3. `src/server/types.ts` - từ artifact "src/server/types.ts"
4. `src/server/database.ts` - từ artifact "src/server/database.ts"
5. `src/server/index.ts` - từ artifact "src/server/index.ts - BookStore MCP Server"
6. `src/ui/BookListWidget.tsx` - từ artifact "src/ui/BookListWidget.tsx"
7. `src/ui/BookDetailWidget.tsx` - từ artifact "src/ui/BookDetailWidget.tsx"
8. `src/ui/CartWidget.tsx` - từ artifact "src/ui/CartWidget.tsx"
9. `src/ui/OrderHistoryWidget.tsx` - từ artifact "src/ui/OrderHistoryWidget.tsx"

---

## 📥 Step 3: Install Dependencies

```bash
# Install production dependencies
npm install @fractal-mcp/oai-hooks@latest @fractal-mcp/oai-server@latest zod

# Install dev dependencies
npm install --save-dev \
  @fractal-mcp/cli@latest \
  @types/node \
  @types/react \
  @types/react-dom \
  react \
  react-dom \
  typescript \
  vite
```

---

## 🏗️ Step 4: Build Project

```bash
# Build React widgets first (creates HTML files)
npm run build:ui

# Build TypeScript server
npm run build:server

# Or build all at once
npm run build
```

- Or if error run

```bash
chmod +x fix-widgets.sh
./fix-widgets.sh
```

**Expected output:**

```
dist/
├── ui/
│   ├── book-list/index.html
│   ├── book-detail/index.html
│   ├── cart/index.html
│   └── order-history/index.html
└── server/
    ├── index.js
    ├── database.js
    └── types.js
```

---

## 🚀 Step 5: Start Server Locally

```bash
npm start
```

**Expected console output:**

```
🚀 Starting BookStore MCP Server...

╔════════════════════════════════════════════════════════════╗
║  📚 BOOKSTORE MCP SERVER                                   ║
║  Status: ✅ Running                                        ║
║  Port: 8000                                                ║
╚════════════════════════════════════════════════════════════╝
```

---

## 🧪 Step 6: Test Local Server

**Terminal 1 (Server):**

```bash
npm start
```

**Terminal 2 (Test):**

```bash
# Test health endpoint
curl http://localhost:8000/health

# Open in browser
open http://localhost:8000
```

Bạn sẽ thấy UI với thông tin server!

---

## 🌐 Step 7: Deploy to Render

### 7.1 Push to GitHub

```bash
# Initialize git
git init
git add .
git commit -m "Initial commit: BookStore MCP"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/bookstore-mcp.git
git branch -M main
git push -u origin main
```

### 7.2 Deploy on Render

1. Truy cập https://render.com
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repository
4. Settings:

   - **Name:** `bookstore-mcp`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

5. Click **"Create Web Service"**

### 7.3 Get URL

Sau khi deploy xong (3-5 phút):

```
https://bookstore-mcp-xxxx.onrender.com
```

Test: Mở URL trong browser, bạn sẽ thấy server info page!

---

## 🔗 Step 8: Connect to ChatGPT

### Method 1: Direct URL (Recommended)

1. Mở **ChatGPT** → **Settings** (⚙️)
2. Click **"Apps SDK"** (hoặc "Integrations")
3. Click **"Add App"**
4. Nhập URL: `https://bookstore-mcp-xxxx.onrender.com`
5. ChatGPT sẽ auto-discover MCP endpoint
6. Click **"Connect"**

### Method 2: MCP Endpoint

Nếu method 1 không work:

1. URL: `https://bookstore-mcp-xxxx.onrender.com/mcp`
2. Transport: **SSE (Server-Sent Events)**
3. No authentication required

---

## 💬 Step 9: Test in ChatGPT

Sau khi connect thành công, thử các lệnh:

```
1. "Tìm sách về Programming"
2. "Tìm sách TypeScript giá dưới $50"
3. "Cho tôi xem chi tiết sách có ID là 1"
4. "Thêm sách ID 2 vào giỏ hàng"
5. "Thêm 3 cuốn sách ID 3 vào giỏ"
6. "Xem giỏ hàng của tôi"
7. "Thanh toán đơn hàng"
8. "Xem lịch sử đơn hàng"
```

ChatGPT sẽ:

- ✅ Show text response
- ✅ Render interactive widget UI
- ✅ Widget có dark/light theme
- ✅ Data update real-time

---

## 🐛 Troubleshooting

### Issue 1: Build fails

```bash
# Clean và rebuild
npm run clean
npm install
npm run build
```

### Issue 2: Widget không hiển thị

**Check:**

```bash
# Verify widget HTML files exist
ls -la dist/ui/*/index.html

# Should output:
# dist/ui/book-list/index.html
# dist/ui/book-detail/index.html
# dist/ui/cart/index.html
# dist/ui/order-history/index.html
```

**Fix:**

```bash
npm run build:ui
```

### Issue 3: ChatGPT connection failed

**Verify endpoints:**

```bash
curl https://your-app.onrender.com/health
# Should return JSON with status: ok

curl https://your-app.onrender.com/mcp
# Should return SSE stream
```

**Common fixes:**

- Đảm bảo Render service đang running (không sleep)
- Check Render logs for errors
- Verify PORT env variable (Render auto-sets this)

### Issue 4: Module not found errors

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Architecture

```
┌─────────────┐
│   ChatGPT   │  User asks: "Tìm sách TypeScript"
└──────┬──────┘
       │ calls MCP tool: search-books
       ↓
┌─────────────────────┐
│   MCP Server        │
│   (src/server)      │
│   • Register tools  │
│   • Process request │
│   • Return data     │
└──────┬──────────────┘
       │ returns structuredContent
       ↓
┌─────────────────────┐
│  React Widget UI    │
│  (dist/ui/*.html)   │
│  • useWidgetProps() │
│  • Render UI        │
│  • User interacts   │
└─────────────────────┘
```

---

## 🎨 Customization

### Add new book:

Edit `src/server/database.ts`:

```typescript
{
  id: '9',
  title: 'Your Book Title',
  author: 'Author Name',
  price: 39.99,
  category: 'Programming',
  // ... other fields
}
```

### Add new tool:

Edit `src/server/index.ts`:

```typescript
registerOpenAIWidget(
  server,
  {
    id: "your-tool",
    title: "Your Tool",
    // ... config
  },
  async (args) => {
    // Handler logic
  }
);
```

### Modify widget UI:

Edit `src/ui/*.tsx` files, then:

```bash
npm run build:ui
```

---

## 📚 Resources

- **Fractal MCP SDK:** https://github.com/fractal-mcp/sdk
- **OpenAI Apps SDK:** https://developers.openai.com/apps-sdk/
- **Model Context Protocol:** https://modelcontextprotocol.io
- **Render Docs:** https://render.com/docs

---

## ✅ Success Checklist

- [ ] Project created với đúng structure
- [ ] Dependencies installed
- [ ] Build successful (có dist/ui/\*/index.html)
- [ ] Server chạy local (port 8000)
- [ ] Deployed to Render
- [ ] ChatGPT connected
- [ ] All 6 tools hoạt động
- [ ] Widgets hiển thị đúng
- [ ] Theme switching works

---

## 🎉 Done!

Bạn đã có một **BookStore MCP Server** hoàn chỉnh với:

- ✅ 6 powerful tools
- ✅ 4 beautiful widgets
- ✅ Full Fractal MCP SDK features
- ✅ ChatGPT integration
- ✅ Production-ready code

**Next steps:**

- Add more books to database
- Implement user authentication
- Add payment processing
- Deploy to production domain
- Share with community!

Happy coding! 📚🚀
