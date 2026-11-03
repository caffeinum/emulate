import "./chunk-PZ5AY32C.js";

// ../@emulators/aws/dist/index.js
import { randomBytes, createHash } from "crypto";
import { randomBytes as randomBytes2 } from "crypto";

// ../../node_modules/.pnpm/jose@6.2.12/node_modules/jose/dist/webapi/lib/buffer_utils.js
var encoder = new TextEncoder();
var decoder = new TextDecoder();
var strictDecoder = new TextDecoder("utf-8", { fatal: true });
var MAX_INT32 = 2 ** 32;
function concat(...buffers) {
  const size = buffers.reduce((acc, { length }) => acc + length, 0), buf = new Uint8Array(size);
  let i = 0;
  for (const buffer of buffers)
    buf.set(buffer, i), i += buffer.length;
  return buf;
}
var NON_ASCII = /[^\x00-\x7f]/;
function encode(string2) {
  if (typeof string2 == "string" && string2.length >= 128) {
    if (NON_ASCII.test(string2))
      throw new TypeError("non-ASCII string encountered in encode()");
    return encoder.encode(string2);
  }
  const bytes = new Uint8Array(string2.length);
  for (let i = 0; i < string2.length; i++) {
    const code = string2.charCodeAt(i);
    if (code > 127)
      throw new TypeError("non-ASCII string encountered in encode()");
    bytes[i] = code;
  }
  return bytes;
}
function encodeBase64(input, url = false) {
  if (Uint8Array.prototype.toBase64)
    return input.toBase64({ alphabet: url ? "base64url" : "base64", omitPadding: url });
  const CHUNK_SIZE = 32768, arr = [];
  for (let i = 0; i < input.length; i += CHUNK_SIZE)
    arr.push(String.fromCharCode.apply(null, input.subarray(i, i + CHUNK_SIZE)));
  const encoded = btoa(arr.join(""));
  return url ? encoded.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_") : encoded;
}
function decodeBase64(encoded, url = false) {
  if (Uint8Array.fromBase64)
    return Uint8Array.fromBase64(encoded, { alphabet: url ? "base64url" : "base64" });
  if (url) {
    if (encoded.includes("+") || encoded.includes("/"))
      throw new TypeError("Invalid base64url");
    encoded = encoded.replace(/-/g, "+").replace(/_/g, "/");
  }
  const binary = atob(encoded), bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++)
    bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// ../../node_modules/.pnpm/jose@6.2.12/node_modules/jose/dist/webapi/util/errors.js
var JOSEError = class extends Error {
  static code = "ERR_JOSE_GENERIC";
  code = "ERR_JOSE_GENERIC";
  constructor(message2, options) {
    super(message2, options), this.name = this.constructor.name, Error.captureStackTrace?.(this, this.constructor);
  }
};
var JWTClaimValidationFailed = class extends JOSEError {
  static code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
  code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
  claim;
  reason;
  payload;
  constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
    super(message2, { cause: { claim, reason, payload } }), this.claim = claim, this.reason = reason, this.payload = payload;
  }
};
var JWTExpired = class extends JOSEError {
  static code = "ERR_JWT_EXPIRED";
  code = "ERR_JWT_EXPIRED";
  claim;
  reason;
  payload;
  constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
    super(message2, { cause: { claim, reason, payload } }), this.claim = claim, this.reason = reason, this.payload = payload;
  }
};
var JOSEAlgNotAllowed = class extends JOSEError {
  static code = "ERR_JOSE_ALG_NOT_ALLOWED";
  code = "ERR_JOSE_ALG_NOT_ALLOWED";
};
var JOSENotSupported = class extends JOSEError {
  static code = "ERR_JOSE_NOT_SUPPORTED";
  code = "ERR_JOSE_NOT_SUPPORTED";
};
var JWSInvalid = class extends JOSEError {
  static code = "ERR_JWS_INVALID";
  code = "ERR_JWS_INVALID";
};
var JWTInvalid = class extends JOSEError {
  static code = "ERR_JWT_INVALID";
  code = "ERR_JWT_INVALID";
};
var JWSSignatureVerificationFailed = class extends JOSEError {
  static code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
  code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
  constructor(message2 = "signature verification failed", options) {
    super(message2, options);
  }
};

// ../../node_modules/.pnpm/jose@6.2.12/node_modules/jose/dist/webapi/util/base64url.js
var invalid = "The input to be decoded is not correctly encoded.";
function decode(input) {
  try {
    return decodeBase64(typeof input == "string" ? input : decoder.decode(input), true);
  } catch (cause) {
    throw new TypeError(invalid, { cause });
  }
}
function encode2(input) {
  return encodeBase64(typeof input == "string" ? encoder.encode(input) : input, true);
}

// ../../node_modules/.pnpm/jose@6.2.12/node_modules/jose/dist/webapi/lib/validate.js
function isObject(input) {
  if (typeof input != "object" || input === null || Object.prototype.toString.call(input) !== "[object Object]")
    return false;
  const prototype = Object.getPrototypeOf(input);
  return prototype === null || Object.getPrototypeOf(prototype) === null;
}
function isDisjoint(...headers) {
  const parameters = /* @__PURE__ */ new Set();
  for (const header of headers)
    if (header)
      for (const parameter of Object.keys(header)) {
        if (parameters.has(parameter))
          return false;
        parameters.add(parameter);
      }
  return true;
}
function assertNotSet(value, name) {
  if (value !== void 0)
    throw new TypeError(`${name} can only be called once`);
}
function decodeBase64url(value, label, ErrorClass) {
  try {
    return decode(value);
  } catch {
    throw new ErrorClass(`Failed to base64url decode the ${label}`);
  }
}
function encodeBase64url(value, label, ErrorClass) {
  try {
    return encode(value);
  } catch {
    throw new ErrorClass(`The ${label} is not a valid base64url string`);
  }
}
function parseJoseHeader(b64, ErrorClass, message2) {
  let parsed;
  try {
    parsed = JSON.parse(strictDecoder.decode(decode(b64)));
  } catch {
    throw new ErrorClass(message2);
  }
  if (!isObject(parsed))
    throw new ErrorClass(message2);
  return parsed;
}
var JWS_RECOGNIZED = { __proto__: null, b64: true };
function validateAlgorithms(option, algorithms) {
  if (algorithms !== void 0 && (!Array.isArray(algorithms) || algorithms.some((s) => typeof s != "string")))
    throw new TypeError(`"${option}" option must be an array of strings`);
  return algorithms === void 0 ? void 0 : new Set(algorithms);
}
function validateCritDuplicates(Err, protectedHeader) {
  const { crit } = protectedHeader ?? {};
  if (Array.isArray(crit) && new Set(crit).size !== crit.length)
    throw new Err('"crit" (Critical) Header Parameter MUST NOT contain duplicate values');
}
function validateCrit(Err, recognizedDefault, recognizedOption, protectedHeader, joseHeader) {
  if (joseHeader.crit !== void 0 && protectedHeader?.crit === void 0)
    throw new Err('"crit" (Critical) Header Parameter MUST be integrity protected');
  if (!protectedHeader || protectedHeader.crit === void 0)
    return [];
  if (!Array.isArray(protectedHeader.crit) || protectedHeader.crit.length === 0 || protectedHeader.crit.some((input) => typeof input != "string" || input.length === 0))
    throw new Err('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');
  const recognized = recognizedOption === void 0 ? recognizedDefault : { __proto__: null, ...recognizedOption, ...recognizedDefault };
  for (const parameter of protectedHeader.crit) {
    if (!(parameter in recognized))
      throw new JOSENotSupported(`Extension Header Parameter "${parameter}" is not recognized`);
    if (!Object.hasOwn(joseHeader, parameter) || joseHeader[parameter] === void 0)
      throw new Err(`Extension Header Parameter "${parameter}" is missing`);
    if (recognized[parameter] && (!Object.hasOwn(protectedHeader, parameter) || protectedHeader[parameter] === void 0))
      throw new Err(`Extension Header Parameter "${parameter}" MUST be integrity protected`);
  }
  return protectedHeader.crit;
}
function validateB64(protectedHeader, extensions) {
  if (extensions.includes("b64")) {
    const b64 = protectedHeader.b64;
    if (typeof b64 != "boolean")
      throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
    return b64;
  }
  return true;
}
function serializeJoseHeader(Err, header) {
  let serialized, parsed;
  try {
    serialized = JSON.stringify(header), parsed = JSON.parse(serialized);
  } catch (cause) {
    throw new Err("JOSE Header is not valid JSON", { cause });
  }
  if (!isObject(parsed))
    throw new Err("JOSE Header is not a JSON object");
  return [parsed, serialized];
}

// ../../node_modules/.pnpm/jose@6.2.12/node_modules/jose/dist/webapi/lib/key.js
var tag = (key) => key[Symbol.toStringTag];
var jwkMatchesOp = (entry, key, usage) => {
  const { alg } = entry;
  if (key.use !== void 0) {
    const expected = usage === "sign" || usage === "verify" ? "sig" : "enc";
    if (key.use !== expected)
      throw new TypeError(`Invalid key for this operation, its "use" must be "${expected}" when present`);
  }
  if (key.alg !== void 0 && key.alg !== alg)
    throw new TypeError(`Invalid key for this operation, its "alg" must be "${alg}" when present`);
  if (Array.isArray(key.key_ops)) {
    const expectedKeyOp = usage === "encrypt" || usage === "decrypt" ? entry.ops?.[usage === "encrypt" ? 0 : 1] : usage;
    if (expectedKeyOp && !key.key_ops.includes(expectedKeyOp))
      throw new TypeError(`Invalid key for this operation, its "key_ops" must include "${expectedKeyOp}" when present`);
  }
};
async function prepareKey(entry, key, usage) {
  const { alg, secret } = entry, privateKey = usage === "decrypt" || usage === "sign";
  if (secret && key instanceof Uint8Array)
    return key;
  let normalized, keyObject;
  if (isObject(key)) {
    if (normalized = normalizeJwk(key), typeof normalized.kty != "string")
      throw invalidKeyType(alg, key, secret);
    if (!(secret ? normalized.kty === "oct" && typeof normalized.k == "string" : normalized.kty !== "oct" && (privateKey ? normalized.kty === "AKP" && typeof normalized.priv == "string" || typeof normalized.d == "string" : normalized.d === void 0 && normalized.priv === void 0)))
      throw new TypeError(secret ? 'JSON Web Key for symmetric algorithms must have JWK "kty" (Key Type) equal to "oct" and the JWK "k" (Key Value) present' : `JSON Web Key for this operation must be a ${privateKey ? "private" : "public"} JWK`);
    if (jwkMatchesOp(entry, normalized, usage), normalized.kty === "oct")
      return decode(normalized.k);
    if (!Object.isFrozen(key)) {
      const { key_ops } = key;
      Array.isArray(key_ops) && Object.freeze(key_ops), Object.freeze(key);
    }
  } else {
    if (!isKeyLike(key))
      throw invalidKeyType(alg, key, secret);
    const expectedType = secret ? "secret" : privateKey ? "private" : "public";
    if (key.type !== expectedType && (secret || ["secret", "public", "private"].includes(key.type)))
      throw new TypeError(`${tag(key)} instances must be of type "${expectedType}" for the ${alg} algorithm`);
    if (isCryptoKey(key))
      return key;
    if (keyObject = key, keyObject.type === "secret")
      return keyObject.export();
  }
  cache ||= /* @__PURE__ */ new WeakMap();
  const cacheKey = key;
  let cached = cache.get(cacheKey);
  if (cached?.[alg])
    return cached[alg];
  if (cached || cache.set(cacheKey, cached = {}), keyObject && typeof keyObject.toCryptoKey == "function") {
    const isPublic = keyObject.type === "public", crv = nist[keyObject.asymmetricKeyDetails?.namedCurve], params = entry.resolve?.({ crv, asymmetricKeyType: keyObject.asymmetricKeyType }) ?? entry.subtle;
    return cached[alg] = keyObject.toCryptoKey(params, isPublic, entry.usages[isPublic ? 0 : 1]);
  }
  return normalized ??= keyObject.export({ format: "jwk" }), normalized.alg = alg, cached[alg] = await jwkToKey(entry, normalized);
}
var cache;
var nist = {
  __proto__: null,
  prime256v1: "P-256",
  secp384r1: "P-384",
  secp521r1: "P-521"
};
var isCryptoKey = (key) => {
  if (key?.[Symbol.toStringTag] === "CryptoKey")
    return true;
  try {
    return key instanceof CryptoKey;
  } catch {
    return false;
  }
};
var isKeyObject = (key) => key?.[Symbol.toStringTag] === "KeyObject";
var isKeyLike = (key) => isCryptoKey(key) || isKeyObject(key);
function message(msg, actual, ...types) {
  if (types.length > 2) {
    const last = types.pop();
    msg += `one of type ${types.join(", ")}, or ${last}.`;
  } else types.length === 2 ? msg += `one of type ${types[0]} or ${types[1]}.` : msg += `of type ${types[0]}.`;
  return actual == null ? msg += ` Received ${actual}` : typeof actual == "function" && actual.name ? msg += ` Received function ${actual.name}` : typeof actual == "object" && actual != null && actual.constructor?.name && (msg += ` Received an instance of ${actual.constructor.name}`), msg;
}
function invalidKeyType(alg, actual, secret) {
  const types = ["CryptoKey", "KeyObject", "JSON Web Key"];
  return secret && types.push("Uint8Array"), new TypeError(message(`Key for the ${alg} algorithm must be `, actual, ...types));
}
var unusable = (name, prop = "algorithm.name") => new TypeError(`CryptoKey does not support this operation, its ${prop} must be ${name}`);
function checkUsage(key, usage) {
  if (usage && !key.usages.includes(usage))
    throw new TypeError(`CryptoKey does not support this operation, its usages must include ${usage}.`);
}
function checkModulusLength(alg, key) {
  const { modulusLength } = key.algorithm;
  if (typeof modulusLength != "number" || modulusLength < 2048)
    throw new TypeError(`${alg} requires key modulusLength to be 2048 bits or larger`);
}
function checkCryptoKey(key, expected, usage) {
  const algorithm = key.algorithm;
  if (algorithm.name !== expected.name)
    throw unusable(expected.name);
  if (expected.hash && algorithm.hash?.name !== expected.hash)
    throw unusable(expected.hash, "algorithm.hash");
  if (expected.namedCurve && algorithm.namedCurve !== expected.namedCurve)
    throw unusable(expected.namedCurve, "algorithm.namedCurve");
  if (expected.length !== void 0 && algorithm.length !== expected.length)
    throw unusable(expected.length, "algorithm.length");
  checkUsage(key, usage);
}
function snapshotJwk(jwk) {
  return { __proto__: null, ...jwk };
}
function normalizeJwk(jwk) {
  const normalized = snapshotJwk(jwk);
  if (normalized.ext !== void 0 && typeof normalized.ext != "boolean")
    throw new TypeError('"ext" (Extractable) Parameter must be a boolean');
  if (normalized.key_ops !== void 0) {
    const value = normalized.key_ops, keyOps = Array.isArray(value) ? [...value] : void 0;
    if (!keyOps || keyOps.some((operation) => typeof operation != "string") || new Set(keyOps).size !== keyOps.length)
      throw new TypeError('"key_ops" (Key Operations) Parameter must be an array of unique strings');
    normalized.key_ops = keyOps;
  }
  return normalized;
}
async function jwkToKey(entry, jwk, extractable) {
  if (!entry.kty.includes(jwk.kty))
    throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
  const algorithm = entry.resolve?.({ kty: jwk.kty, crv: jwk.crv }) ?? entry.subtle, isPrivate = !!(jwk.d || jwk.priv), keyData = { ...jwk, ext: extractable ?? jwk.ext };
  return keyData.kty !== "AKP" && delete keyData.alg, delete keyData.use, crypto.subtle.importKey("jwk", keyData, algorithm, keyData.ext ?? !isPrivate, jwk.key_ops ?? entry.usages[isPrivate ? 1 : 0]);
}
async function rawKey(key, expected, usage, extractable = false) {
  return key instanceof Uint8Array && (key = await crypto.subtle.importKey("raw", key, expected, extractable, [usage])), checkCryptoKey(key, expected, usage), key;
}

