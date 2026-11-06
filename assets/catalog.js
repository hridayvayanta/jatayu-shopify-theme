/**
 * JATAYU (जटायु) — Official Catalog & Order State Management
 * Connects to Supabase Cloud Database with seamless offline/localStorage fallback.
 */

(function (window) {
  'use strict';

  // Config: Enter your Supabase Project details here or via /admin settings
  const SUPABASE_CONFIG = {
    url: window.SUPABASE_URL || localStorage.getItem('jatayu_supabase_url') || '',
    anonKey: window.SUPABASE_KEY || localStorage.getItem('jatayu_supabase_key') || ''
  };

  // Initial Launch Garments (Default Catalog)
  const DEFAULT_PRODUCTS = [
    {
      id: 101,
      title: "The Jatayu Sovereign Oversized Tee",
      category: "T-Shirts",
      price: 2499,
      image: "/assets/product-tee-charcoal-front.jpg",
      secondary_image: "/assets/product-tee-charcoal-back.jpg",
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["Vintage Charcoal", "Deep Maroon", "Peach Ivory"],
      badge: "Signature Drop",
      description: "Cut from ultra-heavyweight 240 GSM combed cotton with an architectural drop-shoulder fit. Features high-definition screen printing of the iconic Jatayu eagle emblem on the chest and statement scripture on the reverse."
    },
    {
      id: 102,
      title: "The Jatayu Sovereign Oversized Tee - Peach Ivory",
      category: "T-Shirts",
      price: 2499,
      image: "/assets/product-tee-ivory-front.jpg",
      secondary_image: "/assets/product-tee-ivory-back.jpg",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Peach Ivory", "Sand Beige"],
      badge: "Archival",
      description: "Warm Peach Ivory combed cotton with deep maroon Jatayu emblem embroidery. Soft washed for a vintage lived-in handfeel."
    },
    {
      id: 103,
      title: "Sacred Flight Heavyweight Hoodie",
      category: "Hoodies",
      price: 4299,
      image: "/assets/product-hoodie-maroon-front.jpg",
      secondary_image: "/assets/product-hoodie-maroon-back.jpg",
      sizes: ["M", "L", "XL", "XXL"],
      colors: ["Deep Maroon", "Vintage Charcoal"],
      badge: "Limited Release",
      description: "400 GSM brushed fleece pullover hoodie featuring custom high-density embroidery of Jatayu in flight across the chest."
    },
    {
      id: 104,
      title: "Garuda Crest Heavyweight Tee",
      category: "T-Shirts",
      price: 2299,
      image: "/assets/product-tee-maroon-front.jpg",
      secondary_image: "/assets/product-tee-charcoal-back.jpg",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Heritage Maroon", "Vintage Charcoal"],
      badge: "New Chapter",
      description: "100% combed organic cotton classic crewneck celebrating courage and resilience from the Ramayana."
    },
    {
      id: 201,
      title: "Courage Embroidered Pullover Hoodie",
      category: "Hoodies",
      price: 4499,
      image: "/assets/product-hoodie-charcoal-front.jpg",
      secondary_image: "/assets/product-hoodie-charcoal-back.jpg",
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["Vintage Charcoal", "Deep Maroon"],
      badge: "Heavyweight",
      description: "Architectural boxy fit with ribbed side panels, kangaroo pocket, and metallic aglet drawstrings."
    },
    {
      id: 202,
      title: "Vayu Minimalist Classic Crew",
      category: "T-Shirts",
      price: 1999,
      image: "/assets/product-tee-sand-front.jpg",
      secondary_image: "/assets/product-tee-sand-back.jpg",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Sand Beige", "Peach Ivory"],
      badge: "Essential",
      description: "Tailored everyday luxury crew tee with subtle tonal Jatayu wordmark on the chest."
    }
  ];

  // Initialize Supabase Client if credentials exist and SDK is loaded
  let supabaseClient = null;
  if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey && typeof window.supabase !== 'undefined') {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    } catch(e) {
      console.warn('Supabase init failed, using local storage fallback', e);
    }
  }

  const JatayuCatalog = {
    // Get all products
    async getProducts() {
      if (supabaseClient) {
        try {
          const { data, error } = await supabaseClient.from('products').select('*').order('created_at', { ascending: false });
          if (!error && data && data.length > 0) {
            return data;
          }
        } catch(e) {
          console.warn('Supabase fetch failed, falling back to local', e);
        }
      }

      // LocalStorage / Default fallback
      const local = localStorage.getItem('jatayu_custom_products');
      if (local) {
        try {
          return JSON.parse(local);
        } catch(e) {}
      }

      // Initialize with defaults if empty
      localStorage.setItem('jatayu_custom_products', JSON.stringify(DEFAULT_PRODUCTS));
      return DEFAULT_PRODUCTS;
    },

    // Save a new product
    async addProduct(product) {
      product.id = product.id || Date.now();
      product.created_at = new Date().toISOString();

      if (supabaseClient) {
        try {
          const { data, error } = await supabaseClient.from('products').insert([product]).select();
          if (!error) return data[0];
        } catch(e) {
          console.warn('Supabase insert error', e);
        }
      }

      // Local fallback
      const products = await this.getProducts();
      products.unshift(product);
      localStorage.setItem('jatayu_custom_products', JSON.stringify(products));
      return product;
    },

    // Delete a product
    async deleteProduct(id) {
      if (supabaseClient) {
        try {
          await supabaseClient.from('products').delete().eq('id', id);
        } catch(e) {
          console.warn('Supabase delete error', e);
        }
      }

      const products = await this.getProducts();
      const filtered = products.filter(p => p.id != id);
      localStorage.setItem('jatayu_custom_products', JSON.stringify(filtered));
      return true;
    },

    // Get Orders
    async getOrders() {
      if (supabaseClient) {
        try {
          const { data, error } = await supabaseClient.from('orders').select('*').order('created_at', { ascending: false });
          if (!error && data) return data;
        } catch(e) {
          console.warn('Supabase orders fetch error', e);
        }
      }

      const localOrders = localStorage.getItem('jatayu_orders');
      if (localOrders) {
        try { return JSON.parse(localOrders); } catch(e) {}
      }
      return [
        {
          id: 'JATAYU-8429',
          customer_name: 'Hriday Vayanta',
          customer_email: 'hvayanta@gmail.com',
          customer_phone: '+91 98765 43210',
          total_price: 2499,
          items: 'The Jatayu Sovereign Oversized Tee (Charcoal / L) x1',
          payment_method: 'Prepaid UPI',
          payment_id: 'pay_PQR123456789',
          status: 'Dispatched',
          created_at: new Date(Date.now() - 3600000 * 4).toISOString()
        }
      ];
    },

    // Save an Order
    async saveOrder(order) {
      order.created_at = new Date().toISOString();
      order.status = order.status || 'Received';

      if (supabaseClient) {
        try {
          const { data, error } = await supabaseClient.from('orders').insert([order]).select();
          if (!error) return data[0];
        } catch(e) {
          console.warn('Supabase order insert error', e);
        }
      }

      const orders = await this.getOrders();
      orders.unshift(order);
      localStorage.setItem('jatayu_orders', JSON.stringify(orders));
      return order;
    }
  };

  window.JatayuCatalog = JatayuCatalog;
})(window);
