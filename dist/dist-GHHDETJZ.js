import "./chunk-PZ5AY32C.js";

// ../@emulators/ai/dist/index.js
import { isIP } from "net";
import { createHash as createHash2 } from "crypto";
import { createHash } from "crypto";
import { createContext, Script } from "vm";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
var AiRequestError = class extends Error {
  constructor(message, param, code, status = 400) {
    super(message);
    this.param = param;
    this.code = code;
    this.status = status;
    this.name = "AiRequestError";
  }
};
var AiConfigError = class extends Error {
  constructor(message, path) {
    super(`${path}: ${message}`);
    this.path = path;
    this.name = "AiConfigError";
  }
};
function defaultErrorType(status) {
  if (status === 429) return "rate_limit_error";
  if (status >= 500) return "server_error";
  return "invalid_request_error";
}
var MAX_OPENAI_FILE_BYTES = 5e7;
var MAX_OPENAI_IMAGE_BYTES = 512e6;
var IMAGE_TYPES = /* @__PURE__ */ new Set(["image/gif", "image/jpeg", "image/png", "image/webp"]);
var EXTENSION_TYPES = {
  csv: "text/csv",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  gif: "image/gif",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  json: "application/json",
  pdf: "application/pdf",
  png: "image/png",
  txt: "text/plain",
  webp: "image/webp"
};
function fail(message, path) {
  throw new AiRequestError(message, path, "invalid_attachment");
}
function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function optionalString(value, path) {
  if (value === void 0) return void 0;
  if (typeof value !== "string") fail("Expected a string.", path);
  return value;
}
function inferredMediaType(name) {
  const extension = name?.split(".").pop()?.toLowerCase();
  return extension !== void 0 && Object.hasOwn(EXTENSION_TYPES, extension) ? EXTENSION_TYPES[extension] : "application/octet-stream";
}
function stripUrl(url) {
  url.username = "";
  url.password = "";
  url.search = "";
  url.hash = "";
  return url.toString();
}
function checkedUrl(value, path) {
  if (typeof value !== "string") fail("Expected an HTTPS URL.", path);
  let url;
  try {
    url = new URL(value);
  } catch {
    return fail("Expected an HTTPS URL.", path);
  }
  if (url.protocol !== "https:") fail("Expected an HTTPS URL.", path);
  return stripUrl(url);
}
function redactedUrl(value, path) {
  if (typeof value !== "string") fail("Expected an HTTP or HTTPS URL.", path);
  let url;
  try {
    url = new URL(value);
  } catch {
    return fail("Expected an HTTP or HTTPS URL.", path);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") fail("Expected an HTTP or HTTPS URL.", path);
  return stripUrl(url);
}
function decodeBase64(value, path, maxBytes) {
  if (value.length > Math.ceil(maxBytes / 3) * 4 + 2) fail("Inline attachment exceeds the size limit.", path);
  if (value.length % 4 === 1 || !/^[A-Za-z0-9+/]*={0,2}$/.test(value)) {
    fail("Malformed base64 data.", path);
  }
  const unpadded = value.replace(/=+$/, "");
  if (value.includes("=") && value.length % 4 !== 0) fail("Malformed base64 data.", path);
  const normalized = unpadded + "=".repeat((4 - unpadded.length % 4) % 4);
  const bytes = Buffer.from(normalized, "base64");
  if (bytes.toString("base64").replace(/=+$/, "") !== unpadded) fail("Malformed base64 data.", path);
  if (bytes.length > maxBytes) fail("Inline attachment exceeds the size limit.", path);
  return bytes;
}
function inlineFilePart(value, mediaType, path, maxBytes, name) {
  const bytes = decodeBase64(value, path, maxBytes);
  return {
    type: "file",
    mediaType,
    ...name === void 0 ? {} : { name },
    source: "inline",
    bytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex")
  };
}
function inlineAttachment(value, name, path, maxBytes, rawAllowed) {
  let mediaType = inferredMediaType(name);
  let encoded = value;
  const dataUrl = /^data:([^;,]+);base64,(.*)$/s.exec(value);
  if (dataUrl) {
    mediaType = dataUrl[1].toLowerCase();
    encoded = dataUrl[2];
  } else if (value.startsWith("data:")) {
    fail("Malformed base64 data URL.", path);
  } else if (!rawAllowed) {
    fail("Expected a base64 data URL.", path);
  }
  if (!/^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/.test(mediaType)) {
    fail("Invalid attachment media type.", path);
  }
  return inlineFilePart(encoded, mediaType, path, maxBytes, name);
}
function requireDetail(value, path, allowed) {
  if (value !== void 0 && (typeof value !== "string" || !allowed.includes(value))) {
    fail(`Expected one of ${allowed.join(", ")}.`, path);
  }
}
function fileName(value, path) {
  const name = optionalString(value, path);
  if (name === "") fail("Filename must not be empty.", path);
  return name;
}
function responsesFile(part, path) {
  const name = fileName(part.filename, `${path}.filename`);
  requireDetail(part.detail, `${path}.detail`, ["auto", "low", "high"]);
  const sourceCount = [part.file_data, part.file_id, part.file_url].filter((value) => value !== void 0).length;
  if (sourceCount !== 1) fail("Provide exactly one of file_data, file_id, or file_url.", path);
  if (part.file_data !== void 0) {
    if (typeof part.file_data !== "string") fail("Expected a string.", `${path}.file_data`);
    return inlineAttachment(part.file_data, name, `${path}.file_data`, MAX_OPENAI_FILE_BYTES, true);
  }
  if (part.file_id !== void 0) {
    if (typeof part.file_id !== "string" || part.file_id.length === 0)
      fail("Expected a non-empty file id.", `${path}.file_id`);
    return {
      type: "file",
      mediaType: inferredMediaType(name),
      ...name === void 0 ? {} : { name },
      source: "file_id",
      ref: part.file_id
    };
  }
  const ref = checkedUrl(part.file_url, `${path}.file_url`);
  return {
    type: "file",
    mediaType: inferredMediaType(name ?? new URL(ref).pathname),
    ...name === void 0 ? {} : { name },
    source: "url",
    ref
  };
}
function responsesImage(part, path) {
  requireDetail(part.detail, `${path}.detail`, ["auto", "low", "high", "original"]);
  const sourceCount = [part.image_url, part.file_id].filter((value) => value !== void 0).length;
  if (sourceCount !== 1) fail("Provide exactly one of image_url or file_id.", path);
  if (part.file_id !== void 0) {
    if (typeof part.file_id !== "string" || part.file_id.length === 0)
      fail("Expected a non-empty file id.", `${path}.file_id`);
    return { type: "file", mediaType: "image/*", source: "file_id", ref: part.file_id };
  }
  return imageAttachment(part.image_url, `${path}.image_url`);
}
function urlAttachment(ref, kind) {
  const mediaType = inferredMediaType(new URL(ref).pathname);
  return {
    type: "file",
    mediaType: kind === "image" && !mediaType.startsWith("image/") ? "image/*" : mediaType,
    source: "url",
    ref
  };
}
function imageAttachment(value, path) {
  if (typeof value !== "string") fail("Expected an image URL.", path);
  if (value.startsWith("data:")) {
    const result = inlineAttachment(value, void 0, path, MAX_OPENAI_IMAGE_BYTES, false);
    if (!IMAGE_TYPES.has(result.mediaType)) fail("Unsupported image media type.", path);
    return result;
  }
  return urlAttachment(checkedUrl(value, path), "image");
}
function chatFile(part, path) {
  if (!isObject(part.file)) fail("Expected a file object.", `${path}.file`);
  const file = part.file;
  const name = fileName(file.filename, `${path}.file.filename`);
  if (file.file_url !== void 0) fail("Chat file parts do not support file_url.", `${path}.file.file_url`);
  const sourceCount = [file.file_data, file.file_id].filter((value) => value !== void 0).length;
  if (sourceCount !== 1) fail("Provide exactly one of file_data or file_id.", `${path}.file`);
  if (file.file_id !== void 0) {
    if (name !== void 0 && inferredMediaType(name) !== "application/pdf") {
      fail("Chat file attachments must be PDF files.", `${path}.file.filename`);
    }
    if (typeof file.file_id !== "string" || file.file_id.length === 0)
      fail("Expected a non-empty file id.", `${path}.file.file_id`);
    return {
      type: "file",
      mediaType: "application/pdf",
      ...name === void 0 ? {} : { name },
      source: "file_id",
      ref: file.file_id
    };
  }
  if (typeof file.file_data !== "string") fail("Expected a string.", `${path}.file.file_data`);
  const result = inlineAttachment(file.file_data, name, `${path}.file.file_data`, MAX_OPENAI_FILE_BYTES, true);
  if (result.mediaType !== "application/pdf") {
    const typeFromFilename = !file.file_data.startsWith("data:") && name !== void 0;
    fail(
      "Chat file attachments must be PDF files.",
      typeFromFilename ? `${path}.file.filename` : `${path}.file.file_data`
    );
  }
  return result;
}
function chatImage(part, path) {
  if (!isObject(part.image_url)) fail("Expected an image_url object.", `${path}.image_url`);
  const image = part.image_url;
  requireDetail(image.detail, `${path}.image_url.detail`, ["auto", "low", "high", "original"]);
  return imageAttachment(image.url, `${path}.image_url.url`);
}
function decodeChatAttachment(part, path) {
  if (!isObject(part)) return null;
  if (part.type === "file") return chatFile(part, path);
  if (part.type === "image_url") return chatImage(part, path);
  return null;
}
function decodeResponsesAttachment(part, path) {
  if (!isObject(part)) return null;
  if (part.type === "input_file") return responsesFile(part, path);
  if (part.type === "input_image") return responsesImage(part, path);
  return null;
}
function textChunks(value) {
  if (value.length === 0) return [];
  const pieces = [];
  let start = 0;
  let index = 0;
  while (index < value.length) {
    while (index < value.length && space.test(value[index])) index += 1;
    const wordStart = index;
    while (index < value.length && !space.test(value[index])) index += 1;
    if (index === wordStart) break;
    while (index < value.length && space.test(value[index])) index += 1;
    pieces.push(value.slice(start, index));
    start = index;
  }
  return pieces.length > 0 ? pieces : [value];
}
var jsonPieceFloor = 8;
var space = /\s/;
function jsonChunks(value) {
  if (value.length === 0) return [];
  const pieces = [];
  let start = 0;
  let inString = false;
  let escaped = false;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') {
      inString = true;
      continue;
    }
    const boundary = char === "," || char === ":" || char === "{" || char === "[" || char === "}" || char === "]";
    if (!boundary) continue;
    if (index + 1 - start < jsonPieceFloor && index !== value.length - 1) continue;
    pieces.push(value.slice(start, index + 1));
    start = index + 1;
  }
  if (start < value.length) pieces.push(value.slice(start));
  if (pieces.length === 0) pieces.push(value);
  return pieces;
}
function payloadChunks(value) {
  const pieces = textChunks(value);
  const trimmed = value.trim();
  if (pieces.length === 1 && trimmed.length > jsonPieceFloor && /^[[{]/.test(trimmed)) return jsonChunks(value);
  return pieces;
}
var OPENAI_REJECTED = ["allOf", "not", "dependentRequired", "dependentSchemas", "if", "then", "else"];
var ANTHROPIC_REJECTED = [
  "oneOf",
  "minimum",
  "maximum",
  "exclusiveMinimum",
  "exclusiveMaximum",
  "multipleOf",
  "minLength",
  "maxLength",
  "maxItems",
  "uniqueItems",
  "prefixItems",
  "contains",
  "minContains",
  "maxContains"
];
function dialectForModel(model) {
  return /(^|\/)claude/i.test(model) ? "anthropic" : "openai";
}
function record(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function children(node) {
  const found = [];
  const push = (path, value) => {
    if (typeof value === "boolean" || record(value)) found.push([path, value]);
  };
  if (record(node.properties)) {
    for (const [key, value] of Object.entries(node.properties)) push(["properties", key], value);
  }
  if (Array.isArray(node.items)) {
    node.items.forEach((value, index) => push(["items", String(index)], value));
  } else {
    push(["items"], node.items);
  }
  for (const keyword of ["anyOf", "oneOf", "allOf"]) {
    const branches = node[keyword];
    if (Array.isArray(branches)) {
      branches.forEach((value, index) => push([keyword, String(index)], value));
    }
  }
  for (const keyword of ["$defs", "definitions"]) {
    const definitions = node[keyword];
    if (record(definitions)) {
      for (const [key, value] of Object.entries(definitions)) push([keyword, key], value);
    }
  }
  push(["additionalProperties"], node.additionalProperties);
  if (record(node.patternProperties)) {
    for (const [key, value] of Object.entries(node.patternProperties)) push(["patternProperties", key], value);
  }
  return found;
}
function findAnthropicViolation(schema, depth = 0) {
  if (depth > 40 || typeof schema === "boolean" || !record(schema)) return null;
  if (typeof schema.$ref === "string" && !schema.$ref.startsWith("#")) {
    return "External '$ref' values are not supported";
  }
  for (const keyword of ANTHROPIC_REJECTED) {
    if (Object.hasOwn(schema, keyword)) {
      const type = typeof schema.type === "string" ? schema.type : void 0;
      return type === void 0 ? `Schema type '${keyword}' is not supported` : `For '${type}' type, property '${keyword}' is not supported`;
    }
  }
  if (Object.hasOwn(schema, "minItems") && schema.minItems !== 0 && schema.minItems !== 1) {
    return "For 'array' type, 'minItems' values other than 0 or 1 are not supported";
  }
  for (const [, child] of children(schema)) {
    const message = findAnthropicViolation(child, depth + 1);
    if (message) return message;
  }
  return null;
}
function contextOf(path) {
  return `(${path.map((key) => `'${key}'`).join(", ")})`;
}
function isObjectNode(schema) {
  const type = schema.type;
  return type === "object" || Array.isArray(type) && type.includes("object") || record(schema.properties);
}
function findOpenaiViolation(schema, name, subject, path = [], depth = 0) {
  if (depth > 40 || typeof schema === "boolean" || !record(schema)) return null;
  const at = (detail) => `Invalid schema for ${subject} '${name}': In context=${contextOf(path)}, ${detail}`;
  for (const keyword of OPENAI_REJECTED) {
    if (Object.hasOwn(schema, keyword)) return at(`'${keyword}' is not permitted.`);
  }
  if (isObjectNode(schema)) {
    if (schema.additionalProperties !== false) {
      return at("'additionalProperties' is required to be supplied and to be false.");
    }
    const properties = record(schema.properties) ? schema.properties : {};
    const required = Array.isArray(schema.required) ? schema.required : [];
    const missing = Object.keys(properties).find((key) => !required.includes(key));
    if (missing !== void 0) {
      return at(
        `'required' is required to be supplied and to be an array including every key in properties. Missing '${missing}'.`
      );
    }
  }
  for (const [segment, child] of children(schema)) {
    const message = findOpenaiViolation(child, name, subject, [...path, ...segment], depth + 1);
    if (message) return message;
  }
  return null;
}
function schemaFailure(dialect, schema, name, subject = "response_format") {
  if (dialect === "openai") return findOpenaiViolation(schema, name, subject);
  return findAnthropicViolation(schema);
}
function assertToolsSupported(model, tools, paramOf) {
  const dialect = dialectForModel(model);
  tools.forEach((tool, index) => {
    if (tool.strict !== true || tool.parameters === void 0) return;
    const message = schemaFailure(dialect, tool.parameters, tool.name, "function");
    if (message) {
      throw new AiRequestError(
        message,
        paramOf(index),
        dialect === "openai" ? "invalid_function_parameters" : void 0
      );
    }
  });
}
function assertSchemaSupported(dialect, schema, name, param) {
  const message = schemaFailure(dialect, schema, name);
  if (message) throw new AiRequestError(message, param);
}
function assertOutputSupported(model, output, params) {
  if (dialectForModel(model) === "anthropic") {
    if (output !== void 0 && output.kind !== "json_schema") {
      throw new AiRequestError("Expected a json_schema format with strict set to true.", params.format);
    }
    if (output?.kind === "json_schema" && output.strict !== true) {
      throw new AiRequestError("Expected strict to be true.", params.strict);
    }
    if (output?.kind === "json_schema") {
      assertSchemaSupported("anthropic", output.schema, output.name ?? "response", params.format);
    }
    return;
  }
  if (output?.kind === "json_schema" && output.strict === true) {
    assertSchemaSupported("openai", output.schema, output.name ?? "response", params.format);
  }
}
var MAX_INLINE_BYTES = 32e6;
var ERROR_TYPES = {
  400: "invalid_request_error",
  401: "authentication_error",
  403: "permission_error",
  404: "not_found_error",
  413: "request_too_large",
  429: "rate_limit_error",
  500: "api_error",
  529: "overloaded_error"
};
var FORMAT = "anthropic-messages";
function fail2(message, param) {
  throw new AiRequestError(message, param);
}
function unsupported(feature, param) {
  throw new AiRequestError(`Unsupported Messages feature: ${feature} (${param}).`, param, "unsupported_feature");
}
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function requireString(value, path) {
  if (typeof value !== "string" || value.length === 0) fail2("Expected a non-empty string.", path);
  return value;
}
function optionalString2(value, path) {
  if (value === void 0 || value === null) return void 0;
  if (typeof value !== "string") fail2("Expected a string.", path);
  return value;
}
function requireNumber(value, path) {
  if (typeof value !== "number" || !Number.isFinite(value)) fail2("Expected a number.", path);
  return value;
}
function optionalBoolean(value, path) {
  if (value === void 0 || value === null) return void 0;
  if (typeof value !== "boolean") fail2("Expected a boolean.", path);
  return value;
}
function textOfContent(value, path, nested) {
  if (value === void 0 || value === null) return "";
  if (typeof value === "string") return value;
  if (!Array.isArray(value)) fail2("Expected a string or an array of content blocks.", path);
  const texts = [];
  value.forEach((block, index) => {
    const blockPath = `${path}.${index}`;
    if (!isRecord(block)) fail2("Expected a content block object.", blockPath);
    if (block.type === "image") {
      nested.push(decodeFile(block, blockPath, "image"));
      return;
    }
    if (block.type === "document") {
      for (const part of decodeDocument(block, blockPath)) {
        if (part.type === "text") texts.push(part.text);
        else if (part.type === "file") nested.push(part);
      }
      return;
    }
    if (block.type === "text") {
      texts.push(requireString(block.text, `${blockPath}.text`));
      return;
    }
    if (block.type === "search_result") {
      texts.push(searchResultText(block, blockPath));
      return;
    }
    fail2(`Unsupported content block type "${String(block.type)}" in a tool result.`, `${blockPath}.type`);
  });
  return texts.join("\n");
}
function searchResultText(block, path) {
  requireString(block.source, `${path}.source`);
  const title = requireString(block.title, `${path}.title`);
  const content = block.content;
  if (!Array.isArray(content)) fail2("Expected an array of text blocks.", `${path}.content`);
  const texts = content.map((item, index) => {
    const itemPath = `${path}.content.${index}`;
    if (!isRecord(item) || item.type !== "text") fail2("Expected a text block.", itemPath);
    return requireString(item.text, `${itemPath}.text`);
  });
  return [title, ...texts].join("\n");
}
function decodeFile(block, path, kind) {
  const source = block.source;
  if (!isRecord(source)) fail2("Expected a source object.", `${path}.source`);
  if (source.type === "base64") {
    const mediaType = requireString(source.media_type, `${path}.source.media_type`);
    const allowed = kind === "image" ? IMAGE_TYPES.has(mediaType) : mediaType === "application/pdf";
    if (!allowed) {
      fail2(
        `Expected ${kind === "image" ? "image/jpeg, image/png, image/gif, or image/webp" : "application/pdf"}.`,
        `${path}.source.media_type`
      );
    }
    const data = requireString(source.data, `${path}.source.data`);
    return inlineFilePart(data, mediaType, `${path}.source.data`, MAX_INLINE_BYTES);
  }
  if (source.type === "url") {
    return urlAttachment(redactedUrl(source.url, `${path}.source.url`), kind === "image" ? "image" : "file");
  }
  if (source.type === "file") {
    return {
      type: "file",
      mediaType: kind === "image" ? "image/*" : "application/pdf",
      source: "file_id",
      ref: requireString(source.file_id, `${path}.source.file_id`)
    };
  }
  return fail2(`Unsupported source type "${String(source.type)}".`, `${path}.source.type`);
}
function decodeContentSource(content, path) {
  if (content === void 0 || content === null) return [];
  if (typeof content === "string") return [{ type: "text", text: content }];
  if (!Array.isArray(content)) fail2("Expected a string or an array of text and image blocks.", path);
  return content.flatMap((block, index) => {
    const blockPath = `${path}.${index}`;
    if (!isRecord(block)) fail2("Expected a content block object.", blockPath);
    switch (block.type) {
      case "text":
        return [{ type: "text", text: requireString(block.text, `${blockPath}.text`) }];
      case "image":
        return [decodeFile(block, blockPath, "image")];
      default:
        return fail2(`Unsupported content block type "${String(block.type)}" in a content source.`, `${blockPath}.type`);
    }
  });
}
function decodeDocument(block, path) {
  const source = block.source;
  if (!isRecord(source)) fail2("Expected a source object.", `${path}.source`);
  if (source.type === "text") {
    return [{ type: "text", text: requireString(source.data, `${path}.source.data`) }];
  }
  if (source.type === "content") {
    return decodeContentSource(source.content, `${path}.source.content`);
  }
  return [decodeFile(block, path, "document")];
}
function decodeBlock(block, path) {
  if (!isRecord(block)) fail2("Expected a content block object.", path);
  switch (block.type) {
    case "text":
      return [{ type: "text", text: requireString(block.text, `${path}.text`) }];
    case "image":
      return [decodeFile(block, path, "image")];
    case "document":
      return decodeDocument(block, path);
    case "search_result":
      return [{ type: "text", text: searchResultText(block, path) }];
    case "tool_use":
      return [
        {
          type: "tool_call",
          id: requireString(block.id, `${path}.id`),
          name: requireString(block.name, `${path}.name`),
          arguments: JSON.stringify(block.input ?? {})
        }
      ];
    case "tool_result": {
      const id = requireString(block.tool_use_id, `${path}.tool_use_id`);
      const name = optionalString2(block.name, `${path}.name`);
      const nested = [];
      const output = textOfContent(block.content, `${path}.content`, nested);
      return [
        ...nested,
        {
          type: "tool_result",
          id,
          ...name === void 0 ? {} : { name },
          output,
          ...block.is_error === true ? { isError: true } : {}
        }
      ];
    }
    case "thinking":
    case "redacted_thinking":
      return [{ type: "text", text: typeof block.thinking === "string" ? block.thinking : "" }];
    default:
      return fail2(`Unsupported content block type "${String(block.type)}".`, `${path}.type`);
  }
}
function decodeContent(content, path) {
  if (content === void 0 || content === null) return [];
  if (typeof content === "string") return [{ type: "text", text: content }];
  if (!Array.isArray(content)) fail2("Expected a string or an array of content blocks.", path);
  return content.flatMap((block, index) => decodeBlock(block, `${path}.${index}`));
}
function decodeUserMessage(content, path) {
  if (!Array.isArray(content)) return [{ role: "user", parts: decodeContent(content, path) }];
  const toolParts2 = [];
  const userParts2 = [];
  content.forEach((block, index) => {
    const parts = decodeBlock(block, `${path}.${index}`);
    const target = isRecord(block) && block.type === "tool_result" ? toolParts2 : userParts2;
    for (const part of parts) target.push(part);
  });
  const messages = [];
  if (toolParts2.length > 0) messages.push({ role: "tool", parts: toolParts2 });
  if (userParts2.length > 0 || messages.length === 0) messages.push({ role: "user", parts: userParts2 });
  return messages;
}
function decodeMessage(raw, path) {
  if (!isRecord(raw)) fail2("Expected a message object.", path);
  const role = raw.role;
  if (role !== "user" && role !== "assistant") fail2('Expected "user" or "assistant".', `${path}.role`);
  if (role === "assistant") return [{ role, parts: decodeContent(raw.content, `${path}.content`) }];
  return decodeUserMessage(raw.content, `${path}.content`);
}
function decodeSystem(raw) {
  if (raw === void 0 || raw === null) return [];
  return decodeContent(raw, "system");
}
function isServerTool(type) {
  return /^(web_search|web_fetch|code_execution|tool_search_tool_[a-z0-9]+)_|^mcp_toolset$/.test(type);
}
function decodeTools(raw) {
  if (raw === void 0 || raw === null) return [];
  if (!Array.isArray(raw)) fail2("Expected an array.", "tools");
  return raw.map((tool, index) => {
    const path = `tools.${index}`;
    if (!isRecord(tool)) fail2("Expected a tool object.", path);
    if (tool.type !== void 0 && tool.type !== null) {
      const type = requireString(tool.type, `${path}.type`);
      if (isServerTool(type)) unsupported("hosted tools", `${path}.type`);
    }
    const name = requireString(tool.name, `${path}.name`);
    const description = optionalString2(tool.description, `${path}.description`);
    const parameters = tool.input_schema;
    if (parameters !== void 0 && typeof parameters !== "boolean" && !isRecord(parameters)) {
      fail2("Expected a JSON Schema.", `${path}.input_schema`);
    }
    if (optionalBoolean(tool.strict, `${path}.strict`) === true && parameters !== void 0) {
      assertSchemaSupported("anthropic", parameters, name, `${path}.input_schema`);
    }
    return {
      name,
      ...description === void 0 ? {} : { description },
      ...parameters === void 0 ? {} : { parameters }
    };
  });
}
function decodeToolChoice(raw) {
  if (raw === void 0 || raw === null) return "auto";
  if (!isRecord(raw)) fail2("Expected a tool_choice object.", "tool_choice");
  switch (raw.type) {
    case "auto":
      return "auto";
    case "any":
      return "required";
    case "none":
      return "none";
    case "tool":
      return { name: requireString(raw.name, "tool_choice.name") };
    default:
      return fail2(`Unsupported tool choice type "${String(raw.type)}".`, "tool_choice.type");
  }
}
function decodeOutput(raw) {
  if (raw === void 0 || raw === null) return void 0;
  if (!isRecord(raw)) fail2("Expected an output_config object.", "output_config");
  const format = raw.format;
  if (format === void 0 || format === null) return void 0;
  if (!isRecord(format)) fail2("Expected a format object.", "output_config.format");
  if (format.type === "text") return void 0;
  if (format.type !== "json_schema") {
    fail2(`Unsupported output format "${String(format.type)}".`, "output_config.format.type");
  }
  const schema = format.schema;
  if (typeof schema !== "boolean" && !isRecord(schema)) fail2("Expected a JSON Schema.", "output_config.format.schema");
  assertSchemaSupported("anthropic", schema, "response", "output_config.format.schema");
  return { kind: "json_schema", schema };
}
function decodeStopSequences(raw) {
  if (raw === void 0 || raw === null) return void 0;
  if (!Array.isArray(raw)) fail2("Expected an array of strings.", "stop_sequences");
  return raw.map((value, index) => requireString(value, `stop_sequences.${index}`));
}
function decode(body, ctx) {
  void ctx;
  if (!isRecord(body)) fail2("Expected a JSON object body.");
  const model = requireString(body.model, "model");
  const maxTokens = requireNumber(body.max_tokens, "max_tokens");
  if (!Number.isInteger(maxTokens) || maxTokens <= 0) fail2("Expected a positive integer.", "max_tokens");
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    fail2("Expected a non-empty array of messages.", "messages");
  }
  const messages = [];
  const system = decodeSystem(body.system);
  if (system.length > 0) messages.push({ role: "system", parts: system });
  body.messages.forEach((message, index) => {
    for (const decoded of decodeMessage(message, `messages.${index}`)) messages.push(decoded);
  });
  const request = {
    format: FORMAT,
    model,
    messages,
    tools: decodeTools(body.tools),
    toolChoice: decodeToolChoice(body.tool_choice),
    parallelToolCalls: true,
    stream: optionalBoolean(body.stream, "stream") ?? false,
    output: decodeOutput(body.output_config),
    reasoning: body.thinking !== void 0 && body.thinking !== null,
    maxOutputTokens: maxTokens,
    stop: decodeStopSequences(body.stop_sequences),
    store: false,
    references: [],
    warnings: []
  };
  return { request, extras: {} };
}
function stopReason(finish) {
  switch (finish) {
    case "tool_calls":
      return "tool_use";
    case "length":
      return "max_tokens";
    case "refusal":
    case "content_filter":
      return "refusal";
    default:
      return "end_turn";
  }
}
function stopFields(reply) {
  if (reply.finish === "stop" && reply.stopSequence !== void 0) {
    return { stop_reason: "stop_sequence", stop_sequence: reply.stopSequence };
  }
  return { stop_reason: stopReason(reply.finish), stop_sequence: null };
}
function signatureOf(thinking) {
  return createHash2("sha256").update(thinking).digest("base64");
}
function contentBlocks(events) {
  const blocks = [];
  for (const event of events) {
    switch (event.type) {
      case "reasoning":
        blocks.push({ type: "thinking", thinking: event.text, signature: signatureOf(event.text) });
        break;
      case "text":
      case "refusal":
        blocks.push({ type: "text", text: event.text });
        break;
      case "object":
        blocks.push({ type: "text", text: JSON.stringify(event.value) });
        break;
      case "tool_call":
        blocks.push({ type: "tool_use", id: event.id, name: event.name, input: JSON.parse(event.arguments) });
        break;
    }
  }
  return blocks;
}
function usageOf(reply) {
  return { input_tokens: reply.usage.input, output_tokens: reply.usage.output };
}
function encodeJson(reply, decoded, ctx) {
  return {
    id: ctx.makeId("msg"),
    type: "message",
    role: "assistant",
    model: decoded.request.model,
    content: contentBlocks(reply.events),
    ...stopFields(reply),
    usage: usageOf(reply)
  };
}
function streamFrames(reply, decoded, ctx) {
  const frames = [];
  const model = decoded.request.model;
  frames.push({
    event: "message_start",
    data: {
      type: "message_start",
      message: {
        id: ctx.makeId("msg"),
        type: "message",
        role: "assistant",
        model,
        content: [],
        stop_reason: null,
        stop_sequence: null,
        usage: { input_tokens: reply.usage.input, output_tokens: 0 }
      }
    }
  });
  let index = 0;
  const emit = (block, deltas) => {
    frames.push({ event: "content_block_start", data: { type: "content_block_start", index, content_block: block } });
    for (const { delta, content } of deltas) {
      frames.push({
        event: "content_block_delta",
        data: { type: "content_block_delta", index, delta },
        ...content === void 0 ? {} : { content }
      });
    }
    frames.push({ event: "content_block_stop", data: { type: "content_block_stop", index } });
    index += 1;
  };
  const textDeltas = (pieces) => pieces.map((piece) => ({ delta: { type: "text_delta", text: piece }, content: piece }));
  for (const event of reply.events) {
    switch (event.type) {
      case "reasoning":
        emit({ type: "thinking", thinking: "", signature: "" }, [
          ...payloadChunks(event.text).map((piece) => ({ delta: { type: "thinking_delta", thinking: piece } })),
          { delta: { type: "signature_delta", signature: signatureOf(event.text) } }
        ]);
        break;
      case "text":
      case "refusal":
        emit({ type: "text", text: "" }, textDeltas(payloadChunks(event.text)));
        break;
      case "object":
        emit({ type: "text", text: "" }, textDeltas(jsonChunks(JSON.stringify(event.value))));
        break;
      case "tool_call":
        emit(
          { type: "tool_use", id: event.id, name: event.name, input: {} },
          jsonChunks(event.arguments).map((piece) => ({
            delta: { type: "input_json_delta", partial_json: piece },
            content: piece
          }))
        );
        break;
    }
  }
  frames.push({
    event: "message_delta",
    data: {
      type: "message_delta",
      delta: stopFields(reply),
      usage: { output_tokens: reply.usage.output }
    }
  });
  frames.push({ event: "message_stop", data: { type: "message_stop" } });
  return frames;
}
function errorBody(failure, requestId) {
  const named = failure.param === void 0 || failure.message.includes(failure.param);
  return {
    type: "error",
    error: {
      type: failure.type ?? ERROR_TYPES[failure.status] ?? "api_error",
      message: named ? failure.message : `${failure.param}: ${failure.message}`
    },
    request_id: requestId
  };
}
var messagesCodec = {
  format: FORMAT,
  decode,
  encodeJson,
  streamFrames,
  errorBody
};
var CREATED_AT = 173e7;
var MAX_PAIRS = 16;
var MAX_KEY = 64;
var MAX_VALUE = 512;
function decodeMetadata(raw) {
  if (raw === void 0 || raw === null) return {};
  if (typeof raw !== "object" || Array.isArray(raw)) {
    throw new AiRequestError("Expected an object for 'metadata'.", "metadata");
  }
  const entries = Object.entries(raw);
  if (entries.length > MAX_PAIRS) {
    throw new AiRequestError(`Expected at most ${MAX_PAIRS} key-value pairs for 'metadata'.`, "metadata");
  }
  const metadata = {};
  for (const [key, value] of entries) {
    const param = `metadata.${key}`;
    if (key.length > MAX_KEY) {
      throw new AiRequestError(`Expected a key of at most ${MAX_KEY} characters in 'metadata'.`, "metadata");
    }
    if (typeof value !== "string") throw new AiRequestError(`Expected a string for '${param}'.`, param);
    if (value.length > MAX_VALUE) {
      throw new AiRequestError(`Expected a string of at most ${MAX_VALUE} characters for '${param}'.`, param);
    }
    metadata[key] = value;
  }
  return metadata;
}
var FORMAT2 = "openai-chat";
var REASONING_EFFORTS = ["none", "minimal", "low", "medium", "high", "xhigh", "max"];
function isRecord2(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function fail3(message, param, code) {
  throw new AiRequestError(message, param, code);
}
function unsupported2(param, feature) {
  throw new AiRequestError(
    `Unsupported Chat Completions feature: ${feature} (${param}).`,
    param,
    "unsupported_feature"
  );
}
function expectString(value, path, nonEmpty = false) {
  if (typeof value !== "string") fail3("Expected a string.", path);
  if (nonEmpty && value.length === 0) fail3("Expected a non-empty string.", path);
  return value;
}
function expectBoolean(value, path) {
  if (typeof value !== "boolean") fail3("Expected a boolean.", path);
  return value;
}
function expectInteger(value, path, minimum = 0) {
  if (typeof value !== "number" || !Number.isInteger(value)) fail3("Expected an integer.", path);
  if (value < minimum) fail3(`Expected an integer greater than or equal to ${minimum}.`, path);
  return value;
}
function textParts(content, path) {
  if (typeof content === "string") return [{ type: "text", text: content }];
  if (!Array.isArray(content)) fail3("Expected a string or an array of text parts.", path);
  return content.map((part, index) => {
    if (!isRecord2(part) || part.type !== "text") fail3("Expected a text content part.", `${path}[${index}]`);
    return { type: "text", text: expectString(part.text, `${path}[${index}].text`) };
  });
}
function userParts(content, path) {
  if (typeof content === "string") return [{ type: "text", text: content }];
  if (!Array.isArray(content)) fail3("Expected a string or an array of content parts.", path);
  return content.flatMap((part, index) => {
    const at = `${path}[${index}]`;
    if (!isRecord2(part)) fail3("Expected a content part.", at);
    switch (part.type) {
      case "text":
        return [{ type: "text", text: expectString(part.text, `${at}.text`) }];
      case "image_url":
      case "file": {
        const file = decodeChatAttachment(part, at);
        if (!file) fail3("Expected an attachment part.", at);
        return [file];
      }
      case "input_audio":
        return unsupported2(`${at}.input_audio`, "audio input");
      case void 0:
        return fail3("Expected a content part type.", `${at}.type`);
      default:
        return unsupported2(`${at}.${String(part.type)}`, `content part "${String(part.type)}"`);
    }
  });
}
function assistantParts(message, path) {
  const parts = [];
  if (message.content !== void 0 && message.content !== null) {
    if (typeof message.content === "string") {
      parts.push({ type: "text", text: message.content });
    } else if (Array.isArray(message.content)) {
      message.content.forEach((part, index) => {
        const at = `${path}.content[${index}]`;
        if (!isRecord2(part)) fail3("Expected a content part.", at);
        if (part.type === "text") parts.push({ type: "text", text: expectString(part.text, `${at}.text`) });
        else if (part.type === "refusal") {
          parts.push({ type: "text", text: expectString(part.refusal, `${at}.refusal`) });
        } else unsupported2(`${at}.${String(part.type)}`, `assistant content part "${String(part.type)}"`);
      });
    } else {
      fail3("Expected a string or an array of assistant content parts.", `${path}.content`);
    }
  }
  if (message.refusal !== void 0 && message.refusal !== null) {
    parts.push({ type: "text", text: expectString(message.refusal, `${path}.refusal`) });
  }
  if (message.function_call !== void 0 && message.function_call !== null) {
    unsupported2(`${path}.function_call`, "legacy function_call");
  }
  if (message.tool_calls !== void 0) {
    if (!Array.isArray(message.tool_calls)) fail3("Expected an array of tool calls.", `${path}.tool_calls`);
    message.tool_calls.forEach((call, index) => {
      const at = `${path}.tool_calls[${index}]`;
      if (!isRecord2(call)) fail3("Expected a tool call.", at);
      if (call.type !== "function") {
        unsupported2(`${at}.type`, call.type === "custom" ? "custom tools" : `tool call type "${String(call.type)}"`);
      }
      const fn = call.function;
      if (!isRecord2(fn)) fail3("Expected a function object.", `${at}.function`);
      parts.push({
        type: "tool_call",
        id: expectString(call.id, `${at}.id`, true),
        name: expectString(fn.name, `${at}.function.name`, true),
        arguments: expectString(fn.arguments, `${at}.function.arguments`)
      });
    });
  }
  if (parts.length === 0 && message.tool_calls === void 0) {
    fail3("Assistant messages require content or tool_calls.", path);
  }
  return parts;
}
function toolParts(message, path) {
  const id = expectString(message.tool_call_id, `${path}.tool_call_id`, true);
  const output = textParts(message.content, `${path}.content`).map((part) => part.type === "text" ? part.text : "").join("");
  return [{ type: "tool_result", id, output }];
}
function decodeMessage2(raw, index) {
  const path = `messages[${index}]`;
  if (!isRecord2(raw)) fail3("Expected a message object.", path);
  const role = raw.role;
  switch (role) {
    case "system":
    case "developer":
      return { role, parts: textParts(raw.content, `${path}.content`) };
    case "user":
      return { role, parts: userParts(raw.content, `${path}.content`) };
    case "assistant":
      return { role, parts: assistantParts(raw, path) };
    case "tool":
      return { role, parts: toolParts(raw, path) };
    case "function":
      return unsupported2(`${path}.role`, "legacy function messages");
    case void 0:
      return fail3("Expected a message role.", `${path}.role`);
    default:
      return fail3(`Unsupported message role "${String(role)}".`, `${path}.role`);
  }
}
function checkToolPairing(messages) {
  let pending = /* @__PURE__ */ new Set();
  let openedAt = -1;
  const unanswered = () => fail3(
    `An assistant message with 'tool_calls' must be followed by tool messages responding to each 'tool_call_id'. The following tool_call_ids did not have response messages: ${[...pending].join(", ")}`,
    `messages[${openedAt}].role`
  );
  messages.forEach((message, index) => {
    if (message.role === "tool") {
      const part = message.parts[0];
      if (part?.type !== "tool_result" || !pending.delete(part.id)) {
        fail3(
          "Invalid parameter: messages with role 'tool' must be a response to a preceding message with 'tool_calls'.",
          `messages[${index}].role`
        );
      }
      return;
    }
    if (pending.size > 0) unanswered();
    const ids = message.parts.flatMap((part) => part.type === "tool_call" ? [part.id] : []);
    pending = new Set(ids);
    openedAt = index;
  });
  if (pending.size > 0) unanswered();
}
function decodeTools2(raw) {
  if (raw === void 0) return [];
  if (!Array.isArray(raw)) fail3("Expected an array of tools.", "tools");
  return raw.map((tool, index) => {
    const at = `tools[${index}]`;
    if (!isRecord2(tool)) fail3("Expected a tool object.", at);
    if (tool.type !== "function") {
      unsupported2(`${at}.type`, tool.type === "custom" ? "custom tools" : "hosted tools");
    }
    const fn = tool.function;
    if (!isRecord2(fn)) fail3("Expected a function object.", `${at}.function`);
    const parameters = fn.parameters;
    if (parameters !== void 0 && typeof parameters !== "boolean" && !isRecord2(parameters)) {
      fail3("Expected a JSON Schema object.", `${at}.function.parameters`);
    }
    const definition = { name: expectString(fn.name, `${at}.function.name`, true) };
    if (fn.description !== void 0) {
      definition.description = expectString(fn.description, `${at}.function.description`);
    }
    if (parameters !== void 0) definition.parameters = parameters;
    if (fn.strict !== void 0 && fn.strict !== null && expectBoolean(fn.strict, `${at}.function.strict`)) {
      definition.strict = true;
    }
    return definition;
  });
}
function decodeToolChoice2(raw, hasTools) {
  if (raw === void 0 || raw === null) return hasTools ? "auto" : "none";
  if (raw === "none" || raw === "auto" || raw === "required") return raw;
  if (!isRecord2(raw)) fail3("Expected a tool choice.", "tool_choice");
  if (raw.type === "function") {
    if (!isRecord2(raw.function)) fail3("Expected a function object.", "tool_choice.function");
    return { name: expectString(raw.function.name, "tool_choice.function.name", true) };
  }
  if (raw.type === "allowed_tools") return unsupported2("tool_choice.allowed_tools", "allowed tools");
  if (raw.type === "custom") return unsupported2("tool_choice", "custom tools");
  return fail3("Expected a supported tool choice.", "tool_choice");
}
function decodeOutput2(raw) {
  if (raw === void 0 || raw === null) return void 0;
  if (!isRecord2(raw)) fail3("Expected a response_format object.", "response_format");
  switch (raw.type) {
    case "text":
      return void 0;
    case "json_object":
      return { kind: "json_object" };
    case "json_schema": {
      const jsonSchema = raw.json_schema;
      if (!isRecord2(jsonSchema)) fail3("Expected a json_schema object.", "response_format.json_schema");
      if (jsonSchema.schema === void 0) fail3("Expected a schema.", "response_format.json_schema.schema");
      if (typeof jsonSchema.schema !== "boolean" && !isRecord2(jsonSchema.schema)) {
        fail3("Expected a JSON Schema object.", "response_format.json_schema.schema");
      }
      if (jsonSchema.strict !== void 0 && jsonSchema.strict !== null && typeof jsonSchema.strict !== "boolean") {
        fail3("Expected a boolean.", "response_format.json_schema.strict");
      }
      return {
        kind: "json_schema",
        ...jsonSchema.name === void 0 ? {} : { name: expectString(jsonSchema.name, "response_format.json_schema.name", true) },
        ...jsonSchema.strict === true ? { strict: true } : {},
        schema: jsonSchema.schema
      };
    }
    default:
      return unsupported2(`response_format.${String(raw.type)}`, `response format "${String(raw.type)}"`);
  }
}
function decodeStop(raw) {
  if (raw === void 0 || raw === null) return void 0;
  if (typeof raw === "string") return [raw];
  if (!Array.isArray(raw)) fail3("Expected a string or an array of strings.", "stop");
  return raw.map((value, index) => expectString(value, `stop[${index}]`));
}
function decodeMaxTokens(raw) {
  const value = raw.max_completion_tokens ?? raw.max_tokens;
  if (value === void 0 || value === null) return void 0;
  return expectInteger(value, raw.max_completion_tokens !== void 0 ? "max_completion_tokens" : "max_tokens");
}
function decodeReasoning(raw) {
  if (raw === void 0 || raw === null) return false;
  const effort = expectString(raw, "reasoning_effort", true);
  if (!REASONING_EFFORTS.includes(effort)) {
    fail3(`Expected one of ${REASONING_EFFORTS.join(", ")}.`, "reasoning_effort");
  }
  return effort !== "none";
}
function decodeChat(body) {
  if (!isRecord2(body)) fail3("Expected a JSON object request body.", "body");
  if (body.audio !== void 0 && body.audio !== null) unsupported2("audio", "audio output");
  if (body.modalities !== void 0 && body.modalities !== null) {
    const modalities = body.modalities;
    if (!Array.isArray(modalities) || modalities.some((value) => value !== "text")) {
      unsupported2("modalities", "audio output");
    }
  }
  if (body.web_search_options !== void 0 && body.web_search_options !== null) {
    unsupported2("web_search_options", "hosted tools");
  }
  if (body.background === true) unsupported2("background", "background mode");
  decodeMetadata(body.metadata);
  if (body.conversation !== void 0 && body.conversation !== null) unsupported2("conversation", "conversations");
  if (body.conversations !== void 0 && body.conversations !== null) unsupported2("conversations", "conversations");
  if (body.functions !== void 0) {
    if (!Array.isArray(body.functions)) fail3("Expected an array of functions.", "functions");
    if (body.functions.length > 0) unsupported2("functions", "legacy functions");
  }
  if (body.function_call !== void 0 && body.function_call !== null && body.function_call !== "none") {
    unsupported2("function_call", "legacy function_call");
  }
  const model = expectString(body.model, "model", true);
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    fail3("Expected a non-empty array of messages.", "messages");
  }
  const messages = body.messages.map((message, index) => decodeMessage2(message, index));
  checkToolPairing(messages);
  const tools = decodeTools2(body.tools);
  assertToolsSupported(model, tools, (index) => `tools[${index}].function.parameters`);
  const toolChoice = decodeToolChoice2(body.tool_choice, tools.length > 0);
  const output = decodeOutput2(body.response_format);
  assertOutputSupported(model, output, { format: "response_format", strict: "response_format.json_schema.strict" });
  const stream = body.stream === void 0 || body.stream === null ? false : expectBoolean(body.stream, "stream");
  const store = body.store === void 0 || body.store === null ? false : expectBoolean(body.store, "store");
  const parallelToolCalls = body.parallel_tool_calls === void 0 ? true : expectBoolean(body.parallel_tool_calls, "parallel_tool_calls");
  let includeUsage = false;
  if (body.stream_options !== void 0 && body.stream_options !== null) {
    if (!isRecord2(body.stream_options)) fail3("Expected a stream_options object.", "stream_options");
    if (body.stream_options.include_usage !== void 0) {
      includeUsage = expectBoolean(body.stream_options.include_usage, "stream_options.include_usage");
    }
  }
  if (body.n !== void 0 && body.n !== null) {
    const n = expectInteger(body.n, "n", 1);
    if (n !== 1) unsupported2("n", "multiple candidates");
  }
  const maxOutputTokens = decodeMaxTokens(body);
  const stop = decodeStop(body.stop);
  const request = {
    format: FORMAT2,
    model,
    messages,
    tools,
    toolChoice,
    parallelToolCalls,
    stream,
    ...output === void 0 ? {} : { output },
    reasoning: decodeReasoning(body.reasoning_effort),
    ...maxOutputTokens === void 0 ? {} : { maxOutputTokens },
    ...stop === void 0 ? {} : { stop },
    store,
    references: [],
    warnings: []
  };
  const extras = { includeUsage };
  return { request, extras };
}
function usageBody(reply) {
  return {
    prompt_tokens: reply.usage.input,
    completion_tokens: reply.usage.output,
    total_tokens: reply.usage.input + reply.usage.output,
    prompt_tokens_details: { cached_tokens: 0 },
    completion_tokens_details: { reasoning_tokens: reply.usage.reasoning }
  };
}
function finishReason(finish) {
  switch (finish) {
    case "stop":
    case "refusal":
      return "stop";
    case "tool_calls":
      return "tool_calls";
    case "length":
      return "length";
    case "content_filter":
      return "content_filter";
  }
}
function toolCallsOf(events) {
  const calls = [];
  for (const event of events) {
    if (event.type !== "tool_call") continue;
    calls.push({
      id: event.id,
      type: "function",
      function: { name: event.name, arguments: event.arguments }
    });
  }
  return calls;
}
function textOf(events) {
  let text = "";
  let refusal = "";
  for (const event of events) {
    if (event.type === "text") text += event.text;
    else if (event.type === "object") text += JSON.stringify(event.value);
    else if (event.type === "refusal") refusal += event.text;
  }
  return { text, refusal };
}
function encodeJson2(reply, decoded, ctx) {
  const { text, refusal } = textOf(reply.events);
  const toolCalls = toolCallsOf(reply.events);
  const message = {
    role: "assistant",
    content: text.length > 0 ? text : null,
    refusal: refusal.length > 0 ? refusal : null,
    annotations: [],
    ...toolCalls.length > 0 ? { tool_calls: toolCalls } : {}
  };
  const body = {
    id: ctx.makeId("chatcmpl").replace("_", "-"),
    object: "chat.completion",
    created: CREATED_AT,
    model: decoded.request.model,
    choices: [
      {
        index: 0,
        message,
        logprobs: null,
        finish_reason: finishReason(reply.finish)
      }
    ],
    usage: usageBody(reply)
  };
  return body;
}
function chunk(id, model, delta, choiceFinish, includeUsage, usage = null) {
  return {
    id,
    object: "chat.completion.chunk",
    created: CREATED_AT,
    model,
    choices: [{ index: 0, delta, logprobs: null, finish_reason: choiceFinish }],
    ...includeUsage ? { usage } : {}
  };
}
function streamFrames2(reply, decoded, ctx) {
  const { includeUsage } = decoded.extras;
  const id = ctx.makeId("chatcmpl").replace("_", "-");
  const model = decoded.request.model;
  const frames = [{ data: chunk(id, model, { role: "assistant", content: "" }, null, includeUsage) }];
  let toolIndex = 0;
  for (const event of reply.events) {
    switch (event.type) {
      case "reasoning":
        break;
      case "text":
      case "object": {
        const text = event.type === "text" ? event.text : JSON.stringify(event.value);
        const pieces = event.type === "text" ? textChunks(text) : jsonChunks(text);
        for (const piece of pieces) {
          frames.push({
            data: chunk(id, model, { content: piece }, null, includeUsage),
            content: piece
          });
        }
        break;
      }
      case "refusal": {
        for (const piece of textChunks(event.text)) {
          frames.push({
            data: chunk(id, model, { refusal: piece }, null, includeUsage),
            content: piece
          });
        }
        break;
      }
      case "tool_call": {
        const index = toolIndex;
        toolIndex += 1;
        frames.push({
          data: chunk(
            id,
            model,
            {
              tool_calls: [
                {
                  index,
                  id: event.id,
                  type: "function",
                  function: { name: event.name, arguments: "" }
                }
              ]
            },
            null,
            includeUsage
          )
        });
        for (const piece of jsonChunks(event.arguments)) {
          frames.push({
            data: chunk(id, model, { tool_calls: [{ index, function: { arguments: piece } }] }, null, includeUsage),
            content: piece
          });
        }
        break;
      }
    }
  }
  frames.push({
    data: chunk(id, model, {}, finishReason(reply.finish), includeUsage)
  });
  if (includeUsage) {
    frames.push({
      data: {
        id,
        object: "chat.completion.chunk",
        created: CREATED_AT,
        model,
        choices: [],
        usage: usageBody(reply)
      }
    });
  }
  frames.push({ data: "[DONE]" });
  return frames;
}
function errorBody2(failure) {
  return {
    error: {
      message: failure.message,
      type: failure.type ?? defaultErrorType(failure.status),
      param: failure.param ?? null,
      code: failure.code ?? null
    }
  };
}
var chatCodec = {
  format: FORMAT2,
  decode: (body) => decodeChat(body),
  encodeJson: encodeJson2,
  streamFrames: streamFrames2,
  errorBody: errorBody2
};
function currentTurn(request) {
  const { messages, tools, toolChoice } = request;
  const roles = messages.map((message) => message.role);
  const user = messages[roles.lastIndexOf("user")];
  const continuation = messages.slice(roles.lastIndexOf("assistant") + 1);
  const attached = [...user ? [user] : [], ...continuation.filter((message) => message.role === "tool")];
  const pendingResult = messages.at(-1)?.parts.filter(isToolResult).at(-1);
  const forcedTool = typeof toolChoice === "object" ? tools.find((tool) => tool.name === toolChoice.name) : toolChoice === "required" ? tools[0] : void 0;
  if (!forcedTool && toolChoice !== "auto" && toolChoice !== "none") {
    throw new AiRequestError("Forced tool choice requires a declared tool.", "tool_choice");
  }
  return {
    text: (user?.parts ?? []).filter(isText).map((part) => part.text).join(""),
    files: attached.flatMap((message) => message.parts.filter(isFile)),
    toolResults: continuation.flatMap((message) => message.parts.filter(isToolResult)),
    ...pendingResult ? { pendingResult } : {},
    ...forcedTool ? { forcedTool } : {}
  };
}
function isText(part) {
  return part.type === "text";
}
function isFile(part) {
  return part.type === "file";
}
function isToolResult(part) {
  return part.type === "tool_result";
}
var DEFAULT_TIMING = { ttftMs: 0, chunkDelayMs: 0 };
var DEFAULT_SEED = 1;
var MAX_TIMER_MS = 2147483647;
var CONFIG_KEYS = /* @__PURE__ */ new Set(["port", "baseUrl", "strict", "timing", "random", "models", "rules"]);
var RANDOM_KEYS = /* @__PURE__ */ new Set(["seed"]);
var VARIANT_KEYS = /* @__PURE__ */ new Set(["reply", "error", "finish", "timing", "fault"]);
var TIMING_KEYS = /* @__PURE__ */ new Set(["ttftMs", "chunkDelayMs"]);
var MATCH_KEYS = /* @__PURE__ */ new Set(["model", "format", "stream", "textContains", "tool", "hasToolResult", "file"]);
var RULE_KEYS = /* @__PURE__ */ new Set(["id", "match", "times", "reply", "variants", "finish", "error", "fault", "timing"]);
var ERROR_KEYS = /* @__PURE__ */ new Set(["status", "message", "type", "code", "param", "headers"]);
var FAULT_KEYS = /* @__PURE__ */ new Set(["afterChunks", "kind", "stallMs"]);
var TEXT_EVENT_KEYS = /* @__PURE__ */ new Set(["type", "text"]);
var OBJECT_EVENT_KEYS = /* @__PURE__ */ new Set(["type", "value"]);
var TOOL_CALL_EVENT_KEYS = /* @__PURE__ */ new Set(["type", "name", "arguments", "id"]);
var FORMATS = /* @__PURE__ */ new Set(["openai-chat", "openai-responses", "anthropic-messages"]);
var FINISH_REASONS = /* @__PURE__ */ new Set(["stop", "tool_calls", "length", "refusal", "content_filter"]);
var FAULT_KINDS = /* @__PURE__ */ new Set(["disconnect", "stall"]);
function parseConfig(raw) {
  if (raw === void 0 || raw === null) {
    return { strict: false, timing: { ...DEFAULT_TIMING }, random: { seed: DEFAULT_SEED }, models: [], rules: [] };
  }
  let configRaw;
  let rulesRaw;
  if (Array.isArray(raw)) {
    configRaw = {};
    rulesRaw = raw;
  } else if (isRecord3(raw)) {
    configRaw = raw;
    assertKnownKeys(configRaw, CONFIG_KEYS, "");
    rulesRaw = configRaw.rules;
  } else {
    throw new AiConfigError("expected an object or an array of rules", "config");
  }
  const strict = configRaw.strict === void 0 ? false : expectBoolean2(configRaw.strict, "strict");
  const timing = {
    ...DEFAULT_TIMING,
    ...parseTimingFields(configRaw.timing === void 0 ? {} : configRaw.timing, "timing")
  };
  const random = parseRandom(configRaw.random);
  const models = parseModels(configRaw.models);
  if (configRaw.port !== void 0) {
    const port = expectInteger2(configRaw.port, "port", 1);
    if (port > 65535) throw new AiConfigError("expected a port between 1 and 65535", "port");
  }
  if (configRaw.baseUrl !== void 0) expectString2(configRaw.baseUrl, "baseUrl", true);
  if (rulesRaw !== void 0 && !Array.isArray(rulesRaw)) {
    throw new AiConfigError("expected an array of rules", "rules");
  }
  const rules = (rulesRaw ?? []).map((rule, index) => parseRule(rule, `rules[${index}]`));
  assertUniqueRuleIds(rules);
  return { strict, timing, random, models, rules };
}
function initialBudgets(config) {
  const budgets = /* @__PURE__ */ new Map();
  for (const rule of config.rules) {
    budgets.set(rule.id, rule.times === void 0 ? null : rule.times);
  }
  return budgets;
}
function matchRule(config, budgets, request) {
  const exhausted = [];
  const turn = currentTurn(request);
  for (const rule of config.rules) {
    if (!matches(rule.match, request, turn)) continue;
    const remaining = budgetOf(rule, budgets);
    if (remaining !== null && remaining <= 0) {
      exhausted.push(rule.id);
      continue;
    }
    const next = remaining === null ? null : remaining - 1;
    budgets.set(rule.id, next);
    return { rule, snapshot: { id: rule.id, remaining: next, rule: structuredClone(rule) } };
  }
  return { exhausted };
}
function ruleEvents(rule, makeId) {
  if (!rule.reply) return [];
  return rule.reply.map((event) => {
    switch (event.type) {
      case "reasoning":
        return { type: "reasoning", text: event.text };
      case "text":
        return { type: "text", text: event.text };
      case "object":
        return { type: "object", value: event.value };
      case "refusal":
        return { type: "refusal", text: event.text };
      case "tool_call":
        return {
          type: "tool_call",
          id: event.id ?? makeId(),
          name: event.name,
          arguments: JSON.stringify(event.arguments)
        };
      default:
        throw new Error("unknown reply event");
    }
  });
}
function rulesView(config, budgets) {
  return config.rules.map((rule) => ({
    ...rule,
    remaining: rule.times === void 0 ? null : budgets.get(rule.id) ?? rule.times
  }));
}
function matches(match, request, turn) {
  if (match.format !== void 0 && match.format !== request.format) return false;
  if (match.stream !== void 0 && match.stream !== request.stream) return false;
  if (match.model !== void 0 && !globMatch(match.model, request.model)) return false;
  if (match.textContains !== void 0 && !turn.text.includes(match.textContains)) return false;
  const toolPattern = match.tool;
  if (toolPattern !== void 0 && !request.tools.some((tool) => globMatch(toolPattern, tool.name))) return false;
  if (match.hasToolResult !== void 0 && turn.toolResults.length > 0 !== match.hasToolResult) return false;
  if (match.file !== void 0 && !matchesFiles(match.file, turn.files)) return false;
  return true;
}
function budgetOf(rule, budgets) {
  if (rule.times === void 0) return null;
  const remaining = budgets.get(rule.id);
  return remaining === void 0 ? rule.times : remaining;
}
function matchesFiles(spec, files) {
  if (typeof spec === "boolean") return spec === files.length > 0;
  return files.some((file) => globMatch(spec, file.mediaType));
}
function globMatch(pattern, value) {
  if (!pattern.includes("*")) return pattern === value;
  let patternIndex = 0;
  let valueIndex = 0;
  let starIndex = -1;
  let retryIndex = 0;
  while (valueIndex < value.length) {
    if (patternIndex < pattern.length && pattern[patternIndex] !== "*" && pattern[patternIndex] === value[valueIndex]) {
      patternIndex++;
      valueIndex++;
    } else if (patternIndex < pattern.length && pattern[patternIndex] === "*") {
      starIndex = patternIndex++;
      retryIndex = valueIndex;
    } else if (starIndex !== -1) {
      patternIndex = starIndex + 1;
      valueIndex = ++retryIndex;
    } else {
      return false;
    }
  }
  while (patternIndex < pattern.length && pattern[patternIndex] === "*") patternIndex++;
  return patternIndex === pattern.length;
}
function parseModels(raw) {
  if (raw === void 0) return [];
  if (!Array.isArray(raw)) throw new AiConfigError("expected an array of model ids", "models");
  return raw.map((model, index) => expectString2(model, `models[${index}]`, true));
}
function parseTimingFields(raw, path) {
  const obj = expectRecord(raw, path);
  assertKnownKeys(obj, TIMING_KEYS, path);
  const timing = {};
  if (obj.ttftMs !== void 0) timing.ttftMs = expectDelay(obj.ttftMs, `${path}.ttftMs`);
  if (obj.chunkDelayMs !== void 0) {
    const raw2 = obj.chunkDelayMs;
    if (Array.isArray(raw2)) {
      if (raw2.length === 0) throw new AiConfigError("expected a nonempty delay list", `${path}.chunkDelayMs`);
      timing.chunkDelayMs = raw2.map((value, index) => expectDelay(value, `${path}.chunkDelayMs[${index}]`));
    } else {
      timing.chunkDelayMs = expectDelay(raw2, `${path}.chunkDelayMs`);
    }
  }
  return timing;
}
function parseRandom(raw) {
  if (raw === void 0 || raw === null) return { seed: DEFAULT_SEED };
  const obj = expectRecord(raw, "random");
  assertKnownKeys(obj, RANDOM_KEYS, "random");
  const seed = obj.seed === void 0 ? DEFAULT_SEED : expectSafeInteger(obj.seed, "random.seed", 0);
  return { seed };
}
function parseVariants(raw, path, stream) {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new AiConfigError("expected a nonempty list of variants", path);
  }
  return raw.map((variant, index) => {
    const at = `${path}[${index}]`;
    const obj = expectRecord(variant, at);
    assertKnownKeys(obj, VARIANT_KEYS, at);
    const hasReply = obj.reply !== void 0;
    const hasError = obj.error !== void 0;
    if (hasReply === hasError) throw new AiConfigError("expected exactly one of reply or error", at);
    const parsed = hasError ? { error: parseError(obj.error, `${at}.error`) } : { reply: parseReply(obj.reply, `${at}.reply`, "a variant needs at least one event") };
    if (obj.finish !== void 0) {
      if (hasError) throw new AiConfigError("finish does not apply to an error variant", `${at}.finish`);
      parsed.finish = parseFinish(obj.finish, `${at}.finish`);
    }
    if (obj.timing !== void 0) {
      if (hasError) throw new AiConfigError("timing does not apply to an error variant", `${at}.timing`);
      parsed.timing = parseTimingFields(obj.timing, `${at}.timing`);
    }
    if (obj.fault !== void 0) {
      if (hasError) throw new AiConfigError("fault does not apply to an error variant", `${at}.fault`);
      if (!stream) throw new AiConfigError("stream faults require match.stream: true", `${at}.fault`);
      parsed.fault = parseFault(obj.fault, `${at}.fault`);
    }
    return parsed;
  });
}
function parseRule(raw, path) {
  const obj = expectRecord(raw, path);
  assertKnownKeys(obj, RULE_KEYS, path);
  const id = expectString2(obj.id, `${path}.id`, true);
  const match = obj.match === void 0 ? {} : parseMatch(obj.match, `${path}.match`);
  const rule = { id, match };
  if (obj.times !== void 0) rule.times = expectSafeInteger(obj.times, `${path}.times`, 0);
  const hasReply = obj.reply !== void 0;
  const hasVariants = obj.variants !== void 0;
  const hasError = obj.error !== void 0;
  if (hasReply && hasError) throw new AiConfigError("reply and error are mutually exclusive", `${path}.reply`);
  if (hasReply && hasVariants) throw new AiConfigError("reply and variants are mutually exclusive", `${path}.variants`);
  if (hasVariants && hasError) throw new AiConfigError("variants and error are mutually exclusive", `${path}.variants`);
  if (!hasReply && !hasVariants && !hasError) {
    throw new AiConfigError("one of reply, variants, or error is required", path);
  }
  if (hasReply) {
    rule.reply = parseReply(obj.reply, `${path}.reply`);
  } else if (hasVariants) {
    rule.variants = parseVariants(obj.variants, `${path}.variants`, match.stream === true);
  } else {
    rule.error = parseError(obj.error, `${path}.error`);
  }
  const scripted = hasReply || hasVariants;
  if (obj.finish !== void 0) {
    if (!scripted) throw new AiConfigError("finish does not apply to an error rule", `${path}.finish`);
    rule.finish = parseFinish(obj.finish, `${path}.finish`);
  }
  if (obj.timing !== void 0) {
    if (!scripted) throw new AiConfigError("timing does not apply to an error rule", `${path}.timing`);
    rule.timing = parseTimingFields(obj.timing, `${path}.timing`);
  }
  if (obj.fault !== void 0) {
    if (!scripted) throw new AiConfigError("fault requires a reply", `${path}.fault`);
    if (match.stream !== true) {
      throw new AiConfigError("stream faults require match.stream: true", `${path}.fault`);
    }
    rule.fault = parseFault(obj.fault, `${path}.fault`);
  }
  return rule;
}
function parseMatch(raw, path) {
  const obj = expectRecord(raw, path);
  assertKnownKeys(obj, MATCH_KEYS, path);
  const match = {};
  if (obj.model !== void 0) match.model = expectString2(obj.model, `${path}.model`, true);
  if (obj.format !== void 0) match.format = parseFormat(obj.format, `${path}.format`);
  if (obj.stream !== void 0) match.stream = expectBoolean2(obj.stream, `${path}.stream`);
  if (obj.textContains !== void 0) match.textContains = expectString2(obj.textContains, `${path}.textContains`);
  if (obj.tool !== void 0) match.tool = expectString2(obj.tool, `${path}.tool`, true);
  if (obj.hasToolResult !== void 0) {
    match.hasToolResult = expectBoolean2(obj.hasToolResult, `${path}.hasToolResult`);
  }
  if (obj.file !== void 0) match.file = parseFileMatch(obj.file, `${path}.file`);
  return match;
}
function parseFileMatch(value, path) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return expectString2(value, path, true);
  throw new AiConfigError("expected a boolean or a media type", path);
}
function parseFormat(value, path) {
  const format = expectString2(value, path, true);
  if (!FORMATS.has(format)) {
    throw new AiConfigError('expected "openai-chat", "openai-responses", or "anthropic-messages"', path);
  }
  return format;
}
function parseFinish(value, path) {
  const finish = expectString2(value, path, true);
  if (!FINISH_REASONS.has(finish)) {
    throw new AiConfigError(`expected one of ${[...FINISH_REASONS].join(", ")}`, path);
  }
  return finish;
}
function parseReply(raw, path, emptyMessage = "a reply needs at least one event") {
  if (!Array.isArray(raw)) throw new AiConfigError("expected an array of reply events", path);
  if (raw.length === 0) throw new AiConfigError(emptyMessage, path);
  return raw.map((event, index) => parseReplyEvent(event, `${path}[${index}]`));
}
function parseReplyEvent(raw, path) {
  const obj = expectRecord(raw, path);
  const type = expectString2(obj.type, `${path}.type`, true);
  switch (type) {
    case "reasoning":
      assertKnownKeys(obj, TEXT_EVENT_KEYS, path);
      return { type, text: expectString2(obj.text, `${path}.text`) };
    case "text":
      assertKnownKeys(obj, TEXT_EVENT_KEYS, path);
      return { type, text: expectString2(obj.text, `${path}.text`) };
    case "refusal":
      assertKnownKeys(obj, TEXT_EVENT_KEYS, path);
      return { type, text: expectString2(obj.text, `${path}.text`) };
    case "object":
      assertKnownKeys(obj, OBJECT_EVENT_KEYS, path);
      if (obj.value === void 0) throw new AiConfigError("expected a JSON value", `${path}.value`);
      return { type, value: expectJson(obj.value, `${path}.value`) };
    case "tool_call": {
      assertKnownKeys(obj, TOOL_CALL_EVENT_KEYS, path);
      if (obj.arguments === void 0) throw new AiConfigError("expected tool arguments", `${path}.arguments`);
      const args = expectJson(obj.arguments, `${path}.arguments`);
      if (!isRecord3(args)) {
        throw new AiConfigError(
          "expected a JSON object for tool arguments, not an encoded string; write the fields directly",
          `${path}.arguments`
        );
      }
      return {
        type,
        name: expectString2(obj.name, `${path}.name`, true),
        arguments: args,
        ...obj.id === void 0 ? {} : { id: expectString2(obj.id, `${path}.id`, true) }
      };
    }
    default:
      throw new AiConfigError(`unknown reply event type "${type}"`, `${path}.type`);
  }
}
function parseError(raw, path) {
  const obj = expectRecord(raw, path);
  assertKnownKeys(obj, ERROR_KEYS, path);
  const status = expectInteger2(obj.status, `${path}.status`);
  if (status < 400 || status > 599) {
    throw new AiConfigError("expected an HTTP error status between 400 and 599", `${path}.status`);
  }
  const failure = {
    status,
    message: expectString2(obj.message, `${path}.message`)
  };
  if (obj.type !== void 0) failure.type = expectString2(obj.type, `${path}.type`);
  if (obj.code !== void 0) failure.code = expectString2(obj.code, `${path}.code`);
  if (obj.param !== void 0) failure.param = expectString2(obj.param, `${path}.param`);
  if (obj.headers !== void 0) failure.headers = parseHeaders(obj.headers, `${path}.headers`);
  return failure;
}
function parseHeaders(raw, path) {
  const obj = expectRecord(raw, path);
  const entries = [];
  for (const [name, value] of Object.entries(obj)) {
    const headerPath = joinPath(path, name);
    const text = expectString2(value, headerPath);
    try {
      new Headers([[name, text]]);
    } catch {
      throw new AiConfigError("expected a valid HTTP header name and value", headerPath);
    }
    entries.push([name, text]);
  }
  return Object.fromEntries(entries);
}
function parseFault(raw, path) {
  const obj = expectRecord(raw, path);
  assertKnownKeys(obj, FAULT_KEYS, path);
  const afterChunks = expectSafeInteger(obj.afterChunks, `${path}.afterChunks`, 0);
  const kind = expectString2(obj.kind, `${path}.kind`, true);
  if (!FAULT_KINDS.has(kind)) throw new AiConfigError('expected "disconnect" or "stall"', `${path}.kind`);
  if (kind === "stall") {
    if (obj.stallMs === void 0) throw new AiConfigError("stallMs is required for a stall", `${path}.stallMs`);
    return { afterChunks, kind, stallMs: expectDelay(obj.stallMs, `${path}.stallMs`, 1) };
  }
  if (obj.stallMs !== void 0) throw new AiConfigError("stallMs only applies to a stall", `${path}.stallMs`);
  return { afterChunks, kind: "disconnect" };
}
function assertUniqueRuleIds(rules) {
  const seen = /* @__PURE__ */ new Set();
  for (let index = 0; index < rules.length; index++) {
    const id = rules[index].id;
    if (seen.has(id)) throw new AiConfigError(`duplicate rule id "${id}"`, `rules[${index}].id`);
    seen.add(id);
  }
}
function assertKnownKeys(obj, allowed, path) {
  for (const key of Object.keys(obj)) {
    if (!allowed.has(key)) throw new AiConfigError(`unknown key "${key}"`, joinPath(path, key));
  }
}
function joinPath(path, key) {
  return path ? `${path}.${key}` : key;
}
function isRecord3(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function expectRecord(value, path) {
  if (!isRecord3(value)) throw new AiConfigError("expected an object", path);
  return value;
}
function expectString2(value, path, nonEmpty = false) {
  if (typeof value !== "string") throw new AiConfigError("expected a string", path);
  if (nonEmpty && value.length === 0) throw new AiConfigError("expected a non-empty string", path);
  return value;
}
function expectBoolean2(value, path) {
  if (typeof value !== "boolean") throw new AiConfigError("expected a boolean", path);
  return value;
}
function expectFiniteNumber(value, path, minimum) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new AiConfigError("expected a finite number", path);
  }
  if (minimum !== void 0 && value < minimum) {
    throw new AiConfigError(`expected a number greater than or equal to ${minimum}`, path);
  }
  return value;
}
function expectInteger2(value, path, minimum) {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new AiConfigError("expected an integer", path);
  }
  if (minimum !== void 0 && value < minimum) {
    throw new AiConfigError(`expected an integer greater than or equal to ${minimum}`, path);
  }
  return value;
}
function expectSafeInteger(value, path, minimum) {
  if (typeof value !== "number" || !Number.isSafeInteger(value)) {
    throw new AiConfigError("expected a safe integer", path);
  }
  if (minimum !== void 0 && value < minimum) {
    throw new AiConfigError(`expected an integer greater than or equal to ${minimum}`, path);
  }
  return value;
}
function expectDelay(value, path, minimum = 0) {
  const delay2 = expectFiniteNumber(value, path, minimum);
  if (delay2 > MAX_TIMER_MS) {
    throw new AiConfigError(`expected a delay no greater than ${MAX_TIMER_MS} milliseconds`, path);
  }
  return delay2;
}
function expectJson(value, path, depth = 0) {
  if (depth > 100) throw new AiConfigError("JSON nesting is too deep", path);
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new AiConfigError("expected a finite number", path);
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item, index) => expectJson(item, `${path}[${index}]`, depth + 1));
  }
  if (isRecord3(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, expectJson(item, joinPath(path, key), depth + 1)])
    );
  }
  throw new AiConfigError("expected a JSON value", path);
}
var CALL_RECORD_LIMIT = 500;
var STORED_RESPONSE_LIMIT = 1e3;
var CONFIG_KEY = "ai.state.config";
var BUDGETS_KEY = "ai.state.budgets";
var VARIANT_HITS_KEY = "ai.state.variantHits";
var CALL_SEQ_KEY = "ai.state.callSeq";
var CALLS_KEY = "ai.state.calls";
var RESPONSES_KEY = "ai.state.responses";
var SEEN_MODELS_KEY = "ai.state.seenModels";
var NEXT_ID_KEY = "ai.state.nextId";
var SEED_KEY = "ai.seed";
function isAiConfig(value) {
  return typeof value === "object" && value !== null && "rules" in value;
}
var StoreBackedAiState = class {
  constructor(store) {
    this.store = store;
  }
  liveController = new AbortController();
  liveGeneration = 0;
  liveCallsGeneration = 0;
  read(key, create) {
    const value = this.store.getData(key);
    if (value !== void 0) return value;
    const created = create();
    this.store.setData(key, created);
    return created;
  }
  get config() {
    return this.read(CONFIG_KEY, () => parseConfig(void 0));
  }
  set config(value) {
    this.store.setData(CONFIG_KEY, value);
  }
  get budgets() {
    return this.read(BUDGETS_KEY, () => initialBudgets(this.config));
  }
  set budgets(value) {
    this.store.setData(BUDGETS_KEY, value);
  }
  get variantHits() {
    return this.read(VARIANT_HITS_KEY, () => /* @__PURE__ */ new Map());
  }
  set variantHits(value) {
    this.store.setData(VARIANT_HITS_KEY, value);
  }
  get generation() {
    return this.liveGeneration;
  }
  set generation(value) {
    this.liveGeneration = value;
  }
  get controller() {
    return this.liveController;
  }
  set controller(value) {
    this.liveController = value;
  }
  get callSeq() {
    return this.read(CALL_SEQ_KEY, () => 0);
  }
  set callSeq(value) {
    this.store.setData(CALL_SEQ_KEY, value);
  }
  get callsGeneration() {
    return this.liveCallsGeneration;
  }
  set callsGeneration(value) {
    this.liveCallsGeneration = value;
  }
  get calls() {
    return this.read(CALLS_KEY, () => []);
  }
  set calls(value) {
    this.store.setData(CALLS_KEY, value);
  }
  get responses() {
    return this.read(RESPONSES_KEY, () => /* @__PURE__ */ new Map());
  }
  set responses(value) {
    this.store.setData(RESPONSES_KEY, value);
  }
  get seenModels() {
    return this.read(SEEN_MODELS_KEY, () => /* @__PURE__ */ new Set());
  }
  set seenModels(value) {
    this.store.setData(SEEN_MODELS_KEY, value);
  }
  get nextId() {
    return this.read(NEXT_ID_KEY, () => 1);
  }
  set nextId(value) {
    this.store.setData(NEXT_ID_KEY, value);
  }
};
var states = /* @__PURE__ */ new WeakMap();
function getAiState(store) {
  let state = states.get(store);
  if (!state) {
    state = new StoreBackedAiState(store);
    states.set(store, state);
  }
  return state;
}
function setSeedConfig(store, config) {
  store.setData(SEED_KEY, structuredClone(config));
}
function getSeedConfig(store) {
  const seed = store.getData(SEED_KEY);
  return isAiConfig(seed) ? seed : parseConfig(void 0);
}
function setAiConfig(state, config) {
  state.config = config;
  state.budgets = initialBudgets(config);
  state.variantHits = /* @__PURE__ */ new Map();
}
function resetAiState(store, config) {
  const state = getAiState(store);
  state.generation += 1;
  state.controller.abort();
  state.controller = new AbortController();
  setAiConfig(state, structuredClone(config));
  state.callSeq = 0;
  state.callsGeneration += 1;
  state.calls = [];
  state.responses.clear();
  state.seenModels.clear();
  state.nextId = 1;
  return state;
}
function nextId(state) {
  return state.nextId++;
}
function takeCallSeq(state) {
  const seq = state.callSeq + 1;
  state.callSeq = seq;
  return seq;
}
function isCurrentGeneration(state, stamp) {
  return stamp.generation === state.generation;
}
function beginRequest(state, clientSignal) {
  const controller = new AbortController();
  const generation = state.generation;
  const callsGeneration = state.callsGeneration;
  const generationSignal = state.controller.signal;
  const abort = () => controller.abort();
  const link = (signal) => {
    if (!signal) return;
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", abort, { once: true });
  };
  link(generationSignal);
  link(clientSignal);
  let disposed = false;
  return {
    generation,
    callsGeneration,
    signal: controller.signal,
    dispose() {
      if (disposed) return;
      disposed = true;
      generationSignal.removeEventListener("abort", abort);
      clientSignal?.removeEventListener("abort", abort);
    }
  };
}
function recordCall(state, call, stamp) {
  if (stamp.generation !== state.generation || stamp.callsGeneration !== state.callsGeneration) return false;
  state.calls.push(call);
  if (state.calls.length > CALL_RECORD_LIMIT) {
    state.calls.splice(0, state.calls.length - CALL_RECORD_LIMIT);
  }
  return true;
}
function settleCall(state, call, stamp, delivery) {
  if (stamp.generation !== state.generation || stamp.callsGeneration !== state.callsGeneration) return;
  call.delivery = delivery;
}
function clearCalls(state) {
  state.calls = [];
  state.callsGeneration += 1;
}
var FORMAT3 = "openai-responses";
var JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };
function isRecord4(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function invalid(message, param, code) {
  throw new AiRequestError(message, param, code);
}
function requireString2(value, param, nonEmpty = false) {
  if (typeof value !== "string") invalid(`Expected a string for '${param}'.`, param);
  if (nonEmpty && value.length === 0) invalid(`Expected a non-empty string for '${param}'.`, param);
  return value;
}
function optionalString3(value, param) {
  if (value === void 0 || value === null) return void 0;
  return requireString2(value, param);
}
function requireBoolean(value, param) {
  if (typeof value !== "boolean") invalid(`Expected a boolean for '${param}'.`, param);
  return value;
}
function requireNumber2(value, param) {
  if (typeof value !== "number" || !Number.isFinite(value)) invalid(`Expected a number for '${param}'.`, param);
  return value;
}
function unsupported3(feature, param) {
  invalid(`Unsupported feature: ${feature}. The AI emulator does not implement it.`, param, "unsupported_feature");
}
function textOf2(value) {
  if (typeof value === "string") return value;
  if (value === void 0 || value === null) return "";
  return JSON.stringify(value);
}
var LIST = new Intl.ListFormat("en", { style: "long", type: "conjunction" });
function optionalEnum(raw, param, values) {
  if (raw === void 0 || raw === null) return void 0;
  if (!values.includes(raw)) {
    invalid(
      `Invalid value: '${textOf2(raw)}'. Supported values are: ${LIST.format(values.map((value) => `'${value}'`))}.`,
      param,
      "invalid_value"
    );
  }
  return raw;
}
function optionalDecimal(raw, param, min, max) {
  if (raw === void 0 || raw === null) return void 0;
  const value = requireNumber2(raw, param);
  if (value > max) {
    invalid(
      `Invalid '${param}': decimal above maximum value. Expected a value <= ${max}, but got ${value} instead.`,
      param,
      "decimal_above_max_value"
    );
  }
  if (value < min) {
    invalid(
      `Invalid '${param}': decimal below minimum value. Expected a value >= ${min}, but got ${value} instead.`,
      param,
      "decimal_below_min_value"
    );
  }
  return value;
}
function functionOutput(output, path) {
  if (typeof output === "string") return { text: output, files: [] };
  if (!Array.isArray(output)) invalid(`Expected a string or array for '${path}.output'.`, `${path}.output`);
  const text = [];
  const files = [];
  output.forEach((part, index) => {
    const partPath = `${path}.output[${index}]`;
    if (typeof part === "string") {
      text.push(part);
      return;
    }
    if (!isRecord4(part)) invalid(`Expected a content part for '${partPath}'.`, partPath);
    if (part.type === "input_text" || part.type === "output_text" || part.type === "text") {
      if (typeof part.text !== "string") invalid(`Expected a string for '${partPath}.text'.`, `${partPath}.text`);
      text.push(part.text);
      return;
    }
    const attachment = decodeResponsesAttachment(part, partPath);
    if (attachment) {
      files.push(attachment);
      return;
    }
    unsupported3(`function output content type "${String(part.type)}"`, `${partPath}.type`);
  });
  return { text: text.join(""), files };
}
function decodeReasoning2(raw) {
  if (raw === void 0 || raw === null) return void 0;
  if (!isRecord4(raw)) invalid("Expected an object for 'reasoning'.", "reasoning");
  const reasoning = {};
  const effort = optionalEnum(raw.effort, "reasoning.effort", REASONING_EFFORTS);
  if (effort !== void 0) reasoning.effort = effort;
  const summary = optionalEnum(raw.summary, "reasoning.summary", ["auto", "concise", "detailed"]);
  if (summary !== void 0) reasoning.summary = summary;
  const generateSummary = optionalEnum(raw.generate_summary, "reasoning.generate_summary", [
    "auto",
    "concise",
    "detailed"
  ]);
  if (generateSummary !== void 0) reasoning.generate_summary = generateSummary;
  const context2 = optionalEnum(raw.context, "reasoning.context", ["auto", "current_turn", "all_turns"]);
  if (context2 !== void 0) reasoning.context = context2;
  const mode = optionalString3(raw.mode, "reasoning.mode");
  if (mode !== void 0) reasoning.mode = mode;
  return reasoning;
}
function decodeTruncation(raw) {
  return optionalEnum(raw, "truncation", ["auto", "disabled"]) ?? "disabled";
}
function extrasOf(decoded) {
  return decoded.extras;
}
function sendJson(value, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: JSON_HEADERS });
}
function errorBody3(failure) {
  return {
    error: {
      message: failure.message,
      type: failure.type ?? defaultErrorType(failure.status),
      param: failure.param ?? null,
      code: failure.code ?? null
    }
  };
}
function notFound(id) {
  return {
    status: 404,
    type: "invalid_request_error",
    message: `Response with id '${id}' not found.`
  };
}
function decodeTools3(raw) {
  if (raw === void 0 || raw === null) return { tools: [], definitions: [] };
  if (!Array.isArray(raw)) invalid("Expected an array of tools for 'tools'.", "tools");
  const tools = [];
  const definitions = [];
  raw.forEach((tool, index) => {
    const path = `tools[${index}]`;
    if (!isRecord4(tool)) invalid(`Expected an object for '${path}'.`, path);
    if (tool.type !== "function") {
      const name2 = typeof tool.type === "string" ? tool.type : "unknown";
      unsupported3(`tool type "${name2}"`, `${path}.type`);
    }
    const name = requireString2(tool.name, `${path}.name`, true);
    const description = optionalString3(tool.description, `${path}.description`);
    let parameters;
    if (tool.parameters !== void 0 && tool.parameters !== null) {
      if (typeof tool.parameters !== "boolean" && !isRecord4(tool.parameters)) {
        invalid(`Expected a JSON Schema object for '${path}.parameters'.`, `${path}.parameters`);
      }
      parameters = tool.parameters;
    }
    const strict = tool.strict === void 0 || tool.strict === null ? false : requireBoolean(tool.strict, `${path}.strict`);
    tools.push({
      type: "function",
      name,
      ...description === void 0 ? {} : { description },
      parameters: parameters ?? { type: "object" },
      strict
    });
    definitions.push({
      name,
      ...description === void 0 ? {} : { description },
      ...parameters === void 0 ? {} : { parameters },
      ...strict ? { strict: true } : {}
    });
  });
  return { tools, definitions };
}
function decodeToolChoice3(raw) {
  if (raw === void 0 || raw === null) return { choice: "auto", wire: "auto" };
  if (typeof raw === "string") {
    if (raw !== "auto" && raw !== "none" && raw !== "required") {
      unsupported3(`tool_choice "${raw}"`, "tool_choice");
    }
    return { choice: raw, wire: raw };
  }
  if (isRecord4(raw)) {
    if (raw.type !== "function") {
      const name2 = typeof raw.type === "string" ? raw.type : "unknown";
      unsupported3(`tool_choice type "${name2}"`, "tool_choice.type");
    }
    const name = requireString2(raw.name, "tool_choice.name", true);
    return { choice: { name }, wire: { type: "function", name } };
  }
  invalid("Expected a tool choice string or function object for 'tool_choice'.", "tool_choice");
}
function decodeOutput3(raw) {
  if (raw === void 0 || raw === null) return void 0;
  if (!isRecord4(raw)) invalid("Expected an object for 'text'.", "text");
  optionalEnum(raw.verbosity, "text.verbosity", ["low", "medium", "high"]);
  const format = raw.format;
  if (format === void 0 || format === null) return void 0;
  if (!isRecord4(format)) invalid("Expected an object for 'text.format'.", "text.format");
  if (format.type === "text" || format.type === void 0) return void 0;
  if (format.type === "json_object") return { kind: "json_object" };
  if (format.type === "json_schema") {
    const name = optionalString3(format.name, "text.format.name");
    optionalString3(format.description, "text.format.description");
    const schema = format.schema;
    if (typeof schema !== "boolean" && !isRecord4(schema)) {
      invalid("Expected a JSON Schema for 'text.format.schema'.", "text.format.schema");
    }
    if (format.strict !== void 0 && format.strict !== null && typeof format.strict !== "boolean") {
      invalid("Expected a boolean for 'text.format.strict'.", "text.format.strict");
    }
    return {
      kind: "json_schema",
      ...name === void 0 ? {} : { name },
      ...format.strict === true ? { strict: true } : {},
      schema
    };
  }
  invalid(`Unsupported text format "${String(format.type)}".`, "text.format.type");
}
function textWire(raw) {
  const wire = { format: { type: "text" } };
  if (!isRecord4(raw)) return wire;
  const verbosity = optionalEnum(raw.verbosity, "text.verbosity", ["low", "medium", "high"]);
  if (verbosity !== void 0) wire.verbosity = verbosity;
  const format = raw.format;
  if (isRecord4(format)) {
    if (format.type === "json_object") wire.format = { type: "json_object" };
    else if (format.type === "json_schema") {
      const description = optionalString3(format.description, "text.format.description");
      wire.format = {
        type: "json_schema",
        ...typeof format.name === "string" ? { name: format.name } : {},
        ...description === void 0 ? {} : { description },
        schema: format.schema,
        ...typeof format.strict === "boolean" ? { strict: format.strict } : {}
      };
    }
  }
  return wire;
}
function decodeMessageItem(item, path) {
  const role = item.role === "system" || item.role === "developer" || item.role === "assistant" || item.role === "user" ? item.role : void 0;
  if (!role) invalid(`Unsupported message role for '${path}.role'.`, `${path}.role`);
  const parts = [];
  const content = item.content;
  if (content === void 0 || content === null) {
    invalid(`Missing required parameter: '${path}.content'.`, `${path}.content`);
  }
  if (typeof content === "string") {
    parts.push({ type: "text", text: content });
  } else if (Array.isArray(content)) {
    content.forEach((part, index) => {
      const partPath = `${path}.content[${index}]`;
      if (typeof part === "string") {
        parts.push({ type: "text", text: part });
        return;
      }
      if (!isRecord4(part)) invalid(`Expected a content part for '${partPath}'.`, partPath);
      if (part.type === "input_audio") unsupported3("audio input", `${partPath}.type`);
      if (part.type === "input_text" || part.type === "output_text" || part.type === "text") {
        if (typeof part.text !== "string") invalid(`Expected a string for '${partPath}.text'.`, `${partPath}.text`);
        parts.push({ type: "text", text: part.text });
        return;
      }
      const attachment = decodeResponsesAttachment(part, partPath);
      if (attachment) {
        parts.push(attachment);
        return;
      }
      if (part.type === "refusal") {
        if (typeof part.refusal !== "string")
          invalid(`Expected a string for '${partPath}.refusal'.`, `${partPath}.refusal`);
        parts.push({ type: "text", text: part.refusal });
        return;
      }
      unsupported3(`input content type "${String(part.type)}"`, `${partPath}.type`);
    });
  } else {
    invalid(`Expected a string or array for '${path}.content'.`, `${path}.content`);
  }
  return { role, parts };
}
function decodeFunctionCall(item, path) {
  const callId = requireString2(item.call_id, `${path}.call_id`, true);
  const name = requireString2(item.name, `${path}.name`, true);
  const args = requireString2(item.arguments, `${path}.arguments`);
  return {
    message: { role: "assistant", parts: [{ type: "tool_call", id: callId, name, arguments: args }] },
    callId,
    name
  };
}
function decodeFunctionCallOutput(item, path) {
  const callId = requireString2(item.call_id, `${path}.call_id`, true);
  if (item.output === void 0 || item.output === null) {
    invalid(`Missing required parameter: '${path}.output'.`, `${path}.output`);
  }
  const { text, files } = functionOutput(item.output, path);
  return { role: "tool", parts: [...files, { type: "tool_result", id: callId, output: text }] };
}
function decodeStoredMessages(items) {
  const messages = [];
  for (const item of items) {
    if (!isRecord4(item)) continue;
    if (Array.isArray(item.parts) && typeof item.role === "string") {
      const parts = [];
      for (const part of item.parts) {
        if (!isRecord4(part) || typeof part.type !== "string") continue;
        if (part.type === "text" && typeof part.text === "string") parts.push({ type: "text", text: part.text });
        else if (part.type === "tool_call" && typeof part.id === "string" && typeof part.name === "string") {
          parts.push({ type: "tool_call", id: part.id, name: part.name, arguments: textOf2(part.arguments) });
        } else if (part.type === "tool_result" && typeof part.id === "string") {
          parts.push({
            type: "tool_result",
            id: part.id,
            ...typeof part.name === "string" ? { name: part.name } : {},
            output: textOf2(part.output)
          });
        } else if (part.type === "file" && typeof part.mediaType === "string") {
          parts.push(part);
        }
      }
      messages.push({ role: item.role, parts });
    }
  }
  return messages;
}
function storedOutputMessages(items) {
  const messages = [];
  for (const item of items) {
    if (!isRecord4(item) || typeof item.type !== "string") continue;
    if (item.type === "message" && item.role === "assistant") {
      const parts = [];
      if (Array.isArray(item.content)) {
        for (const part of item.content) {
          if (!isRecord4(part)) continue;
          if (part.type === "output_text" && typeof part.text === "string")
            parts.push({ type: "text", text: part.text });
          else if (part.type === "refusal" && typeof part.refusal === "string")
            parts.push({ type: "text", text: part.refusal });
        }
      }
      messages.push({ role: "assistant", parts });
    } else if (item.type === "function_call") {
      messages.push({
        role: "assistant",
        parts: [
          {
            type: "tool_call",
            id: typeof item.call_id === "string" ? item.call_id : "",
            name: typeof item.name === "string" ? item.name : "",
            arguments: textOf2(item.arguments)
          }
        ]
      });
    }
  }
  return messages;
}
var MESSAGE_CACHE = /* @__PURE__ */ new WeakMap();
function storedMessages(entry) {
  const cached = MESSAGE_CACHE.get(entry);
  if (cached && cached.input === entry.inputItems && cached.output === entry.outputItems) return cached.messages;
  const messages = [...decodeStoredMessages(entry.inputItems), ...storedOutputMessages(entry.outputItems)];
  MESSAGE_CACHE.set(entry, { input: entry.inputItems, output: entry.outputItems, messages });
  return messages;
}
function replayStoredHistory(state, id) {
  const head2 = state.responses.get(id);
  if (!head2) return void 0;
  const chain = [];
  const seen = /* @__PURE__ */ new Set();
  let current = head2;
  let missingParentId;
  while (current !== void 0 && chain.length < state.responses.size) {
    if (seen.has(current.id)) {
      missingParentId = current.id;
      break;
    }
    seen.add(current.id);
    chain.push(current);
    const parentId = current.previousResponseId;
    if (parentId === void 0) break;
    const parent = state.responses.get(parentId);
    if (!parent) missingParentId = parentId;
    current = parent;
  }
  const messages = [];
  const gaps = missingParentId === void 0 ? [] : [0];
  const itemIds = /* @__PURE__ */ new Set();
  for (const entry of chain.reverse()) {
    const base = messages.length;
    for (const message of storedMessages(entry)) messages.push(message);
    for (const gap of entry.gaps ?? []) gaps.push(base + gap);
    for (const id2 of [...entry.foldedItemIds ?? [], ...itemIdsOf(entry.outputItems)]) itemIds.add(id2);
  }
  return {
    messages,
    gaps,
    itemIds,
    ...missingParentId === void 0 ? {} : { missingParentId }
  };
}
function removeStoredResponse(state, id) {
  const removed = state.responses.get(id);
  if (!removed) return;
  const folded = [...removed.inputItems, ...storedOutputMessages(removed.outputItems).map(messageToJson)];
  const foldedIds = [...removed.foldedItemIds ?? [], ...itemIdsOf(removed.outputItems)];
  for (const child of state.responses.values()) {
    if (child === removed || child.previousResponseId !== id) continue;
    child.inputItems = [...folded, ...child.inputItems];
    const childFoldedIds = [...foldedIds, ...child.foldedItemIds ?? []];
    if (childFoldedIds.length > 0) child.foldedItemIds = childFoldedIds;
    const gaps = [...removed.gaps ?? [], ...(child.gaps ?? []).map((gap) => gap + folded.length)];
    if (gaps.length > 0) child.gaps = gaps;
    if (removed.previousResponseId === void 0) delete child.previousResponseId;
    else child.previousResponseId = removed.previousResponseId;
  }
  state.responses.delete(id);
}
function indexStoredItems(state) {
  const items = /* @__PURE__ */ new Map();
  for (const stored of state.responses.values()) {
    for (const item of stored.outputItems) {
      if (isRecord4(item) && typeof item.id === "string" && !items.has(item.id)) items.set(item.id, item);
    }
  }
  return items;
}
function itemIdsOf(items) {
  const ids = [];
  for (const item of items) {
    if (isRecord4(item) && typeof item.id === "string") ids.push(item.id);
  }
  return ids;
}
function referencedItem(id, knownItemIds, storedItems) {
  if (knownItemIds.has(id)) return { state: "in_history" };
  const item = storedItems.get(id);
  return item === void 0 ? { state: "unknown" } : { state: "stored", item };
}
function messageToJson(message) {
  return { role: message.role, parts: message.parts };
}
function decode2(body, ctx) {
  if (!isRecord4(body)) invalid("Expected a JSON object request body.");
  const raw = body;
  if (raw.background === true) unsupported3("background mode", "background");
  if (raw.conversation !== void 0 && raw.conversation !== null) unsupported3("the Conversations API", "conversation");
  if (raw.n !== void 0 && raw.n !== null && raw.n !== 1) unsupported3("multiple candidates", "n");
  if (raw.audio !== void 0 && raw.audio !== null) unsupported3("audio input", "audio");
  if (raw.modalities !== void 0 && raw.modalities !== null) unsupported3("audio output", "modalities");
  const model = requireString2(raw.model, "model", true);
  const stream = raw.stream === void 0 || raw.stream === null ? false : requireBoolean(raw.stream, "stream");
  const store = raw.store === void 0 || raw.store === null ? true : requireBoolean(raw.store, "store");
  const instructions = optionalString3(raw.instructions, "instructions");
  const maxOutputTokens = raw.max_output_tokens === void 0 || raw.max_output_tokens === null ? void 0 : requireNumber2(raw.max_output_tokens, "max_output_tokens");
  if (maxOutputTokens !== void 0 && (!Number.isInteger(maxOutputTokens) || maxOutputTokens < 0)) {
    invalid("Expected a non-negative integer for 'max_output_tokens'.", "max_output_tokens");
  }
  const { tools, definitions } = decodeTools3(raw.tools);
  assertToolsSupported(model, definitions, (index) => `tools[${index}].parameters`);
  const { choice, wire: toolChoiceWire } = decodeToolChoice3(raw.tool_choice);
  const parallelToolCalls = raw.parallel_tool_calls === void 0 || raw.parallel_tool_calls === null ? true : requireBoolean(raw.parallel_tool_calls, "parallel_tool_calls");
  const output = decodeOutput3(raw.text);
  assertOutputSupported(model, output, { format: "text.format", strict: "text.format.strict" });
  const reasoning = decodeReasoning2(raw.reasoning);
  const metadata = decodeMetadata(raw.metadata);
  const previousResponseId = optionalString3(raw.previous_response_id, "previous_response_id");
  if (previousResponseId !== void 0 && !previousResponseId.startsWith("resp_")) {
    invalid(`Expected a response id starting with 'resp_' for 'previous_response_id'.`, "previous_response_id");
  }
  const messages = [];
  if (instructions !== void 0) messages.push({ role: "system", parts: [{ type: "text", text: instructions }] });
  const history = [];
  const ownItems = [];
  const references = [];
  const warnings = [];
  const historyGaps = [];
  const ownGaps = [];
  const knownItemIds = /* @__PURE__ */ new Set();
  let storedItems;
  if (previousResponseId !== void 0) {
    const replay = replayStoredHistory(ctx.state, previousResponseId);
    if (replay) {
      for (const message of replay.messages) history.push(message);
      references.push({ id: previousResponseId, kind: "previous_response", resolved: true });
      for (const gap of replay.gaps) historyGaps.push(gap);
      for (const itemId of replay.itemIds) knownItemIds.add(itemId);
      if (replay.gaps.length > 0) {
        warnings.push(`Response "${previousResponseId}" has unresolved history; continuing with partial context.`);
      }
      if (replay.missingParentId !== void 0) {
        warnings.push(
          `Unknown response "${replay.missingParentId}" in the history chain; continuing with partial context.`
        );
      }
    } else {
      references.push({ id: previousResponseId, kind: "previous_response", resolved: false });
      ownGaps.push(0);
      warnings.push(`Unknown previous_response_id "${previousResponseId}"; continuing with empty context.`);
    }
  }
  const input = raw.input;
  if (input === void 0 || input === null) invalid("Missing required parameter: 'input'.", "input");
  const items = typeof input === "string" ? [{ role: "user", content: input }] : input;
  if (!Array.isArray(items)) invalid("Expected a string or array for 'input'.", "input");
  items.forEach((entry, index) => {
    const path = `input[${index}]`;
    if (typeof entry === "string") {
      ownItems.push({ role: "user", parts: [{ type: "text", text: entry }] });
      return;
    }
    if (!isRecord4(entry)) invalid(`Expected an item for '${path}'.`, path);
    const type = typeof entry.type === "string" ? entry.type : void 0;
    if (type === "item_reference") {
      const id = requireString2(entry.id, `${path}.id`, true);
      storedItems ??= indexStoredItems(ctx.state);
      const referenced = referencedItem(id, knownItemIds, storedItems);
      switch (referenced.state) {
        case "in_history":
          references.push({ id, kind: "item", resolved: true });
          break;
        case "stored":
          references.push({ id, kind: "item", resolved: true });
          knownItemIds.add(id);
          for (const message of storedOutputMessages([referenced.item])) ownItems.push(message);
          break;
        case "unknown":
          references.push({ id, kind: "item", resolved: false });
          warnings.push(`Unknown item_reference "${id}"; dropping it.`);
          break;
      }
      return;
    }
    if (type === "function_call") {
      ownItems.push(decodeFunctionCall(entry, path).message);
      return;
    }
    if (type === "function_call_output") {
      ownItems.push(decodeFunctionCallOutput(entry, path));
      return;
    }
    if (type === "reasoning") return;
    if (type === void 0 || type === "message") {
      ownItems.push(decodeMessageItem(entry, path));
      return;
    }
    if (type === "computer_call" || type === "computer_call_output" || type === "file_search_call" || type === "web_search_call" || type === "code_interpreter_call" || type === "image_generation_call" || type === "mcp_call" || type === "local_shell_call" || type === "shell_call" || type === "apply_patch_call" || type === "custom_tool_call" || type === "custom_tool_call_output" || type === "tool_search_call") {
      unsupported3(`hosted tool input item "${type}"`, `${path}.type`);
    }
    unsupported3(`input item type "${type}"`, `${path}.type`);
  });
  const historyStart = messages.length;
  for (const message of history) messages.push(message);
  const ownStart = messages.length;
  for (const message of ownItems) messages.push(message);
  const gaps = [...historyGaps.map((gap) => historyStart + gap), ...ownGaps.map((gap) => ownStart + gap)];
  const firstGap = gaps.reduce((least, gap) => Math.min(least, gap), Infinity);
  const lastGap = gaps.reduce((most, gap) => Math.max(most, gap), -Infinity);
  const callNames = /* @__PURE__ */ new Map();
  for (const message of messages) {
    for (const part of message.parts) {
      if (part.type === "tool_call") callNames.set(part.id, part.name);
    }
  }
  const answered = /* @__PURE__ */ new Set();
  for (const message of messages) {
    for (const part of message.parts) {
      if (part.type !== "tool_result") continue;
      if (answered.has(part.id)) warnings.push(`Duplicate tool output for "${part.id}"; keeping both outputs.`);
      answered.add(part.id);
    }
  }
  messages.forEach((message, index) => {
    for (const part of message.parts) {
      if (part.type === "tool_result") {
        const name = callNames.get(part.id);
        if (name !== void 0) {
          part.name = name;
        } else if (index >= firstGap) {
          warnings.push(
            `Tool result "${part.id}" does not match a known call; accepting it because referenced history is missing.`
          );
        } else {
          invalid(`No function call found for tool output "${part.id}".`, "input");
        }
      } else if (part.type === "tool_call" && !answered.has(part.id) && index >= lastGap) {
        invalid(`No tool output found for function call ${part.id}.`, "input");
      }
    }
  });
  const request = {
    format: FORMAT3,
    model,
    messages,
    tools: definitions,
    toolChoice: choice,
    parallelToolCalls,
    stream,
    ...output === void 0 ? {} : { output },
    reasoning: reasoning !== void 0,
    ...maxOutputTokens === void 0 ? {} : { maxOutputTokens },
    store,
    ...previousResponseId === void 0 ? {} : { previousResponseId },
    references,
    warnings
  };
  const extras = {
    ...instructions === void 0 ? {} : { instructions },
    tools,
    toolChoice: toolChoiceWire,
    temperature: optionalDecimal(raw.temperature, "temperature", 0, 2) ?? 1,
    topP: optionalDecimal(raw.top_p, "top_p", 0, 1) ?? 1,
    text: textWire(raw.text),
    ...reasoning === void 0 ? {} : { reasoning },
    metadata,
    truncation: decodeTruncation(raw.truncation),
    inputItems: ownItems.map(messageToJson),
    gaps: ownGaps
  };
  return { request, extras };
}
function usageWire(usage) {
  return {
    input_tokens: usage.input,
    input_tokens_details: { cached_tokens: 0, cache_write_tokens: 0 },
    output_tokens: usage.output,
    output_tokens_details: { reasoning_tokens: usage.reasoning },
    total_tokens: usage.input + usage.output
  };
}
function itemStatus(finish) {
  return responseStatus(finish).status;
}
function buildOutput(reply, ctx) {
  const output = [];
  const structured = /* @__PURE__ */ new Set();
  let text = [];
  let kind;
  const flushText = () => {
    if (text.length === 0) return;
    const part = {
      type: "output_text",
      text: text.join(""),
      annotations: [],
      logprobs: []
    };
    if (kind === "object") structured.add(part);
    output.push({
      id: ctx.makeId("msg"),
      type: "message",
      role: "assistant",
      status: itemStatus(reply.finish),
      content: [part]
    });
    text = [];
    kind = void 0;
  };
  for (const event of reply.events) {
    switch (event.type) {
      case "reasoning":
        flushText();
        output.push({
          id: ctx.makeId("rs"),
          type: "reasoning",
          status: itemStatus(reply.finish),
          summary: [{ type: "summary_text", text: event.text }]
        });
        break;
      case "text":
        if (kind === "object") flushText();
        kind = "text";
        text.push(event.text);
        break;
      case "object":
        if (kind === "text") flushText();
        kind = "object";
        text.push(JSON.stringify(event.value));
        break;
      case "tool_call":
        flushText();
        output.push({
          id: ctx.makeId("fc"),
          type: "function_call",
          status: itemStatus(reply.finish),
          call_id: event.id,
          name: event.name,
          arguments: event.arguments
        });
        break;
      case "refusal":
        flushText();
        output.push({
          id: ctx.makeId("msg"),
          type: "message",
          role: "assistant",
          status: itemStatus(reply.finish),
          content: [{ type: "refusal", refusal: event.text }]
        });
        break;
    }
  }
  flushText();
  return { output, structured };
}
function responseStatus(finish) {
  if (finish === "length") {
    return { status: "incomplete", incompleteDetails: { reason: "max_output_tokens" } };
  }
  if (finish === "content_filter") {
    return { status: "incomplete", incompleteDetails: { reason: "content_filter" } };
  }
  return { status: "completed", incompleteDetails: null };
}
function buildResponse(reply, decoded, id, createdAt, output) {
  const { request } = decoded;
  const extras = extrasOf(decoded);
  const { status, incompleteDetails } = responseStatus(reply.finish);
  return {
    id,
    object: "response",
    access_programs: null,
    created_at: createdAt,
    status,
    ...status === "completed" ? { completed_at: createdAt } : {},
    error: null,
    incomplete_details: incompleteDetails,
    instructions: extras.instructions ?? null,
    metadata: extras.metadata,
    model: request.model,
    output,
    parallel_tool_calls: request.parallelToolCalls,
    previous_response_id: request.previousResponseId ?? null,
    reasoning: extras.reasoning ?? { effort: null, summary: null },
    temperature: extras.temperature,
    text: extras.text,
    tool_choice: extras.toolChoice,
    tools: extras.tools,
    top_p: extras.topP,
    truncation: extras.truncation,
    usage: usageWire(reply.usage),
    max_output_tokens: request.maxOutputTokens ?? null
  };
}
function preparedFor(reply, decoded, ctx) {
  const cache = decoded.extras;
  const existing = cache.prepared;
  if (existing) return existing;
  const id = ctx.makeId("resp");
  const createdAt = CREATED_AT;
  const { output, structured } = buildOutput(reply, ctx);
  const response = buildResponse(reply, decoded, id, createdAt, output);
  const prepared = { id, createdAt, output, structured, response };
  cache.prepared = prepared;
  return prepared;
}
function emptyResponse(prepared) {
  return {
    ...prepared.response,
    status: "in_progress",
    output: [],
    incomplete_details: null,
    usage: void 0,
    completed_at: void 0,
    error: null
  };
}
function streamFrames3(reply, decoded, ctx) {
  const prepared = preparedFor(reply, decoded, ctx);
  const frames = [];
  let sequence = 0;
  const add = (data, content) => {
    frames.push({
      event: data.type,
      data: { ...data, sequence_number: sequence++ },
      ...content === void 0 ? {} : { content }
    });
  };
  const created = { type: "response.created", response: emptyResponse(prepared) };
  add(created);
  const inProgress = {
    type: "response.in_progress",
    response: emptyResponse(prepared)
  };
  add(inProgress);
  prepared.output.forEach((item, outputIndex) => {
    if (item.type === "message") {
      const added2 = {
        type: "response.output_item.added",
        output_index: outputIndex,
        item: { ...item, status: "in_progress", content: [] }
      };
      add(added2);
      item.content.forEach((part, contentIndex) => {
        if (part.type === "output_text") {
          const partAdded = {
            type: "response.content_part.added",
            item_id: item.id,
            output_index: outputIndex,
            content_index: contentIndex,
            part: { type: "output_text", text: "", annotations: [], logprobs: [] }
          };
          add(partAdded);
          const deltas = prepared.structured.has(part) ? jsonChunks(part.text) : payloadChunks(part.text);
          for (const delta of deltas) {
            const event = {
              type: "response.output_text.delta",
              item_id: item.id,
              output_index: outputIndex,
              content_index: contentIndex,
              delta,
              logprobs: []
            };
            add(event, delta);
          }
          const done = {
            type: "response.output_text.done",
            item_id: item.id,
            output_index: outputIndex,
            content_index: contentIndex,
            text: part.text,
            logprobs: []
          };
          add(done);
          const partDone = {
            type: "response.content_part.done",
            item_id: item.id,
            output_index: outputIndex,
            content_index: contentIndex,
            part
          };
          add(partDone);
        } else {
          const refusalPart = part;
          const partAdded = {
            type: "response.content_part.added",
            item_id: item.id,
            output_index: outputIndex,
            content_index: contentIndex,
            part: { type: "refusal", refusal: "" }
          };
          add(partAdded);
          for (const delta of textChunks(refusalPart.refusal)) {
            const event = {
              type: "response.refusal.delta",
              item_id: item.id,
              output_index: outputIndex,
              content_index: contentIndex,
              delta
            };
            add(event, delta);
          }
          const done = {
            type: "response.refusal.done",
            item_id: item.id,
            output_index: outputIndex,
            content_index: contentIndex,
            refusal: refusalPart.refusal
          };
          add(done);
          const partDone = {
            type: "response.content_part.done",
            item_id: item.id,
            output_index: outputIndex,
            content_index: contentIndex,
            part
          };
          add(partDone);
        }
      });
      const itemDone2 = {
        type: "response.output_item.done",
        output_index: outputIndex,
        item
      };
      add(itemDone2);
      return;
    }
    if (item.type === "function_call") {
      const added2 = {
        type: "response.output_item.added",
        output_index: outputIndex,
        item: { ...item, status: "in_progress", arguments: "" }
      };
      add(added2);
      for (const delta of jsonChunks(item.arguments)) {
        const event = {
          type: "response.function_call_arguments.delta",
          item_id: item.id ?? `fc_${outputIndex}`,
          output_index: outputIndex,
          delta
        };
        add(event, delta);
      }
      const done = {
        type: "response.function_call_arguments.done",
        item_id: item.id ?? `fc_${outputIndex}`,
        output_index: outputIndex,
        arguments: item.arguments
      };
      add(done);
      const itemDone2 = {
        type: "response.output_item.done",
        output_index: outputIndex,
        item
      };
      add(itemDone2);
      return;
    }
    const reasoning = item;
    const added = {
      type: "response.output_item.added",
      output_index: outputIndex,
      item: { ...reasoning, status: "in_progress", summary: [] }
    };
    add(added);
    reasoning.summary.forEach((summary, summaryIndex) => {
      const partAdded = {
        type: "response.reasoning_summary_part.added",
        item_id: reasoning.id,
        output_index: outputIndex,
        summary_index: summaryIndex,
        part: { type: "summary_text", text: "" }
      };
      add(partAdded);
      for (const delta of textChunks(summary.text)) {
        const event = {
          type: "response.reasoning_summary_text.delta",
          item_id: reasoning.id,
          output_index: outputIndex,
          summary_index: summaryIndex,
          delta
        };
        add(event);
      }
      const textDone = {
        type: "response.reasoning_summary_text.done",
        item_id: reasoning.id,
        output_index: outputIndex,
        summary_index: summaryIndex,
        text: summary.text
      };
      add(textDone);
      const partDone = {
        type: "response.reasoning_summary_part.done",
        item_id: reasoning.id,
        output_index: outputIndex,
        summary_index: summaryIndex,
        part: summary
      };
      add(partDone);
    });
    const itemDone = {
      type: "response.output_item.done",
      output_index: outputIndex,
      item: reasoning
    };
    add(itemDone);
  });
  const terminal = prepared.response;
  if (terminal.status === "incomplete") {
    const event = {
      type: "response.incomplete",
      response: terminal
    };
    add(event);
  } else {
    const event = {
      type: "response.completed",
      response: terminal
    };
    add(event);
  }
  return frames;
}
function afterReply(reply, decoded, ctx) {
  if (!decoded.request.store) return;
  const extras = extrasOf(decoded);
  const prepared = preparedFor(reply, decoded, ctx);
  const responses = ctx.state.responses;
  const parent = decoded.request.references.find(
    (reference) => reference.kind === "previous_response" && reference.resolved
  );
  responses.set(prepared.id, {
    id: prepared.id,
    createdAt: prepared.createdAt,
    model: decoded.request.model,
    ...extras.instructions === void 0 ? {} : { instructions: extras.instructions },
    ...parent === void 0 ? {} : { previousResponseId: parent.id },
    inputItems: extras.inputItems,
    outputItems: prepared.output,
    response: prepared.response,
    ...extras.gaps.length > 0 ? { gaps: extras.gaps } : {}
  });
  while (responses.size > STORED_RESPONSE_LIMIT) {
    const oldest = responses.keys().next();
    if (oldest.done) break;
    removeStoredResponse(ctx.state, oldest.value);
  }
}
function getStoredResponse(ctx, id) {
  const stored = ctx.state.responses.get(id);
  if (!stored) return sendJson(errorBody3(notFound(id)), 404);
  return sendJson(stored.response);
}
function deleteStoredResponse(ctx, id) {
  const stored = ctx.state.responses.get(id);
  if (!stored) return sendJson(errorBody3(notFound(id)), 404);
  removeStoredResponse(ctx.state, id);
  return sendJson({ id, object: "response.deleted", deleted: true });
}
var responsesCodec = {
  format: FORMAT3,
  decode: decode2,
  encodeJson(reply, decoded, ctx) {
    return preparedFor(reply, decoded, ctx).response;
  },
  streamFrames: streamFrames3,
  errorBody: errorBody3,
  afterReply
};
var keywords = /* @__PURE__ */ new Set([
  "$schema",
  "$id",
  "$defs",
  "definitions",
  "$ref",
  "title",
  "description",
  "default",
  "examples",
  "type",
  "properties",
  "required",
  "additionalProperties",
  "enum",
  "const",
  "items",
  "minimum",
  "maximum",
  "exclusiveMinimum",
  "exclusiveMaximum",
  "multipleOf",
  "minLength",
  "maxLength",
  "minItems",
  "maxItems",
  "nullable",
  "anyOf",
  "oneOf",
  "format",
  "pattern"
]);
var types = /* @__PURE__ */ new Set(["object", "array", "string", "number", "integer", "boolean", "null"]);
var PATTERN_TIMEOUT_MS = 250;
var PATTERN_BUDGET_MS = 2e3;
var PATTERN_CHECK_COST = 4;
var patternSandbox = createContext({ pattern: "", value: "" });
var patternTest = new Script(
  "(() => { let regex; try { regex = new RegExp(pattern, 'u'); } catch { try { regex = new RegExp(pattern); } catch { return null; } } return regex.test(value); })()"
);
var formatSamples = {
  email: "user@example.com",
  uuid: "00000000-0000-4000-8000-000000000000",
  uri: "https://example.com/",
  hostname: "example.com",
  ipv4: "192.0.2.1",
  ipv6: "2001:db8::1",
  date: "2026-01-01",
  time: "00:00:00Z",
  "date-time": "2026-01-01T00:00:00Z",
  duration: "PT1S"
};
function fail4(path, reason) {
  throw new AiRequestError(`Cannot generate a default for ${path}: ${reason}. Add an explicit reply rule.`, path);
}
function record2(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function equal(left, right) {
  if (left === right) return true;
  if (Array.isArray(left) || Array.isArray(right)) {
    return Array.isArray(left) && Array.isArray(right) && left.length === right.length && left.every((item, index) => equal(item, right[index]));
  }
  if (record2(left) && record2(right)) {
    const keys = Object.keys(left);
    return keys.length === Object.keys(right).length && keys.every((key) => Object.hasOwn(right, key) && equal(left[key], right[key]));
  }
  return false;
}
function adjacentNumber(value, direction) {
  if (value === 0) return direction * Number.MIN_VALUE;
  const view = new DataView(new ArrayBuffer(8));
  view.setFloat64(0, value);
  view.setBigUint64(0, view.getBigUint64(0) + (value > 0 === direction > 0 ? 1n : -1n));
  return view.getFloat64(0);
}
function sampleSchema(schema, seed, path = "schema") {
  function asSchema(value2, at) {
    if (typeof value2 !== "boolean" && !record2(value2)) fail4(at, "expected a schema");
    return value2;
  }
  let remaining = 4096;
  let aborted;
  let patternMillis = 0;
  let characters = 262144;
  const seedLimit = 64;
  const seedText = Array.from(String(seed) || "sample").slice(0, seedLimit);
  function spend(at) {
    if (--remaining < 0) fail4(at, "generation exceeds the bounded schema size or recursion depth");
  }
  function resolve(ref, at) {
    if (typeof ref !== "string" || ref !== "#" && !ref.startsWith("#/")) {
      fail4(at, "only local references are supported");
    }
    let target = schema;
    for (const segment of ref === "#" ? [] : ref.slice(2).split("/")) {
      const key = segment.replace(/~1/g, "/").replace(/~0/g, "~");
      spend(at);
      if (Array.isArray(target)) {
        if (!/^(0|[1-9]\d*)$/.test(key) || Number(key) >= target.length) {
          fail4(at, `unresolved reference ${ref}`);
        }
        target = target[Number(key)];
      } else if (record2(target) && Object.hasOwn(target, key)) {
        target = target[key];
      } else {
        fail4(at, `unresolved reference ${ref}`);
      }
    }
    return asSchema(target, at);
  }
  function validate(node, at, depth = 0) {
    if (depth > 32) fail4(at, "schema nesting exceeds 32 levels");
    if (typeof node === "boolean") return;
    for (const key of Object.keys(node)) {
      if (!keywords.has(key)) fail4(`${at}.${key}`, "unsupported schema keyword");
    }
    if (node.$ref !== void 0) resolve(node.$ref, `${at}.$ref`);
    if (node.type !== void 0) {
      const list = Array.isArray(node.type) ? node.type : [node.type];
      if (!list.length || list.some((type) => typeof type !== "string" || !types.has(type))) {
        fail4(`${at}.type`, "unsupported type");
      }
    }
    for (const key of ["properties", "$defs", "definitions"]) {
      if (node[key] === void 0) continue;
      if (!record2(node[key])) fail4(`${at}.${key}`, "expected an object");
      for (const [name, child] of Object.entries(node[key])) {
        validate(asSchema(child, `${at}.${key}.${name}`), `${at}.${key}.${name}`, depth + 1);
      }
    }
    if (node.required !== void 0 && (!Array.isArray(node.required) || node.required.some((key) => typeof key !== "string"))) {
      fail4(`${at}.required`, "expected property names");
    }
    if (node.enum !== void 0) {
      if (!Array.isArray(node.enum) || !node.enum.length) fail4(`${at}.enum`, "expected a nonempty array");
      node.enum.forEach((item, index) => checkValue(item, `${at}.enum[${index}]`));
    }
    if (Object.hasOwn(node, "const")) checkValue(node.const, `${at}.const`);
    if (node.pattern !== void 0) patternMatches(node.pattern, "", at);
    if (node.nullable !== void 0 && typeof node.nullable !== "boolean") fail4(`${at}.nullable`, "expected a boolean");
    if (node.items !== void 0) validate(asSchema(node.items, `${at}.items`), `${at}.items`, depth + 1);
    if (node.additionalProperties !== void 0) {
      validate(
        asSchema(node.additionalProperties, `${at}.additionalProperties`),
        `${at}.additionalProperties`,
        depth + 1
      );
    }
    if (node.anyOf !== void 0) {
      if (!Array.isArray(node.anyOf) || !node.anyOf.length) fail4(`${at}.anyOf`, "expected a nonempty array");
      node.anyOf.forEach(
        (branch, index) => validate(asSchema(branch, `${at}.anyOf[${index}]`), `${at}.anyOf[${index}]`, depth + 1)
      );
    }
    if (node.oneOf !== void 0) {
      if (!Array.isArray(node.oneOf) || !node.oneOf.length) fail4(`${at}.oneOf`, "expected a nonempty array");
      node.oneOf.forEach(
        (branch, index) => validate(asSchema(branch, `${at}.oneOf[${index}]`), `${at}.oneOf[${index}]`, depth + 1)
      );
    }
    for (const key of [
      "minimum",
      "maximum",
      "exclusiveMinimum",
      "exclusiveMaximum",
      "multipleOf",
      "minLength",
      "maxLength",
      "minItems",
      "maxItems"
    ]) {
      const bound = node[key];
      if (bound === void 0) continue;
      if (typeof bound !== "number" || !Number.isFinite(bound)) fail4(`${at}.${key}`, "expected a finite number");
      if ((key.endsWith("Length") || key.endsWith("Items")) && (!Number.isSafeInteger(bound) || bound < 0)) {
        fail4(`${at}.${key}`, "expected a nonnegative integer");
      }
      if (key === "multipleOf" && bound <= 0) fail4(`${at}.${key}`, "expected a positive number");
    }
  }
  function checkValue(value2, at, depth = 0) {
    if (depth > 32) fail4(at, "value nesting exceeds 32 levels");
    if (Array.isArray(value2)) {
      for (const item of value2) checkValue(item, at, depth + 1);
    } else if (record2(value2)) {
      for (const item of Object.values(value2)) checkValue(item, at, depth + 1);
    }
  }
  function patternMatches(pattern, value2, at) {
    if (typeof pattern !== "string") fail4(`${at}.pattern`, "expected a regular expression");
    remaining -= PATTERN_CHECK_COST - 1;
    spend(`${at}.pattern`);
    let result;
    let timedOut = false;
    const started = performance.now();
    try {
      Object.assign(patternSandbox, { pattern, value: value2 });
      result = patternTest.runInContext(patternSandbox, { timeout: PATTERN_TIMEOUT_MS });
    } catch {
      timedOut = true;
    }
    patternMillis += performance.now() - started;
    if (timedOut || patternMillis > PATTERN_BUDGET_MS) {
      aborted = new AiRequestError(
        `Cannot generate a default for ${at}.pattern: the regular expression exceeds the time limit. Add an explicit reply rule.`,
        `${at}.pattern`
      );
      throw aborted;
    }
    if (result === null) fail4(`${at}.pattern`, "not a valid regular expression");
    return result === true;
  }
  function matches2(value2, node, depth = 0, at = path) {
    spend(path);
    if (depth > 32) return false;
    if (typeof node === "boolean") return node;
    if (node.$ref !== void 0 && !matches2(value2, resolve(node.$ref, path), depth + 1, at)) return false;
    if (node.anyOf !== void 0 && !node.anyOf.some(
      (branch, index) => matches2(value2, branch, depth + 1, `${at}.anyOf[${index}]`)
    ))
      return false;
    if (Array.isArray(node.oneOf)) {
      let matched = 0;
      for (const [index, branch] of node.oneOf.entries()) {
        if (matches2(value2, branch, depth + 1, `${at}.oneOf[${index}]`)) matched += 1;
        if (matched > 1) return false;
      }
      if (matched !== 1) return false;
    }
    if (Object.hasOwn(node, "const") && !equal(value2, node.const)) return false;
    if (Array.isArray(node.enum) && !node.enum.some((item) => equal(item, value2))) return false;
    const valueType = value2 === null ? "null" : Array.isArray(value2) ? "array" : typeof value2;
    if (node.type !== void 0 && !(node.nullable === true && value2 === null)) {
      const list = Array.isArray(node.type) ? node.type : [node.type];
      if (!list.some(
        (type) => type === valueType || type === "integer" && typeof value2 === "number" && Number.isInteger(value2)
      ))
        return false;
    }
    if (typeof value2 === "number") {
      if (typeof node.minimum === "number" && value2 < node.minimum) return false;
      if (typeof node.maximum === "number" && value2 > node.maximum) return false;
      if (typeof node.exclusiveMinimum === "number" && value2 <= node.exclusiveMinimum) return false;
      if (typeof node.exclusiveMaximum === "number" && value2 >= node.exclusiveMaximum) return false;
      if (typeof node.multipleOf === "number" && Math.abs(value2 / node.multipleOf - Math.round(value2 / node.multipleOf)) > 1e-8)
        return false;
    }
    if (typeof value2 === "string" && node.pattern !== void 0 && !patternMatches(node.pattern, value2, at)) {
      return false;
    }
    if (typeof value2 === "string" || Array.isArray(value2)) {
      const length = typeof value2 === "string" ? Array.from(value2).length : value2.length;
      const min = node[typeof value2 === "string" ? "minLength" : "minItems"];
      const max = node[typeof value2 === "string" ? "maxLength" : "maxItems"];
      if (typeof min === "number" && length < min) return false;
      if (typeof max === "number" && length > max) return false;
      if (Array.isArray(value2) && node.items !== void 0 && !value2.every((item) => matches2(item, node.items, depth + 1, `${at}.items`)))
        return false;
    }
    if (record2(value2)) {
      if (Array.isArray(node.required) && node.required.some((key) => !Object.hasOwn(value2, key)))
        return false;
      const properties = record2(node.properties) ? node.properties : {};
      for (const [key, item] of Object.entries(value2)) {
        const child = Object.hasOwn(properties, key) ? properties[key] : node.additionalProperties;
        if (child !== void 0 && !matches2(item, child, depth + 1, `${at}.properties.${key}`))
          return false;
      }
    }
    return true;
  }
  function siblings(node, keyword) {
    return Object.fromEntries(Object.entries(node).filter(([key]) => key !== keyword));
  }
  function mergeSchema(branch, rest) {
    if (typeof branch === "boolean") return branch === false ? false : rest;
    const merged = { ...rest, ...branch };
    for (const key of ["maximum", "exclusiveMaximum", "maxLength", "maxItems"]) {
      if (typeof rest[key] === "number" && typeof branch[key] === "number")
        merged[key] = Math.min(rest[key], branch[key]);
    }
    for (const key of ["minimum", "exclusiveMinimum", "minLength", "minItems"]) {
      if (typeof rest[key] === "number" && typeof branch[key] === "number")
        merged[key] = Math.max(rest[key], branch[key]);
    }
    if (rest.type !== void 0 && branch.type !== void 0) {
      const left = Array.isArray(rest.type) ? rest.type : [rest.type];
      const right = Array.isArray(branch.type) ? branch.type : [branch.type];
      const types2 = /* @__PURE__ */ new Set();
      for (const a of left) {
        for (const b of right) {
          if (a === b) types2.add(a);
          else if (a === "integer" && b === "number" || a === "number" && b === "integer") types2.add("integer");
        }
      }
      if (!types2.size) return false;
      merged.type = types2.size === 1 ? [...types2][0] : [...types2];
    }
    if (merged.nullable === true) {
      const typedStrict = (side) => side.type !== void 0 && side.nullable !== true;
      if (typedStrict(rest) || typedStrict(branch)) delete merged.nullable;
    }
    if (typeof rest.multipleOf === "number" && typeof branch.multipleOf === "number") {
      const [small, large] = [rest.multipleOf, branch.multipleOf].sort((a, b) => a - b);
      if (Number.isInteger(small) && Number.isInteger(large)) {
        let [divisor, rem] = [large, small];
        while (rem) [divisor, rem] = [rem, divisor % rem];
        merged.multipleOf = small / divisor * large;
      } else if (Math.abs(large / small - Math.round(large / small)) <= 1e-8) {
        merged.multipleOf = large;
      }
    }
    if (typeof rest.format === "string" && typeof branch.format === "string" && rest.format !== branch.format && Object.hasOwn(formatSamples, rest.format) && Object.hasOwn(formatSamples, branch.format))
      return false;
    if (Object.hasOwn(rest, "const") && Object.hasOwn(branch, "const") && !equal(rest.const, branch.const))
      return false;
    if (Array.isArray(rest.enum) && Array.isArray(branch.enum)) {
      merged.enum = branch.enum.filter((item) => rest.enum.some((other) => equal(item, other)));
    }
    if (Array.isArray(rest.required) && Array.isArray(branch.required)) {
      merged.required = [.../* @__PURE__ */ new Set([...rest.required, ...branch.required])];
    }
    if (record2(rest.properties) && record2(branch.properties)) {
      const properties = { ...rest.properties, ...branch.properties };
      for (const key of Object.keys(branch.properties)) {
        const other = rest.properties[key];
        if (Object.hasOwn(rest.properties, key) && record2(other)) {
          properties[key] = mergeSchema(branch.properties[key], other);
        }
      }
      merged.properties = properties;
    }
    for (const key of ["items", "additionalProperties"]) {
      if (record2(rest[key]) && record2(branch[key])) {
        merged[key] = mergeSchema(branch[key], rest[key]);
      }
    }
    return merged;
  }
  function flatten(branch, rest, at) {
    const merged = mergeSchema(branch, rest);
    if (!record2(merged) || merged.$ref === void 0) return merged;
    return mergeSchema(resolve(merged.$ref, `${at}.$ref`), siblings(merged, "$ref"));
  }
  function exclusiveVariants(own, others) {
    const variants = [];
    const required = Array.isArray(own.required) ? own.required : [];
    for (const key of record2(own.properties) ? Object.keys(own.properties) : []) {
      if (!required.includes(key)) variants.push({ required: [...required, key] });
    }
    for (const item of Array.isArray(own.enum) ? own.enum : []) variants.push({ const: item });
    for (const other of others) {
      if (!record2(other)) continue;
      for (const [min, max] of [
        ["minLength", "maxLength"],
        ["minItems", "maxItems"]
      ]) {
        if (typeof other[min] === "number" && other[min] > 0) variants.push({ [max]: other[min] - 1 });
        if (typeof other[max] === "number") variants.push({ [min]: other[max] + 1 });
      }
      if (typeof other.minimum === "number") variants.push({ exclusiveMaximum: other.minimum });
      if (typeof other.exclusiveMinimum === "number") variants.push({ maximum: other.exclusiveMinimum });
      if (typeof other.maximum === "number") variants.push({ exclusiveMinimum: other.maximum });
      if (typeof other.exclusiveMaximum === "number") variants.push({ minimum: other.exclusiveMaximum });
    }
    return variants.slice(0, 16).map((variant) => mergeSchema(variant, own));
  }
  function sampleAlternative(node, keyword, at, depth) {
    const rest = siblings(node, keyword);
    const branches = node[keyword];
    let sampled = false;
    let firstError;
    const attempt = (schema2, where) => {
      const before = characters;
      try {
        const value2 = sample(schema2, where, depth + 1);
        sampled = true;
        if (matches2(value2, node)) return value2;
        if (keyword === "oneOf" && typeof value2 === "number" && matches2(value2 + 0.5, node)) return value2 + 0.5;
      } catch (error) {
        if (!(error instanceof AiRequestError) || error === aborted) throw error;
        firstError ??= error;
        characters = before;
      }
      return void 0;
    };
    for (const [index, branch] of branches.entries()) {
      const where = `${at}.${keyword}[${index}]`;
      const found = attempt(mergeSchema(branch, rest), where);
      if (found !== void 0) return found;
      if (keyword !== "oneOf" || !sampled) continue;
      let own;
      let others;
      try {
        own = flatten(branch, rest, where);
        others = branches.flatMap((other, at2) => at2 === index ? [] : [flatten(other, rest, where)]);
      } catch (error) {
        if (!(error instanceof AiRequestError) || error === aborted) throw error;
        continue;
      }
      if (!record2(own)) continue;
      for (const variant of exclusiveVariants(own, others)) {
        const hit = attempt(variant, where);
        if (hit !== void 0) return hit;
      }
    }
    if (!sampled && firstError) throw firstError;
    if (keyword === "oneOf") fail4(at, "no oneOf branch produces a value that matches exactly one branch");
    fail4(at, "no anyOf branch produces a value that satisfies the schema");
  }
  function sample(node, at, depth = 0) {
    if (depth > 32) fail4(at, "generation exceeds the bounded schema size or recursion depth");
    spend(at);
    if (node === false) fail4(at, "schema permits no value");
    if (node === true) return null;
    if (Object.hasOwn(node, "const")) {
      if (!matches2(node.const, node, 0, at)) fail4(at, "const does not satisfy the schema");
      characters -= JSON.stringify(node.const).length;
      if (characters < 0) fail4(at, "sample exceeds the bounded output size");
      return structuredClone(node.const);
    }
    if (Array.isArray(node.enum)) {
      const candidate = node.enum.find((value3) => matches2(value3, node, 0, at));
      if (candidate === void 0) fail4(at, "no enum value satisfies the schema");
      characters -= JSON.stringify(candidate).length;
      if (characters < 0) fail4(at, "sample exceeds the bounded output size");
      return structuredClone(candidate);
    }
    if ((node.nullable === true || depth > 8) && matches2(null, node)) return null;
    let value2;
    if (node.$ref !== void 0) {
      const resolved = resolve(node.$ref, `${at}.$ref`);
      value2 = sample(mergeSchema(resolved, siblings(node, "$ref")), `${at}.$ref`, depth + 1);
    } else if (Array.isArray(node.anyOf)) {
      value2 = sampleAlternative(node, "anyOf", at, depth);
    } else if (Array.isArray(node.oneOf)) {
      value2 = sampleAlternative(node, "oneOf", at, depth);
    } else {
      const type = Array.isArray(node.type) ? node.type[0] : node.type ?? (node.properties || node.required ? "object" : node.items ? "array" : "null");
      switch (type) {
        case "object": {
          const properties = record2(node.properties) ? node.properties : {};
          const required = new Set(node.required ?? []);
          const entries = [];
          for (const key of required) {
            const child = Object.hasOwn(properties, key) ? properties[key] : node.additionalProperties ?? true;
            entries.push([key, sample(child, `${at}.properties.${key}`, depth + 1)]);
          }
          value2 = Object.fromEntries(entries);
          break;
        }
        case "array": {
          const count = typeof node.minItems === "number" ? node.minItems : 0;
          if (count > remaining) fail4(`${at}.minItems`, "array exceeds the bounded output size");
          value2 = Array.from(
            { length: count },
            (_, index) => sample(node.items ?? true, `${at}.items[${index}]`, depth + 1)
          );
          break;
        }
        case "string": {
          const known = typeof node.format === "string" ? formatSamples[node.format] : void 0;
          if (known !== void 0) {
            characters -= known.length;
            if (characters < 0) fail4(at, "sample exceeds the bounded output size");
            value2 = known;
            break;
          }
          if (node.pattern !== void 0) {
            fail4(at, "the sampler cannot generate a string for a pattern");
          }
          const min = typeof node.minLength === "number" ? node.minLength : 0;
          const max = typeof node.maxLength === "number" ? node.maxLength : 65536;
          const length = Math.max(min, Math.min(seedText.length, max));
          characters -= length;
          if (length > 65536 || characters < 0) fail4(at, "string exceeds the bounded output size");
          value2 = Array.from({ length }, (_, index) => seedText[index % seedText.length]).join("");
          break;
        }
        case "integer":
        case "number": {
          let step = typeof node.multipleOf === "number" ? node.multipleOf : type === "integer" ? 1 : void 0;
          if (type === "integer" && step !== void 0 && !Number.isInteger(step)) {
            const [coefficient, exponent = "0"] = step.toString().split("e");
            const decimals = coefficient.split(".")[1]?.length ?? 0;
            const scale = 10 ** Math.max(0, decimals - Number(exponent));
            let numerator = Math.round(step * scale);
            let denominator = scale;
            while (denominator) [numerator, denominator] = [denominator, numerator % denominator];
            step = Math.round(step * scale) / numerator;
          }
          const low = Math.max(
            typeof node.minimum === "number" ? node.minimum : -Infinity,
            typeof node.exclusiveMinimum === "number" ? node.exclusiveMinimum : -Infinity
          );
          const high = Math.min(
            typeof node.maximum === "number" ? node.maximum : Infinity,
            typeof node.exclusiveMaximum === "number" ? node.exclusiveMaximum : Infinity
          );
          let number = Number.isFinite(low) ? low : Math.min(0, high);
          if (step !== void 0) {
            const [coefficient, exponent = "0"] = step.toString().split("e");
            const decimals = coefficient.split(".")[1]?.length ?? 0;
            const digits = Number(coefficient.replace(".", ""));
            const multiply = (count2) => {
              const [product, shift = "0"] = (count2 * digits).toString().split("e");
              return Number(`${product}e${Number(shift) + Number(exponent) - decimals}`);
            };
            let count = Math.round(number / step);
            if (Number.isFinite(low) && multiply(count) < low) count++;
            if (!Number.isFinite(low) && multiply(count) > high) count--;
            if (multiply(count) === node.exclusiveMinimum) count++;
            if (multiply(count) === node.exclusiveMaximum && !Number.isFinite(low)) count--;
            number = multiply(count);
          } else {
            if (number === node.exclusiveMinimum) number = adjacentNumber(number, 1);
            if (number === node.exclusiveMaximum) number = adjacentNumber(number, -1);
          }
          if (!Number.isFinite(number)) fail4(at, "numeric bounds permit no finite sample");
          value2 = number;
          break;
        }
        case "boolean":
          value2 = false;
          break;
        case "null":
          value2 = null;
          break;
        default:
          fail4(`${at}.type`, "unsupported type");
      }
    }
    if (!matches2(value2, node, 0, at)) fail4(at, "constraints do not permit the generated sample");
    return value2;
  }
  validate(schema, path);
  const value = sample(schema, path);
  if (JSON.stringify(value).length > 262144) fail4(path, "sample exceeds the bounded output size");
  return value;
}
function eventText(event) {
  if (event.type === "object") return JSON.stringify(event.value);
  if (event.type === "tool_call") return event.name + event.arguments;
  return event.text;
}
function eventTokens(event) {
  return Math.ceil(eventText(event).length / 4);
}
function estimateUsage(request, events) {
  const input = JSON.stringify({ messages: request.messages, tools: request.tools, output: request.output }).length;
  let output = 0;
  let reasoning = 0;
  for (const event of events) {
    const tokens = eventTokens(event);
    output += tokens;
    if (event.type === "reasoning") reasoning += tokens;
  }
  return { input: Math.ceil(input / 4), output, reasoning };
}
function toolCallName(request, id) {
  for (const message of request.messages) {
    for (const part of message.parts) {
      if (part.type === "tool_call" && part.id === id) return part.name;
    }
  }
  return void 0;
}
function toolArgumentSchema(tool) {
  const at = `tools.${tool.name}.parameters`;
  const parameters = tool.parameters ?? true;
  if (parameters === false) fail4(at, "schema permits no object");
  if (parameters === true) return { type: "object" };
  const rest = { ...parameters };
  delete rest.nullable;
  const list = rest.type === void 0 ? ["object"] : Array.isArray(rest.type) ? rest.type : [rest.type];
  if (!list.includes("object")) fail4(`${at}.type`, "tool arguments must be a JSON object");
  return { ...rest, type: "object" };
}
function toolCallPrefix(request) {
  return request.format === "anthropic-messages" ? "toolu" : "call";
}
function defaultEvents(request, makeId) {
  const turn = currentTurn(request);
  let kind;
  let event;
  if (turn.forcedTool) {
    const tool = turn.forcedTool;
    const args = sampleSchema(toolArgumentSchema(tool), turn.text, `tools.${tool.name}.parameters`);
    kind = "forced_tool";
    event = {
      type: "tool_call",
      id: makeId(toolCallPrefix(request)),
      name: tool.name,
      arguments: JSON.stringify(args)
    };
  } else if (request.output) {
    kind = request.output.kind;
    event = {
      type: "object",
      value: request.output.kind === "json_object" ? {} : sampleSchema(request.output.schema, turn.text)
    };
  } else if (turn.pendingResult) {
    const result = turn.pendingResult;
    kind = "tool_result";
    event = {
      type: "text",
      text: `Received the result of ${result.name ?? toolCallName(request, result.id) ?? result.id}.`
    };
  } else if (!turn.text && turn.files.length > 0) {
    const names = turn.files.map((file) => file.name ?? file.mediaType).join(", ");
    kind = "attachments";
    event = { type: "text", text: `Received ${turn.files.length} files (${names}).` };
  } else {
    kind = "echo";
    event = { type: "text", text: turn.text };
  }
  return { kind, events: [event] };
}
function strictMissFailure(request, exhaustedRuleIds, ruleIds) {
  let id = "matching-reply";
  for (let suffix = 2; ruleIds.includes(id); suffix++) id = `matching-reply-${suffix}`;
  const match = { model: request.model, format: request.format };
  const rule = { id, match, reply: [{ type: "text", text: "Replace with your expected reply." }] };
  const yaml = [
    "ai:",
    "  rules:",
    `    - id: ${rule.id}`,
    "      match:",
    `        model: ${JSON.stringify(request.model)}`,
    `        format: ${request.format}`,
    "      reply:",
    "        - type: text",
    `          text: ${JSON.stringify(rule.reply[0].text)}`
  ].join("\n");
  return {
    status: 400,
    type: "invalid_request_error",
    message: [
      `No AI rule matched model ${JSON.stringify(request.model)} with tools ${JSON.stringify(request.tools.map((tool) => tool.name))}.`,
      ...exhaustedRuleIds.length ? [`Exhausted matching rules: ${exhaustedRuleIds.map((id2) => JSON.stringify(id2)).join(", ")}.`] : [],
      `Add a matching rule to your seed configuration:
${yaml}`,
      `Or PUT /_ai/rules with this JSON body. It replaces the whole configuration, so add the rules and settings you want to keep:
${JSON.stringify({ strict: true, rules: [rule] }, null, 2)}`
    ].join("\n\n")
  };
}
function earliestStop(text, sequences) {
  let found;
  for (const sequence of sequences) {
    const at = text.indexOf(sequence);
    if (at !== -1 && (found === void 0 || at < found.at)) found = { at, sequence };
  }
  return found;
}
function applyStop(events, stop) {
  const sequences = (stop ?? []).filter((sequence) => sequence !== "");
  const hit = earliestStop(events.map((event) => event.type === "text" ? event.text : "").join(""), sequences);
  if (hit === void 0) return { events, ending: { kind: "complete" } };
  const kept = [];
  let before = 0;
  for (const event of events) {
    if (event.type !== "text") {
      kept.push(event);
      continue;
    }
    const end = before + event.text.length;
    if (hit.at < end) {
      const text = event.text.slice(0, hit.at - before);
      if (text !== "") kept.push({ ...event, text });
      break;
    }
    kept.push(event);
    before = end;
  }
  return { events: kept, ending: { kind: "stop_sequence", sequence: hit.sequence } };
}
function withoutLoneHighSurrogate(text) {
  const last = text.charCodeAt(text.length - 1);
  return last >= 55296 && last <= 56319 ? text.slice(0, -1) : text;
}
function applyCap(events, maxOutputTokens) {
  if (maxOutputTokens === void 0) return { events, capped: false };
  const kept = [];
  let left = maxOutputTokens;
  for (const event of events) {
    const cost = eventTokens(event);
    if (cost <= left) {
      kept.push(event);
      left -= cost;
      continue;
    }
    if (event.type !== "tool_call") {
      const prefix = withoutLoneHighSurrogate(eventText(event).slice(0, left * 4));
      if (prefix !== "") {
        kept.push(event.type === "object" ? { type: "text", text: prefix } : { ...event, text: prefix });
      }
    }
    return { events: kept, capped: true };
  }
  return { events: kept, capped: false };
}
function applyLimits(request, events) {
  const stopped = applyStop(events, request.stop);
  const capped = applyCap(stopped.events, request.maxOutputTokens);
  if (capped.capped) return { events: capped.events, ending: { kind: "max_tokens" } };
  return { events: capped.events, ending: stopped.ending };
}
function finishOf(events, ending, override) {
  if (override !== void 0) return override;
  if (ending.kind === "max_tokens") return "length";
  if (events.some((event) => event.type === "tool_call")) return "tool_calls";
  if (events.some((event) => event.type === "refusal")) return "refusal";
  return "stop";
}
function replyOf(request, events, finish) {
  const limited = applyLimits(request, events);
  const reply = {
    events: limited.events,
    finish: finishOf(limited.events, limited.ending, finish),
    usage: estimateUsage(request, limited.events)
  };
  return limited.ending.kind === "stop_sequence" ? { ...reply, stopSequence: limited.ending.sequence } : reply;
}
function hashText(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 16777619) >>> 0;
  }
  return hash;
}
function applyVariant(rule, state) {
  const variants = rule.variants;
  if (!variants || variants.length === 0) return rule;
  const hits = state.variantHits;
  const hit = hits.get(rule.id) ?? 0;
  hits.set(rule.id, hit + 1);
  const variant = variants[variantIndex(state.config.random.seed, rule.id, hit, variants.length)];
  if (!variant) return rule;
  const finish = variant.finish ?? rule.finish;
  const fault = variant.fault ?? rule.fault;
  const timing = rule.timing || variant.timing ? { ...rule.timing, ...variant.timing } : void 0;
  return {
    id: rule.id,
    match: rule.match,
    ...rule.times === void 0 ? {} : { times: rule.times },
    ...variant.reply === void 0 ? {} : { reply: variant.reply },
    ...variant.error === void 0 ? {} : { error: variant.error },
    ...finish === void 0 ? {} : { finish },
    ...timing === void 0 ? {} : { timing },
    ...fault === void 0 ? {} : { fault }
  };
}
function variantIndex(seed, ruleId, hit, length) {
  if (length <= 1) return 0;
  let state = (seed ^ hashText(ruleId)) >>> 0;
  const order = Array.from({ length }, (_, index) => index);
  for (let index = length - 1; index > 0; index -= 1) {
    state = Math.imul(state ^ state >>> 15, 739982445) + 695872825 >>> 0;
    const swap = state % (index + 1);
    const value = order[index];
    order[index] = order[swap];
    order[swap] = value;
  }
  return order[hit % length];
}
function idFactory(state) {
  return (prefix) => `${prefix}_${nextId(state)}`;
}
function decide(store, request) {
  const state = getAiState(store);
  const makeId = idFactory(state);
  const match = matchRule(state.config, state.budgets, request);
  if ("rule" in match) {
    const { snapshot } = match;
    const rule = applyVariant(match.rule, state);
    if (rule.error) return { kind: "error", matched: snapshot, failure: rule.error };
    return {
      kind: "reply",
      matched: snapshot,
      timing: { ...state.config.timing, ...rule.timing },
      ...rule.fault ? { fault: rule.fault } : {},
      reply: replyOf(
        request,
        ruleEvents(rule, () => makeId(toolCallPrefix(request))),
        rule.finish
      )
    };
  }
  if (state.config.strict) {
    const ruleIds = state.config.rules.map((rule) => rule.id);
    return { kind: "error", matched: null, failure: strictMissFailure(request, match.exhausted, ruleIds) };
  }
  const { kind, events } = defaultEvents(request, makeId);
  return {
    kind: "reply",
    matched: { default: kind },
    timing: { ...state.config.timing },
    reply: replyOf(request, events)
  };
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
function renderJsonDetails(label, value, open2 = false) {
  const text = JSON.stringify(value, null, 2) ?? "";
  const bounded2 = text.length > 65536 ? `${text.slice(0, 65536)}
[remaining data omitted from preview]` : text;
  return `<details class="inspector-detail"${open2 ? " open" : ""}><summary>${escapeHtml(label)}</summary><pre class="inspector-json">${escapeHtml(bounded2)}</pre></details>`;
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
var TABS = [
  { id: "calls", label: "Calls", href: "/?tab=calls" },
  { id: "rules", label: "Rules", href: "/?tab=rules" }
];
function renderAiInspector({ tab, calls, rules, selected }) {
  const body = tab === "rules" ? rulesView2(rules) : callsView(calls, selected);
  return renderInspectorPage("AI Inspector", TABS, tab, body, "AI");
}
function section(title, body) {
  return `<section class="inspector-section"><h2>${escapeHtml(title)}</h2>${body}</section>`;
}
function table(headers, rows, empty) {
  if (rows.length === 0) return `<div class="empty">${escapeHtml(empty)}</div>`;
  const headerHtml = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("");
  const rowHtml = rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("\n");
  return `<div class="inspector-scroll"><table class="inspector-table"><thead><tr>${headerHtml}</tr></thead><tbody>${rowHtml}</tbody></table></div>`;
}
function matchedLabel(matched) {
  if (!matched) return "none";
  if ("default" in matched) return `default: ${matched.default}`;
  return matched.id;
}
function ruleAnswer(rule) {
  if (rule.error) return `error ${rule.error.status}`;
  return rule.fault ? `reply, ${rule.fault.kind} fault` : "reply";
}
function callsView(calls, selected) {
  const ordered = [...calls].sort((a, b) => b.seq - a.seq);
  const rows = ordered.map((call) => [
    `<a href="/?tab=calls&amp;call=${call.seq}">#${call.seq}</a>`,
    escapeHtml(call.time),
    escapeHtml(call.format),
    escapeHtml(call.model),
    escapeHtml(call.stream ? "stream" : "unary"),
    escapeHtml(matchedLabel(call.matched)),
    escapeHtml(String(call.status)),
    escapeHtml(call.fault),
    escapeHtml(call.delivery)
  ]);
  const list = section(
    "Calls",
    table(
      ["Seq", "Time", "Format", "Model", "Mode", "Matched", "Status", "Fault", "Delivery"],
      rows,
      "No calls recorded."
    )
  );
  const chosen = ordered.find((call) => call.seq === selected);
  return chosen ? list + section(`Call #${chosen.seq}`, renderJsonDetails("Record", chosen, true)) : list;
}
function rulesView2(rules) {
  const rows = rules.map(({ rule, remaining }) => [
    escapeHtml(rule.id),
    escapeHtml(JSON.stringify(rule.match)),
    escapeHtml(ruleAnswer(rule)),
    escapeHtml(remaining === null ? "unlimited" : String(remaining))
  ]);
  return section("Rules", table(["ID", "Match", "Answers with", "Remaining"], rows, "No rules loaded."));
}
function delay(ms, signal) {
  if (ms <= 0 || signal.aborted) return Promise.resolve(!signal.aborted);
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve(true);
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", onAbort);
      resolve(false);
    };
    signal.addEventListener("abort", onAbort, { once: true });
  });
}
function formatFrame(frame) {
  const lines = [];
  if (frame.event) lines.push(`event: ${frame.event}`);
  const data = typeof frame.data === "string" ? frame.data : JSON.stringify(frame.data);
  lines.push(`data: ${data}`);
  return `${lines.join("\n")}

`;
}
function frameDelay(timing, index) {
  if (index === 0) return timing.ttftMs;
  const delayMs = timing.chunkDelayMs;
  if (typeof delayMs === "number") return delayMs;
  if (delayMs.length === 0) return 0;
  return delayMs[Math.min(index - 1, delayMs.length - 1)];
}
function sseResponse(frames, options = {}) {
  const encoder = new TextEncoder();
  const timing = options.timing ?? { ttftMs: 0, chunkDelayMs: 0 };
  const stop = new AbortController();
  let index = 0;
  let contentChunks = 0;
  let faultApplied = false;
  let closed = false;
  let settled = false;
  const settle = (delivery) => {
    if (settled) return;
    settled = true;
    options.signal?.removeEventListener("abort", onAbort);
    options.onSettled?.(delivery);
  };
  const onAbort = () => {
    stop.abort();
    settle("client_aborted");
  };
  if (options.signal?.aborted) onAbort();
  else options.signal?.addEventListener("abort", onAbort, { once: true });
  const stream = new ReadableStream({
    async pull(controller) {
      const finish = (delivery, error) => {
        settle(delivery);
        if (closed) return;
        closed = true;
        if (delivery === "completed") controller.close();
        else controller.error(error ?? new Error("Stream aborted"));
      };
      try {
        if (closed) return;
        if (stop.signal.aborted) {
          finish("client_aborted");
          return;
        }
        const fault = options.fault;
        if (fault && !faultApplied && contentChunks >= fault.afterChunks) {
          faultApplied = true;
          options.onFault?.(fault.kind);
          if (fault.kind === "disconnect") {
            await new Promise((resolve) => setTimeout(resolve, 0));
            finish("error", new Error("Stream disconnected"));
            return;
          }
          const ready = await delay(fault.stallMs ?? 0, stop.signal);
          if (closed) return;
          if (!ready) {
            finish("client_aborted");
            return;
          }
        }
        const wait = frameDelay(timing, index);
        if (wait > 0) {
          const ready = await delay(wait, stop.signal);
          if (closed) return;
          if (!ready) {
            finish("client_aborted");
            return;
          }
        }
        const frame = frames[index];
        index += 1;
        if (!frame) {
          finish("completed");
          return;
        }
        controller.enqueue(encoder.encode(formatFrame(frame)));
        if (frame.content !== void 0) contentChunks += 1;
        if (index === frames.length) finish("completed");
      } catch (error) {
        finish("error", error);
      }
    },
    cancel() {
      closed = true;
      stop.abort();
      settle("client_aborted");
    }
  });
  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no"
    }
  });
}
var SUPPORTED_DATA_PATHS = "POST .../chat/completions, POST .../responses, POST .../messages, GET .../models, GET or DELETE .../responses/{id}";
function aiErrorBody(status, message, param, code) {
  return {
    error: {
      message,
      type: defaultErrorType(status),
      param: param ?? null,
      code: code ?? null
    }
  };
}
var CODECS = [
  { suffix: "/chat/completions", codec: chatCodec },
  { suffix: "/responses", codec: responsesCodec },
  { suffix: "/messages", codec: messagesCodec }
];
var MESSAGES_FAMILY = /(?:^|\/)messages(?:\/|$)/;
function errorCodecOf(path, anthropicVersion) {
  if (path === "/_ai" || path.startsWith("/_ai/")) return void 0;
  return MESSAGES_FAMILY.test(path) || anthropicVersion !== void 0 ? messagesCodec : void 0;
}
function internalFailure(error) {
  const status = typeof error?.status === "number" ? error.status : 500;
  if (status >= 500) console.error("[ai]", error);
  return { status, message: error instanceof Error ? error.message : "Internal Server Error" };
}
function unrecordedError(store, codec, error) {
  const failure = error instanceof AiRequestError ? failureOf(error) : internalFailure(error);
  return errorResponse(codec, failure, takeCallSeq(getAiState(store)));
}
var MAX_SEEN_MODELS = 1e3;
var RESPONSE_ID = /(?:^|\/)responses\/([^/]+)$/;
function registerAiRoutes({ app, store, baseUrl, baseUrlDerived }) {
  const configured = baseUrlDerived ? void 0 : parseUrl(baseUrl);
  app.use("*", async (c, next) => {
    if (c.req.path.startsWith("/_emulate/")) {
      await next();
      return;
    }
    try {
      return await handleRequest(c, store, configured);
    } catch (error) {
      const codec = errorCodecOf(c.req.path, c.req.header("anthropic-version"));
      if (!codec) throw error;
      return unrecordedError(store, codec, error);
    }
  });
}
function setAiSeed(store, config) {
  setSeedConfig(store, config);
  resetAiState(store, config);
}
function resetAiToSeed(store) {
  resetAiState(store, getSeedConfig(store));
}
async function handleRequest(c, store, configured) {
  const url = new URL(c.req.url);
  const path = url.pathname;
  const requested = c.req.method.toUpperCase();
  const method = requested === "HEAD" ? "GET" : requested;
  const state = getAiState(store);
  const authority = c.req.header("host") ?? url.host;
  const addressed = parseUrl(`${url.protocol}//${authority}`);
  const caller = callerOf(c.req.header("origin"), addressed, configured);
  if (caller === "untrusted-host") {
    const refusal = untrustedHostMessage(authority);
    if (errorCodecOf(path, c.req.header("anthropic-version")))
      throw new AiRequestError(refusal, void 0, void 0, 403);
    return c.json(aiErrorBody(403, refusal), 403);
  }
  if (path === "/_ai" || path.startsWith("/_ai/") || method === "GET" && path === "/") {
    if (caller !== "direct" && caller !== "same-origin") {
      return c.json(aiErrorBody(403, "Cross-origin requests are not allowed on AI control routes."), 403);
    }
    return handleControl(c, method, path, store, state);
  }
  if (caller === "foreign") {
    const foreign = "Requests from other websites are not allowed on AI data routes. Call the emulator from a server, from its own origin, or from a page served on this machine.";
    if (errorCodecOf(path, c.req.header("anthropic-version")))
      throw new AiRequestError(foreign, void 0, void 0, 403);
    return c.json(aiErrorBody(403, foreign), 403);
  }
  if (method === "POST") {
    const codec = CODECS.find(({ suffix }) => hasSuffix(path, suffix))?.codec;
    if (codec) {
      try {
        return await handleGeneration(c, store, state, codec, path);
      } catch (error) {
        return unrecordedError(store, codec, error);
      }
    }
  }
  if (method === "GET" || method === "DELETE") {
    const id = responseId(path);
    if (id !== null) {
      const ctx = context(store, state, path);
      return method === "GET" ? getStoredResponse(ctx, id) : deleteStoredResponse(ctx, id);
    }
    if (method === "GET" && hasSuffix(path, "/models")) return listModels(c, state);
  }
  throw unsupportedPath(path);
}
async function handleControl(c, method, path, store, state) {
  if (path === "/_ai/calls") {
    if (method === "GET") return c.json(state.calls);
    if (method === "DELETE") {
      const deleted = state.calls.length;
      clearCalls(state);
      return c.json({ deleted });
    }
  }
  if (path === "/_ai/rules") {
    if (method === "GET") return c.json(configView(state));
    if (method === "PUT") return replaceRules(c, state);
  }
  if (path === "/_ai/reset" && method === "POST") {
    resetAiToSeed(store);
    return c.json({ reset: true });
  }
  if (path === "/" && method === "GET") {
    const requested = c.req.query("tab");
    const tab = requested === "rules" ? "rules" : "calls";
    const rawSelected = c.req.query("call");
    const selected = rawSelected !== void 0 && /^\d+$/.test(rawSelected) ? Number(rawSelected) : void 0;
    return c.html(renderAiInspector({ tab, calls: state.calls, rules: ruleStatuses(state), selected }));
  }
  throw unsupportedPath(path);
}
async function replaceRules(c, state) {
  const generation = state.generation;
  const generationSignal = state.controller.signal;
  const body = await readJson(c);
  if (generationSignal.aborted || !isCurrentGeneration(state, { generation })) throw staleStateError();
  if (!isRecord5(body)) {
    throw new AiRequestError("Expected a JSON object rules body.", "config", "invalid_config");
  }
  let config;
  try {
    config = parseConfig(stripBudgets(body));
  } catch (error) {
    if (error instanceof AiConfigError) {
      throw new AiRequestError(error.message, error.path, "invalid_config");
    }
    throw error;
  }
  setAiConfig(state, config);
  return c.json(configView(state));
}
function configView(state) {
  const { strict, timing, random, models } = state.config;
  return { rules: ruleViews(state), strict, timing, random, models };
}
function ruleViews(state) {
  return rulesView(state.config, state.budgets);
}
function ruleStatuses(state) {
  return ruleViews(state).map(({ remaining, ...rule }) => ({ rule, remaining }));
}
function listModels(c, state) {
  const ids = [.../* @__PURE__ */ new Set([...state.config.models, ...state.seenModels])];
  return c.json({
    object: "list",
    data: ids.map((id) => ({ id, object: "model", created: 0, owned_by: "emulate" }))
  });
}
async function handleGeneration(c, store, state, codec, path) {
  const scope = beginRequest(state, c.req.raw.signal);
  const stamp = { generation: scope.generation, callsGeneration: scope.callsGeneration };
  const ctx = context(store, state, path);
  let body;
  let decoded;
  try {
    body = await readJson(c);
  } catch (error) {
    const status = error instanceof AiRequestError ? error.status : 500;
    const call2 = rejectedCall(state, codec.format, path, body, status);
    recordCall(state, call2, stamp);
    scope.dispose();
    if (error instanceof AiRequestError) return errorResponse(codec, failureOf(error), call2.seq);
    throw error;
  }
  if (scope.signal.aborted || !isCurrentGeneration(state, stamp)) {
    scope.dispose();
    throw staleStateError();
  }
  try {
    decoded = codec.decode(body, ctx);
  } catch (error) {
    const status = error instanceof AiRequestError ? error.status : 500;
    const call2 = rejectedCall(state, codec.format, path, body, status);
    recordCall(state, call2, stamp);
    scope.dispose();
    if (error instanceof AiRequestError) return errorResponse(codec, failureOf(error), call2.seq);
    throw error;
  }
  const request = decoded.request;
  state.seenModels.add(request.model);
  while (state.seenModels.size > MAX_SEEN_MODELS) {
    state.seenModels.delete(state.seenModels.values().next().value);
  }
  let outcome;
  try {
    outcome = decide(store, request);
  } catch (error) {
    const status = error instanceof AiRequestError ? error.status : 500;
    const call2 = rejectedCall(state, codec.format, path, body, status);
    fillCall(call2, request);
    recordCall(state, call2, stamp);
    scope.dispose();
    if (error instanceof AiRequestError) return errorResponse(codec, failureOf(error), call2.seq);
    throw error;
  }
  const call = freshCall(state, codec.format, path);
  fillCall(call, request);
  call.matched = outcome.matched;
  if (outcome.kind === "error") {
    call.status = outcome.failure.status;
    call.delivery = "completed";
    recordCall(state, call, stamp);
    scope.dispose();
    return errorResponse(codec, outcome.failure, call.seq);
  }
  call.status = 200;
  call.reply = { finish: outcome.reply.finish, summary: summarize(outcome.reply) };
  let encoded;
  if (!request.stream) {
    try {
      encoded = codec.encodeJson(outcome.reply, decoded, ctx);
    } catch (error) {
      scope.dispose();
      throw error;
    }
  }
  if (scope.signal.aborted || !isCurrentGeneration(state, stamp)) {
    scope.dispose();
    throw staleStateError();
  }
  codec.afterReply?.(outcome.reply, decoded, ctx);
  recordCall(state, call, stamp);
  if (!request.stream) {
    const sent = await delay(outcome.timing.ttftMs, scope.signal);
    settleCall(state, call, stamp, sent ? "completed" : "client_aborted");
    scope.dispose();
    if (!sent) throw staleStateError();
    return withRequestId(Response.json(encoded, { status: 200 }), codec, call.seq);
  }
  let frames;
  try {
    frames = codec.streamFrames(outcome.reply, decoded, ctx);
  } catch (error) {
    settleCall(state, call, stamp, "error");
    scope.dispose();
    throw error;
  }
  const options = {
    signal: scope.signal,
    timing: outcome.timing,
    fault: outcome.fault,
    onFault(kind) {
      call.fault = kind;
    },
    onSettled(delivery) {
      settleCall(state, call, stamp, delivery);
      scope.dispose();
    }
  };
  return withRequestId(sseResponse(frames, options), codec, call.seq);
}
function context(store, state, path) {
  return {
    store,
    state,
    path,
    makeId(prefix) {
      return `${prefix}_${nextId(state)}`;
    }
  };
}
function freshCall(state, format, path) {
  return {
    seq: takeCallSeq(state),
    time: (/* @__PURE__ */ new Date()).toISOString(),
    format,
    path,
    model: "",
    stream: false,
    messages: [],
    tools: [],
    toolChoice: "auto",
    references: [],
    store: format === "openai-responses",
    matched: null,
    status: 200,
    fault: "none",
    delivery: "pending",
    warnings: []
  };
}
function rejectedCall(state, format, path, body, status) {
  const call = freshCall(state, format, path);
  call.status = status;
  call.delivery = "completed";
  if (isRecord5(body)) {
    if (typeof body.model === "string") call.model = body.model;
    if (typeof body.stream === "boolean") call.stream = body.stream;
    if (typeof body.store === "boolean") call.store = body.store;
  }
  return call;
}
function fillCall(call, request) {
  call.model = request.model;
  call.stream = request.stream;
  call.messages = request.messages;
  call.tools = request.tools.map((tool) => tool.name);
  call.toolChoice = request.toolChoice;
  call.references = request.references;
  call.store = request.store;
  call.warnings = request.warnings;
  if (request.output) {
    call.outputSchema = request.output.kind === "json_schema" ? request.output.name ?? "schema" : "json_object";
  }
  if (request.previousResponseId !== void 0) call.previousResponseId = request.previousResponseId;
}
function summarize(reply) {
  const text = reply.events.map((event) => {
    if (event.type === "text" || event.type === "reasoning" || event.type === "refusal") return event.text;
    if (event.type === "object") return JSON.stringify(event.value);
    return `${event.name}(${event.arguments})`;
  }).join(" ").replace(/\s+/g, " ").trim();
  return text.length > 200 ? `${text.slice(0, 197)}...` : text;
}
function failureOf(error) {
  return {
    status: error.status,
    message: error.message,
    ...error.param === void 0 ? {} : { param: error.param },
    ...error.code === void 0 ? {} : { code: error.code }
  };
}
function errorResponse(codec, failure, seq) {
  const headers = new Headers(failure.headers);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json; charset=utf-8");
  const name = requestIdHeader(codec);
  const requestId = headers.get(name) ?? `req_${seq}`;
  headers.set(name, requestId);
  return new Response(JSON.stringify(codec.errorBody(failure, requestId)), {
    status: failure.status,
    headers
  });
}
function requestIdHeader(codec) {
  return codec.format === "anthropic-messages" ? "request-id" : "x-request-id";
}
function withRequestId(response, codec, seq) {
  const name = requestIdHeader(codec);
  if (!response.headers.has(name)) response.headers.set(name, `req_${seq}`);
  return response;
}
async function readJson(c) {
  const text = await c.req.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new AiRequestError("Request body must be valid JSON.", void 0, "invalid_json");
  }
}
function hasSuffix(path, suffix) {
  return path === suffix || path.endsWith(suffix);
}
function responseId(path) {
  const match = RESPONSE_ID.exec(path);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    throw new AiRequestError("Malformed response id.", "id", "invalid_id");
  }
}
function unsupportedPath(path) {
  return new AiRequestError(
    `Unsupported path ${path}. Supported paths: ${SUPPORTED_DATA_PATHS}.`,
    void 0,
    "unsupported_path",
    404
  );
}
function staleStateError() {
  return new AiRequestError(
    "The emulator state was reset while this request was in progress.",
    void 0,
    "state_reset",
    409
  );
}
var LOOPBACK_HOSTS = /* @__PURE__ */ new Set(["localhost", "127.0.0.1", "[::1]"]);
function trustedHostname(hostname, configuredHost) {
  return LOOPBACK_HOSTS.has(hostname) || hostname.endsWith(".localhost") || isIP(hostname.replace(/^\[|\]$/g, "")) !== 0 || hostname === configuredHost;
}
function untrustedHostMessage(host) {
  return `The AI service does not answer on host "${host}". Start the emulator with --base-url http://${host} to allow it, or set publicUrl when embedding it.`;
}
function callerOf(origin, addressed, configured) {
  if (!addressed || !trustedHostname(addressed.hostname, configured?.hostname)) return "untrusted-host";
  if (!origin) return "direct";
  const url = parseUrl(origin);
  if (!url) return "foreign";
  const key = originKey(url);
  if (key === originKey(addressed) || configured && key === originKey(configured)) return "same-origin";
  return LOOPBACK_HOSTS.has(url.hostname) || url.hostname.endsWith(".localhost") ? "local" : "foreign";
}
function parseUrl(value) {
  try {
    return new URL(value);
  } catch {
    return void 0;
  }
}
function originKey(url) {
  const host = LOOPBACK_HOSTS.has(url.hostname) ? "localhost" : url.hostname;
  return `${url.protocol}//${host}:${url.port}`;
}
function isRecord5(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function stripBudgets(body) {
  if (Array.isArray(body)) return body.map(stripRemaining);
  if (!isRecord5(body) || !Array.isArray(body.rules)) return body;
  return { ...body, rules: body.rules.map(stripRemaining) };
}
function stripRemaining(rule) {
  if (!isRecord5(rule)) return rule;
  const { remaining: _remaining, ...rest } = rule;
  return rest;
}
function formatError(error, c, status) {
  if (error instanceof AiRequestError) {
    return c.json(
      aiErrorBody(status, error.message, error.param ?? null, error.code ?? null),
      status
    );
  }
  const message = status === 404 && !c.req.path.startsWith("/_emulate") ? `Not Found. Supported AI data paths: ${SUPPORTED_DATA_PATHS}.` : error instanceof Error ? error.message : "Internal Server Error";
  return c.json(aiErrorBody(status, message), status);
}
function seedFromConfig(store, _baseUrl, config) {
  setAiSeed(store, parseConfig(config));
}
var aiPlugin = {
  name: "ai",
  rateLimit: false,
  abortOnClose: true,
  formatError,
  register(app, store, _webhooks, baseUrl, _tokenMap, options) {
    registerAiRoutes({ app, store, baseUrl, baseUrlDerived: options?.baseUrlDerived === true });
  },
  seed(store) {
    setAiSeed(store, parseConfig(void 0));
  }
};
var index_default = aiPlugin;
export {
  AiConfigError,
  AiRequestError,
  aiPlugin,
  index_default as default,
  formatError,
  seedFromConfig
};
/*!
 * This HTTP compatibility layer builds on Hono's API and design.
 * https://github.com/honojs/hono
 * Copyright (c) 2021 - present, Yusuke Wada and Hono contributors
 * MIT license: see THIRD_PARTY_NOTICES.md in the repository and npm packages.
 */
//# sourceMappingURL=dist-GHHDETJZ.js.map