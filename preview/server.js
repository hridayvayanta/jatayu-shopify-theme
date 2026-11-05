const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = path.resolve(__dirname, '..');

// In-memory mock Shopify Ajax Cart state for testing
let cartState = {
  token: 'mock-shopify-cart-token-jatayu',
  note: null,
  attributes: {},
  original_total_price: 0,
  total_price: 0,
  total_discount: 0,
  total_weight: 0,
  item_count: 0,
  items: [],
  requires_shipping: true,
  currency: 'INR',
  items_subtotal_price: 0
};

// Catalog database for mock checkout & variant resolution
const catalog = {
  '101': { id: 101, title: 'The Jatayu Sovereign Oversized Tee', variant_title: 'Vintage Charcoal / L', price: 249900, image: '/assets/product-tee-charcoal-front.jpg' },
  '102': { id: 102, title: 'The Jatayu Sovereign Oversized Tee', variant_title: 'Peach Ivory / M', price: 249900, image: '/assets/product-tee-ivory-front.jpg' },
  '103': { id: 103, title: 'Sacred Flight Heavyweight Hoodie', variant_title: 'Deep Maroon / L', price: 429900, image: '/assets/product-hoodie-maroon-front.jpg' },
  '104': { id: 104, title: 'Garuda Crest Heavyweight Tee', variant_title: 'Heritage Maroon / XL', price: 229900, image: '/assets/product-tee-maroon-front.jpg' },
  '201': { id: 201, title: 'Courage Embroidered Pullover Hoodie', variant_title: 'Vintage Charcoal / L', price: 449900, image: '/assets/product-hoodie-charcoal-front.jpg' },
  '202': { id: 202, title: 'Vayu Minimalist Classic Crew', variant_title: 'Sand Beige / M', price: 199900, image: '/assets/product-tee-sand-front.jpg' },
  '1': { id: 1, title: 'The Jatayu Sovereign Oversized Tee', variant_title: 'S', price: 249900, image: '/assets/product-tee-charcoal-front.jpg' },
  '2': { id: 2, title: 'The Jatayu Sovereign Oversized Tee', variant_title: 'M', price: 249900, image: '/assets/product-tee-charcoal-front.jpg' },
  '3': { id: 3, title: 'The Jatayu Sovereign Oversized Tee', variant_title: 'L', price: 249900, image: '/assets/product-tee-charcoal-front.jpg' },
  '4': { id: 4, title: 'The Jatayu Sovereign Oversized Tee', variant_title: 'XL', price: 249900, image: '/assets/product-tee-charcoal-front.jpg' },
  '5': { id: 5, title: 'The Jatayu Sovereign Oversized Tee', variant_title: 'XXL', price: 249900, image: '/assets/product-tee-charcoal-front.jpg' }
};

function recalculateCart() {
  cartState.item_count = cartState.items.reduce((sum, item) => sum + item.quantity, 0);
  cartState.total_price = cartState.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cartState.original_total_price = cartState.total_price;
  cartState.items_subtotal_price = cartState.total_price;
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // 1. Shopify Ajax Cart API endpoint: GET /cart.js
  if (pathname === '/cart.js' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(cartState));
    return;
  }

  // 2. Shopify Ajax Cart API endpoint: POST /cart/add.js
  if (pathname === '/cart/add.js' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const variantId = String(payload.id || '101');
        const qty = Number(payload.quantity || 1);

        const productInfo = catalog[variantId] || {
          id: Number(variantId),
          title: 'Jatayu Heritage Apparel',
          variant_title: 'Standard',
          price: 249900,
          image: '/assets/product-tee-charcoal-front.jpg'
        };

        const existingItem = cartState.items.find(item => item.id == variantId);
        if (existingItem) {
          existingItem.quantity += qty;
        } else {
          cartState.items.push({
            id: Number(variantId),
            key: `${variantId}:token`,
            title: productInfo.title,
            product_title: productInfo.title,
            variant_title: productInfo.variant_title,
            price: productInfo.price,
            final_price: productInfo.price,
            quantity: qty,
            image: productInfo.image
          });
        }

        recalculateCart();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(cartState.items.find(i => i.id == variantId) || {}));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 400, message: 'Invalid payload' }));
      }
    });
    return;
  }

  // 3. Shopify Ajax Cart API endpoint: POST /cart/change.js
  if (pathname === '/cart/change.js' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const targetId = String(payload.id).split(':')[0];
        const newQty = Number(payload.quantity);

        const item = cartState.items.find(i => i.id == targetId);
        if (item) {
          if (newQty <= 0) {
            cartState.items = cartState.items.filter(i => i.id != targetId);
          } else {
            item.quantity = newQty;
          }
        }
        recalculateCart();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(cartState));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 400, message: 'Invalid payload' }));
      }
    });
    return;
  }

  // 4. Shopify Checkout redirect simulation
  if (pathname === '/checkout') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!doctype html>
      <html>
      <head>
        <title>Shopify Checkout | JATAYU</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600&family=Cormorant+Garamond:wght@500&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Manrope', sans-serif; background: #F7DBBD; color: #211B19; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
          .checkout-box { background: #FFF9F1; padding: 48px; border-radius: 4px; max-width: 520px; width: 100%; text-align: center; border: 1px solid rgba(116, 1, 1, 0.15); box-shadow: 0 10px 40px rgba(33,27,25,0.08); }
          h1 { font-family: 'Cormorant Garamond', serif; color: #740101; font-size: 32px; margin-bottom: 12px; }
          .btn { display: inline-block; background: #740101; color: #FFF9F1; padding: 14px 28px; text-decoration: none; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; font-size: 13px; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="checkout-box">
          <img src="/assets/jatayu-logo.jpg" alt="JATAYU" style="height: 48px; margin-bottom: 24px;">
          <h1>Shopify Checkout Gateway</h1>
          <p>This is the standard Shopify checkout handoff point. Once connected to your live Shopify store, your actual configured payment gateways (UPI, Razorpay, Cards, NetBanking, COD) and shipping zones handle the transaction seamlessly.</p>
          <p style="margin-top: 16px; font-weight: 600; color: #740101;">Cart Subtotal: ₹${(cartState.total_price / 100).toLocaleString('en-IN')}</p>
          <a href="/" class="btn">Return to Store</a>
        </div>
      </body>
      </html>
    `);
    return;
  }

  // 5. Static File Routing
  let filePath;
  if (pathname === '/' || pathname === '/index.html') {
    filePath = path.join(__dirname, 'index.html');
  } else if (pathname.startsWith('/products/')) {
    filePath = path.join(__dirname, 'product.html');
  } else if (pathname.startsWith('/collections')) {
    filePath = path.join(__dirname, 'collection.html');
  } else if (pathname === '/pages/our-story') {
    filePath = path.join(__dirname, 'story.html');
  } else if (pathname === '/pages/contact') {
    filePath = path.join(__dirname, 'contact.html');
  } else if (pathname === '/pages/faq') {
    filePath = path.join(__dirname, 'faq.html');
  } else if (pathname === '/pages/size-guide') {
    filePath = path.join(__dirname, 'size-guide.html');
  } else if (pathname.startsWith('/assets/')) {
    filePath = path.join(ROOT_DIR, pathname);
  } else {
    filePath = path.join(ROOT_DIR, pathname);
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // 404 fallback
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // Video stream support (Range requests for smooth playback on Safari/Chrome)
    if (ext === '.mp4') {
      const range = req.headers.range;
      const fileSize = stats.size;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(filePath).pipe(res);
      }
      return;
    }

    // Default static file serving
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`JATAYU Luxury Fashion local development preview server running at http://localhost:${PORT}`);
});