// ../../node_modules/.pnpm/jose@6.2.12/node_modules/jose/dist/webapi/lib/key_descriptor.js
function table(entries) {
  const out = { __proto__: null };
  for (const alg in entries)
    out[alg] = { ...entries[alg], alg };
  return out;
}

// ../../node_modules/.pnpm/jose@6.2.12/node_modules/jose/dist/webapi/lib/jws_algorithms.js
var sig = [["verify"], ["sign"]];
function hmac(bits) {
  const subtle = { name: "HMAC", hash: `SHA-${bits}` };
  return { kty: ["oct"], secret: true, subtle, signing: subtle, usages: sig };
}
function rsa(bits, saltLength) {
  const subtle = { name: saltLength ? "RSA-PSS" : "RSASSA-PKCS1-v1_5", hash: `SHA-${bits}` };
  return {
    kty: ["RSA"],
    subtle,
    signing: saltLength ? { ...subtle, saltLength } : subtle,
    usages: sig,
    minRsaBits: 2048
  };
}
function ecdsa(crv, bits) {
  return {
    kty: ["EC"],
    crv,
    subtle: { name: "ECDSA", namedCurve: crv },
    signing: { name: "ECDSA", hash: `SHA-${bits}` },
    usages: sig
  };
}
function eddsa() {
  const subtle = { name: "Ed25519" };
  return {
    kty: ["OKP"],
    crv: "Ed25519",
    subtle,
    signing: subtle,
    usages: sig
  };
}
function mldsa(bits) {
  const subtle = { name: `ML-DSA-${bits}` };
  return {
    kty: ["AKP"],
    subtle,
    signing: subtle,
    usages: sig
  };
}
var JWS = table({
  HS256: hmac(256),
  HS384: hmac(384),
  HS512: hmac(512),
  RS256: rsa(256),
  RS384: rsa(384),
  RS512: rsa(512),
  PS256: rsa(256, 32),
  PS384: rsa(384, 48),
  PS512: rsa(512, 64),
  ES256: ecdsa("P-256", 256),
  ES384: ecdsa("P-384", 384),
  ES512: ecdsa("P-521", 512),
  EdDSA: eddsa(),
  Ed25519: eddsa(),
  "ML-DSA-44": mldsa(44),
  "ML-DSA-65": mldsa(65),
  "ML-DSA-87": mldsa(87)
});
function jwsAlgorithm(alg) {
  const entry = typeof alg == "string" ? JWS[alg] : void 0;
  if (!entry)
    throw new JOSENotSupported(`alg ${alg} is not supported either by JOSE or your javascript runtime`);
  return entry;
}

// ../../node_modules/.pnpm/jose@6.2.12/node_modules/jose/dist/webapi/lib/jws_verify.js
function prepareVerify(options) {
  return [options && validateAlgorithms("algorithms", options.algorithms), options?.crit];
}
function parseProtectedHeader(encodedProtected) {
  return encodedProtected === void 0 ? {} : parseJoseHeader(encodedProtected, JWSInvalid, "JWS Protected Header is invalid");
}
function encodeCompactUnencodedPayload(payload) {
  try {
    return encode(payload);
  } catch {
    throw new JWSInvalid("JWS Compact Serialization payload must use only ASCII characters");
  }
}
async function verifySignature(jws, shared, key, encodeUnencodedPayload, parsedProtected) {
  const { protected: encodedProtected, header, payload: inputPayload } = jws, parsedProt = parsedProtected ?? parseProtectedHeader(encodedProtected);
  if (!isDisjoint(parsedProt, header))
    throw new JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
  const joseHeader = { ...parsedProt, ...header }, b64 = validateB64(parsedProt, validateCrit(JWSInvalid, JWS_RECOGNIZED, shared[1], parsedProt, joseHeader)), { alg } = joseHeader;
  if (typeof alg != "string" || !alg)
    throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
  if (shared[0] && !shared[0].has(alg))
    throw new JOSEAlgNotAllowed('"alg" (Algorithm) Header Parameter value not allowed');
  if (b64) {
    if (typeof inputPayload != "string")
      throw new JWSInvalid("JWS Payload must be a string");
  } else if (typeof inputPayload != "string" && !(inputPayload instanceof Uint8Array))
    throw new JWSInvalid("JWS Payload must be a string or an Uint8Array instance");
  const signingPayload = b64 || typeof inputPayload != "string" ? inputPayload : encodeUnencodedPayload(inputPayload);
  let resolvedKey = false;
  typeof key == "function" && (key = await key(parsedProt, jws), resolvedKey = true);
  const entry = jwsAlgorithm(alg), data = concat(encodedProtected !== void 0 ? encode(encodedProtected) : new Uint8Array(), encode("."), typeof signingPayload == "string" ? shared[2] ??= encodeBase64url(signingPayload, "payload", JWSInvalid) : signingPayload), signature = decodeBase64url(jws.signature, "signature", JWSInvalid), k = await prepareKey(entry, key, "verify"), cryptoKey = await rawKey(k, entry.subtle, "verify");
  entry.minRsaBits && checkModulusLength(entry.alg, cryptoKey);
  let verified = false;
  try {
    verified = await crypto.subtle.verify(entry.signing, cryptoKey, signature, data);
  } catch {
  }
  if (!verified)
    throw new JWSSignatureVerificationFailed();
  const result = { payload: typeof signingPayload == "string" ? decodeBase64url(signingPayload, "payload", JWSInvalid) : signingPayload };
  return encodedProtected !== void 0 && (result.protectedHeader = parsedProt), header !== void 0 && (result.unprotectedHeader = header), resolvedKey ? [{ ...result, key: k }, b64] : [result, b64];
}
async function verifyCompact(jws, shared, key) {
  if (jws instanceof Uint8Array && (jws = decoder.decode(jws)), typeof jws != "string")
    throw new JWSInvalid("Compact JWS must be a string or Uint8Array");
  const { 0: protectedHeader, 1: payload, 2: signature, length } = jws.split(".");
  if (length !== 3)
    throw new JWSInvalid("Invalid Compact JWS");
  return verifySignature({ payload, protected: protectedHeader, signature }, shared, key, encodeCompactUnencodedPayload);
}

// ../../node_modules/.pnpm/jose@6.2.12/node_modules/jose/dist/webapi/lib/jwt_claims_set.js
var epoch = (date) => Math.floor(date.getTime() / 1e3);
var multipliers = {
  s: 1,
  m: 60,
  h: 3600,
  d: 86400,
  w: 604800,
  y: 31557600
};
var REGEX = /^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i;
var checkFailed = "check_failed";
function invalidDuration() {
  throw new TypeError("Invalid time period format");
}
function secs(str2) {
  typeof str2 != "string" && invalidDuration();
  const matched = REGEX.exec(str2);
  (!matched || matched[4] && matched[1]) && invalidDuration();
  const value = parseFloat(matched[2]), numericDate2 = Math.round(value * multipliers[matched[3][0].toLowerCase()]);
  return Number.isFinite(numericDate2) || invalidDuration(), matched[1] === "-" || matched[4] === "ago" ? -numericDate2 : numericDate2;
}
function validateInput(label, input) {
  if (!Number.isFinite(input))
    throw new TypeError(`Invalid ${label} input`);
  return input;
}
function validateStringClaim(claim, value) {
  if (typeof value != "string")
    throw new TypeError(`"${claim}" claim must be a string`);
}
function validateAudienceClaim(value) {
  if (typeof value != "string" && (!Array.isArray(value) || Array.from(value).some((member) => typeof member != "string")))
    throw new TypeError('"aud" claim must be a string or an array of strings');
}
function numericDate(value, label) {
  return typeof value == "number" ? validateInput(label, value) : value instanceof Date ? validateInput(label, epoch(value)) : epoch(/* @__PURE__ */ new Date()) + secs(value);
}
var normalizeTyp = (value) => {
  const normalized = value.toLowerCase();
  return value.includes("/") ? normalized : `application/${normalized}`;
};
var checkAudiencePresence = (audPayload, audOption) => typeof audPayload == "string" ? audOption.includes(audPayload) : Array.isArray(audPayload) ? audOption.some((aud) => audPayload.includes(aud)) : false;
function validateNumericDate(payload, claim, required2 = false) {
  const value = payload[claim];
  if (!(value === void 0 && !required2)) {
    if (typeof value != "number")
      throw new JWTClaimValidationFailed(`"${claim}" claim must be a number`, payload, claim, "invalid");
    return value;
  }
}
function unexpectedClaim(payload, claim) {
  throw new JWTClaimValidationFailed(`unexpected "${claim}" claim value`, payload, claim, checkFailed);
}
function validateClaimsSet(protectedHeader, encodedPayload, options = {}) {
  let payload;
  try {
    payload = JSON.parse(strictDecoder.decode(encodedPayload));
  } catch {
  }
  if (!isObject(payload))
    throw new JWTInvalid("JWT Claims Set must be a top-level JSON object");
  const { typ } = options;
  if (typ !== void 0 && (typeof protectedHeader.typ != "string" || normalizeTyp(protectedHeader.typ) !== normalizeTyp(typ)))
    throw new JWTClaimValidationFailed('unexpected "typ" JWT header value', payload, "typ", checkFailed);
  const { requiredClaims = [], issuer: issuer2, subject, audience, maxTokenAge } = options, presenceCheck = [...requiredClaims];
  maxTokenAge !== void 0 && presenceCheck.push("iat"), audience !== void 0 && presenceCheck.push("aud"), subject !== void 0 && presenceCheck.push("sub"), issuer2 !== void 0 && presenceCheck.push("iss");
  for (const claim of new Set(presenceCheck.reverse()))
    if (!Object.hasOwn(payload, claim))
      throw new JWTClaimValidationFailed(`missing required "${claim}" claim`, payload, claim, "missing");
  issuer2 !== void 0 && !(Array.isArray(issuer2) ? issuer2 : [issuer2]).includes(payload.iss) && unexpectedClaim(payload, "iss"), subject !== void 0 && payload.sub !== subject && unexpectedClaim(payload, "sub"), audience !== void 0 && !checkAudiencePresence(payload.aud, typeof audience == "string" ? [audience] : audience) && unexpectedClaim(payload, "aud");
  const { clockTolerance } = options;
  let tolerance = 0;
  if (typeof clockTolerance == "string")
    tolerance = secs(clockTolerance);
  else if (clockTolerance !== void 0) {
    if (typeof clockTolerance != "number")
      throw new TypeError("Invalid clockTolerance option type");
    tolerance = clockTolerance;
  }
  validateInput("clockTolerance option", tolerance);
  const { currentDate } = options, now = validateInput("currentDate option", epoch(currentDate === void 0 ? /* @__PURE__ */ new Date() : currentDate)), iat = validateNumericDate(payload, "iat", maxTokenAge !== void 0), nbf = validateNumericDate(payload, "nbf");
  if (nbf !== void 0 && nbf > now + tolerance)
    throw new JWTClaimValidationFailed('"nbf" claim timestamp check failed', payload, "nbf", checkFailed);
  const exp = validateNumericDate(payload, "exp");
  if (exp !== void 0 && exp <= now - tolerance)
    throw new JWTExpired('"exp" claim timestamp check failed', payload, "exp", checkFailed);
  if (maxTokenAge !== void 0) {
    const age = now - iat, max = validateInput("maxTokenAge option", typeof maxTokenAge == "number" ? maxTokenAge : secs(maxTokenAge));
    if (age - tolerance > max)
      throw new JWTExpired('"iat" claim timestamp check failed (too far in the past)', payload, "iat", checkFailed);
    if (age < -tolerance)
      throw new JWTClaimValidationFailed('"iat" claim timestamp check failed (it should be in the past)', payload, "iat", checkFailed);
  }
  return payload;
}
var producerPayloads;
function producerPayload(producer) {
  return producerPayloads.get(producer);
}
function jwtData(producer) {
  const payload = producerPayload(producer);
  for (const claim of ["iat", "nbf", "exp"]) {
    const value = payload[claim];
    if (typeof value == "number" && !Number.isFinite(value))
      throw new TypeError(`"${claim}" claim must be a finite number`);
  }
  return encoder.encode(JSON.stringify(payload));
}
var JWTClaimsBuilder = class {
  constructor(payload = {}) {
    if (!isObject(payload))
      throw new TypeError("JWT Claims Set MUST be an object");
    (producerPayloads ||= /* @__PURE__ */ new WeakMap()).set(this, structuredClone(payload));
  }
  setIssuer(value) {
    return validateStringClaim("iss", value), producerPayload(this).iss = value, this;
  }
  setSubject(value) {
    return validateStringClaim("sub", value), producerPayload(this).sub = value, this;
  }
  setAudience(value) {
    return validateAudienceClaim(value), producerPayload(this).aud = value, this;
  }
  setJti(value) {
    return validateStringClaim("jti", value), producerPayload(this).jti = value, this;
  }
  setNotBefore(value) {
    return producerPayload(this).nbf = numericDate(value, "setNotBefore"), this;
  }
  setExpirationTime(value) {
    return producerPayload(this).exp = numericDate(value, "setExpirationTime"), this;
  }
  setIssuedAt(value) {
    const payload = producerPayload(this);
    return value === void 0 ? payload.iat = epoch(/* @__PURE__ */ new Date()) : typeof value == "string" ? payload.iat = validateInput("setIssuedAt", epoch(/* @__PURE__ */ new Date()) + secs(value)) : payload.iat = numericDate(value, "setIssuedAt"), this;
  }
};

// ../../node_modules/.pnpm/jose@6.2.12/node_modules/jose/dist/webapi/jwt/verify.js
async function jwtVerify(jwt, key, options) {
  const [verified, b64] = await verifyCompact(jwt, prepareVerify(options), key);
  if (!b64)
    throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
  const payload = validateClaimsSet(verified.protectedHeader, verified.payload, options);
  return { ...verified, payload };
}

// ../../node_modules/.pnpm/jose@6.2.12/node_modules/jose/dist/webapi/lib/jws_sign.js
async function createSignature(input, key, rejectUnencoded) {
  let [payload, protectedHeader, unprotectedHeader, crit] = input, protectedHeaderString = "";
  if (protectedHeader !== void 0) {
    const normalized = serializeJoseHeader(JWSInvalid, protectedHeader);
    protectedHeader = normalized[0], protectedHeaderString = encode2(normalized[1]);
  }
  if (unprotectedHeader !== void 0 && (unprotectedHeader = serializeJoseHeader(JWSInvalid, unprotectedHeader)[0]), !protectedHeader && !unprotectedHeader)
    throw new JWSInvalid("either setProtectedHeader or setUnprotectedHeader must be called before #sign()");
  if (!isDisjoint(protectedHeader, unprotectedHeader))
    throw new JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
  const joseHeader = { ...protectedHeader, ...unprotectedHeader };
  validateCritDuplicates(JWSInvalid, protectedHeader);
  const b64 = validateB64(protectedHeader, validateCrit(JWSInvalid, JWS_RECOGNIZED, crit, protectedHeader, joseHeader));
  b64 || rejectUnencoded?.();
  const { alg } = joseHeader;
  if (typeof alg != "string" || !alg)
    throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
  const entry = jwsAlgorithm(alg);
  let payloadS = "", payloadB = payload, data;
  if (b64) {
    const encoded = input[4];
    encoded ? (payloadS = encoded[0] ??= encode2(payload), payloadB = encoded[1] ??= encode(payloadS)) : (payloadS = encode2(payload), data = encoder.encode(`${protectedHeaderString}.${payloadS}`));
  }
  data ??= concat(encode(protectedHeaderString), encode("."), payloadB);
  const k = await rawKey(await prepareKey(entry, key, "sign"), entry.subtle, "sign");
  entry.minRsaBits && checkModulusLength(entry.alg, k);
  const jws = {
    signature: encode2(new Uint8Array(await crypto.subtle.sign(entry.signing, k, data))),
    payload: payloadS
  };
  return protectedHeader && (jws.protected = protectedHeaderString), unprotectedHeader && (jws.header = unprotectedHeader), [jws, b64];
}
async function createCompactSignature(payload, protectedHeader, crit, key, rejectUnencoded) {
  const [jws] = await createSignature([payload, protectedHeader, void 0, crit], key, rejectUnencoded);
  return `${jws.protected}.${jws.payload}.${jws.signature}`;
}

