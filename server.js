const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

// In-memory Cart state
let cartState = {
  token: 'jatayu-cart-token',
  total_price: 0,
  item_count: 0,
  items: [],
  currency: 'INR'
};

// Catalog database
const catalog = {
  '101': { id: 101, title: 'The Jatayu Sovereign Oversized Tee', variant_title: 'Vintage Charcoal / L', price: 249900, image: '/assets/product-tee-charcoal-front.jpg' },
  '102': { id: 102, title: 'The Jatayu Sovereign Oversized Tee', variant_title: 'Peach Ivory / M', price: 249900, image: '/assets/product-tee-ivory-front.jpg' },
  '103': { id: 103, title: 'Sacred Flight Heavyweight Hoodie', variant_title: 'Deep Maroon / L', price: 429900, image: '/assets/product-hoodie-maroon-front.jpg' },
  '104': { id: 104, title: 'Garuda Crest Heavyweight Tee', variant_title: 'Heritage Maroon / XL', price: 229900, image: '/assets/product-tee-maroon-front.jpg' },
  '201': { id: 201, title: 'Courage Embroidered Pullover Hoodie', variant_title: 'Vintage Charcoal / L', price: 449900, image: '/assets/product-hoodie-charcoal-front.jpg' },
  '202': { id: 202, title: 'Vayu Minimalist Classic Crew', variant_title: 'Sand Beige / M', price: 199900, image: '/assets/product-tee-sand-front.jpg' }
};

function recalculateCart() {
  cartState.item_count = cartState.items.reduce((sum, item) => sum + item.quantity, 0);
  cartState.total_price = cartState.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
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

  // 1. Cart API: GET /cart.js
  if (pathname === '/cart.js' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(cartState));
    return;
  }

  // 2. Cart API: POST /cart/add.js
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
          title: 'The Jatayu Sovereign Oversized Tee',
          variant_title: 'Vintage Charcoal / L',
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

  // 3. Cart API: POST /cart/change.js
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

  // 4. Static File Routing
  let filePath;
  if (pathname === '/' || pathname === '/index.html') {
    filePath = path.join(ROOT_DIR, 'index.html');
  } else if (pathname === '/admin' || pathname === '/admin.html') {
    filePath = path.join(ROOT_DIR, 'admin.html');
  } else if (pathname === '/login' || pathname === '/login.html') {
    filePath = path.join(ROOT_DIR, 'login.html');
  } else if (pathname === '/account' || pathname === '/account.html') {
    filePath = path.join(ROOT_DIR, 'account.html');
  } else if (pathname === '/checkout' || pathname === '/checkout.html') {
    filePath = path.join(ROOT_DIR, 'checkout.html');
  } else if (pathname.startsWith('/products/')) {
    filePath = path.join(ROOT_DIR, 'product.html');
  } else if (pathname.startsWith('/collections')) {
    filePath = path.join(ROOT_DIR, 'collection.html');
  } else if (pathname === '/pages/our-story' || pathname === '/story') {
    filePath = path.join(ROOT_DIR, 'story.html');
  } else if (pathname === '/pages/contact' || pathname === '/contact') {
    filePath = path.join(ROOT_DIR, 'contact.html');
  } else if (pathname === '/pages/faq' || pathname === '/faq') {
    filePath = path.join(ROOT_DIR, 'faq.html');
  } else if (pathname === '/pages/size-guide' || pathname === '/size-guide') {
    filePath = path.join(ROOT_DIR, 'size-guide.html');
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
      const fileSize = stats.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (start >= fileSize || end >= fileSize) {
          res.writeHead(416, {
            'Content-Range': `bytes */${fileSize}`,
            'Content-Type': 'video/mp4'
          });
          return res.end();
        }

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
          'Accept-Ranges': 'bytes'
        };
        res.writeHead(200, head);
        fs.createReadStream(filePath).pipe(res);
      }
      return;
    }

    // Standard static file response
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`JATAYU Luxury Fashion server running at http://localhost:${PORT}`);
});
