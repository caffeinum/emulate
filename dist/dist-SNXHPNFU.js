import "./chunk-PZ5AY32C.js";

// ../@emulators/stripe/dist/index.js
import { createHmac } from "crypto";
import { randomBytes } from "crypto";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
function getStripeStore(store) {
  return {
    customers: store.collection("stripe.customers", ["stripe_id", "email"]),
    products: store.collection("stripe.products", ["stripe_id"]),
    prices: store.collection("stripe.prices", ["stripe_id", "product_id"]),
    paymentIntents: store.collection("stripe.payment_intents", ["stripe_id", "customer_id"]),
    charges: store.collection("stripe.charges", ["stripe_id", "customer_id", "payment_intent_id"]),
    checkoutSessions: store.collection("stripe.checkout_sessions", ["stripe_id", "customer_id"])
  };
}
var NUMERIC_KEYS = /* @__PURE__ */ new Set([
  "amount",
  "unit_amount",
  "quantity",
  "amount_total",
  "amount_subtotal",
  "application_fee_amount",
  "transfer_amount"
]);
function stripeId(prefix) {
  return `${prefix}_${randomBytes(12).toString("base64url").slice(0, 24)}`;
}
function toUnixTimestamp(iso) {
  return Math.floor(new Date(iso).getTime() / 1e3);
}
async function parseStripeBody(c) {
  const contentType = c.req.header("Content-Type") ?? "";
  const rawText = await c.req.text();
  if (!rawText) return {};
  if (contentType.includes("application/json")) {
    try {
      const parsed = JSON.parse(rawText);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
  const params = new URLSearchParams(rawText);
  const result = {};
  for (const [key, value] of params) {
    if (key.includes("[")) {
      const parts = key.replace(/]/g, "").split("[");
      let target = result;
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        const nextIsIndex = /^\d+$/.test(parts[i + 1]);
        const current = target[part];
        if (current === void 0 || current === null || typeof current !== "object") {
          target[part] = nextIsIndex ? [] : {};
        }
        target = target[part];
      }
      const lastKey = parts[parts.length - 1];
      const num = Number(value);
      const coerced = NUMERIC_KEYS.has(lastKey) && Number.isFinite(num) ? num : value;
      if (Array.isArray(target)) {
        const idx = lastKey === "" ? target.length : parseInt(lastKey, 10);
        target[idx] = coerced;
      } else {
        target[lastKey] = coerced;
      }
    } else {
      const num = Number(value);
      result[key] = NUMERIC_KEYS.has(key) && Number.isFinite(num) ? num : value;
    }
  }
  return result;
}
function stripeError(c, status, type, message, code, param) {
  return c.json(
    {
      error: {
        type,
        message,
        ...code && { code },
        ...param && { param }
      }
    },
    status
  );
}
function stripeList(c, items, url, formatFn) {
  const limit = Math.min(parseInt(c.req.query("limit") ?? "10", 10), 100);
  const startingAfter = c.req.query("starting_after");
  const endingBefore = c.req.query("ending_before");
  const createdGte = c.req.query("created[gte]");
  const createdLte = c.req.query("created[lte]");
  let filtered = items;
  if (createdGte) {
    const gte = parseInt(createdGte, 10);
    filtered = filtered.filter((item) => toUnixTimestamp(item.created_at) >= gte);
  }
  if (createdLte) {
    const lte = parseInt(createdLte, 10);
    filtered = filtered.filter((item) => toUnixTimestamp(item.created_at) <= lte);
  }
  filtered.sort((a, b) => b.id - a.id);
  if (startingAfter) {
    const idx = filtered.findIndex((item) => item.stripe_id === startingAfter);
    if (idx !== -1) {
      filtered = filtered.slice(idx + 1);
    }
  } else if (endingBefore) {
    const idx = filtered.findIndex((item) => item.stripe_id === endingBefore);
    if (idx !== -1) {
      filtered = filtered.slice(0, idx);
      filtered = filtered.slice(-limit);
    }
  }
  const page = filtered.slice(0, limit);
  const hasMore = filtered.length > limit;
  return c.json({
    object: "list",
    url,
    has_more: hasMore,
    data: page.map(formatFn)
  });
}
function applyExpand(obj, expandPaths, resolvers) {
  if (!expandPaths || expandPaths.length === 0) return obj;
  const result = { ...obj };
  for (const path of expandPaths) {
    const resolver = resolvers[path];
    const id = result[path];
    if (resolver && typeof id === "string") {
      const expanded = resolver(id);
      if (expanded) {
        result[path] = expanded;
      }
    }
  }
  return result;
}
function parseExpand(c) {
  const fromQuery = c.req.queries("expand[]") ?? [];
  return fromQuery;
}
function formatCustomer(c) {
  return {
    id: c.stripe_id,
    object: "customer",
    email: c.email,
    name: c.name,
    description: c.description,
    metadata: c.metadata,
    created: toUnixTimestamp(c.created_at),
    livemode: false
  };
}
function formatPaymentIntent(pi) {
  return {
    id: pi.stripe_id,
    object: "payment_intent",
    amount: pi.amount,
    currency: pi.currency,
    status: pi.status,
    customer: pi.customer_id,
    description: pi.description,
    payment_method: pi.payment_method,
    metadata: pi.metadata,
    created: toUnixTimestamp(pi.created_at),
    livemode: false
  };
}
function customerRoutes({ app, store, webhooks }) {
  const ss = getStripeStore(store);
  app.post("/v1/customers", async (c) => {
    const body = await parseStripeBody(c);
    const customer = ss.customers.insert({
      stripe_id: stripeId("cus"),
      email: body.email ?? null,
      name: body.name ?? null,
      description: body.description ?? null,
      metadata: body.metadata ?? {}
    });
    await webhooks.dispatch(
      "customer.created",
      void 0,
      { type: "customer.created", data: { object: formatCustomer(customer) } },
      "stripe"
    );
    return c.json(formatCustomer(customer), 200);
  });
  app.get("/v1/customers/:id", (c) => {
    const customer = ss.customers.findOneBy("stripe_id", c.req.param("id"));
    if (!customer)
      return stripeError(
        c,
        404,
        "invalid_request_error",
        `No such customer: '${c.req.param("id")}'`,
        "resource_missing"
      );
    return c.json(formatCustomer(customer));
  });
  app.post("/v1/customers/:id", async (c) => {
    const customer = ss.customers.findOneBy("stripe_id", c.req.param("id"));
    if (!customer)
      return stripeError(
        c,
        404,
        "invalid_request_error",
        `No such customer: '${c.req.param("id")}'`,
        "resource_missing"
      );
    const body = await parseStripeBody(c);
    const updated = ss.customers.update(customer.id, {
      ...body.email !== void 0 && { email: body.email },
      ...body.name !== void 0 && { name: body.name },
      ...body.description !== void 0 && { description: body.description },
      ...body.metadata !== void 0 && { metadata: body.metadata }
    });
    await webhooks.dispatch(
      "customer.updated",
      void 0,
      { type: "customer.updated", data: { object: formatCustomer(updated) } },
      "stripe"
    );
    return c.json(formatCustomer(updated));
  });
  app.delete("/v1/customers/:id", async (c) => {
    const customer = ss.customers.findOneBy("stripe_id", c.req.param("id"));
    if (!customer)
      return stripeError(
        c,
        404,
        "invalid_request_error",
        `No such customer: '${c.req.param("id")}'`,
        "resource_missing"
      );
    for (const pi of ss.paymentIntents.findBy("customer_id", customer.stripe_id)) {
      ss.paymentIntents.update(pi.id, { customer_id: null });
    }
    for (const ch of ss.charges.findBy("customer_id", customer.stripe_id)) {
      ss.charges.update(ch.id, { customer_id: null });
    }
    for (const cs of ss.checkoutSessions.findBy("customer_id", customer.stripe_id)) {
      ss.checkoutSessions.update(cs.id, { customer_id: null });
    }
    ss.customers.delete(customer.id);
    await webhooks.dispatch(
      "customer.deleted",
      void 0,
      { type: "customer.deleted", data: { object: { ...formatCustomer(customer), deleted: true } } },
      "stripe"
    );
    return c.json({ id: customer.stripe_id, object: "customer", deleted: true });
  });
  app.get("/v1/customers", (c) => {
    let items = ss.customers.all();
    const email = c.req.query("email");
    if (email) items = items.filter((cust) => cust.email === email);
    return stripeList(c, items, "/v1/customers", formatCustomer);
  });
}
function paymentIntentRoutes({ app, store, webhooks }) {
  const ss = getStripeStore(store);
  const expandResolvers = {
    customer: (id) => {
      const cust = ss.customers.findOneBy("stripe_id", id);
      return cust ? formatCustomer(cust) : void 0;
    }
  };
  app.post("/v1/payment_intents", async (c) => {
    const body = await parseStripeBody(c);
    if (!body.amount || !body.currency) {
      return stripeError(
        c,
        400,
        "invalid_request_error",
        "Missing required param: amount and currency are required.",
        void 0,
        "amount"
      );
    }
    if (body.customer && !ss.customers.findOneBy("stripe_id", body.customer)) {
      return stripeError(
        c,
        400,
        "invalid_request_error",
        `No such customer: '${body.customer}'`,
        "resource_missing",
        "customer"
      );
    }
    const status = body.payment_method ? "requires_confirmation" : "requires_payment_method";
    const pi = ss.paymentIntents.insert({
      stripe_id: stripeId("pi"),
      amount: body.amount,
      currency: body.currency.toLowerCase(),
      status,
      customer_id: body.customer ?? null,
      description: body.description ?? null,
      payment_method: body.payment_method ?? null,
      metadata: body.metadata ?? {}
    });
    await webhooks.dispatch(
      "payment_intent.created",
      void 0,
      { type: "payment_intent.created", data: { object: formatPaymentIntent(pi) } },
      "stripe"
    );
    return c.json(formatPaymentIntent(pi), 200);
  });
  app.get("/v1/payment_intents/:id", (c) => {
    const pi = ss.paymentIntents.findOneBy("stripe_id", c.req.param("id"));
    if (!pi)
      return stripeError(
        c,
        404,
        "invalid_request_error",
        `No such payment_intent: '${c.req.param("id")}'`,
        "resource_missing"
      );
    const expand = parseExpand(c);
    const result = applyExpand(formatPaymentIntent(pi), expand, expandResolvers);
    return c.json(result);
  });
  app.post("/v1/payment_intents/:id", async (c) => {
    const pi = ss.paymentIntents.findOneBy("stripe_id", c.req.param("id"));
    if (!pi)
      return stripeError(
        c,
        404,
        "invalid_request_error",
        `No such payment_intent: '${c.req.param("id")}'`,
        "resource_missing"
      );
    const body = await parseStripeBody(c);
    const updates = {};
    if (body.amount !== void 0) updates.amount = body.amount;
    if (body.currency !== void 0) updates.currency = body.currency.toLowerCase();
    if (body.description !== void 0) updates.description = body.description;
    if (body.metadata !== void 0) updates.metadata = body.metadata;
    if (body.payment_method !== void 0) {
      updates.payment_method = body.payment_method;
      if (pi.status === "requires_payment_method") {
        updates.status = "requires_confirmation";
      }
    }
    const updated = ss.paymentIntents.update(pi.id, updates);
    return c.json(formatPaymentIntent(updated));
  });
  app.post("/v1/payment_intents/:id/confirm", async (c) => {
    const pi = ss.paymentIntents.findOneBy("stripe_id", c.req.param("id"));
    if (!pi)
      return stripeError(
        c,
        404,
        "invalid_request_error",
        `No such payment_intent: '${c.req.param("id")}'`,
        "resource_missing"
      );
    const body = await parseStripeBody(c);
    if (pi.status !== "requires_confirmation" && pi.status !== "requires_payment_method") {
      return stripeError(
        c,
        400,
        "invalid_request_error",
        `This PaymentIntent's status is ${pi.status}, which does not allow confirmation.`,
        "payment_intent_unexpected_state"
      );
    }
    if (body.payment_method) {
      ss.paymentIntents.update(pi.id, { payment_method: body.payment_method });
    }
    const updated = ss.paymentIntents.update(pi.id, { status: "succeeded" });
    const charge = ss.charges.insert({
      stripe_id: stripeId("ch"),
      amount: updated.amount,
      currency: updated.currency,
      status: "succeeded",
      customer_id: updated.customer_id,
      payment_intent_id: updated.stripe_id,
      description: updated.description,
      metadata: updated.metadata
    });
    await webhooks.dispatch(
      "payment_intent.succeeded",
      void 0,
      { type: "payment_intent.succeeded", data: { object: formatPaymentIntent(updated) } },
      "stripe"
    );
    await webhooks.dispatch(
      "charge.succeeded",
      void 0,
      {
        type: "charge.succeeded",
        data: {
          object: {
            id: charge.stripe_id,
            object: "charge",
            amount: charge.amount,
            currency: charge.currency,
            status: charge.status
          }
        }
      },
      "stripe"
    );
    return c.json(formatPaymentIntent(updated));
  });
  app.post("/v1/payment_intents/:id/cancel", async (c) => {
    const pi = ss.paymentIntents.findOneBy("stripe_id", c.req.param("id"));
    if (!pi)
      return stripeError(
        c,
        404,
        "invalid_request_error",
        `No such payment_intent: '${c.req.param("id")}'`,
        "resource_missing"
      );
    if (pi.status === "succeeded" || pi.status === "canceled") {
      return stripeError(
        c,
        400,
        "invalid_request_error",
        `This PaymentIntent's status is ${pi.status}, which does not allow cancellation.`,
        "payment_intent_unexpected_state"
      );
    }
    const updated = ss.paymentIntents.update(pi.id, { status: "canceled" });
    await webhooks.dispatch(
      "payment_intent.canceled",
      void 0,
      { type: "payment_intent.canceled", data: { object: formatPaymentIntent(updated) } },
      "stripe"
    );
    return c.json(formatPaymentIntent(updated));
  });
  app.get("/v1/payment_intents", (c) => {
    let items = ss.paymentIntents.all();
    const customerId = c.req.query("customer");
    const status = c.req.query("status");
    if (customerId) items = items.filter((pi) => pi.customer_id === customerId);
    if (status) items = items.filter((pi) => pi.status === status);
    return stripeList(c, items, "/v1/payment_intents", formatPaymentIntent);
  });
}
function paymentMethodRoutes({ app, store }) {
  const ss = getStripeStore(store);
  app.get("/v1/payment_methods", (c) => {
    const customerId = c.req.query("customer");
    if (customerId && !ss.customers.findOneBy("stripe_id", customerId)) {
      return stripeError(
        c,
        400,
        "invalid_request_error",
        `No such customer: '${customerId}'`,
        "resource_missing",
        "customer"
      );
    }
    return c.json(
      {
        object: "list",
        url: "/v1/payment_methods",
        has_more: false,
        data: []
      },
      200
    );
  });
}
function formatCharge(ch) {
  return {
    id: ch.stripe_id,
    object: "charge",
    amount: ch.amount,
    currency: ch.currency,
    status: ch.status,
    customer: ch.customer_id,
    payment_intent: ch.payment_intent_id,
    description: ch.description,
    metadata: ch.metadata,
    created: toUnixTimestamp(ch.created_at),
    livemode: false
  };
}
function chargeRoutes({ app, store }) {
  const ss = getStripeStore(store);
  const expandResolvers = {
    customer: (id) => {
      const cust = ss.customers.findOneBy("stripe_id", id);
      return cust ? formatCustomer(cust) : void 0;
    },
    payment_intent: (id) => {
      const pi = ss.paymentIntents.findOneBy("stripe_id", id);
      return pi ? formatPaymentIntent(pi) : void 0;
    }
  };
  app.get("/v1/charges/:id", (c) => {
    const charge = ss.charges.findOneBy("stripe_id", c.req.param("id"));
    if (!charge)
      return stripeError(c, 404, "invalid_request_error", `No such charge: '${c.req.param("id")}'`, "resource_missing");
    const expand = parseExpand(c);
    const result = applyExpand(formatCharge(charge), expand, expandResolvers);
    return c.json(result);
  });
  app.get("/v1/charges", (c) => {
    let items = ss.charges.all();
    const customerId = c.req.query("customer");
    const piId = c.req.query("payment_intent");
    if (customerId) items = items.filter((ch) => ch.customer_id === customerId);
    if (piId) items = items.filter((ch) => ch.payment_intent_id === piId);
    return stripeList(c, items, "/v1/charges", formatCharge);
  });
}
function formatProduct(p) {
  return {
    id: p.stripe_id,
    object: "product",
    name: p.name,
    description: p.description,
    active: p.active,
    metadata: p.metadata,
    created: toUnixTimestamp(p.created_at),
    livemode: false
  };
}
function productRoutes({ app, store, webhooks }) {
  const ss = getStripeStore(store);
  app.post("/v1/products", async (c) => {
    const body = await parseStripeBody(c);
    if (!body.name)
      return stripeError(c, 400, "invalid_request_error", "Missing required param: name.", void 0, "name");
    const product = ss.products.insert({
      stripe_id: stripeId("prod"),
      name: body.name,
      description: body.description ?? null,
      active: body.active ?? true,
      metadata: body.metadata ?? {}
    });
    await webhooks.dispatch(
      "product.created",
      void 0,
      { type: "product.created", data: { object: formatProduct(product) } },
      "stripe"
    );
    return c.json(formatProduct(product), 200);
  });
  app.get("/v1/products/:id", (c) => {
    const product = ss.products.findOneBy("stripe_id", c.req.param("id"));
    if (!product)
      return stripeError(
        c,
        404,
        "invalid_request_error",
        `No such product: '${c.req.param("id")}'`,
        "resource_missing"
      );
    return c.json(formatProduct(product));
  });
  app.get("/v1/products", (c) => {
    let items = ss.products.all();
    const active = c.req.query("active");
    if (active !== void 0) items = items.filter((p) => p.active === (active === "true"));
    return stripeList(c, items, "/v1/products", formatProduct);
  });
}
function formatPrice(p) {
  return {
    id: p.stripe_id,
    object: "price",
    product: p.product_id,
    currency: p.currency,
    unit_amount: p.unit_amount,
    type: p.type,
    active: p.active,
    metadata: p.metadata,
    created: toUnixTimestamp(p.created_at),
    livemode: false
  };
}
function formatProduct2(p) {
  return {
    id: p.stripe_id,
    object: "product",
    name: p.name,
    active: p.active,
    created: toUnixTimestamp(p.created_at),
    livemode: false
  };
}
function priceRoutes({ app, store, webhooks }) {
  const ss = getStripeStore(store);
  const expandResolvers = {
    product: (id) => {
      const prod = ss.products.findOneBy("stripe_id", id);
      return prod ? formatProduct2(prod) : void 0;
    }
  };
  app.post("/v1/prices", async (c) => {
    const body = await parseStripeBody(c);
    if (!body.currency || !body.product) {
      return stripeError(
        c,
        400,
        "invalid_request_error",
        "Missing required param: currency and product are required.",
        void 0,
        "currency"
      );
    }
    if (!ss.products.findOneBy("stripe_id", body.product)) {
      return stripeError(
        c,
        400,
        "invalid_request_error",
        `No such product: '${body.product}'`,
        "resource_missing",
        "product"
      );
    }
    const price = ss.prices.insert({
      stripe_id: stripeId("price"),
      product_id: body.product,
      currency: body.currency.toLowerCase(),
      unit_amount: body.unit_amount ?? null,
      type: body.recurring ? "recurring" : "one_time",
      active: body.active ?? true,
      metadata: body.metadata ?? {}
    });
    await webhooks.dispatch(
      "price.created",
      void 0,
      { type: "price.created", data: { object: formatPrice(price) } },
      "stripe"
    );
    return c.json(formatPrice(price), 200);
  });
  app.get("/v1/prices/:id", (c) => {
    const price = ss.prices.findOneBy("stripe_id", c.req.param("id"));
    if (!price)
      return stripeError(c, 404, "invalid_request_error", `No such price: '${c.req.param("id")}'`, "resource_missing");
    const expand = parseExpand(c);
    const result = applyExpand(formatPrice(price), expand, expandResolvers);
    return c.json(result);
  });
  app.get("/v1/prices", (c) => {
    let items = ss.prices.all();
    const productId = c.req.query("product");
    const active = c.req.query("active");
    if (productId) items = items.filter((p) => p.product_id === productId);
    if (active !== void 0) items = items.filter((p) => p.active === (active === "true"));
    return stripeList(c, items, "/v1/prices", formatPrice);
  });
}
function createErrorHandler(documentationUrl) {
  return async (c, next) => {
    if (documentationUrl) {
      c.set("docsUrl", documentationUrl);
    }
    await next();
  };
}
var errorHandler = createErrorHandler();
var isDebug = typeof process !== "undefined" && (process.env.DEBUG === "1" || process.env.DEBUG === "true" || process.env.EMULATE_DEBUG === "1");
var __dirname = dirname(fileURLToPath(import.meta.url));
var FONTS = {
  "geist-sans.woff2": readFileSync(join(__dirname, "fonts", "geist-sans.woff2")),
  "GeistPixel-Square.woff2": readFileSync(join(__dirname, "fonts", "GeistPixel-Square.woff2"))
};
var FAVICON = readFileSync(join(__dirname, "fonts", "favicon.ico"));
function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function escapeAttr(s) {
  return escapeHtml(s).replace(/'/g, "&#39;");
}
var CSS = `
.inspector-json{white-space:pre-wrap;overflow-wrap:anywhere;font-size:.8125rem;line-height:1.6;max-height:70vh;overflow:auto}
.inspector-detail{padding:14px 0;border-bottom:1px solid #0a3300}
.inspector-detail summary{cursor:pointer;overflow-wrap:anywhere}
.inspector-action{display:inline-block;margin-top:12px;padding:8px 12px;border:1px solid #0a3300;border-radius:6px;background:#001a00;color:#33ff00;font:inherit;font-size:.8125rem;cursor:pointer}
.inspector-action:hover{background:#0a3300}
.inspector-scroll{overflow-x:auto}
@font-face{
  font-family:'Geist';font-style:normal;font-weight:100 900;font-display:swap;
  src:url('/_emulate/fonts/geist-sans.woff2') format('woff2');
}
@font-face{
  font-family:'Geist Pixel';font-style:normal;font-weight:400;font-display:swap;
  src:url('/_emulate/fonts/GeistPixel-Square.woff2') format('woff2');
}
*{box-sizing:border-box;margin:0;padding:0}
body{
  font-family:'Geist',-apple-system,BlinkMacSystemFont,sans-serif;
  background:#000;color:#33ff00;min-height:100vh;
  -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;
}
.emu-bar{
  border-bottom:1px solid #0a3300;padding:10px 20px;
  display:flex;align-items:center;gap:10px;font-size:.8125rem;color:#1a8c00;
}
.emu-bar-title{font-weight:600;color:#33ff00;font-family:'Geist Pixel',monospace;}
.emu-bar-links{margin-left:auto;display:flex;gap:16px;}
.emu-bar-links a{
  color:#1a8c00;font-size:.75rem;text-decoration:none;transition:color .15s;
}
.emu-bar-links a:hover{color:#33ff00;}
.emu-bar-links a .full{display:inline;}
.emu-bar-links a .short{display:none;}
@media(max-width:600px){
  .emu-bar-links a .full{display:none;}
  .emu-bar-links a .short{display:inline;}
}

.content{
  display:flex;align-items:center;justify-content:center;
  min-height:calc(100vh - 42px);padding:24px 16px;
}
.content-inner{width:100%;max-width:420px;}
.card-title{
  font-family:'Geist Pixel',monospace;
  font-size:1.125rem;font-weight:600;margin-bottom:4px;color:#33ff00;
}
.card-subtitle{color:#1a8c00;font-size:.8125rem;margin-bottom:18px;line-height:1.45;}
.powered-by{
  position:fixed;bottom:0;left:0;right:0;
  text-align:center;padding:12px;font-size:.6875rem;color:#0a3300;
  font-family:'Geist Pixel',monospace;
}
.powered-by a{color:#1a8c00;text-decoration:none;transition:color .15s;}
.powered-by a:hover{color:#33ff00;}

.error-title{
  font-family:'Geist Pixel',monospace;
  color:#ff4444;font-size:1.125rem;font-weight:600;margin-bottom:8px;
}
.error-msg{color:#1a8c00;font-size:.875rem;line-height:1.5;}
.error-card{text-align:center;}

.user-form{margin-bottom:8px;}
.user-form:last-of-type{margin-bottom:0;}
.user-btn{
  width:100%;display:flex;align-items:center;gap:12px;
  padding:10px 12px;border:1px solid #0a3300;border-radius:8px;
  background:#000;color:inherit;cursor:pointer;text-align:left;
  font:inherit;transition:border-color .15s;
}
.user-btn:hover{border-color:#33ff00;}
.avatar{
  width:36px;height:36px;border-radius:50%;
  background:#0a3300;color:#33ff00;font-weight:600;font-size:.875rem;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
  font-family:'Geist Pixel',monospace;
}
.user-text{min-width:0;}
.user-login{font-weight:600;font-size:.875rem;display:block;color:#33ff00;}
.user-meta{color:#1a8c00;font-size:.75rem;margin-top:1px;}
.user-email{font-size:.6875rem;color:#116600;word-break:break-all;margin-top:1px;}

.settings-layout{
  max-width:920px;margin:0 auto;padding:28px 20px;
  display:flex;gap:28px;
}
.settings-sidebar{width:200px;flex-shrink:0;}
.settings-sidebar a{
  display:block;padding:6px 10px;border-radius:6px;color:#1a8c00;
  text-decoration:none;font-size:.8125rem;transition:color .15s;
}
.settings-sidebar a:hover{color:#33ff00;}
.settings-sidebar a.active{color:#33ff00;font-weight:600;}
.settings-main{flex:1;min-width:0;}

.s-card{
  padding:18px 0;margin-bottom:14px;border-bottom:1px solid #0a3300;
}
.s-card:last-child{border-bottom:none;}
.s-card-header{display:flex;align-items:center;gap:14px;margin-bottom:14px;}
.s-icon{
  width:42px;height:42px;border-radius:8px;
  background:#0a3300;display:flex;align-items:center;justify-content:center;
  font-size:1.125rem;font-weight:700;color:#116600;flex-shrink:0;
  font-family:'Geist Pixel',monospace;
}
.s-title{
  font-family:'Geist Pixel',monospace;
  font-size:1.25rem;font-weight:600;color:#33ff00;
}
.s-subtitle{font-size:.75rem;color:#1a8c00;margin-top:2px;}
.section-heading{
  font-size:.9375rem;font-weight:600;margin-bottom:10px;color:#33ff00;
  display:flex;align-items:center;justify-content:space-between;
}
.perm-list{list-style:none;}
.perm-list li{padding:5px 0;font-size:.8125rem;display:flex;align-items:center;gap:6px;color:#1a8c00;}
.check{color:#33ff00;}
.org-row{
  display:flex;align-items:center;gap:8px;padding:7px 0;
  border-bottom:1px solid #0a3300;font-size:.8125rem;
}
.org-row:last-child{border-bottom:none;}
.org-icon{
  width:22px;height:22px;border-radius:4px;background:#0a3300;
  display:flex;align-items:center;justify-content:center;
  font-size:.625rem;font-weight:700;color:#116600;flex-shrink:0;
  font-family:'Geist Pixel',monospace;
}
.org-name{font-weight:600;color:#33ff00;}
.badge{font-size:.6875rem;padding:1px 7px;border-radius:999px;font-weight:500;}
.badge-granted{background:#0a3300;color:#33ff00;}
.badge-denied{background:#1a0a0a;color:#ff4444;}
.badge-requested{background:#0a3300;color:#1a8c00;}
.btn-revoke{
  display:inline-block;padding:5px 14px;border-radius:6px;
  border:1px solid #0a3300;background:transparent;color:#ff4444;
  font-size:.75rem;font-weight:600;cursor:pointer;transition:border-color .15s;
}
.btn-revoke:hover{border-color:#ff4444;}
.info-text{color:#1a8c00;font-size:.75rem;line-height:1.5;margin-top:10px;}
.app-link{
  display:flex;align-items:center;gap:12px;padding:12px;
  border:1px solid #0a3300;border-radius:8px;background:#000;
  text-decoration:none;color:inherit;margin-bottom:8px;transition:border-color .15s;
}
.app-link:hover{border-color:#33ff00;}
.app-link-name{font-weight:600;font-size:.875rem;color:#33ff00;}
.app-link-scopes{font-size:.6875rem;color:#1a8c00;margin-top:1px;}
.empty{color:#1a8c00;text-align:center;padding:28px 0;font-size:.875rem;}

.inspector-layout{max-width:960px;margin:0 auto;padding:28px 20px;}
.inspector-tabs{display:flex;gap:4px;margin-bottom:20px;}
.inspector-tabs a{
  padding:7px 16px;border-radius:6px;text-decoration:none;
  font-size:.8125rem;color:#1a8c00;border:1px solid transparent;
  transition:color .15s,border-color .15s;
}
.inspector-tabs a:hover{color:#33ff00;}
.inspector-tabs a.active{color:#33ff00;font-weight:600;border-color:#0a3300;background:#0a3300;}
.inspector-section{margin-bottom:24px;}
.inspector-section h2{
  font-family:'Geist Pixel',monospace;
  font-size:1rem;font-weight:600;color:#33ff00;margin-bottom:10px;
}
.inspector-section h3{
  font-family:'Geist Pixel',monospace;
  font-size:.875rem;font-weight:600;color:#1a8c00;margin:16px 0 8px;
}
.inspector-table{width:100%;border-collapse:collapse;margin-bottom:12px;}
.inspector-table th,.inspector-table td{
  text-align:left;padding:8px 12px;border-bottom:1px solid #0a3300;
  font-size:.8125rem;
}
.inspector-table th{color:#1a8c00;font-weight:600;font-size:.75rem;text-transform:uppercase;letter-spacing:.04em;}
.inspector-table td{color:#33ff00;}
.inspector-table tbody tr{transition:background .1s;}
.inspector-table tbody tr:hover{background:#0a3300;}
.inspector-empty{color:#1a8c00;text-align:center;padding:20px 0;font-size:.8125rem;}

.checkout-layout{
  display:flex;min-height:calc(100vh - 42px);
}
.checkout-summary{
  flex:1;background:#020;padding:48px 40px 48px 10%;
  display:flex;flex-direction:column;justify-content:center;
  border-right:1px solid #0a3300;
}
.checkout-form-side{
  flex:1;background:#000;padding:48px 10% 48px 40px;
  display:flex;flex-direction:column;justify-content:center;
}
.checkout-merchant{
  display:flex;align-items:center;gap:10px;margin-bottom:6px;
}
.checkout-merchant-name{
  font-family:'Geist Pixel',monospace;
  font-size:.9375rem;font-weight:600;color:#33ff00;
}
.checkout-test-badge{
  font-size:.625rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;
  background:#0a3300;color:#1a8c00;padding:2px 8px;border-radius:4px;
}
.checkout-total{
  font-family:'Geist Pixel',monospace;
  font-size:2rem;font-weight:700;color:#33ff00;margin:8px 0 28px;
}
.checkout-line-item{
  display:flex;align-items:center;gap:14px;padding:14px 0;
  border-bottom:1px solid #0a3300;
}
.checkout-line-item:first-child{border-top:1px solid #0a3300;}
.checkout-item-icon{
  width:42px;height:42px;border-radius:6px;background:#0a3300;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
  font-family:'Geist Pixel',monospace;font-size:.875rem;font-weight:700;color:#116600;
}
.checkout-item-details{flex:1;min-width:0;}
.checkout-item-name{font-size:.875rem;font-weight:600;color:#33ff00;}
.checkout-item-qty{font-size:.75rem;color:#1a8c00;margin-top:2px;}
.checkout-item-price{
  font-size:.875rem;font-weight:600;color:#33ff00;text-align:right;white-space:nowrap;
}
.checkout-item-unit{font-size:.6875rem;color:#1a8c00;text-align:right;margin-top:2px;}
.checkout-totals{margin-top:20px;}
.checkout-totals-row{
  display:flex;justify-content:space-between;padding:6px 0;
  font-size:.8125rem;color:#1a8c00;
}
.checkout-totals-row.total{
  border-top:1px solid #0a3300;margin-top:8px;padding-top:14px;
  font-size:.9375rem;font-weight:600;color:#33ff00;
}
.checkout-form-section{margin-bottom:24px;}
.checkout-form-label{
  font-size:.8125rem;font-weight:600;color:#33ff00;margin-bottom:8px;display:block;
}
.checkout-input{
  width:100%;padding:10px 12px;border:1px solid #0a3300;border-radius:6px;
  background:#020;color:#33ff00;font:inherit;font-size:.875rem;
  transition:border-color .15s;outline:none;
}
.checkout-input:focus{border-color:#33ff00;}
.checkout-input::placeholder{color:#116600;}
.checkout-card-box{
  border:1px solid #0a3300;border-radius:6px;padding:14px;
  background:#020;
}
.checkout-card-row{
  display:flex;gap:12px;margin-top:10px;
}
.checkout-card-row .checkout-input{flex:1;}
.checkout-sim-note{
  font-size:.6875rem;color:#1a8c00;margin-top:10px;text-align:center;
  font-style:italic;
}
.checkout-pay-btn{
  width:100%;padding:14px;border:none;border-radius:8px;
  background:#33ff00;color:#000;font:inherit;font-size:.9375rem;font-weight:700;
  cursor:pointer;transition:background .15s;
  font-family:'Geist Pixel',monospace;
}
.checkout-pay-btn:hover{background:#44ff22;}
.checkout-cancel{
  text-align:center;margin-top:14px;
}
.checkout-cancel a{
  color:#1a8c00;text-decoration:none;font-size:.8125rem;
  transition:color .15s;
}
.checkout-cancel a:hover{color:#33ff00;}
@media(max-width:768px){
  .checkout-layout{flex-direction:column;}
  .checkout-summary{padding:32px 20px;border-right:none;border-bottom:1px solid #0a3300;}
  .checkout-form-side{padding:32px 20px;}
}
`;
var POWERED_BY = `<div class="powered-by">Powered by <a href="https://emulate.dev" target="_blank" rel="noopener">emulate</a></div>`;
function emuBar(service) {
  const title = service ? `${escapeHtml(service)} Emulator` : "Emulator";
  return `<div class="emu-bar">
  <span class="emu-bar-title">${title}</span>
  <nav class="emu-bar-links">
    <a href="https://github.com/vercel-labs/emulate/issues" target="_blank" rel="noopener"><span class="full">Report Issue</span><span class="short">Report</span></a>
    <a href="https://github.com/vercel-labs/emulate" target="_blank" rel="noopener"><span class="full">Source Code</span><span class="short">Source</span></a>
    <a href="https://emulate.dev" target="_blank" rel="noopener"><span class="full">Learn More</span><span class="short">Learn</span></a>
  </nav>
</div>`;
}
function head(title) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<link rel="icon" href="/_emulate/favicon.ico"/>
<title>${escapeHtml(title)} | emulate</title>
<style>${CSS}</style>
</head>`;
}
function renderCardPage(title, subtitle, body, service) {
  return `${head(title)}
<body>
${emuBar(service)}
<div class="content">
  <div class="content-inner">
    <div class="card-title">${escapeHtml(title)}</div>
    <div class="card-subtitle">${subtitle}</div>
    ${body}
  </div>
</div>
${POWERED_BY}
</body></html>`;
}
function renderCheckoutPage(opts, service) {
  const fmt = (cents, cur) => `$${(cents / 100).toFixed(2)} ${cur.toUpperCase()}`;
  const fmtShort = (cents) => `$${(cents / 100).toFixed(2)}`;
  const itemsHtml = opts.lineItems.length > 0 ? opts.lineItems.map((li) => {
    const initial = li.name.charAt(0).toUpperCase();
    const unitNote = li.quantity > 1 ? `<div class="checkout-item-unit">${fmtShort(li.unitPrice)} each</div>` : "";
    return `<div class="checkout-line-item">
  <div class="checkout-item-icon">${escapeHtml(initial)}</div>
  <div class="checkout-item-details">
    <div class="checkout-item-name">${escapeHtml(li.name)}</div>
    <div class="checkout-item-qty">Qty ${li.quantity}</div>
  </div>
  <div>
    <div class="checkout-item-price">${fmtShort(li.totalPrice)}</div>
    ${unitNote}
  </div>
</div>`;
  }).join("") : '<p class="empty">No line items</p>';
  const totalsHtml = `<div class="checkout-totals">
  <div class="checkout-totals-row">
    <span>Subtotal</span><span>${fmtShort(opts.subtotal)}</span>
  </div>
  <div class="checkout-totals-row total">
    <span>Total due</span><span>${fmt(opts.total, opts.currency)}</span>
  </div>
</div>`;
  const cancelHtml = opts.cancelUrl ? `<div class="checkout-cancel"><a href="${escapeAttr(opts.cancelUrl)}">Cancel</a></div>` : "";
  const merchant = opts.merchantName ? escapeHtml(opts.merchantName) : "Checkout";
  return `${head("Checkout")}
<body>
${emuBar(service)}
<div class="checkout-layout">
  <div class="checkout-summary">
    <div class="checkout-merchant">
      <span class="checkout-merchant-name">${merchant}</span>
      <span class="checkout-test-badge">Test Mode</span>
    </div>
    <div class="checkout-total">${fmtShort(opts.total)}</div>
    ${itemsHtml}
    ${totalsHtml}
  </div>
  <div class="checkout-form-side">
    <form method="post" action="/checkout/${escapeAttr(opts.sessionId)}/complete">
      <div class="checkout-form-section">
        <label class="checkout-form-label">Email</label>
        <input type="email" name="email" class="checkout-input" placeholder="you@example.com"/>
      </div>
      <div class="checkout-form-section">
        <label class="checkout-form-label">Card information</label>
        <div class="checkout-card-box">
          <input type="text" class="checkout-input" placeholder="1234 1234 1234 1234" disabled/>
          <div class="checkout-card-row">
            <input type="text" class="checkout-input" placeholder="MM / YY" disabled/>
            <input type="text" class="checkout-input" placeholder="CVC" disabled/>
          </div>
        </div>
        <div class="checkout-sim-note">Card fields are simulated. Payment will be auto-approved.</div>
      </div>
      <button type="submit" class="checkout-pay-btn">Pay ${fmtShort(opts.total)}</button>
    </form>
    ${cancelHtml}
  </div>
</div>
${POWERED_BY}
</body></html>`;
}
var SERVICE_LABEL = "Stripe";
function formatSession(s, baseUrl) {
  return {
    id: s.stripe_id,
    object: "checkout.session",
    mode: s.mode,
    status: s.status,
    payment_status: s.payment_status,
    customer: s.customer_id,
    success_url: s.success_url,
    cancel_url: s.cancel_url,
    metadata: s.metadata,
    created: toUnixTimestamp(s.created_at),
    livemode: false,
    url: s.status === "open" ? `${baseUrl}/checkout/${s.stripe_id}` : null
  };
}
function checkoutSessionRoutes({ app, store, webhooks, baseUrl }) {
  const ss = getStripeStore(store);
  app.post("/v1/checkout/sessions", async (c) => {
    const body = await parseStripeBody(c);
    if (!body.mode)
      return stripeError(c, 400, "invalid_request_error", "Missing required param: mode.", void 0, "mode");
    if (body.customer && !ss.customers.findOneBy("stripe_id", body.customer)) {
      return stripeError(
        c,
        400,
        "invalid_request_error",
        `No such customer: '${body.customer}'`,
        "resource_missing",
        "customer"
      );
    }
    const lineItems = [];
    if (body.line_items) {
      if (!Array.isArray(body.line_items)) {
        return stripeError(c, 400, "invalid_request_error", "line_items must be an array.", void 0, "line_items");
      }
      for (let i = 0; i < body.line_items.length; i++) {
        const li = body.line_items[i];
        if (!li || typeof li !== "object") {
          return stripeError(
            c,
            400,
            "invalid_request_error",
            `Invalid line_items[${i}]: must be an object.`,
            void 0,
            `line_items[${i}]`
          );
        }
        if (!li.price || typeof li.price !== "string") {
          return stripeError(
            c,
            400,
            "invalid_request_error",
            `Missing required param: line_items[${i}][price].`,
            void 0,
            `line_items[${i}][price]`
          );
        }
        if (!ss.prices.findOneBy("stripe_id", li.price)) {
          return stripeError(
            c,
            400,
            "invalid_request_error",
            `No such price: '${li.price}'`,
            "resource_missing",
            `line_items[${i}][price]`
          );
        }
        const qty = typeof li.quantity === "number" ? li.quantity : parseInt(li.quantity, 10);
        if (!Number.isFinite(qty) || qty < 1) {
          return stripeError(
            c,
            400,
            "invalid_request_error",
            `Invalid line_items[${i}][quantity]: must be a positive integer.`,
            void 0,
            `line_items[${i}][quantity]`
          );
        }
        lineItems.push({ price: li.price, quantity: qty });
      }
    }
    const session = ss.checkoutSessions.insert({
      stripe_id: stripeId("cs"),
      mode: body.mode,
      status: "open",
      payment_status: "unpaid",
      customer_id: body.customer ?? null,
      success_url: body.success_url ?? null,
      cancel_url: body.cancel_url ?? null,
      line_items: lineItems,
      metadata: body.metadata ?? {}
    });
    return c.json(formatSession(session, baseUrl), 200);
  });
  app.get("/v1/checkout/sessions/:id", (c) => {
    const session = ss.checkoutSessions.findOneBy("stripe_id", c.req.param("id"));
    if (!session)
      return stripeError(
        c,
        404,
        "invalid_request_error",
        `No such checkout session: '${c.req.param("id")}'`,
        "resource_missing"
      );
    return c.json(formatSession(session, baseUrl));
  });
  app.post("/v1/checkout/sessions/:id/expire", async (c) => {
    const session = ss.checkoutSessions.findOneBy("stripe_id", c.req.param("id"));
    if (!session)
      return stripeError(
        c,
        404,
        "invalid_request_error",
        `No such checkout session: '${c.req.param("id")}'`,
        "resource_missing"
      );
    if (session.status !== "open") {
      return stripeError(
        c,
        400,
        "invalid_request_error",
        "Only open sessions can be expired.",
        "checkout_session_not_open"
      );
    }
    const updated = ss.checkoutSessions.update(session.id, { status: "expired" });
    await webhooks.dispatch(
      "checkout.session.expired",
      void 0,
      { type: "checkout.session.expired", data: { object: formatSession(updated, baseUrl) } },
      "stripe"
    );
    return c.json(formatSession(updated, baseUrl));
  });
  app.get("/v1/checkout/sessions", (c) => {
    let items = ss.checkoutSessions.all();
    const customerId = c.req.query("customer");
    const status = c.req.query("status");
    const paymentStatus = c.req.query("payment_status");
    if (customerId) items = items.filter((s) => s.customer_id === customerId);
    if (status) items = items.filter((s) => s.status === status);
    if (paymentStatus) items = items.filter((s) => s.payment_status === paymentStatus);
    return stripeList(c, items, "/v1/checkout/sessions", (s) => formatSession(s, baseUrl));
  });
  app.get("/checkout/:id", (c) => {
    const session = ss.checkoutSessions.findOneBy("stripe_id", c.req.param("id"));
    if (!session) {
      return c.html(
        renderCardPage(
          "Session Not Found",
          "This checkout session does not exist.",
          '<p class="empty">The session ID is invalid or has been removed.</p>',
          SERVICE_LABEL
        ),
        404
      );
    }
    if (session.status !== "open") {
      return c.html(
        renderCardPage(
          "Session Expired",
          "This checkout session is no longer available.",
          `<p class="empty">Status: ${escapeHtml(session.status)}</p>`,
          SERVICE_LABEL
        )
      );
    }
    const lineItems = session.line_items.map((li) => {
      const priceObj = ss.prices.findOneBy("stripe_id", li.price);
      const product = priceObj ? ss.products.findOneBy("stripe_id", priceObj.product_id) : null;
      const unitPrice = priceObj?.unit_amount ?? 0;
      return {
        name: product?.name ?? li.price,
        quantity: li.quantity,
        unitPrice,
        totalPrice: unitPrice * li.quantity,
        currency: priceObj?.currency ?? "usd"
      };
    });
    const subtotal = lineItems.reduce((sum, li) => sum + li.totalPrice, 0);
    const currency = lineItems.length > 0 ? lineItems[0].currency : "usd";
    return c.html(
      renderCheckoutPage(
        {
          lineItems,
          subtotal,
          total: subtotal,
          currency,
          sessionId: session.stripe_id,
          cancelUrl: session.cancel_url
        },
        SERVICE_LABEL
      )
    );
  });
  app.post("/checkout/:id/complete", async (c) => {
    const session = ss.checkoutSessions.findOneBy("stripe_id", c.req.param("id"));
    if (!session || session.status !== "open") {
      return c.redirect("/checkout/" + c.req.param("id"));
    }
    const updated = ss.checkoutSessions.update(session.id, { status: "complete", payment_status: "paid" });
    await webhooks.dispatch(
      "checkout.session.completed",
      void 0,
      { type: "checkout.session.completed", data: { object: formatSession(updated, baseUrl) } },
      "stripe"
    );
    if (session.success_url) {
      const url = session.success_url.replace("{CHECKOUT_SESSION_ID}", updated.stripe_id);
      return c.redirect(url);
    }
    return c.html(
      renderCardPage(
        "Payment Complete",
        "Your payment was successful.",
        '<p class="empty check">Payment received</p>',
        SERVICE_LABEL
      )
    );
  });
}
function customerSessionRoutes({ app, store }) {
  const ss = getStripeStore(store);
  app.post("/v1/customer_sessions", async (c) => {
    const body = await parseStripeBody(c);
    if (!body.customer)
      return stripeError(c, 400, "invalid_request_error", "Missing required param: customer.", void 0, "customer");
    const customer = ss.customers.findOneBy("stripe_id", body.customer);
    if (!customer)
      return stripeError(
        c,
        400,
        "invalid_request_error",
        `No such customer: '${body.customer}'`,
        "resource_missing",
        "customer"
      );
    return c.json(
      {
        object: "customer_session",
        client_secret: stripeId("cuss_secret"),
        components: body.components ?? {},
        created: Math.floor(Date.now() / 1e3),
        customer: customer.stripe_id,
        expires_at: Math.floor(Date.now() / 1e3) + 1800,
        livemode: false
      },
      200
    );
  });
}
function stripeWebhookHeaders({ body, subscription }) {
  const headers = {
    "Content-Type": "application/json"
  };
  if (subscription.secret) {
    const timestamp = Math.floor(Date.now() / 1e3);
    const signature = createHmac("sha256", subscription.secret).update(`${timestamp}.${body}`).digest("hex");
    headers["Stripe-Signature"] = `t=${timestamp},v1=${signature}`;
  }
  return headers;
}
function seedDefaults(store, _baseUrl) {
  const ss = getStripeStore(store);
  ss.customers.insert({
    stripe_id: stripeId("cus"),
    email: "test@example.com",
    name: "Test Customer",
    description: null,
    metadata: {}
  });
}
function seedFromConfig(store, _baseUrl, config, webhooks) {
  const ss = getStripeStore(store);
  if (config.customers) {
    for (const c of config.customers) {
      if (c.email) {
        const existing = ss.customers.findOneBy("email", c.email);
        if (existing) continue;
      }
      ss.customers.insert({
        stripe_id: c.id ?? stripeId("cus"),
        email: c.email ?? null,
        name: c.name ?? null,
        description: c.description ?? null,
        metadata: {}
      });
    }
  }
  if (config.products) {
    for (const p of config.products) {
      const product = ss.products.insert({
        stripe_id: p.id ?? stripeId("prod"),
        name: p.name,
        description: p.description ?? null,
        active: true,
        metadata: {}
      });
      const matchingPrices = config.prices?.filter((pr) => pr.product_name === p.name) ?? [];
      for (const pr of matchingPrices) {
        ss.prices.insert({
          stripe_id: pr.id ?? stripeId("price"),
          product_id: product.stripe_id,
          currency: pr.currency.toLowerCase(),
          unit_amount: pr.unit_amount,
          type: "one_time",
          active: true,
          metadata: {}
        });
      }
    }
  }
  if (config.webhooks && webhooks) {
    webhooks.setHeaderFactory(stripeWebhookHeaders);
    for (const wh of config.webhooks) {
      webhooks.register({
        url: wh.url,
        events: wh.events,
        active: true,
        secret: wh.secret,
        owner: "stripe"
      });
    }
  }
}
var stripePlugin = {
  name: "stripe",
  register(app, store, webhooks, baseUrl, tokenMap) {
    webhooks.setHeaderFactory(stripeWebhookHeaders);
    const ctx = { app, store, webhooks, baseUrl, tokenMap };
    customerRoutes(ctx);
    paymentMethodRoutes(ctx);
    paymentIntentRoutes(ctx);
    chargeRoutes(ctx);
    productRoutes(ctx);
    priceRoutes(ctx);
    checkoutSessionRoutes(ctx);
    customerSessionRoutes(ctx);
  },
  seed(store, baseUrl) {
    seedDefaults(store, baseUrl);
  }
};
var index_default = stripePlugin;
export {
  index_default as default,
  getStripeStore,
  seedFromConfig,
  stripePlugin
};
/*!
 * This HTTP compatibility layer builds on Hono's API and design.
 * https://github.com/honojs/hono
 * Copyright (c) 2021 - present, Yusuke Wada and Hono contributors
 * MIT license: see THIRD_PARTY_NOTICES.md in the repository and npm packages.
 */
//# sourceMappingURL=dist-SNXHPNFU.js.map