// ../../node_modules/.pnpm/jose@6.2.12/node_modules/jose/dist/webapi/jwt/sign.js
var SignJWT_base = JWTClaimsBuilder;
var SignJWT = class extends SignJWT_base {
  #protectedHeader;
  setProtectedHeader(protectedHeader) {
    return assertNotSet(this.#protectedHeader, "setProtectedHeader"), this.#protectedHeader = protectedHeader, this;
  }
  async sign(key, options) {
    return createCompactSignature(jwtData(this), this.#protectedHeader, options?.crit, key, () => {
      throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
    });
  }
};

// ../@emulators/aws/dist/index.js
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { timingSafeEqual } from "crypto";
import { randomBytes as randomBytes4, randomUUID as randomUUID2 } from "crypto";
import {
  createHmac,
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync,
  randomBytes as randomBytes3,
  randomUUID,
  scryptSync,
  timingSafeEqual as timingSafeEqual2
} from "crypto";
import { randomBytes as randomBytes5, randomUUID as randomUUID3 } from "crypto";
import { createHash as createHash2, randomBytes as randomBytes6 } from "crypto";
import { randomUUID as randomUUID4 } from "crypto";
function getAwsStore(store) {
  return {
    s3Buckets: store.collection("aws.s3_buckets", ["bucket_name"]),
    s3Objects: store.collection("aws.s3_objects", ["key", "bucket_name"]),
    sqsQueues: store.collection("aws.sqs_queues", ["queue_name", "queue_url"]),
    sqsMessages: store.collection("aws.sqs_messages", ["message_id", "queue_name"]),
    iamUsers: store.collection("aws.iam_users", ["user_name", "user_id"]),
    iamRoles: store.collection("aws.iam_roles", ["role_name", "role_id"])
  };
}
var ACCOUNT_ID = "123456789012";
var DEFAULT_REGION = "us-east-1";
function generateAwsId(prefix) {
  return prefix + randomBytes(8).toString("hex").toUpperCase();
}
function generateMessageId() {
  return [
    randomBytes(4).toString("hex"),
    randomBytes(2).toString("hex"),
    randomBytes(2).toString("hex"),
    randomBytes(2).toString("hex"),
    randomBytes(6).toString("hex")
  ].join("-");
}
function generateReceiptHandle() {
  return randomBytes(48).toString("base64url");
}
function md5(content) {
  return createHash("md5").update(content).digest("hex");
}
function decodeS3ObjectBody(object3) {
  if (typeof object3.body_base64 === "string") {
    return Buffer.from(object3.body_base64, "base64");
  }
  return Buffer.from(object3.body ?? "", "utf8");
}
function getAccountId() {
  return ACCOUNT_ID;
}
function getDefaultRegion() {
  return DEFAULT_REGION;
}
function awsXmlResponse(c, xml, status = 200) {
  return c.text(xml, status, { "Content-Type": "application/xml" });
}
function awsErrorXml(c, code, message2, status = 400) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ErrorResponse>
  <Error>
    <Code>${escapeXml(code)}</Code>
    <Message>${escapeXml(message2)}</Message>
  </Error>
  <RequestId>${generateMessageId()}</RequestId>
</ErrorResponse>`;
  return c.text(xml, status, { "Content-Type": "application/xml" });
}
function escapeXml(str2) {
  return str2.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function parseQueryString(body) {
  const params = new URLSearchParams(body);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
}
function writeObjectBody(body) {
  return { body_base64: Buffer.from(body).toString("base64"), body: void 0 };
}
function s3Routes(ctx) {
  const { app, store, baseUrl } = ctx;
  const aws = () => getAwsStore(store);
  const handleListBuckets = (c) => {
    const buckets = aws().s3Buckets.all();
    const bucketXml = buckets.map(
      (b) => `    <Bucket>
      <Name>${escapeXml(b.bucket_name)}</Name>
      <CreationDate>${b.creation_date}</CreationDate>
    </Bucket>`
    ).join("\n");
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ListAllMyBucketsResult>
  <Owner>
    <ID>owner-id</ID>
    <DisplayName>emulate</DisplayName>
  </Owner>
  <Buckets>
${bucketXml}
  </Buckets>
</ListAllMyBucketsResult>`;
    return awsXmlResponse(c, xml);
  };
  const handleCreateBucket = (c) => {
    const bucketName = c.req.param("bucket");
    const existing = aws().s3Buckets.findOneBy("bucket_name", bucketName);
    if (existing) {
      return awsErrorXml(
        c,
        "BucketAlreadyOwnedByYou",
        "Your previous request to create the named bucket succeeded and you already own it.",
        409
      );
    }
    aws().s3Buckets.insert({
      bucket_name: bucketName,
      region: "us-east-1",
      creation_date: (/* @__PURE__ */ new Date()).toISOString(),
      acl: "private",
      versioning_enabled: false
    });
    return c.text("", 200, { Location: `/${bucketName}` });
  };
  const handleDeleteBucket = (c) => {
    const bucketName = c.req.param("bucket");
    const bucket = aws().s3Buckets.findOneBy("bucket_name", bucketName);
    if (!bucket) {
      return awsErrorXml(c, "NoSuchBucket", "The specified bucket does not exist.", 404);
    }
    const objects = aws().s3Objects.findBy("bucket_name", bucketName);
    if (objects.length > 0) {
      return awsErrorXml(c, "BucketNotEmpty", "The bucket you tried to delete is not empty.", 409);
    }
    aws().s3Buckets.delete(bucket.id);
    return c.body(null, 204);
  };
  const handleHeadBucket = (c) => {
    const bucketName = c.req.param("bucket");
    const bucket = aws().s3Buckets.findOneBy("bucket_name", bucketName);
    if (!bucket) {
      return c.text("", 404);
    }
    return c.text("", 200, { "x-amz-bucket-region": bucket.region });
  };
  const handleListObjects = (c) => {
    const bucketName = c.req.param("bucket");
    const bucket = aws().s3Buckets.findOneBy("bucket_name", bucketName);
    if (!bucket) {
      return awsErrorXml(c, "NoSuchBucket", "The specified bucket does not exist.", 404);
    }
    const prefix = c.req.query("prefix") ?? "";
    const delimiter = c.req.query("delimiter") ?? "";
    const maxKeys = Math.min(parseInt(c.req.query("max-keys") ?? "1000", 10), 1e3);
    const continuationToken = c.req.query("continuation-token");
    const startAfter = c.req.query("start-after");
    let objects = aws().s3Objects.findBy("bucket_name", bucketName);
    if (prefix) {
      objects = objects.filter((o) => o.key.startsWith(prefix));
    }
    objects.sort((a, b) => a.key.localeCompare(b.key));
    const marker = continuationToken ?? startAfter;
    if (marker) {
      const startIndex = objects.findIndex((o) => o.key > marker);
      objects = startIndex >= 0 ? objects.slice(startIndex) : [];
    }
    const commonPrefixes = [];
    let contents = objects;
    if (delimiter) {
      const prefixSet = /* @__PURE__ */ new Set();
      contents = [];
      for (const obj of objects) {
        const remaining = obj.key.slice(prefix.length);
        const delimIndex = remaining.indexOf(delimiter);
        if (delimIndex >= 0) {
          prefixSet.add(prefix + remaining.slice(0, delimIndex + delimiter.length));
        } else {
          contents.push(obj);
        }
      }
      commonPrefixes.push(...Array.from(prefixSet).sort());
    }
    const truncated = contents.length > maxKeys;
    const page = contents.slice(0, maxKeys);
    const nextToken = truncated ? page[page.length - 1].key : void 0;
    const contentsXml = page.map(
      (o) => `  <Contents>
    <Key>${escapeXml(o.key)}</Key>
    <LastModified>${o.last_modified}</LastModified>
    <ETag>"${o.etag}"</ETag>
    <Size>${o.content_length}</Size>
    <StorageClass>STANDARD</StorageClass>
  </Contents>`
    ).join("\n");
    const prefixesXml = commonPrefixes.map((p) => `  <CommonPrefixes><Prefix>${escapeXml(p)}</Prefix></CommonPrefixes>`).join("\n");
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ListBucketResult>
  <Name>${escapeXml(bucketName)}</Name>
  <Prefix>${escapeXml(prefix)}</Prefix>
  <MaxKeys>${maxKeys}</MaxKeys>
  <IsTruncated>${truncated}</IsTruncated>
  <KeyCount>${page.length}</KeyCount>${continuationToken ? `
  <ContinuationToken>${escapeXml(continuationToken)}</ContinuationToken>` : ""}${nextToken ? `
  <NextContinuationToken>${escapeXml(nextToken)}</NextContinuationToken>` : ""}${startAfter ? `
  <StartAfter>${escapeXml(startAfter)}</StartAfter>` : ""}
${contentsXml}
${prefixesXml}
</ListBucketResult>`;
    return awsXmlResponse(c, xml);
  };
  const handlePresignedPost = async (c) => {
    const bucketName = c.req.param("bucket");
    const bucket = aws().s3Buckets.findOneBy("bucket_name", bucketName);
    if (!bucket) {
      return awsErrorXml(c, "NoSuchBucket", "The specified bucket does not exist.", 404);
    }
    const body = await c.req.parseBody();
    const key = body["key"];
    if (!key) {
      return awsErrorXml(c, "InvalidArgument", "Bucket POST must contain a field named 'key'.", 400);
    }
    const file = body["file"];
    if (!file || !(file instanceof File)) {
      return awsErrorXml(c, "InvalidArgument", "Bucket POST must contain a file field.", 400);
    }
    const policyB64 = body["Policy"];
    if (policyB64) {
      let policy;
      try {
        policy = JSON.parse(Buffer.from(policyB64, "base64").toString());
      } catch {
        return awsErrorXml(c, "InvalidPolicyDocument", "Invalid Policy: Invalid JSON.", 400);
      }
      if (policy.expiration) {
        const expDate = new Date(policy.expiration);
        if (expDate.getTime() < Date.now()) {
          return awsErrorXml(c, "AccessDenied", "Invalid according to Policy: Policy expired.", 403);
        }
      }
      if (Array.isArray(policy.conditions)) {
        for (const condition of policy.conditions) {
          if (!Array.isArray(condition)) continue;
          if (condition[0] === "content-length-range") {
            const min = condition[1];
            const max = condition[2];
            if (file.size < min || file.size > max) {
              return awsErrorXml(c, "EntityTooLarge", "Your proposed upload exceeds the maximum allowed size.", 400);
            }
          } else if (condition[0] === "starts-with") {
            const field = condition[1].replace(/^\$/, "");
            const prefix = condition[2];
            const value = body[field] ?? "";
            if (!value.startsWith(prefix)) {
              return awsErrorXml(
                c,
                "AccessDenied",
                `Invalid according to Policy: Policy Condition failed: ["starts-with", "$${field}", "${prefix}"]`,
                403
              );
            }
          }
        }
      }
    }
    const fileContent = Buffer.from(await file.arrayBuffer());
    const contentType = body["Content-Type"] ?? file.type ?? "application/octet-stream";
    const etag = md5(fileContent);
    const contentLength = fileContent.byteLength;
    const bodyFields = writeObjectBody(fileContent);
    const existing = aws().s3Objects.findBy("bucket_name", bucketName).find((o) => o.key === key);
    if (existing) {
      aws().s3Objects.update(existing.id, {
        ...bodyFields,
        content_type: contentType,
        content_length: contentLength,
        etag,
        last_modified: (/* @__PURE__ */ new Date()).toISOString(),
        metadata: {}
      });
    } else {
      aws().s3Objects.insert({
        bucket_name: bucketName,
        key,
        ...bodyFields,
        content_type: contentType,
        content_length: contentLength,
        etag,
        last_modified: (/* @__PURE__ */ new Date()).toISOString(),
        metadata: {}
      });
    }
    const successStatus = parseInt(body["success_action_status"], 10);
    if (successStatus === 201) {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<PostResponse>
  <Location>${escapeXml(baseUrl)}/${escapeXml(bucketName)}/${escapeXml(key)}</Location>
  <Bucket>${escapeXml(bucketName)}</Bucket>
  <Key>${escapeXml(key)}</Key>
  <ETag>"${etag}"</ETag>
</PostResponse>`;
      return awsXmlResponse(c, xml, 201);
    }
    return c.body(null, 204);
  };
  const handlePutObject = async (c) => {
    const bucketName = c.req.param("bucket");
    const key = c.req.param("key");
    const bucket = aws().s3Buckets.findOneBy("bucket_name", bucketName);
    if (!bucket) {
      return awsErrorXml(c, "NoSuchBucket", "The specified bucket does not exist.", 404);
    }
    const copySource = c.req.header("x-amz-copy-source");
    if (copySource) {
      const normalized = copySource.startsWith("/") ? copySource.slice(1) : copySource;
      const slashIndex = normalized.indexOf("/");
      if (slashIndex < 0) {
        return awsErrorXml(c, "InvalidArgument", "Invalid copy source.", 400);
      }
      const srcBucket = normalized.slice(0, slashIndex);
      const srcKey = normalized.slice(slashIndex + 1);
      const srcObj = aws().s3Objects.findBy("bucket_name", srcBucket).find((o) => o.key === srcKey);
      if (!srcObj) {
        return awsErrorXml(c, "NoSuchKey", "The specified source key does not exist.", 404);
      }
      const etag2 = srcObj.etag;
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const bodyFields2 = writeObjectBody(decodeS3ObjectBody(srcObj));
      const existing2 = aws().s3Objects.findBy("bucket_name", bucketName).find((o) => o.key === key);
      if (existing2) {
        aws().s3Objects.update(existing2.id, {
          ...bodyFields2,
          content_type: srcObj.content_type,
          content_length: srcObj.content_length,
          etag: etag2,
          last_modified: now,
          metadata: { ...srcObj.metadata }
        });
      } else {
        aws().s3Objects.insert({
          bucket_name: bucketName,
          key,
          ...bodyFields2,
          content_type: srcObj.content_type,
          content_length: srcObj.content_length,
          etag: etag2,
          last_modified: now,
          metadata: { ...srcObj.metadata }
        });
      }
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<CopyObjectResult>
  <ETag>"${etag2}"</ETag>
  <LastModified>${now}</LastModified>
</CopyObjectResult>`;
      return c.text(xml, 200, {
        "Content-Type": "application/xml",
        "Last-Modified": new Date(now).toUTCString()
      });
    }
    const body = Buffer.from(await c.req.arrayBuffer());
    const contentType = c.req.header("Content-Type") ?? "application/octet-stream";
    const etag = md5(body);
    const bodyFields = writeObjectBody(body);
    const metadata = {};
    for (const [headerName, headerValue] of Object.entries(c.req.header())) {
      if (typeof headerValue === "string" && headerName.toLowerCase().startsWith("x-amz-meta-")) {
        metadata[headerName.slice("x-amz-meta-".length)] = headerValue;
      }
    }
    const existing = aws().s3Objects.findBy("bucket_name", bucketName).find((o) => o.key === key);
    if (existing) {
      aws().s3Objects.update(existing.id, {
        ...bodyFields,
        content_type: contentType,
        content_length: body.byteLength,
        etag,
        last_modified: (/* @__PURE__ */ new Date()).toISOString(),
        metadata
      });
    } else {
      aws().s3Objects.insert({
        bucket_name: bucketName,
        key,
        ...bodyFields,
        content_type: contentType,
        content_length: body.byteLength,
        etag,
        last_modified: (/* @__PURE__ */ new Date()).toISOString(),
        metadata
      });
    }
    return c.text("", 200, { ETag: `"${etag}"` });
  };
  const handleGetObject = (c) => {
    const bucketName = c.req.param("bucket");
    const key = c.req.param("key");
    const bucket = aws().s3Buckets.findOneBy("bucket_name", bucketName);
    if (!bucket) {
      return awsErrorXml(c, "NoSuchBucket", "The specified bucket does not exist.", 404);
    }
    const obj = aws().s3Objects.findBy("bucket_name", bucketName).find((o) => o.key === key);
    if (!obj) {
      return awsErrorXml(c, "NoSuchKey", "The specified key does not exist.", 404);
    }
    const headers = {
      "Content-Type": obj.content_type,
      "Content-Length": String(obj.content_length),
      ETag: `"${obj.etag}"`,
      "Last-Modified": new Date(obj.last_modified).toUTCString()
    };
    for (const [k, v] of Object.entries(obj.metadata)) {
      headers[`x-amz-meta-${k}`] = v;
    }
    return c.body(decodeS3ObjectBody(obj), 200, headers);
  };
  const handleHeadObject = (c) => {
    const bucketName = c.req.param("bucket");
    const key = c.req.param("key");
    const obj = aws().s3Objects.findBy("bucket_name", bucketName).find((o) => o.key === key);
    if (!obj) {
      return c.text("", 404);
    }
    return c.text("", 200, {
      "Content-Type": obj.content_type,
      "Content-Length": String(obj.content_length),
      ETag: `"${obj.etag}"`,
      "Last-Modified": new Date(obj.last_modified).toUTCString()
    });
  };
  const handleDeleteObject = (c) => {
    const bucketName = c.req.param("bucket");
    const key = c.req.param("key");
    const obj = aws().s3Objects.findBy("bucket_name", bucketName).find((o) => o.key === key);
    if (obj) {
      aws().s3Objects.delete(obj.id);
    }
    return c.body(null, 204);
  };
  app.get("/s3/", handleListBuckets);
  app.put("/s3/:bucket", handleCreateBucket);
  app.delete("/s3/:bucket", handleDeleteBucket);
  app.on("HEAD", "/s3/:bucket", handleHeadBucket);
  app.get("/s3/:bucket", handleListObjects);
  app.post("/s3/:bucket", handlePresignedPost);
  app.put("/s3/:bucket/:key{.+}", handlePutObject);
  app.get("/s3/:bucket/:key{.+}", handleGetObject);
  app.on("HEAD", "/s3/:bucket/:key{.+}", handleHeadObject);
  app.delete("/s3/:bucket/:key{.+}", handleDeleteObject);
  app.get("/", handleListBuckets);
  app.put("/:bucket", handleCreateBucket);
  app.put("/:bucket/", handleCreateBucket);
  app.delete("/:bucket", handleDeleteBucket);
  app.delete("/:bucket/", handleDeleteBucket);
  app.on("HEAD", "/:bucket", handleHeadBucket);
  app.on("HEAD", "/:bucket/", handleHeadBucket);
  app.get("/:bucket", handleListObjects);
  app.get("/:bucket/", handleListObjects);
  app.post("/:bucket", handlePresignedPost);
  app.post("/:bucket/", handlePresignedPost);
  app.put("/:bucket/:key{.+}", handlePutObject);
  app.get("/:bucket/:key{.+}", handleGetObject);
  app.on("HEAD", "/:bucket/:key{.+}", handleHeadObject);
  app.delete("/:bucket/:key{.+}", handleDeleteObject);
}
function isSqsJson(c) {
  return c.req.header("Content-Type")?.split(";")[0].trim().toLowerCase() === "application/x-amz-json-1.0";
}
function object(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Expected an object.");
  }
  return value;
}
function string(value) {
  if (typeof value !== "string") throw new Error("Expected a string.");
  return value;
}
function parseSqsJson(body) {
  const input = object(JSON.parse(body));
  const params = {};
  for (const name of ["QueueName", "QueueNamePrefix", "QueueUrl", "MessageBody", "ReceiptHandle"]) {
    if (input[name] != null) params[name] = string(input[name]);
  }
  for (const name of ["MaxNumberOfMessages", "VisibilityTimeout"]) {
    if (input[name] == null) continue;
    if (typeof input[name] !== "number" || !Number.isInteger(input[name])) throw new Error("Expected an integer.");
    params[name] = String(input[name]);
  }
  if (input.Attributes != null) {
    let i = 1;
    for (const [name, value] of Object.entries(object(input.Attributes))) {
      params[`Attribute.${i}.Name`] = name;
      params[`Attribute.${i}.Value`] = string(value);
      i++;
    }
  }
  if (input.MessageAttributes != null) {
    let i = 1;
    for (const [name, value] of Object.entries(object(input.MessageAttributes))) {
      const attribute = object(value);
      params[`MessageAttribute.${i}.Name`] = name;
      for (const field of ["DataType", "StringValue", "BinaryValue"]) {
        if (attribute[field] != null) params[`MessageAttribute.${i}.Value.${field}`] = string(attribute[field]);
      }
      i++;
    }
  }
  return params;
}
function attributesXml(attributes2) {
  return Object.entries(attributes2).map(([name, value]) => `<Attribute><Name>${escapeXml(name)}</Name><Value>${escapeXml(value)}</Value></Attribute>`).join("");
}
function sqsResponse(c, action, result = {}) {
  const requestId = generateMessageId();
  c.header("x-amzn-requestid", requestId);
  if (isSqsJson(c)) {
    return c.json(result, 200, { "Content-Type": "application/x-amz-json-1.0" });
  }
  let content = "";
  if (result.QueueUrl != null) content += `<QueueUrl>${escapeXml(result.QueueUrl)}</QueueUrl>`;
  for (const url of result.QueueUrls ?? []) content += `<QueueUrl>${escapeXml(url)}</QueueUrl>`;
  if (result.Attributes) content += attributesXml(result.Attributes);
  if (result.MessageId) content += `<MessageId>${escapeXml(result.MessageId)}</MessageId>`;
  if (result.MD5OfMessageBody) content += `<MD5OfMessageBody>${result.MD5OfMessageBody}</MD5OfMessageBody>`;
  for (const message2 of result.Messages ?? []) {
    content += `<Message>
      <MessageId>${escapeXml(message2.MessageId)}</MessageId>
      <ReceiptHandle>${escapeXml(message2.ReceiptHandle)}</ReceiptHandle>
      <MD5OfBody>${message2.MD5OfBody}</MD5OfBody>
      <Body>${escapeXml(message2.Body)}</Body>
      ${attributesXml(message2.Attributes)}
    </Message>`;
  }
  const resultXml = Object.keys(result).length ? `<${action}Result>${content}</${action}Result>` : "";
  return awsXmlResponse(
    c,
    `<?xml version="1.0" encoding="UTF-8"?>
<${action}Response>
  ${resultXml}
  <ResponseMetadata><RequestId>${requestId}</RequestId></ResponseMetadata>
</${action}Response>`
  );
}
function sqsError(c, code, message2) {
  if (!isSqsJson(c)) return awsErrorXml(c, code, message2, 400);
  const type = code === "AWS.SimpleQueueService.NonExistentQueue" ? "QueueDoesNotExist" : code;
  return c.json({ __type: type, message: message2 }, 400, {
    "Content-Type": "application/x-amz-json-1.0",
    "x-amzn-requestid": generateMessageId(),
    "x-amzn-query-error": `${code};Sender`
  });
}
function sqsRoutes(ctx) {
  const { app, store, baseUrl } = ctx;
  const aws = () => getAwsStore(store);
  const accountId = getAccountId();
  async function handleRequest(c) {
    const body = await c.req.text();
    let params;
    let action;
    if (isSqsJson(c)) {
      try {
        params = parseSqsJson(body);
      } catch {
        return sqsError(c, "SerializationException", "Could not deserialize the request body.");
      }
      const target = c.req.header("X-Amz-Target") ?? "";
      action = target.startsWith("AmazonSQS.") ? target.slice("AmazonSQS.".length) : "";
    } else {
      params = parseQueryString(body);
      action = params["Action"] ?? c.req.query("Action") ?? "";
    }
    switch (action) {
      case "CreateQueue":
        return createQueue(c, params);
      case "DeleteQueue":
        return deleteQueue(c, params);
      case "ListQueues":
        return listQueues(c, params);
      case "GetQueueUrl":
        return getQueueUrl(c, params);
      case "GetQueueAttributes":
        return getQueueAttributes(c, params);
      case "SendMessage":
        return sendMessage(c, params);
      case "ReceiveMessage":
        return receiveMessage(c, params);
      case "DeleteMessage":
        return deleteMessage(c, params);
      case "PurgeQueue":
        return purgeQueue(c, params);
      default:
        return sqsError(c, "InvalidAction", `The action ${action} is not valid for this endpoint.`);
    }
  }
  app.post("/sqs/", handleRequest);
  app.post("/sqs/:accountId/:queueName", handleRequest);
  function createQueue(c, params) {
    const queueName = params["QueueName"] ?? "";
    if (!queueName) {
      return sqsError(c, "MissingParameter", "The request must contain the parameter QueueName.");
    }
    const existing = aws().sqsQueues.findOneBy("queue_name", queueName);
    if (existing) {
      return sqsResponse(c, "CreateQueue", { QueueUrl: existing.queue_url });
    }
    const fifo = queueName.endsWith(".fifo");
    const queueUrl = `${baseUrl}/sqs/${accountId}/${queueName}`;
    const arn = `arn:aws:sqs:us-east-1:${accountId}:${queueName}`;
    const attrs = {};
    for (let i = 1; params[`Attribute.${i}.Name`]; i++) {
      attrs[params[`Attribute.${i}.Name`]] = params[`Attribute.${i}.Value`] ?? "";
    }
    aws().sqsQueues.insert({
      queue_name: queueName,
      queue_url: queueUrl,
      arn,
      visibility_timeout: parseInt(attrs["VisibilityTimeout"] ?? "30", 10),
      delay_seconds: parseInt(attrs["DelaySeconds"] ?? "0", 10),
      max_message_size: parseInt(attrs["MaximumMessageSize"] ?? "262144", 10),
      message_retention_period: parseInt(attrs["MessageRetentionPeriod"] ?? "345600", 10),
      receive_message_wait_time: parseInt(attrs["ReceiveMessageWaitTimeSeconds"] ?? "0", 10),
      fifo
    });
    return sqsResponse(c, "CreateQueue", { QueueUrl: queueUrl });
  }
  function deleteQueue(c, params) {
    const queueUrl = params["QueueUrl"] ?? "";
    const queue = aws().sqsQueues.findOneBy("queue_url", queueUrl);
    if (!queue) {
      return sqsError(c, "AWS.SimpleQueueService.NonExistentQueue", "The specified queue does not exist.");
    }
    const messages = aws().sqsMessages.findBy("queue_name", queue.queue_name);
    for (const msg of messages) {
      aws().sqsMessages.delete(msg.id);
    }
    aws().sqsQueues.delete(queue.id);
    return sqsResponse(c, "DeleteQueue");
  }
  function listQueues(c, params) {
    const prefix = params["QueueNamePrefix"] ?? "";
    let queues = aws().sqsQueues.all();
    if (prefix) {
      queues = queues.filter((q) => q.queue_name.startsWith(prefix));
    }
    return sqsResponse(c, "ListQueues", { QueueUrls: queues.map((q) => q.queue_url) });
  }
  function getQueueUrl(c, params) {
    const queueName = params["QueueName"] ?? "";
    const queue = aws().sqsQueues.findOneBy("queue_name", queueName);
    if (!queue) {
      return sqsError(c, "AWS.SimpleQueueService.NonExistentQueue", "The specified queue does not exist.");
    }
    return sqsResponse(c, "GetQueueUrl", { QueueUrl: queue.queue_url });
  }
  function getQueueAttributes(c, params) {
    const queueUrl = params["QueueUrl"] ?? "";
    const queue = aws().sqsQueues.findOneBy("queue_url", queueUrl);
    if (!queue) {
      return sqsError(c, "AWS.SimpleQueueService.NonExistentQueue", "The specified queue does not exist.");
    }
    const messages = aws().sqsMessages.findBy("queue_name", queue.queue_name);
    const now = Date.now();
    const visibleCount = messages.filter((m) => m.visible_after <= now).length;
    const inFlightCount = messages.filter((m) => m.visible_after > now).length;
    return sqsResponse(c, "GetQueueAttributes", {
      Attributes: {
        QueueArn: queue.arn,
        ApproximateNumberOfMessages: String(visibleCount),
        ApproximateNumberOfMessagesNotVisible: String(inFlightCount),
        VisibilityTimeout: String(queue.visibility_timeout),
        MaximumMessageSize: String(queue.max_message_size),
        MessageRetentionPeriod: String(queue.message_retention_period),
        DelaySeconds: String(queue.delay_seconds),
        ReceiveMessageWaitTimeSeconds: String(queue.receive_message_wait_time),
        FifoQueue: String(queue.fifo)
      }
    });
  }
  function sendMessage(c, params) {
    const queueUrl = params["QueueUrl"] ?? "";
    const messageBody = params["MessageBody"] ?? "";
    const queue = aws().sqsQueues.findOneBy("queue_url", queueUrl);
    if (!queue) {
      return sqsError(c, "AWS.SimpleQueueService.NonExistentQueue", "The specified queue does not exist.");
    }
    if (!messageBody) {
      return sqsError(c, "MissingParameter", "The request must contain the parameter MessageBody.");
    }
    const bodyBytes = new TextEncoder().encode(messageBody).byteLength;
    if (bodyBytes > queue.max_message_size) {
      return sqsError(
        c,
        "InvalidParameterValue",
        `One or more parameters are invalid. Reason: Message must be shorter than ${queue.max_message_size} bytes.`
      );
    }
    const messageId = generateMessageId();
    const bodyMd5 = md5(messageBody);
    const now = Date.now();
    const messageAttributes = {};
    let attrIndex = 1;
    while (params[`MessageAttribute.${attrIndex}.Name`]) {
      const name = params[`MessageAttribute.${attrIndex}.Name`];
      const dataType = params[`MessageAttribute.${attrIndex}.Value.DataType`] ?? "String";
      const stringValue = params[`MessageAttribute.${attrIndex}.Value.StringValue`];
      const binaryValue = params[`MessageAttribute.${attrIndex}.Value.BinaryValue`];
      messageAttributes[name] = { DataType: dataType, StringValue: stringValue, BinaryValue: binaryValue };
      attrIndex++;
    }
    aws().sqsMessages.insert({
      queue_name: queue.queue_name,
      message_id: messageId,
      receipt_handle: generateReceiptHandle(),
      body: messageBody,
      md5_of_body: bodyMd5,
      attributes: {
        SentTimestamp: String(now),
        ApproximateReceiveCount: "0",
        ApproximateFirstReceiveTimestamp: "",
        SenderId: getAccountId()
      },
      message_attributes: messageAttributes,
      visible_after: now + queue.delay_seconds * 1e3,
      sent_timestamp: now,
      receive_count: 0
    });
    return sqsResponse(c, "SendMessage", { MessageId: messageId, MD5OfMessageBody: bodyMd5 });
  }
  function receiveMessage(c, params) {
    const queueUrl = params["QueueUrl"] ?? "";
    const maxMessages = Math.min(parseInt(params["MaxNumberOfMessages"] ?? "1", 10), 10);
    const visibilityTimeout = parseInt(params["VisibilityTimeout"] ?? "", 10);
    const queue = aws().sqsQueues.findOneBy("queue_url", queueUrl);
    if (!queue) {
      return sqsError(c, "AWS.SimpleQueueService.NonExistentQueue", "The specified queue does not exist.");
    }
    const now = Date.now();
    const timeout = isNaN(visibilityTimeout) ? queue.visibility_timeout : visibilityTimeout;
    const allMessages = aws().sqsMessages.findBy("queue_name", queue.queue_name);
    const visible = allMessages.filter((m) => m.visible_after <= now);
    const batch = visible.slice(0, maxMessages);
    for (const msg of batch) {
      const newReceiptHandle = generateReceiptHandle();
      aws().sqsMessages.update(msg.id, {
        receipt_handle: newReceiptHandle,
        visible_after: now + timeout * 1e3,
        receive_count: msg.receive_count + 1
      });
      msg.receipt_handle = newReceiptHandle;
      msg.receive_count += 1;
    }
    return sqsResponse(c, "ReceiveMessage", {
      Messages: batch.map((m) => ({
        MessageId: m.message_id,
        ReceiptHandle: m.receipt_handle,
        MD5OfBody: m.md5_of_body,
        Body: m.body,
        Attributes: {
          SentTimestamp: String(m.sent_timestamp),
          ApproximateReceiveCount: String(m.receive_count),
          ApproximateFirstReceiveTimestamp: String(m.sent_timestamp)
        }
      }))
    });
  }
  function deleteMessage(c, params) {
    const queueUrl = params["QueueUrl"] ?? "";
    const receiptHandle = params["ReceiptHandle"] ?? "";
    const queue = aws().sqsQueues.findOneBy("queue_url", queueUrl);
    if (!queue) {
      return sqsError(c, "AWS.SimpleQueueService.NonExistentQueue", "The specified queue does not exist.");
    }
    const messages = aws().sqsMessages.findBy("queue_name", queue.queue_name);
    const msg = messages.find((m) => m.receipt_handle === receiptHandle);
    if (msg) {
      aws().sqsMessages.delete(msg.id);
    }
    return sqsResponse(c, "DeleteMessage");
  }
  function purgeQueue(c, params) {
    const queueUrl = params["QueueUrl"] ?? "";
    const queue = aws().sqsQueues.findOneBy("queue_url", queueUrl);
    if (!queue) {
      return sqsError(c, "AWS.SimpleQueueService.NonExistentQueue", "The specified queue does not exist.");
    }
    const messages = aws().sqsMessages.findBy("queue_name", queue.queue_name);
    for (const msg of messages) {
      aws().sqsMessages.delete(msg.id);
    }
    return sqsResponse(c, "PurgeQueue");
  }
}
function iamRoutes(ctx) {
  const { app, store } = ctx;
  const aws = () => getAwsStore(store);
  const accountId = getAccountId();
  app.post("/iam/", async (c) => {
    const body = await c.req.text();
    const params = parseQueryString(body);
    const action = params["Action"] ?? c.req.query("Action") ?? "";
    switch (action) {
      case "CreateUser":
        return createUser(c, params);
      case "GetUser":
        return getUser2(c, params);
      case "DeleteUser":
        return deleteUser(c, params);
      case "ListUsers":
        return listUsers(c);
      case "CreateAccessKey":
        return createAccessKey(c, params);
      case "ListAccessKeys":
        return listAccessKeys(c, params);
      case "DeleteAccessKey":
        return deleteAccessKey(c, params);
      case "CreateRole":
        return createRole(c, params);
      case "GetRole":
        return getRole(c, params);
      case "DeleteRole":
        return deleteRole(c, params);
      case "ListRoles":
        return listRoles(c);
      default:
        return awsErrorXml(c, "InvalidAction", `The action ${action} is not valid for this endpoint.`, 400);
    }
  });
  app.post("/sts/", async (c) => {
    const body = await c.req.text();
    const params = parseQueryString(body);
    const action = params["Action"] ?? c.req.query("Action") ?? "";
    switch (action) {
      case "GetCallerIdentity":
        return getCallerIdentity(c);
      case "AssumeRole":
        return assumeRole(c, params);
      default:
        return awsErrorXml(c, "InvalidAction", `The action ${action} is not valid for this endpoint.`, 400);
    }
  });
  function createUser(c, params) {
    const userName = params["UserName"] ?? "";
    if (!userName) {
      return awsErrorXml(c, "ValidationError", "The request must contain the parameter UserName.", 400);
    }
    const existing = aws().iamUsers.findOneBy("user_name", userName);
    if (existing) {
      return awsErrorXml(c, "EntityAlreadyExists", `User with name ${escapeXml(userName)} already exists.`, 409);
    }
    const userId = generateAwsId("AIDA");
    const path = params["Path"] ?? "/";
    const arn = `arn:aws:iam::${accountId}:user${path}${userName}`;
    aws().iamUsers.insert({
      user_name: userName,
      user_id: userId,
      arn,
      path,
      access_keys: []
    });
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<CreateUserResponse>
  <CreateUserResult>
    <User>
      <Path>${escapeXml(path)}</Path>
      <UserName>${escapeXml(userName)}</UserName>
      <UserId>${userId}</UserId>
      <Arn>${escapeXml(arn)}</Arn>
      <CreateDate>${(/* @__PURE__ */ new Date()).toISOString()}</CreateDate>
    </User>
  </CreateUserResult>
  <ResponseMetadata><RequestId>${generateMessageId()}</RequestId></ResponseMetadata>
</CreateUserResponse>`;
    return awsXmlResponse(c, xml);
  }
  function getUser2(c, params) {
    const userName = params["UserName"] ?? "";
    const user = aws().iamUsers.findOneBy("user_name", userName);
    if (!user) {
      return awsErrorXml(c, "NoSuchEntity", `The user with name ${escapeXml(userName)} cannot be found.`, 404);
    }
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<GetUserResponse>
  <GetUserResult>
    <User>
      <Path>${escapeXml(user.path)}</Path>
      <UserName>${escapeXml(user.user_name)}</UserName>
      <UserId>${user.user_id}</UserId>
      <Arn>${escapeXml(user.arn)}</Arn>
      <CreateDate>${user.created_at}</CreateDate>
    </User>
  </GetUserResult>
  <ResponseMetadata><RequestId>${generateMessageId()}</RequestId></ResponseMetadata>
</GetUserResponse>`;
    return awsXmlResponse(c, xml);
  }
  function deleteUser(c, params) {
    const userName = params["UserName"] ?? "";
    const user = aws().iamUsers.findOneBy("user_name", userName);
    if (!user) {
      return awsErrorXml(c, "NoSuchEntity", `The user with name ${escapeXml(userName)} cannot be found.`, 404);
    }
    aws().iamUsers.delete(user.id);
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<DeleteUserResponse>
  <ResponseMetadata><RequestId>${generateMessageId()}</RequestId></ResponseMetadata>
</DeleteUserResponse>`;
    return awsXmlResponse(c, xml);
  }
  function listUsers(c) {
    const users = aws().iamUsers.all();
    const usersXml = users.map(
      (u) => `      <member>
        <Path>${escapeXml(u.path)}</Path>
        <UserName>${escapeXml(u.user_name)}</UserName>
        <UserId>${u.user_id}</UserId>
        <Arn>${escapeXml(u.arn)}</Arn>
        <CreateDate>${u.created_at}</CreateDate>
      </member>`
    ).join("\n");
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ListUsersResponse>
  <ListUsersResult>
    <IsTruncated>false</IsTruncated>
    <Users>
${usersXml}
    </Users>
  </ListUsersResult>
  <ResponseMetadata><RequestId>${generateMessageId()}</RequestId></ResponseMetadata>
</ListUsersResponse>`;
    return awsXmlResponse(c, xml);
  }
  function createAccessKey(c, params) {
    const userName = params["UserName"] ?? "";
    const user = aws().iamUsers.findOneBy("user_name", userName);
    if (!user) {
      return awsErrorXml(c, "NoSuchEntity", `The user with name ${escapeXml(userName)} cannot be found.`, 404);
    }
    const accessKeyId = "AKIA" + randomBytes2(8).toString("hex").toUpperCase();
    const secretAccessKey = randomBytes2(30).toString("base64");
    const keys = [
      ...user.access_keys,
      { access_key_id: accessKeyId, secret_access_key: secretAccessKey, status: "Active" }
    ];
    aws().iamUsers.update(user.id, { access_keys: keys });
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<CreateAccessKeyResponse>
  <CreateAccessKeyResult>
    <AccessKey>
      <UserName>${escapeXml(userName)}</UserName>
      <AccessKeyId>${accessKeyId}</AccessKeyId>
      <Status>Active</Status>
      <SecretAccessKey>${secretAccessKey}</SecretAccessKey>
      <CreateDate>${(/* @__PURE__ */ new Date()).toISOString()}</CreateDate>
    </AccessKey>
  </CreateAccessKeyResult>
  <ResponseMetadata><RequestId>${generateMessageId()}</RequestId></ResponseMetadata>
</CreateAccessKeyResponse>`;
    return awsXmlResponse(c, xml);
  }
  function listAccessKeys(c, params) {
    const userName = params["UserName"] ?? "";
    const user = aws().iamUsers.findOneBy("user_name", userName);
    if (!user) {
      return awsErrorXml(c, "NoSuchEntity", `The user with name ${escapeXml(userName)} cannot be found.`, 404);
    }
    const keysXml = user.access_keys.map(
      (k) => `      <member>
        <UserName>${escapeXml(userName)}</UserName>
        <AccessKeyId>${k.access_key_id}</AccessKeyId>
        <Status>${k.status}</Status>
      </member>`
    ).join("\n");
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ListAccessKeysResponse>
  <ListAccessKeysResult>
    <IsTruncated>false</IsTruncated>
    <AccessKeyMetadata>
${keysXml}
    </AccessKeyMetadata>
  </ListAccessKeysResult>
  <ResponseMetadata><RequestId>${generateMessageId()}</RequestId></ResponseMetadata>
</ListAccessKeysResponse>`;
    return awsXmlResponse(c, xml);
  }
  function deleteAccessKey(c, params) {
    const userName = params["UserName"] ?? "";
    const accessKeyId = params["AccessKeyId"] ?? "";
    const user = aws().iamUsers.findOneBy("user_name", userName);
    if (!user) {
      return awsErrorXml(c, "NoSuchEntity", `The user with name ${escapeXml(userName)} cannot be found.`, 404);
    }
    const keys = user.access_keys.filter((k) => k.access_key_id !== accessKeyId);
    aws().iamUsers.update(user.id, { access_keys: keys });
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<DeleteAccessKeyResponse>
  <ResponseMetadata><RequestId>${generateMessageId()}</RequestId></ResponseMetadata>
</DeleteAccessKeyResponse>`;
    return awsXmlResponse(c, xml);
  }
  function createRole(c, params) {
    const roleName = params["RoleName"] ?? "";
    if (!roleName) {
      return awsErrorXml(c, "ValidationError", "The request must contain the parameter RoleName.", 400);
    }
    const existing = aws().iamRoles.findOneBy("role_name", roleName);
    if (existing) {
      return awsErrorXml(c, "EntityAlreadyExists", `Role with name ${escapeXml(roleName)} already exists.`, 409);
    }
    const roleId = generateAwsId("AROA");
    const path = params["Path"] ?? "/";
    const arn = `arn:aws:iam::${accountId}:role${path}${roleName}`;
    const assumeRolePolicy = params["AssumeRolePolicyDocument"] ?? "{}";
    const description = params["Description"] ?? "";
    aws().iamRoles.insert({
      role_name: roleName,
      role_id: roleId,
      arn,
      path,
      assume_role_policy_document: assumeRolePolicy,
      description
    });
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<CreateRoleResponse>
  <CreateRoleResult>
    <Role>
      <Path>${escapeXml(path)}</Path>
      <RoleName>${escapeXml(roleName)}</RoleName>
      <RoleId>${roleId}</RoleId>
      <Arn>${escapeXml(arn)}</Arn>
      <CreateDate>${(/* @__PURE__ */ new Date()).toISOString()}</CreateDate>
      <AssumeRolePolicyDocument>${encodeURIComponent(assumeRolePolicy)}</AssumeRolePolicyDocument>
      <Description>${escapeXml(description)}</Description>
    </Role>
  </CreateRoleResult>
  <ResponseMetadata><RequestId>${generateMessageId()}</RequestId></ResponseMetadata>
</CreateRoleResponse>`;
    return awsXmlResponse(c, xml);
  }
  function getRole(c, params) {
    const roleName = params["RoleName"] ?? "";
    const role = aws().iamRoles.findOneBy("role_name", roleName);
    if (!role) {
      return awsErrorXml(c, "NoSuchEntity", `The role with name ${escapeXml(roleName)} cannot be found.`, 404);
    }
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<GetRoleResponse>
  <GetRoleResult>
    <Role>
      <Path>${escapeXml(role.path)}</Path>
      <RoleName>${escapeXml(role.role_name)}</RoleName>
      <RoleId>${role.role_id}</RoleId>
      <Arn>${escapeXml(role.arn)}</Arn>
      <CreateDate>${role.created_at}</CreateDate>
      <AssumeRolePolicyDocument>${encodeURIComponent(role.assume_role_policy_document)}</AssumeRolePolicyDocument>
      <Description>${escapeXml(role.description)}</Description>
    </Role>
  </GetRoleResult>
  <ResponseMetadata><RequestId>${generateMessageId()}</RequestId></ResponseMetadata>
</GetRoleResponse>`;
    return awsXmlResponse(c, xml);
  }
  function deleteRole(c, params) {
    const roleName = params["RoleName"] ?? "";
    const role = aws().iamRoles.findOneBy("role_name", roleName);
    if (!role) {
      return awsErrorXml(c, "NoSuchEntity", `The role with name ${escapeXml(roleName)} cannot be found.`, 404);
    }
    aws().iamRoles.delete(role.id);
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<DeleteRoleResponse>
  <ResponseMetadata><RequestId>${generateMessageId()}</RequestId></ResponseMetadata>
</DeleteRoleResponse>`;
    return awsXmlResponse(c, xml);
  }
  function listRoles(c) {
    const roles = aws().iamRoles.all();
    const rolesXml = roles.map(
      (r) => `      <member>
        <Path>${escapeXml(r.path)}</Path>
        <RoleName>${escapeXml(r.role_name)}</RoleName>
        <RoleId>${r.role_id}</RoleId>
        <Arn>${escapeXml(r.arn)}</Arn>
        <CreateDate>${r.created_at}</CreateDate>
        <Description>${escapeXml(r.description)}</Description>
      </member>`
    ).join("\n");
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ListRolesResponse>
  <ListRolesResult>
    <IsTruncated>false</IsTruncated>
    <Roles>
${rolesXml}
    </Roles>
  </ListRolesResult>
  <ResponseMetadata><RequestId>${generateMessageId()}</RequestId></ResponseMetadata>
</ListRolesResponse>`;
    return awsXmlResponse(c, xml);
  }
  function getCallerIdentity(c) {
    const authUser = c.get("authUser");
    const userName = authUser?.login ?? "admin";
    const arn = `arn:aws:iam::${accountId}:user/${userName}`;
    const user = aws().iamUsers.findOneBy("user_name", userName);
    const userId = user?.user_id ?? generateAwsId("AIDA");
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<GetCallerIdentityResponse>
  <GetCallerIdentityResult>
    <Arn>${escapeXml(arn)}</Arn>
    <UserId>${userId}</UserId>
    <Account>${accountId}</Account>
  </GetCallerIdentityResult>
  <ResponseMetadata><RequestId>${generateMessageId()}</RequestId></ResponseMetadata>
</GetCallerIdentityResponse>`;
    return awsXmlResponse(c, xml);
  }
  function assumeRole(c, params) {
    const roleArn = params["RoleArn"] ?? "";
    const sessionName = params["RoleSessionName"] ?? "session";
    const role = aws().iamRoles.all().find((r) => r.arn === roleArn);
    if (!role) {
      return awsErrorXml(c, "NoSuchEntity", `The role specified cannot be found.`, 404);
    }
    const accessKeyId = "ASIA" + randomBytes2(8).toString("hex").toUpperCase();
    const secretAccessKey = randomBytes2(30).toString("base64");
    const sessionToken = randomBytes2(64).toString("base64");
    const expiration = new Date(Date.now() + 3600 * 1e3).toISOString();
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<AssumeRoleResponse>
  <AssumeRoleResult>
    <Credentials>
      <AccessKeyId>${accessKeyId}</AccessKeyId>
      <SecretAccessKey>${secretAccessKey}</SecretAccessKey>
      <SessionToken>${sessionToken}</SessionToken>
      <Expiration>${expiration}</Expiration>
    </Credentials>
    <AssumedRoleUser>
      <Arn>${roleArn}/${sessionName}</Arn>
      <AssumedRoleId>${role.role_id}:${sessionName}</AssumedRoleId>
    </AssumedRoleUser>
  </AssumeRoleResult>
  <ResponseMetadata><RequestId>${generateMessageId()}</RequestId></ResponseMetadata>
</AssumeRoleResponse>`;
    return awsXmlResponse(c, xml);
  }
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
function renderInspectorPage(title, tabs, activeTab, body, service) {
  const tabLinks = tabs.map(
    (t) => `<a href="${escapeAttr(t.href)}" class="${t.id === activeTab ? "active" : ""}">${escapeHtml(t.label)}</a>`
  ).join("");
  return `${head(title)}
<body>
${emuBar(service)}
<div class="inspector-layout">
  <nav class="inspector-tabs">${tabLinks}</nav>
  ${body}
</div>
${POWERED_BY}
</body></html>`;
}
function renderUserButton(opts) {
  const hiddens = Object.entries(opts.hiddenFields).map(([k, v]) => `<input type="hidden" name="${escapeAttr(k)}" value="${escapeAttr(v)}"/>`).join("");
  const nameLine = opts.name ? `<div class="user-meta">${escapeHtml(opts.name)}</div>` : "";
  const emailLine = opts.email ? `<div class="user-email">${escapeHtml(opts.email)}</div>` : "";
  return `<form class="user-form" method="post" action="${escapeAttr(opts.formAction)}">
${hiddens}
<button type="submit" class="user-btn">
  <span class="avatar">${escapeHtml(opts.letter)}</span>
  <span class="user-text">
    <span class="user-login">${escapeHtml(opts.login)}</span>
    ${nameLine}${emailLine}
  </span>
</button>
</form>`;
}
function constantTimeSecretEqual(a, b) {
  const bufA = Buffer.from(a, "utf-8");
  const bufB = Buffer.from(b, "utf-8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
function getCognitoStore(store) {
  return {
    pools: store.collection("aws.cognito.user_pools", ["pool_id"]),
    clients: store.collection("aws.cognito.clients", ["client_id", "pool_id"]),
    users: store.collection("aws.cognito.users", ["pool_id", "username", "sub"]),
    sessions: store.collection("aws.cognito.sessions", ["session_id", "refresh_token", "pool_id"]),
    challenges: store.collection("aws.cognito.challenges", ["token"]),
    codes: store.collection("aws.cognito.codes", ["token"]),
    identityPools: store.collection("aws.cognito.identity_pools", ["pool_id"]),
    identities: store.collection("aws.cognito.identities", ["identity_id", "pool_id"])
  };
}
var SERVICE_LABEL = "AWS";
var TABS = [
  { id: "s3", label: "S3", href: "/_inspector?tab=s3" },
  { id: "sqs", label: "SQS", href: "/_inspector?tab=sqs" },
  { id: "iam", label: "IAM", href: "/_inspector?tab=iam" },
  { id: "cognito", label: "Cognito", href: "/_inspector?tab=cognito" }
];
function inspectorRoutes(ctx) {
  const { app, store } = ctx;
  const aws = () => getAwsStore(store);
  app.get("/_inspector", (c) => {
    const tab = c.req.query("tab") ?? "s3";
    const s3Store = aws();
    const buckets = s3Store.s3Buckets.all();
    const queues = s3Store.sqsQueues.all();
    const users = s3Store.iamUsers.all();
    const roles = s3Store.iamRoles.all();
    let contentHtml = "";
    if (tab === "s3") {
      const rows = buckets.map((b) => {
        const objects = s3Store.s3Objects.findBy("bucket_name", b.bucket_name);
        return `<tr>
            <td>${escapeXml(b.bucket_name)}</td>
            <td>${objects.length}</td>
            <td>${escapeXml(b.region)}</td>
            <td>${escapeXml(b.creation_date)}</td>
          </tr>`;
      }).join("\n");
      contentHtml = `
        <div class="inspector-section">
          <h2>S3 Buckets (${buckets.length})</h2>
          <table class="inspector-table">
            <thead><tr><th>Bucket</th><th>Objects</th><th>Region</th><th>Created</th></tr></thead>
            <tbody>${rows || `<tr><td colspan="4"><div class="inspector-empty">No buckets</div></td></tr>`}</tbody>
          </table>
        </div>`;
      for (const bucket of buckets) {
        const objects = s3Store.s3Objects.findBy("bucket_name", bucket.bucket_name);
        if (objects.length > 0) {
          const objRows = objects.map(
            (o) => `<tr>
              <td>${escapeXml(o.key)}</td>
              <td>${o.content_length}</td>
              <td>${escapeXml(o.content_type)}</td>
              <td>${escapeXml(o.last_modified)}</td>
            </tr>`
          ).join("\n");
          contentHtml += `
            <div class="inspector-section">
              <h3>${escapeXml(bucket.bucket_name)} objects</h3>
              <table class="inspector-table">
                <thead><tr><th>Key</th><th>Size</th><th>Type</th><th>Last Modified</th></tr></thead>
                <tbody>${objRows}</tbody>
              </table>
            </div>`;
        }
      }
    } else if (tab === "sqs") {
      const rows = queues.map((q) => {
        const messages = s3Store.sqsMessages.findBy("queue_name", q.queue_name);
        return `<tr>
            <td>${escapeXml(q.queue_name)}</td>
            <td>${messages.length}</td>
            <td>${q.fifo ? "Yes" : "No"}</td>
            <td>${q.visibility_timeout}s</td>
          </tr>`;
      }).join("\n");
      contentHtml = `
        <div class="inspector-section">
          <h2>SQS Queues (${queues.length})</h2>
          <table class="inspector-table">
            <thead><tr><th>Queue</th><th>Messages</th><th>FIFO</th><th>Visibility Timeout</th></tr></thead>
            <tbody>${rows || `<tr><td colspan="4"><div class="inspector-empty">No queues</div></td></tr>`}</tbody>
          </table>
        </div>`;
    } else if (tab === "iam") {
      const userRows = users.map(
        (u) => `<tr>
          <td>${escapeXml(u.user_name)}</td>
          <td>${escapeXml(u.user_id)}</td>
          <td>${u.access_keys.length}</td>
          <td>${escapeXml(u.arn)}</td>
        </tr>`
      ).join("\n");
      const roleRows = roles.map(
        (r) => `<tr>
          <td>${escapeXml(r.role_name)}</td>
          <td>${escapeXml(r.role_id)}</td>
          <td>${escapeXml(r.description)}</td>
          <td>${escapeXml(r.arn)}</td>
        </tr>`
      ).join("\n");
      contentHtml = `
        <div class="inspector-section">
          <h2>IAM Users (${users.length})</h2>
          <table class="inspector-table">
            <thead><tr><th>User</th><th>User ID</th><th>Access Keys</th><th>ARN</th></tr></thead>
            <tbody>${userRows || `<tr><td colspan="4"><div class="inspector-empty">No users</div></td></tr>`}</tbody>
          </table>
        </div>
        <div class="inspector-section">
          <h2>IAM Roles (${roles.length})</h2>
          <table class="inspector-table">
            <thead><tr><th>Role</th><th>Role ID</th><th>Description</th><th>ARN</th></tr></thead>
            <tbody>${roleRows || `<tr><td colspan="4"><div class="inspector-empty">No roles</div></td></tr>`}</tbody>
          </table>
        </div>`;
    }
    if (tab === "cognito") {
      const cognito = getCognitoStore(store);
      const rows = cognito.users.all().map(
        (user) => `<tr>
        <td>${escapeXml(user.pool_id)}</td><td>${escapeXml(user.username)}</td>
        <td>${escapeXml(user.status)}</td><td>${user.enabled ? "Yes" : "No"}</td>
        <td>${user.code_expires_at && user.code_expires_at > Date.now() ? escapeXml(user.confirmation_code ?? "") : ""}</td>
      </tr>`
      ).join("");
      contentHtml = `<div class="inspector-section"><h2>Cognito Users (${cognito.users.all().length})</h2>
        <p>${cognito.pools.all().length} user pools, ${cognito.identityPools.all().length} identity pools, ${cognito.identities.all().length} identities</p>
        <table class="inspector-table"><thead><tr><th>Pool</th><th>Username</th><th>Status</th><th>Enabled</th><th>Local verification code</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="5">No users</td></tr>'}</tbody></table></div>`;
    }
    return c.html(renderInspectorPage("Inspector", TABS, tab, contentHtml, SERVICE_LABEL));
  });
}
var DEFAULT_USER_POOL = "us-east-1_emulate";
var DEFAULT_CLIENT = "emulateclient";
var DEFAULT_IDENTITY_POOL = "us-east-1:00000000-0000-4000-8000-000000000001";
var CognitoError = class extends Error {
  constructor(code, message2) {
    super(message2);
    this.code = code;
  }
};
function fail(code, message2) {
  throw new CognitoError(code, message2);
}
function str(value) {
  return typeof value === "string" ? value : "";
}
function object2(value) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    fail("InvalidParameterException", "Expected an object.");
  return value;
}
function required(value, name) {
  const result = str(value);
  if (!result) fail("InvalidParameterException", `${name} is required.`);
  return result;
}
function attributes(value) {
  if (value === void 0) return {};
  if (!Array.isArray(value)) fail("InvalidParameterException", "Attributes must be an array.");
  return Object.fromEntries(
    value.map((item) => {
      const attribute = object2(item);
      const name = required(attribute.Name, "Attribute name");
      if (name === "sub") fail("InvalidParameterException", "sub is read-only.");
      if (typeof attribute.Value !== "string") fail("InvalidParameterException", "Attribute values must be strings.");
      return [name, attribute.Value];
    })
  );
}
function userAttributes(user) {
  return Object.entries({ ...user.attributes, sub: user.sub }).map(([Name, Value]) => ({ Name, Value }));
}
function userResponse(user) {
  return {
    Username: user.username,
    Attributes: userAttributes(user),
    UserStatus: user.status,
    Enabled: user.enabled,
    UserCreateDate: Date.parse(user.created_at) / 1e3,
    UserLastModifiedDate: Date.parse(user.updated_at) / 1e3
  };
}
function passwordHash(password) {
  if (password.length < 8) fail("InvalidPasswordException", "Password must contain at least 8 characters.");
  const salt = randomBytes3(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 32).toString("hex")}`;
}
function matchesPassword(password, hash) {
  const [salt, digest] = hash.split(":");
  if (!salt || !digest || !password) return false;
  const expected = Buffer.from(digest, "hex");
  const actual = scryptSync(password, salt, 32);
  return expected.length === actual.length && timingSafeEqual2(expected, actual);
}
function findUser(store, poolId, username) {
  return getCognitoStore(store).users.findBy("pool_id", poolId).find((user) => user.username === username);
}
function getUser(store, poolId, username) {
  return findUser(store, poolId, username) ?? fail("UserNotFoundException", "User does not exist.");
}
function getPool(store, poolId) {
  return getCognitoStore(store).pools.findOneBy("pool_id", poolId) ?? fail("ResourceNotFoundException", "User pool does not exist.");
}
function getClient(store, clientId) {
  return getCognitoStore(store).clients.findOneBy("client_id", clientId) ?? fail("ResourceNotFoundException", "App client does not exist.");
}
function checkSecretHash(client, username, provided) {
  if (!client.client_secret) return;
  const expected = createHmac("sha256", client.client_secret).update(username + client.client_id).digest("base64");
  if (!constantTimeSecretEqual(str(provided), expected))
    fail("NotAuthorizedException", "Unable to verify secret hash for client.");
}
function checkUser(user) {
  if (!user.enabled) fail("NotAuthorizedException", "User is disabled.");
  if (user.status !== "CONFIRMED") fail("UserNotConfirmedException", "User is not confirmed.");
}
function revokeSessions(store, user) {
  const cs = getCognitoStore(store);
  for (const collection of [cs.sessions, cs.challenges, cs.codes]) {
    for (const record of collection.all()) {
      if (record.pool_id === user.pool_id && record.username === user.username) collection.delete(record.id);
    }
  }
}
function setCode(store, user, kind) {
  getCognitoStore(store).users.update(user.id, {
    confirmation_code: getPool(store, user.pool_id).confirmation_code,
    code_expires_at: Date.now() + 10 * 6e4,
    code_kind: kind
  });
  return {
    CodeDeliveryDetails: {
      DeliveryMedium: "EMAIL",
      AttributeName: "email",
      Destination: user.attributes.email ?? user.username
    }
  };
}
function checkCode(user, code, kind) {
  if (!user.confirmation_code || user.code_kind !== kind || !user.code_expires_at || user.code_expires_at <= Date.now()) {
    fail("ExpiredCodeException", "Confirmation code has expired.");
  }
  if (!constantTimeSecretEqual(str(code), user.confirmation_code))
    fail("CodeMismatchException", "Invalid verification code.");
}
function issuer(baseUrl, poolId) {
  return `${baseUrl}/cognito-idp/${poolId}`;
}
function signingKey(store, poolId) {
  const name = `aws.cognito.signing.${poolId}`;
  let key = store.getData(name);
  if (!key) {
    const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const kid = randomUUID();
    key = {
      private_key: privateKey.export({ type: "pkcs8", format: "pem" }).toString(),
      kid,
      jwk: { ...publicKey.export({ format: "jwk" }), kid, use: "sig", alg: "RS256" }
    };
    store.setData(name, key);
  }
  return key;
}
async function issueTokens(store, baseUrl, client, user, options = {}) {
  checkUser(user);
  const cs = getCognitoStore(store);
  const session = options.session ?? cs.sessions.insert({
    session_id: randomUUID(),
    refresh_token: randomBytes3(48).toString("base64url"),
    pool_id: user.pool_id,
    client_id: client.client_id,
    username: user.username,
    scope: options.scope ?? "aws.cognito.signin.user.admin",
    auth_time: Math.floor(Date.now() / 1e3),
    expires_at: Date.now() + 30 * 864e5
  });
  const key = signingKey(store, user.pool_id);
  const privateKey = createPrivateKey(key.private_key);
  const common = { auth_time: session.auth_time, origin_jti: session.session_id };
  const sign = (claims2) => new SignJWT({ ...common, ...claims2 }).setProtectedHeader({ alg: "RS256", kid: key.kid }).setIssuer(issuer(baseUrl, user.pool_id)).setSubject(user.sub).setIssuedAt().setExpirationTime("1h").setJti(randomUUID()).sign(privateKey);
  const allowed = /* @__PURE__ */ new Set([
    "email",
    "email_verified",
    "name",
    "given_name",
    "family_name",
    "picture",
    "phone_number",
    "phone_number_verified",
    "preferred_username"
  ]);
  const claims = Object.fromEntries(
    Object.entries(user.attributes).filter(([name]) => allowed.has(name) || name.startsWith("custom:")).map(([name, value]) => [name, name.endsWith("_verified") ? value === "true" : value])
  );
  return {
    AccessToken: await sign({
      token_use: "access",
      client_id: client.client_id,
      username: user.username,
      scope: session.scope
    }),
    IdToken: await sign({
      ...claims,
      token_use: "id",
      aud: client.client_id,
      "cognito:username": user.username,
      ...options.nonce ? { nonce: options.nonce } : {}
    }),
    ...!options.session ? { RefreshToken: session.refresh_token } : {},
    ExpiresIn: 3600,
    TokenType: "Bearer"
  };
}
function refreshSession(store, client, token) {
  const session = getCognitoStore(store).sessions.findOneBy("refresh_token", token);
  if (!session || session.client_id !== client.client_id || session.pool_id !== client.pool_id || session.expires_at <= Date.now()) {
    fail("NotAuthorizedException", "Invalid refresh token.");
  }
  checkUser(getUser(store, session.pool_id, session.username));
  return session;
}
async function verifyToken(store, baseUrl, token, use, poolId) {
  const cs = getCognitoStore(store);
  for (const pool of poolId ? [getPool(store, poolId)] : cs.pools.all()) {
    try {
      const key = signingKey(store, pool.pool_id);
      const { payload } = await jwtVerify(token, createPublicKey(key.private_key), {
        algorithms: ["RS256"],
        issuer: issuer(baseUrl, pool.pool_id)
      });
      if (payload.token_use !== use) continue;
      const session = cs.sessions.findOneBy("session_id", str(payload.origin_jti));
      if (!session || session.pool_id !== pool.pool_id || session.expires_at <= Date.now()) continue;
      if ((use === "id" ? payload.aud : payload.client_id) !== session.client_id) continue;
      const user = getUser(store, pool.pool_id, session.username);
      if (user.sub !== payload.sub) continue;
      checkUser(user);
      return { user, session, payload };
    } catch {
    }
  }
  return fail("NotAuthorizedException", "Invalid or expired token.");
}
function jsonResponse(c, data, status = 200) {
  c.header("Content-Type", "application/x-amz-json-1.1");
  c.header("x-amzn-requestid", randomUUID());
  return c.json(data, status);
}
function errorResponse(c, error) {
  if (!(error instanceof CognitoError)) throw error;
  c.header("x-amzn-errortype", error.code);
  return jsonResponse(c, { __type: error.code, message: error.message }, 400);
}
function cognitoIdpRoutes({ app, store, baseUrl }) {
  const cs = () => getCognitoStore(store);
  const clearCode = { confirmation_code: void 0, code_expires_at: void 0, code_kind: void 0 };
  const confirm = (user, verifyEmail = false) => cs().users.update(user.id, {
    ...clearCode,
    status: "CONFIRMED",
    attributes: { ...user.attributes, ...verifyEmail && user.attributes.email ? { email_verified: "true" } : {} }
  });
  for (const path of ["/cognito-idp", "/cognito-idp/"])
    app.post(path, async (c) => {
      try {
        const body = object2(await c.req.json());
        const target = c.req.header("X-Amz-Target") ?? "";
        const prefix = "AWSCognitoIdentityProviderService.";
        if (!target.startsWith(prefix)) fail("UnknownOperationException", "Unknown Cognito operation.");
        return jsonResponse(c, await dispatch(target.slice(prefix.length), body));
      } catch (error) {
        if (error instanceof SyntaxError)
          return errorResponse(c, new CognitoError("SerializationException", "Invalid JSON request body."));
        return errorResponse(c, error);
      }
    });
  async function dispatch(action, body) {
    if (action.startsWith("Admin") || action === "ListUsers") {
      const poolId = required(body.UserPoolId, "UserPoolId");
      getPool(store, poolId);
      if (action === "ListUsers") {
        if (body.Filter) fail("InvalidParameterException", "ListUsers filters are not simulated.");
        const offset = body.PaginationToken === void 0 ? 0 : Number(body.PaginationToken);
        const limit = body.Limit === void 0 ? 60 : Number(body.Limit);
        if (!Number.isInteger(offset) || offset < 0 || !Number.isInteger(limit) || limit < 1 || limit > 60)
          fail("InvalidParameterException", "Invalid pagination parameters.");
        const users = cs().users.findBy("pool_id", poolId);
        return {
          Users: users.slice(offset, offset + limit).map(userResponse),
          ...offset + limit < users.length ? { PaginationToken: String(offset + limit) } : {}
        };
      }
      if (action === "AdminInitiateAuth") {
        const client2 = getClient(store, required(body.ClientId, "ClientId"));
        if (client2.pool_id !== poolId)
          fail("ResourceNotFoundException", "App client does not belong to this user pool.");
        return authenticate(body, true);
      }
      if (action === "AdminRespondToAuthChallenge") {
        const client2 = getClient(store, required(body.ClientId, "ClientId"));
        if (client2.pool_id !== poolId)
          fail("ResourceNotFoundException", "App client does not belong to this user pool.");
        return respondToChallenge(body);
      }
      if (action === "AdminCreateUser") {
        const username2 = required(body.Username, "Username");
        if (findUser(store, poolId, username2)) fail("UsernameExistsException", "User already exists.");
        const password = required(body.TemporaryPassword, "TemporaryPassword");
        const user3 = cs().users.insert({
          pool_id: poolId,
          username: username2,
          sub: randomUUID2(),
          password_hash: passwordHash(password),
          attributes: attributes(body.UserAttributes),
          status: "FORCE_CHANGE_PASSWORD",
          enabled: true
        });
        return { User: userResponse(user3) };
      }
      const user2 = getUser(store, poolId, required(body.Username, "Username"));
      switch (action) {
        case "AdminGetUser": {
          const { Attributes, ...rest } = userResponse(user2);
          return { ...rest, UserAttributes: Attributes };
        }
        case "AdminConfirmSignUp":
          confirm(user2);
          return {};
        case "AdminSetUserPassword": {
          const hash = passwordHash(required(body.Password, "Password"));
          if (body.Permanent !== void 0 && typeof body.Permanent !== "boolean")
            fail("InvalidParameterException", "Permanent must be a boolean.");
          revokeSessions(store, user2);
          cs().users.update(user2.id, {
            ...clearCode,
            password_hash: hash,
            status: body.Permanent ? "CONFIRMED" : "FORCE_CHANGE_PASSWORD"
          });
          return {};
        }
        case "AdminDisableUser":
          revokeSessions(store, user2);
          cs().users.update(user2.id, { enabled: false });
          return {};
        case "AdminEnableUser":
          cs().users.update(user2.id, { enabled: true });
          return {};
        case "AdminDeleteUser":
          revokeSessions(store, user2);
          cs().users.delete(user2.id);
          return {};
        default:
          return fail("UnknownOperationException", `Operation ${action} is not simulated.`);
      }
    }
    if (action === "InitiateAuth") return authenticate(body);
    if (action === "RespondToAuthChallenge") return respondToChallenge(body);
    if (action === "GetUser" || action === "ChangePassword" || action === "GlobalSignOut") {
      const { user: user2, session } = await verifyToken(store, baseUrl, required(body.AccessToken, "AccessToken"), "access");
      if (!session.scope.split(" ").includes("aws.cognito.signin.user.admin"))
        fail("NotAuthorizedException", "Access token does not have the required scope.");
      if (action === "GetUser") return { Username: user2.username, UserAttributes: userAttributes(user2) };
      if (action === "ChangePassword") {
        if (!matchesPassword(str(body.PreviousPassword), user2.password_hash))
          fail("NotAuthorizedException", "Incorrect username or password.");
        cs().users.update(user2.id, {
          password_hash: passwordHash(required(body.ProposedPassword, "ProposedPassword"))
        });
      } else revokeSessions(store, user2);
      return {};
    }
    const client = getClient(store, required(body.ClientId, "ClientId"));
    if (action === "RevokeToken") {
      if (client.client_secret && body.ClientSecret !== client.client_secret)
        fail("NotAuthorizedException", "Invalid client secret.");
      const session = refreshSession(store, client, required(body.Token, "Token"));
      cs().sessions.delete(session.id);
      return {};
    }
    const username = required(body.Username, "Username");
    checkSecretHash(client, username, body.SecretHash);
    if (action === "SignUp") {
      if (findUser(store, client.pool_id, username)) fail("UsernameExistsException", "User already exists.");
      const attrs = attributes(body.UserAttributes);
      const user2 = cs().users.insert({
        pool_id: client.pool_id,
        username,
        sub: randomUUID2(),
        password_hash: passwordHash(required(body.Password, "Password")),
        attributes: { ...attrs, ...attrs.email ? { email_verified: "false" } : {} },
        status: "UNCONFIRMED",
        enabled: true
      });
      return { UserConfirmed: false, UserSub: user2.sub, ...setCode(store, user2, "signup") };
    }
    const user = getUser(store, client.pool_id, username);
    switch (action) {
      case "ConfirmSignUp":
        if (user.status !== "UNCONFIRMED") fail("NotAuthorizedException", "User is already confirmed.");
        checkCode(user, body.ConfirmationCode, "signup");
        confirm(user, true);
        return {};
      case "ResendConfirmationCode":
        if (user.status !== "UNCONFIRMED") fail("InvalidParameterException", "User is already confirmed.");
        return setCode(store, user, "signup");
      case "ForgotPassword":
        checkUser(user);
        return setCode(store, user, "reset");
      case "ConfirmForgotPassword":
        checkUser(user);
        checkCode(user, body.ConfirmationCode, "reset");
        cs().users.update(user.id, { ...clearCode, password_hash: passwordHash(required(body.Password, "Password")) });
        revokeSessions(store, user);
        return {};
      default:
        return fail("UnknownOperationException", `Operation ${action} is not simulated.`);
    }
  }
  async function respondToChallenge(body) {
    const client = getClient(store, required(body.ClientId, "ClientId"));
    if (body.ChallengeName !== "NEW_PASSWORD_REQUIRED")
      fail("InvalidParameterException", "Only NEW_PASSWORD_REQUIRED is simulated.");
    const challenge = cs().challenges.findOneBy("token", required(body.Session, "Session"));
    if (!challenge || challenge.client_id !== client.client_id || challenge.pool_id !== client.pool_id || challenge.expires_at <= Date.now())
      fail("NotAuthorizedException", "Invalid challenge session.");
    const response = object2(body.ChallengeResponses);
    if (response.USERNAME !== challenge.username) fail("NotAuthorizedException", "Challenge username does not match.");
    checkSecretHash(client, challenge.username, response.SECRET_HASH);
    const user = getUser(store, client.pool_id, challenge.username);
    if (!user.enabled || user.status !== "FORCE_CHANGE_PASSWORD")
      fail("NotAuthorizedException", "Challenge is no longer valid.");
    const hash = passwordHash(required(response.NEW_PASSWORD, "NEW_PASSWORD"));
    cs().challenges.delete(challenge.id);
    const updated = cs().users.update(user.id, { password_hash: hash, status: "CONFIRMED" });
    return { AuthenticationResult: await issueTokens(store, baseUrl, client, updated) };
  }
  async function authenticate(body, admin = false) {
    const client = getClient(store, required(body.ClientId, "ClientId"));
    const params = object2(body.AuthParameters);
    if (body.AuthFlow === "REFRESH_TOKEN_AUTH" || body.AuthFlow === "REFRESH_TOKEN") {
      const session = refreshSession(store, client, required(params.REFRESH_TOKEN, "REFRESH_TOKEN"));
      checkSecretHash(client, session.username, params.SECRET_HASH);
      return {
        AuthenticationResult: await issueTokens(
          store,
          baseUrl,
          client,
          getUser(store, client.pool_id, session.username),
          { session }
        )
      };
    }
    if (body.AuthFlow !== "USER_PASSWORD_AUTH" && !(admin && body.AuthFlow === "ADMIN_USER_PASSWORD_AUTH")) {
      fail(
        "InvalidParameterException",
        "Supported flows are USER_PASSWORD_AUTH, ADMIN_USER_PASSWORD_AUTH, and REFRESH_TOKEN_AUTH. SRP and MFA are not simulated."
      );
    }
    const username = required(params.USERNAME, "USERNAME");
    checkSecretHash(client, username, params.SECRET_HASH);
    const user = findUser(store, client.pool_id, username);
    if (!user || !user.enabled || !matchesPassword(str(params.PASSWORD), user.password_hash))
      fail("NotAuthorizedException", "Incorrect username or password.");
    if (user.status === "FORCE_CHANGE_PASSWORD") {
      const challenge = cs().challenges.insert({
        token: randomBytes4(32).toString("base64url"),
        pool_id: client.pool_id,
        client_id: client.client_id,
        username,
        expires_at: Date.now() + 3 * 6e4
      });
      return {
        ChallengeName: "NEW_PASSWORD_REQUIRED",
        Session: challenge.token,
        ChallengeParameters: {
          USER_ID_FOR_SRP: username,
          userAttributes: JSON.stringify(user.attributes),
          requiredAttributes: "[]"
        }
      };
    }
    return { AuthenticationResult: await issueTokens(store, baseUrl, client, user) };
  }
}
function cognitoIdentityRoutes({ app, store, baseUrl }) {
  const cs = () => getCognitoStore(store);
  async function principal(pool, logins) {
    const entries = Object.entries(logins === void 0 ? {} : object2(logins));
    if (entries.length === 0) {
      if (!pool.allow_unauthenticated_identities)
        fail("NotAuthorizedException", "Unauthenticated access is not supported for this identity pool.");
      return void 0;
    }
    if (entries.length !== 1) fail("InvalidParameterException", "Only one Cognito User Pool login is simulated.");
    const [provider, token] = entries[0];
    const configured = pool.providers.filter(
      (item) => provider === `cognito-idp.${item.user_pool_id.split("_")[0]}.amazonaws.com/${item.user_pool_id}`
    );
    if (configured.length === 0)
      fail("NotAuthorizedException", "Login provider is not configured for this identity pool.");
    const { user, session } = await verifyToken(store, baseUrl, str(token), "id", configured[0].user_pool_id);
    if (!configured.some((item) => session.client_id === item.client_id))
      fail("NotAuthorizedException", "Token audience does not match the configured app client.");
    return `${provider}:${user.sub}`;
  }
  for (const path of ["/cognito-identity", "/cognito-identity/"])
    app.post(path, async (c) => {
      try {
        const body = object2(await c.req.json());
        const target = c.req.header("X-Amz-Target") ?? "";
        if (target !== "AWSCognitoIdentityService.GetId" && target !== "AWSCognitoIdentityService.GetCredentialsForIdentity") {
          fail("UnknownOperationException", "Only GetId and GetCredentialsForIdentity are simulated.");
        }
        if (target.endsWith(".GetId")) {
          const pool2 = cs().identityPools.findOneBy("pool_id", required(body.IdentityPoolId, "IdentityPoolId"));
          if (!pool2) fail("ResourceNotFoundException", "Identity pool does not exist.");
          const login2 = await principal(pool2, body.Logins);
          const existing = login2 ? cs().identities.findBy("pool_id", pool2.pool_id).find((identity3) => identity3.principal === login2) : void 0;
          const identity2 = existing ?? cs().identities.insert({
            pool_id: pool2.pool_id,
            identity_id: `${pool2.pool_id.split(":")[0]}:${randomUUID3()}`,
            principal: login2
          });
          return jsonResponse(c, { IdentityId: identity2.identity_id });
        }
        const identity = cs().identities.findOneBy("identity_id", required(body.IdentityId, "IdentityId"));
        if (!identity) fail("ResourceNotFoundException", "Identity does not exist.");
        const pool = cs().identityPools.findOneBy("pool_id", identity.pool_id);
        if (!pool) fail("ResourceNotFoundException", "Identity pool does not exist.");
        const login = await principal(pool, body.Logins);
        if (login !== identity.principal) fail("NotAuthorizedException", "Login does not match this identity.");
        if (body.CustomRoleArn) fail("InvalidParameterException", "Role selection is not simulated.");
        return jsonResponse(c, {
          IdentityId: identity.identity_id,
          Credentials: {
            AccessKeyId: `ASIA${randomBytes5(8).toString("hex").toUpperCase()}`,
            SecretKey: randomBytes5(30).toString("base64"),
            SessionToken: randomBytes5(64).toString("base64"),
            Expiration: Math.floor(Date.now() / 1e3) + 3600
          }
        });
      } catch (error) {
        if (error instanceof SyntaxError)
          return errorResponse(c, new CognitoError("SerializationException", "Invalid JSON request body."));
        return errorResponse(c, error);
      }
    });
}
function cognitoOAuthRoutes({ app, store, baseUrl }) {
  const cs = () => getCognitoStore(store);
  const root = "/cognito-idp/:poolId";
  const oauthError = (c, error, description, status = 400) => c.json({ error, error_description: description }, status);
  app.get(`${root}/.well-known/openid-configuration`, (c) => {
    const pool = cs().pools.findOneBy("pool_id", c.req.param("poolId"));
    if (!pool) return c.json({ error: "not_found" }, 404);
    const url = issuer(baseUrl, pool.pool_id);
    return c.json({
      issuer: url,
      authorization_endpoint: `${url}/oauth2/authorize`,
      token_endpoint: `${url}/oauth2/token`,
      userinfo_endpoint: `${url}/oauth2/userInfo`,
      jwks_uri: `${url}/.well-known/jwks.json`,
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code", "refresh_token"],
      subject_types_supported: ["public"],
      id_token_signing_alg_values_supported: ["RS256"],
      token_endpoint_auth_methods_supported: ["none", "client_secret_basic", "client_secret_post"],
      scopes_supported: ["openid", "email", "profile", "aws.cognito.signin.user.admin"],
      code_challenge_methods_supported: ["S256"]
    });
  });
  app.get(`${root}/.well-known/jwks.json`, (c) => {
    const pool = cs().pools.findOneBy("pool_id", c.req.param("poolId"));
    if (!pool) return c.json({ error: "not_found" }, 404);
    return c.json({ keys: [signingKey(store, pool.pool_id).jwk] });
  });
  for (const method of ["GET", "POST"])
    app.on(method, `${root}/oauth2/authorize`, async (c) => {
      try {
        const pool = getPool(store, c.req.param("poolId"));
        const params = method === "GET" ? new URL(c.req.url).searchParams : new URLSearchParams(await c.req.text());
        const client = getClient(store, params.get("client_id") ?? "");
        if (client.pool_id !== pool.pool_id)
          return oauthError(c, "invalid_client", "Client does not belong to this user pool.");
        const redirect = params.get("redirect_uri") ?? "";
        if (!client.redirect_uris.includes(redirect))
          return oauthError(c, "invalid_request", "redirect_uri must exactly match a registered URI.");
        if (params.get("response_type") !== "code")
          return oauthError(c, "unsupported_response_type", "Only the authorization code flow is simulated.");
        const scopes = [...new Set((params.get("scope") ?? "openid").split(" ").filter(Boolean))];
        if (scopes.some((scope) => !client.scopes.includes(scope)))
          return oauthError(c, "invalid_scope", "A requested scope is not allowed for this client.");
        const challenge = params.get("code_challenge");
        if (challenge && (!/^[A-Za-z0-9_-]{43}$/.test(challenge) || params.get("code_challenge_method") !== "S256") || !challenge && params.has("code_challenge_method")) {
          return oauthError(c, "invalid_request", "PKCE requires an S256 code challenge.");
        }
        if (method === "GET") {
          const users = cs().users.findBy("pool_id", pool.pool_id).filter((user2) => user2.enabled && user2.status === "CONFIRMED");
          const fields = Object.fromEntries([...params].filter(([name]) => name !== "username"));
          const buttons = users.map(
            (user2) => renderUserButton({
              login: user2.username,
              letter: user2.username[0].toUpperCase(),
              name: user2.attributes.name,
              email: user2.attributes.email,
              formAction: `${issuer(baseUrl, pool.pool_id)}/oauth2/authorize`,
              hiddenFields: { ...fields, username: user2.username }
            })
          ).join("");
          return c.html(
            renderCardPage(
              "Sign in with Cognito",
              "Choose a local test user",
              buttons || '<p class="empty">Seed a confirmed user or complete sign-up to sign in.</p>',
              "AWS"
            )
          );
        }
        const user = getUser(store, pool.pool_id, params.get("username") ?? "");
        checkUser(user);
        const code = cs().codes.insert({
          token: randomBytes6(32).toString("base64url"),
          pool_id: pool.pool_id,
          client_id: client.client_id,
          username: user.username,
          redirect_uri: redirect,
          scope: scopes.join(" "),
          nonce: params.get("nonce") ?? void 0,
          code_challenge: challenge ?? void 0,
          expires_at: Date.now() + 5 * 6e4
        });
        const location = new URL(redirect);
        location.searchParams.set("code", code.token);
        if (params.has("state")) location.searchParams.set("state", params.get("state"));
        return c.redirect(location.toString());
      } catch (error) {
        if (!(error instanceof CognitoError)) throw error;
        return oauthError(c, "invalid_request", error.message);
      }
    });
  app.post(`${root}/oauth2/token`, async (c) => {
    c.header("Cache-Control", "no-store");
    c.header("Pragma", "no-cache");
    try {
      const pool = getPool(store, c.req.param("poolId"));
      const params = new URLSearchParams(await c.req.text());
      let clientId = params.get("client_id") ?? "";
      let secret = params.get("client_secret") ?? "";
      const authorization = c.req.header("Authorization");
      if (authorization?.startsWith("Basic ")) {
        const credentials = Buffer.from(authorization.slice(6), "base64").toString();
        const separator = credentials.indexOf(":");
        if (separator < 0) return oauthError(c, "invalid_client", "Invalid client credentials.", 401);
        const basicId = decodeURIComponent(credentials.slice(0, separator));
        if (clientId && clientId !== basicId)
          return oauthError(c, "invalid_client", "Conflicting client credentials.", 401);
        clientId = basicId;
        secret = decodeURIComponent(credentials.slice(separator + 1));
      }
      const client = getClient(store, clientId);
      if (client.pool_id !== pool.pool_id || client.client_secret && !constantTimeSecretEqual(secret, client.client_secret)) {
        return oauthError(c, "invalid_client", "Invalid client credentials.", 401);
      }
      let tokens;
      let scope;
      if (params.get("grant_type") === "authorization_code") {
        const code = cs().codes.findOneBy("token", params.get("code") ?? "");
        if (!code || code.client_id !== client.client_id || code.pool_id !== pool.pool_id || code.redirect_uri !== params.get("redirect_uri") || code.expires_at <= Date.now()) {
          return oauthError(c, "invalid_grant", "Invalid or expired authorization code.");
        }
        if (code.code_challenge) {
          const verifier = params.get("code_verifier") ?? "";
          const challenge = createHash2("sha256").update(verifier).digest("base64url");
          if (!/^[A-Za-z0-9._~-]{43,128}$/.test(verifier) || !constantTimeSecretEqual(challenge, code.code_challenge)) {
            return oauthError(c, "invalid_grant", "Invalid PKCE verifier.");
          }
        }
        const user = getUser(store, pool.pool_id, code.username);
        checkUser(user);
        cs().codes.delete(code.id);
        scope = code.scope;
        tokens = await issueTokens(store, baseUrl, client, user, { scope, nonce: code.nonce });
      } else if (params.get("grant_type") === "refresh_token") {
        const session = refreshSession(store, client, params.get("refresh_token") ?? "");
        scope = session.scope;
        tokens = await issueTokens(store, baseUrl, client, getUser(store, pool.pool_id, session.username), { session });
      } else return oauthError(c, "unsupported_grant_type", "Only authorization_code and refresh_token are simulated.");
      return c.json({
        access_token: tokens.AccessToken,
        ...scope.split(" ").includes("openid") ? { id_token: tokens.IdToken } : {},
        ...tokens.RefreshToken ? { refresh_token: tokens.RefreshToken } : {},
        token_type: tokens.TokenType,
        expires_in: tokens.ExpiresIn,
        scope
      });
    } catch (error) {
      if (error instanceof URIError) return oauthError(c, "invalid_client", "Invalid client credentials.", 401);
      if (!(error instanceof CognitoError)) throw error;
      return oauthError(
        c,
        error.code === "ResourceNotFoundException" ? "invalid_client" : "invalid_grant",
        error.message
      );
    }
  });
  app.get(`${root}/oauth2/userInfo`, async (c) => {
    try {
      const pool = getPool(store, c.req.param("poolId"));
      const token = c.req.header("Authorization")?.replace(/^Bearer\s+/i, "") ?? "";
      const { user, session } = await verifyToken(store, baseUrl, token, "access", pool.pool_id);
      const scopes = session.scope.split(" ");
      if (!scopes.includes("openid")) return oauthError(c, "invalid_token", "Token requires openid scope.", 401);
      return c.json({
        sub: user.sub,
        username: user.username,
        ...scopes.includes("email") && user.attributes.email ? { email: user.attributes.email, email_verified: user.attributes.email_verified === "true" } : {},
        ...scopes.includes("profile") && user.attributes.name ? { name: user.attributes.name } : {}
      });
    } catch (error) {
      if (!(error instanceof CognitoError)) throw error;
      return oauthError(c, "invalid_token", error.message, 401);
    }
  });
}
function seedCognito(store, config) {
  const cs = getCognitoStore(store);
  for (const pool of config.user_pools ?? []) {
    const existing = cs.pools.findOneBy("pool_id", pool.id);
    const data = {
      pool_id: pool.id,
      name: pool.name ?? pool.id,
      confirmation_code: pool.confirmation_code ?? "123456"
    };
    if (existing) cs.pools.update(existing.id, data);
    else cs.pools.insert(data);
    for (const client of pool.clients ?? []) {
      const previous = cs.clients.findOneBy("client_id", client.client_id);
      if (previous && previous.pool_id !== pool.id)
        throw new Error(`Cognito client ${client.client_id} belongs to another user pool.`);
      const clientData = {
        ...client,
        pool_id: pool.id,
        redirect_uris: client.redirect_uris ?? [],
        scopes: client.scopes ?? ["openid", "email", "profile", "aws.cognito.signin.user.admin"]
      };
      if (previous) cs.clients.update(previous.id, clientData);
      else cs.clients.insert(clientData);
    }
    for (const user of pool.users ?? []) {
      if (findUser(store, pool.id, user.username)) continue;
      cs.users.insert({
        pool_id: pool.id,
        username: user.username,
        sub: randomUUID4(),
        password_hash: passwordHash(user.password),
        attributes: user.attributes ?? {},
        status: user.status ?? "CONFIRMED",
        enabled: user.enabled ?? true
      });
    }
  }
  for (const pool of config.identity_pools ?? []) {
    const existing = cs.identityPools.findOneBy("pool_id", pool.id);
    const data = {
      pool_id: pool.id,
      name: pool.name ?? pool.id,
      allow_unauthenticated_identities: pool.allow_unauthenticated_identities ?? false,
      providers: pool.providers ?? []
    };
    if (existing) cs.identityPools.update(existing.id, data);
    else cs.identityPools.insert(data);
  }
}
function seedCognitoDefaults(store) {
  seedCognito(store, {
    user_pools: [
      {
        id: DEFAULT_USER_POOL,
        name: "emulate",
        clients: [{ client_id: DEFAULT_CLIENT, redirect_uris: ["http://localhost:3000/callback"] }]
      }
    ],
    identity_pools: [
      {
        id: DEFAULT_IDENTITY_POOL,
        name: "emulate",
        providers: [{ user_pool_id: DEFAULT_USER_POOL, client_id: DEFAULT_CLIENT }]
      }
    ]
  });
}
function seedDefaults(store, baseUrl) {
  const aws = getAwsStore(store);
  const accountId = getAccountId();
  const region = getDefaultRegion();
  seedCognitoDefaults(store);
  aws.s3Buckets.insert({
    bucket_name: "emulate-default",
    region,
    creation_date: (/* @__PURE__ */ new Date()).toISOString(),
    acl: "private",
    versioning_enabled: false
  });
  const queueName = "emulate-default-queue";
  aws.sqsQueues.insert({
    queue_name: queueName,
    queue_url: `${baseUrl}/sqs/${accountId}/${queueName}`,
    arn: `arn:aws:sqs:${region}:${accountId}:${queueName}`,
    visibility_timeout: 30,
    delay_seconds: 0,
    max_message_size: 262144,
    message_retention_period: 345600,
    receive_message_wait_time: 0,
    fifo: false
  });
  const userId = generateAwsId("AIDA");
  aws.iamUsers.insert({
    user_name: "admin",
    user_id: userId,
    arn: `arn:aws:iam::${accountId}:user/admin`,
    path: "/",
    access_keys: [
      {
        access_key_id: "AKIAIOSFODNN7EXAMPLE",
        secret_access_key: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
        status: "Active"
      }
    ]
  });
}
function seedFromConfig(store, baseUrl, config) {
  const aws = getAwsStore(store);
  const accountId = getAccountId();
  const region = config.region ?? getDefaultRegion();
  if (config.cognito) seedCognito(store, config.cognito);
  if (config.s3?.buckets) {
    for (const b of config.s3.buckets) {
      const existing = aws.s3Buckets.findOneBy("bucket_name", b.name);
      if (existing) continue;
      aws.s3Buckets.insert({
        bucket_name: b.name,
        region: b.region ?? region,
        creation_date: (/* @__PURE__ */ new Date()).toISOString(),
        acl: "private",
        versioning_enabled: false
      });
    }
  }
  if (config.sqs?.queues) {
    for (const q of config.sqs.queues) {
      const existing = aws.sqsQueues.findOneBy("queue_name", q.name);
      if (existing) continue;
      const fifo = q.fifo ?? q.name.endsWith(".fifo");
      aws.sqsQueues.insert({
        queue_name: q.name,
        queue_url: `${baseUrl}/sqs/${accountId}/${q.name}`,
        arn: `arn:aws:sqs:${region}:${accountId}:${q.name}`,
        visibility_timeout: q.visibility_timeout ?? 30,
        delay_seconds: 0,
        max_message_size: 262144,
        message_retention_period: 345600,
        receive_message_wait_time: 0,
        fifo
      });
    }
  }
  if (config.iam?.users) {
    for (const u of config.iam.users) {
      const existing = aws.iamUsers.findOneBy("user_name", u.user_name);
      if (existing) continue;
      const userId = generateAwsId("AIDA");
      const path = u.path ?? "/";
      const accessKeys = u.create_access_key ? [
        {
          access_key_id: "AKIA" + generateAwsId("").slice(0, 16),
          secret_access_key: generateAwsId("") + generateAwsId(""),
          status: "Active"
        }
      ] : [];
      aws.iamUsers.insert({
        user_name: u.user_name,
        user_id: userId,
        arn: `arn:aws:iam::${accountId}:user${path}${u.user_name}`,
        path,
        access_keys: accessKeys
      });
    }
  }
  if (config.iam?.roles) {
    for (const r of config.iam.roles) {
      const existing = aws.iamRoles.findOneBy("role_name", r.role_name);
      if (existing) continue;
      const roleId = generateAwsId("AROA");
      const path = r.path ?? "/";
      aws.iamRoles.insert({
        role_name: r.role_name,
        role_id: roleId,
        arn: `arn:aws:iam::${accountId}:role${path}${r.role_name}`,
        path,
        assume_role_policy_document: r.assume_role_policy ?? "{}",
        description: r.description ?? ""
      });
    }
  }
}
var awsPlugin = {
  name: "aws",
  register(app, store, webhooks, baseUrl, tokenMap) {
    const ctx = { app, store, webhooks, baseUrl, tokenMap };
    inspectorRoutes(ctx);
    cognitoIdpRoutes(ctx);
    cognitoIdentityRoutes(ctx);
    cognitoOAuthRoutes(ctx);
    sqsRoutes(ctx);
    iamRoutes(ctx);
    s3Routes(ctx);
  },
  seed(store, baseUrl) {
    seedDefaults(store, baseUrl);
  }
};
var index_default = awsPlugin;
export {
  awsPlugin,
  index_default as default,
  getAwsStore,
  getCognitoStore,
  seedFromConfig
};
/*!
 * This HTTP compatibility layer builds on Hono's API and design.
 * https://github.com/honojs/hono
 * Copyright (c) 2021 - present, Yusuke Wada and Hono contributors
 * MIT license: see THIRD_PARTY_NOTICES.md in the repository and npm packages.
 */
//# sourceMappingURL=dist-W3PA4APY.js.map