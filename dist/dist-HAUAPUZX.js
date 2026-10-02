import {
  __export
} from "./chunk-PZ5AY32C.js";

// ../@emulators/linear/dist/index.js
import { randomBytes, randomUUID } from "crypto";

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/jsutils/inspect.mjs
var MAX_ARRAY_LENGTH = 10;
var MAX_RECURSIVE_DEPTH = 2;
function inspect(value) {
  return formatValue(value, []);
}
function formatValue(value, seenValues) {
  switch (typeof value) {
    case "string":
      return JSON.stringify(value);
    case "function":
      return value.name ? `[function ${value.name}]` : "[function]";
    case "object":
      return formatObjectValue(value, seenValues);
    default:
      return String(value);
  }
}
function formatObjectValue(value, previouslySeenValues) {
  if (value === null) {
    return "null";
  }
  if (previouslySeenValues.includes(value)) {
    return "[Circular]";
  }
  const seenValues = [...previouslySeenValues, value];
  if (isJSONable(value)) {
    const jsonValue = value.toJSON();
    if (jsonValue !== value) {
      return typeof jsonValue === "string" ? jsonValue : formatValue(jsonValue, seenValues);
    }
  } else if (Array.isArray(value)) {
    return formatArray(value, seenValues);
  }
  return formatObject(value, seenValues);
}
function isJSONable(value) {
  return typeof value.toJSON === "function";
}
function formatObject(object, seenValues) {
  const entries = Object.entries(object);
  if (entries.length === 0) {
    return "{}";
  }
  if (seenValues.length > MAX_RECURSIVE_DEPTH) {
    return "[" + getObjectTag(object) + "]";
  }
  const properties = entries.map(([key, value]) => key + ": " + formatValue(value, seenValues));
  return "{ " + properties.join(", ") + " }";
}
function formatArray(array, seenValues) {
  if (array.length === 0) {
    return "[]";
  }
  if (seenValues.length > MAX_RECURSIVE_DEPTH) {
    return "[Array]";
  }
  const len = Math.min(MAX_ARRAY_LENGTH, array.length);
  const remaining = array.length - len;
  const items = [];
  for (let i = 0; i < len; ++i) {
    items.push(formatValue(array[i], seenValues));
  }
  if (remaining === 1) {
    items.push("... 1 more item");
  } else if (remaining > 1) {
    items.push(`... ${remaining} more items`);
  }
  return "[" + items.join(", ") + "]";
}
function getObjectTag(object) {
  const tag = Object.prototype.toString.call(object).replace(/^\[object /, "").replace(/]$/, "");
  if (tag === "Object" && typeof object.constructor === "function") {
    const name = object.constructor.name;
    if (typeof name === "string" && name !== "") {
      return name;
    }
  }
  return tag;
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/jsutils/instanceOf.mjs
function prodInstanceOf(value, symbol) {
  return value?.__kind === symbol;
}
var instanceOf = prodInstanceOf;

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/jsutils/isPromise.mjs
function isPromise(value) {
  return value instanceof Promise;
}
function isPromiseLike(value) {
  return typeof value?.then === "function";
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/jsutils/toError.mjs
function toError(thrownValue) {
  return thrownValue instanceof Error ? thrownValue : new NonErrorThrown(thrownValue);
}
var NonErrorThrown = class extends Error {
  constructor(thrownValue) {
    super("Unexpected error value: " + inspect(thrownValue));
    this.name = "NonErrorThrown";
    this.thrownValue = thrownValue;
  }
};

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/jsutils/isObjectLike.mjs
function isObjectLike(value) {
  return typeof value == "object" && value !== null;
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/jsutils/invariant.mjs
function invariant(condition, message) {
  if (!condition) {
    throw new Error(message ?? "Unexpected invariant triggered.");
  }
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/language/location.mjs
var LineRegExp = /\r\n|[\n\r]/g;
function getLocation(source, position) {
  let lastLineStart = 0;
  let line = 1;
  for (const match of source.body.matchAll(LineRegExp)) {
    if (!(typeof match.index === "number"))
      invariant(false);
    if (match.index >= position) {
      break;
    }
    lastLineStart = match.index + match[0].length;
    line += 1;
  }
  return { line, column: position + 1 - lastLineStart };
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/language/printLocation.mjs
function printLocation(location) {
  return printSourceLocation(location.source, getLocation(location.source, location.start));
}
function printSourceLocation(source, sourceLocation) {
  const firstLineColumnOffset = source.locationOffset.column - 1;
  const body = "".padStart(firstLineColumnOffset) + source.body;
  const lineIndex = sourceLocation.line - 1;
  const lineOffset = source.locationOffset.line - 1;
  const lineNum = sourceLocation.line + lineOffset;
  const columnOffset = sourceLocation.line === 1 ? firstLineColumnOffset : 0;
  const columnNum = sourceLocation.column + columnOffset;
  const locationStr = `${source.name}:${lineNum}:${columnNum}
`;
  const lines = body.split(/\r\n|[\n\r]/g);
  const locationLine = lines[lineIndex];
  if (locationLine.length > 120) {
    const subLineIndex = Math.floor(columnNum / 80);
    const subLineColumnNum = columnNum % 80;
    const subLines = [];
    for (let i = 0; i < locationLine.length; i += 80) {
      subLines.push(locationLine.slice(i, i + 80));
    }
    return locationStr + printPrefixedLines([
      [`${lineNum} |`, subLines[0]],
      ...subLines.slice(1, subLineIndex + 1).map((subLine) => ["|", subLine]),
      ["|", "^".padStart(subLineColumnNum)],
      ["|", subLines[subLineIndex + 1]]
    ]);
  }
  return locationStr + printPrefixedLines([
    [`${lineNum - 1} |`, lines[lineIndex - 1]],
    [`${lineNum} |`, locationLine],
    ["|", "^".padStart(columnNum)],
    [`${lineNum + 1} |`, lines[lineIndex + 1]]
  ]);
}
function printPrefixedLines(lines) {
  const existingLines = lines.filter(([_, line]) => line !== void 0);
  const padLen = Math.max(...existingLines.map(([prefix]) => prefix.length));
  return existingLines.map(([prefix, line]) => prefix.padStart(padLen) + (line ? " " + line : "")).join("\n");
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/error/GraphQLError.mjs
var GraphQLError = class _GraphQLError extends Error {
  constructor(message, options = {}) {
    const { nodes, source, positions, path, originalError, cause, extensions } = options;
    const hasCause = "cause" in options;
    const errorCause = hasCause ? cause : originalError;
    const errorOptions = hasCause || originalError != null ? { cause: errorCause } : void 0;
    super(message, errorOptions);
    this.name = "GraphQLError";
    this.path = path ?? void 0;
    const underlyingError = originalError ?? (cause instanceof Error ? cause : void 0);
    this.originalError = underlyingError;
    this.nodes = undefinedIfEmpty(Array.isArray(nodes) ? nodes : nodes ? [nodes] : void 0);
    const nodeLocations = undefinedIfEmpty(this.nodes?.map((node) => node.loc).filter((loc) => loc != null));
    this.source = source ?? nodeLocations?.[0]?.source;
    this.positions = positions ?? nodeLocations?.map((loc) => loc.start);
    this.locations = positions && source ? positions.map((pos) => getLocation(source, pos)) : nodeLocations?.map((loc) => getLocation(loc.source, loc.start));
    const originalExtensions = isObjectLike(underlyingError?.extensions) ? underlyingError.extensions : void 0;
    this.extensions = extensions ?? originalExtensions ?? /* @__PURE__ */ Object.create(null);
    Object.defineProperties(this, {
      message: {
        writable: true,
        enumerable: true
      },
      name: { enumerable: false },
      nodes: { enumerable: false },
      source: { enumerable: false },
      positions: { enumerable: false },
      originalError: { enumerable: false }
    });
    if (originalError?.stack != null) {
      Object.defineProperty(this, "stack", {
        value: originalError.stack,
        writable: true,
        configurable: true
      });
    } else if (Error.captureStackTrace != null) {
      Error.captureStackTrace(this, _GraphQLError);
    } else {
      Object.defineProperty(this, "stack", {
        value: Error().stack,
        writable: true,
        configurable: true
      });
    }
  }
  get [Symbol.toStringTag]() {
    return "GraphQLError";
  }
  toString() {
    let output = this.message;
    if (this.nodes) {
      for (const node of this.nodes) {
        if (node.loc) {
          output += "\n\n" + printLocation(node.loc);
        }
      }
    } else if (this.source && this.locations) {
      for (const location of this.locations) {
        output += "\n\n" + printSourceLocation(this.source, location);
      }
    }
    return output;
  }
  toJSON() {
    const formattedError = {
      message: this.message
    };
    if (this.locations != null) {
      formattedError.locations = this.locations;
    }
    if (this.path != null) {
      formattedError.path = this.path;
    }
    if (this.extensions != null && Object.keys(this.extensions).length > 0) {
      formattedError.extensions = this.extensions;
    }
    return formattedError;
  }
};
function undefinedIfEmpty(array) {
  return array === void 0 || array.length === 0 ? void 0 : array;
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/error/ensureGraphQLError.mjs
function ensureGraphQLError(rawError) {
  if (rawError instanceof GraphQLError) {
    return rawError;
  }
  const originalError = toError(rawError);
  return new GraphQLError(originalError.message, { originalError });
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/jsutils/AccumulatorMap.mjs
var AccumulatorMap = class extends Map {
  get [Symbol.toStringTag]() {
    return "AccumulatorMap";
  }
  add(key, item) {
    const group = this.get(key);
    if (group === void 0) {
      this.set(key, [item]);
    } else {
      group.push(item);
    }
  }
};

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/jsutils/capitalize.mjs
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/jsutils/formatList.mjs
function orList(items) {
  return formatList("or", items);
}
function andList(items) {
  return formatList("and", items);
}
function formatList(conjunction, items) {
  if (!(items.length !== 0))
    invariant(false);
  switch (items.length) {
    case 1:
      return items[0];
    case 2:
      return items[0] + " " + conjunction + " " + items[1];
  }
  const allButLast = items.slice(0, -1);
  const lastItem = items.at(-1);
  return allButLast.join(", ") + ", " + conjunction + " " + lastItem;
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/jsutils/isIterableObject.mjs
function isIterableObject(maybeIterable) {
  return typeof maybeIterable === "object" && typeof maybeIterable?.[Symbol.iterator] === "function";
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/jsutils/keyMap.mjs
function keyMap(list, keyFn) {
  const result = /* @__PURE__ */ Object.create(null);
  for (const item of list) {
    result[keyFn(item)] = item;
  }
  return result;
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/jsutils/mapValue.mjs
function mapValue(map, fn) {
  const result = /* @__PURE__ */ Object.create(null);
  for (const key of Object.keys(map)) {
    result[key] = fn(map[key], key);
  }
  return result;
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/jsutils/printPathArray.mjs
function printPathArray(path) {
  if (path.length === 0) {
    return "";
  }
  return ` at ${path.map((key) => typeof key === "number" ? `[${key}]` : `.${key}`).join("")}`;
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/language/ast.mjs
var Location = class {
  constructor(startToken, endToken, source) {
    this.start = startToken.start;
    this.end = endToken.end;
    this.startToken = startToken;
    this.endToken = endToken;
    this.source = source;
  }
  get [Symbol.toStringTag]() {
    return "Location";
  }
  toJSON() {
    return { start: this.start, end: this.end };
  }
};
var Token = class {
  constructor(kind, start, end, line, column, value) {
    this.kind = kind;
    this.start = start;
    this.end = end;
    this.line = line;
    this.column = column;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
  get [Symbol.toStringTag]() {
    return "Token";
  }
  toJSON() {
    return {
      kind: this.kind,
      value: this.value,
      line: this.line,
      column: this.column
    };
  }
};
var QueryDocumentKeys = {
  Name: [],
  Document: ["definitions"],
  OperationDefinition: [
    "description",
    "name",
    "variableDefinitions",
    "directives",
    "selectionSet"
  ],
  VariableDefinition: [
    "description",
    "variable",
    "type",
    "defaultValue",
    "directives"
  ],
  Variable: ["name"],
  SelectionSet: ["selections"],
  Field: ["alias", "name", "arguments", "directives", "selectionSet"],
  Argument: ["name", "value"],
  FragmentArgument: ["name", "value"],
  FragmentSpread: [
    "name",
    "arguments",
    "directives"
  ],
  InlineFragment: ["typeCondition", "directives", "selectionSet"],
  FragmentDefinition: [
    "description",
    "name",
    "variableDefinitions",
    "typeCondition",
    "directives",
    "selectionSet"
  ],
  IntValue: [],
  FloatValue: [],
  StringValue: [],
  BooleanValue: [],
  NullValue: [],
  EnumValue: [],
  ListValue: ["values"],
  ObjectValue: ["fields"],
  ObjectField: ["name", "value"],
  Directive: ["name", "arguments"],
  NamedType: ["name"],
  ListType: ["type"],
  NonNullType: ["type"],
  SchemaDefinition: ["description", "directives", "operationTypes"],
  OperationTypeDefinition: ["type"],
  ScalarTypeDefinition: ["description", "name", "directives"],
  ObjectTypeDefinition: [
    "description",
    "name",
    "interfaces",
    "directives",
    "fields"
  ],
  FieldDefinition: ["description", "name", "arguments", "type", "directives"],
  InputValueDefinition: [
    "description",
    "name",
    "type",
    "defaultValue",
    "directives"
  ],
  InterfaceTypeDefinition: [
    "description",
    "name",
    "interfaces",
    "directives",
    "fields"
  ],
  UnionTypeDefinition: ["description", "name", "directives", "types"],
  EnumTypeDefinition: ["description", "name", "directives", "values"],
  EnumValueDefinition: ["description", "name", "directives"],
  InputObjectTypeDefinition: ["description", "name", "directives", "fields"],
  DirectiveDefinition: [
    "description",
    "name",
    "arguments",
    "directives",
    "locations"
  ],
  SchemaExtension: ["directives", "operationTypes"],
  DirectiveExtension: ["name", "directives"],
  ScalarTypeExtension: ["name", "directives"],
  ObjectTypeExtension: ["name", "interfaces", "directives", "fields"],
  InterfaceTypeExtension: ["name", "interfaces", "directives", "fields"],
  UnionTypeExtension: ["name", "directives", "types"],
  EnumTypeExtension: ["name", "directives", "values"],
  InputObjectTypeExtension: ["name", "directives", "fields"],
  TypeCoordinate: ["name"],
  MemberCoordinate: ["name", "memberName"],
  ArgumentCoordinate: ["name", "fieldName", "argumentName"],
  DirectiveCoordinate: ["name"],
  DirectiveArgumentCoordinate: ["name", "argumentName"]
};
var kindValues = new Set(Object.keys(QueryDocumentKeys));
function isNode(maybeNode) {
  const maybeKind = maybeNode?.kind;
  return typeof maybeKind === "string" && kindValues.has(maybeKind);
}
var OperationTypeNode = {
  QUERY: "query",
  MUTATION: "mutation",
  SUBSCRIPTION: "subscription"
};

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/language/kinds_.mjs
var kinds_exports = {};
__export(kinds_exports, {
  ARGUMENT: () => ARGUMENT,
  ARGUMENT_COORDINATE: () => ARGUMENT_COORDINATE,
  BOOLEAN: () => BOOLEAN,
  DIRECTIVE: () => DIRECTIVE,
  DIRECTIVE_ARGUMENT_COORDINATE: () => DIRECTIVE_ARGUMENT_COORDINATE,
  DIRECTIVE_COORDINATE: () => DIRECTIVE_COORDINATE,
  DIRECTIVE_DEFINITION: () => DIRECTIVE_DEFINITION,
  DIRECTIVE_EXTENSION: () => DIRECTIVE_EXTENSION,
  DOCUMENT: () => DOCUMENT,
  ENUM: () => ENUM,
  ENUM_TYPE_DEFINITION: () => ENUM_TYPE_DEFINITION,
  ENUM_TYPE_EXTENSION: () => ENUM_TYPE_EXTENSION,
  ENUM_VALUE_DEFINITION: () => ENUM_VALUE_DEFINITION,
  FIELD: () => FIELD,
  FIELD_DEFINITION: () => FIELD_DEFINITION,
  FLOAT: () => FLOAT,
  FRAGMENT_ARGUMENT: () => FRAGMENT_ARGUMENT,
  FRAGMENT_DEFINITION: () => FRAGMENT_DEFINITION,
  FRAGMENT_SPREAD: () => FRAGMENT_SPREAD,
  INLINE_FRAGMENT: () => INLINE_FRAGMENT,
  INPUT_OBJECT_TYPE_DEFINITION: () => INPUT_OBJECT_TYPE_DEFINITION,
  INPUT_OBJECT_TYPE_EXTENSION: () => INPUT_OBJECT_TYPE_EXTENSION,
  INPUT_VALUE_DEFINITION: () => INPUT_VALUE_DEFINITION,
  INT: () => INT,
  INTERFACE_TYPE_DEFINITION: () => INTERFACE_TYPE_DEFINITION,
  INTERFACE_TYPE_EXTENSION: () => INTERFACE_TYPE_EXTENSION,
  LIST: () => LIST,
  LIST_TYPE: () => LIST_TYPE,
  MEMBER_COORDINATE: () => MEMBER_COORDINATE,
  NAME: () => NAME,
  NAMED_TYPE: () => NAMED_TYPE,
  NON_NULL_TYPE: () => NON_NULL_TYPE,
  NULL: () => NULL,
  OBJECT: () => OBJECT,
  OBJECT_FIELD: () => OBJECT_FIELD,
  OBJECT_TYPE_DEFINITION: () => OBJECT_TYPE_DEFINITION,
  OBJECT_TYPE_EXTENSION: () => OBJECT_TYPE_EXTENSION,
  OPERATION_DEFINITION: () => OPERATION_DEFINITION,
  OPERATION_TYPE_DEFINITION: () => OPERATION_TYPE_DEFINITION,
  SCALAR_TYPE_DEFINITION: () => SCALAR_TYPE_DEFINITION,
  SCALAR_TYPE_EXTENSION: () => SCALAR_TYPE_EXTENSION,
  SCHEMA_DEFINITION: () => SCHEMA_DEFINITION,
  SCHEMA_EXTENSION: () => SCHEMA_EXTENSION,
  SELECTION_SET: () => SELECTION_SET,
  STRING: () => STRING,
  TYPE_COORDINATE: () => TYPE_COORDINATE,
  UNION_TYPE_DEFINITION: () => UNION_TYPE_DEFINITION,
  UNION_TYPE_EXTENSION: () => UNION_TYPE_EXTENSION,
  VARIABLE: () => VARIABLE,
  VARIABLE_DEFINITION: () => VARIABLE_DEFINITION
});
var NAME = "Name";
var DOCUMENT = "Document";
var OPERATION_DEFINITION = "OperationDefinition";
var VARIABLE_DEFINITION = "VariableDefinition";
var SELECTION_SET = "SelectionSet";
var FIELD = "Field";
var ARGUMENT = "Argument";
var FRAGMENT_ARGUMENT = "FragmentArgument";
var FRAGMENT_SPREAD = "FragmentSpread";
var INLINE_FRAGMENT = "InlineFragment";
var FRAGMENT_DEFINITION = "FragmentDefinition";
var VARIABLE = "Variable";
var INT = "IntValue";
var FLOAT = "FloatValue";
var STRING = "StringValue";
var BOOLEAN = "BooleanValue";
var NULL = "NullValue";
var ENUM = "EnumValue";
var LIST = "ListValue";
var OBJECT = "ObjectValue";
var OBJECT_FIELD = "ObjectField";
var DIRECTIVE = "Directive";
var NAMED_TYPE = "NamedType";
var LIST_TYPE = "ListType";
var NON_NULL_TYPE = "NonNullType";
var SCHEMA_DEFINITION = "SchemaDefinition";
var OPERATION_TYPE_DEFINITION = "OperationTypeDefinition";
var SCALAR_TYPE_DEFINITION = "ScalarTypeDefinition";
var OBJECT_TYPE_DEFINITION = "ObjectTypeDefinition";
var FIELD_DEFINITION = "FieldDefinition";
var INPUT_VALUE_DEFINITION = "InputValueDefinition";
var INTERFACE_TYPE_DEFINITION = "InterfaceTypeDefinition";
var UNION_TYPE_DEFINITION = "UnionTypeDefinition";
var ENUM_TYPE_DEFINITION = "EnumTypeDefinition";
var ENUM_VALUE_DEFINITION = "EnumValueDefinition";
var INPUT_OBJECT_TYPE_DEFINITION = "InputObjectTypeDefinition";
var DIRECTIVE_DEFINITION = "DirectiveDefinition";
var SCHEMA_EXTENSION = "SchemaExtension";
var DIRECTIVE_EXTENSION = "DirectiveExtension";
var SCALAR_TYPE_EXTENSION = "ScalarTypeExtension";
var OBJECT_TYPE_EXTENSION = "ObjectTypeExtension";
var INTERFACE_TYPE_EXTENSION = "InterfaceTypeExtension";
var UNION_TYPE_EXTENSION = "UnionTypeExtension";
var ENUM_TYPE_EXTENSION = "EnumTypeExtension";
var INPUT_OBJECT_TYPE_EXTENSION = "InputObjectTypeExtension";
var TYPE_COORDINATE = "TypeCoordinate";
var MEMBER_COORDINATE = "MemberCoordinate";
var ARGUMENT_COORDINATE = "ArgumentCoordinate";
var DIRECTIVE_COORDINATE = "DirectiveCoordinate";
var DIRECTIVE_ARGUMENT_COORDINATE = "DirectiveArgumentCoordinate";

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/jsutils/devAssert.mjs
function devAssert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/jsutils/didYouMean.mjs
var MAX_SUGGESTIONS = 5;
function didYouMean(firstArg, secondArg) {
  const [subMessage, suggestions] = secondArg ? [firstArg, secondArg] : [void 0, firstArg];
  if (suggestions.length === 0) {
    return "";
  }
  let message = " Did you mean ";
  if (subMessage != null) {
    message += subMessage + " ";
  }
  const suggestionList2 = orList(suggestions.slice(0, MAX_SUGGESTIONS).map((x) => `"${x}"`));
  return message + suggestionList2 + "?";
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/jsutils/identityFunc.mjs
function identityFunc(x) {
  return x;
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/jsutils/keyValMap.mjs
function keyValMap(list, keyFn, valFn) {
  const result = /* @__PURE__ */ Object.create(null);
  for (const item of list) {
    result[keyFn(item)] = valFn(item);
  }
  return result;
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/jsutils/naturalCompare.mjs
function naturalCompare(aStr, bStr) {
  let aIndex = 0;
  let bIndex = 0;
  while (aIndex < aStr.length && bIndex < bStr.length) {
    let aChar = aStr.charCodeAt(aIndex);
    let bChar = bStr.charCodeAt(bIndex);
    if (isDigit(aChar) && isDigit(bChar)) {
      let aNum = 0;
      do {
        ++aIndex;
        aNum = aNum * 10 + aChar - DIGIT_0;
        aChar = aStr.charCodeAt(aIndex);
      } while (isDigit(aChar) && aNum > 0);
      let bNum = 0;
      do {
        ++bIndex;
        bNum = bNum * 10 + bChar - DIGIT_0;
        bChar = bStr.charCodeAt(bIndex);
      } while (isDigit(bChar) && bNum > 0);
      if (aNum < bNum) {
        return -1;
      }
      if (aNum > bNum) {
        return 1;
      }
    } else {
      if (aChar < bChar) {
        return -1;
      }
      if (aChar > bChar) {
        return 1;
      }
      ++aIndex;
      ++bIndex;
    }
  }
  return aStr.length - bStr.length;
}
var DIGIT_0 = 48;
var DIGIT_9 = 57;
function isDigit(code) {
  return !isNaN(code) && DIGIT_0 <= code && code <= DIGIT_9;
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/jsutils/suggestionList.mjs
function suggestionList(input, options) {
  const optionsByDistance = /* @__PURE__ */ Object.create(null);
  const lexicalDistance = new LexicalDistance(input);
  const threshold = Math.floor(input.length * 0.4) + 1;
  for (const option of options) {
    const distance = lexicalDistance.measure(option, threshold);
    if (distance !== void 0) {
      optionsByDistance[option] = distance;
    }
  }
  return Object.keys(optionsByDistance).sort((a, b) => {
    const distanceDiff = optionsByDistance[a] - optionsByDistance[b];
    return distanceDiff !== 0 ? distanceDiff : naturalCompare(a, b);
  });
}
var LexicalDistance = class {
  constructor(input) {
    this._input = input;
    this._inputLowerCase = input.toLowerCase();
    this._inputArray = stringToArray(this._inputLowerCase);
    this._rows = [
      new Array(input.length + 1).fill(0),
      new Array(input.length + 1).fill(0),
      new Array(input.length + 1).fill(0)
    ];
  }
  measure(option, threshold) {
    if (this._input === option) {
      return 0;
    }
    const optionLowerCase = option.toLowerCase();
    if (this._inputLowerCase === optionLowerCase) {
      return 1;
    }
    let a = stringToArray(optionLowerCase);
    let b = this._inputArray;
    if (a.length < b.length) {
      const tmp = a;
      a = b;
      b = tmp;
    }
    const aLength = a.length;
    const bLength = b.length;
    if (aLength - bLength > threshold) {
      return void 0;
    }
    const rows = this._rows;
    for (let j = 0; j <= bLength; j++) {
      rows[0][j] = j;
    }
    for (let i = 1; i <= aLength; i++) {
      const upRow = rows[(i - 1) % 3];
      const currentRow = rows[i % 3];
      let smallestCell = currentRow[0] = i;
      for (let j = 1; j <= bLength; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        let currentCell = Math.min(upRow[j] + 1, currentRow[j - 1] + 1, upRow[j - 1] + cost);
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
          const doubleDiagonalCell = rows[(i - 2) % 3][j - 2];
          currentCell = Math.min(currentCell, doubleDiagonalCell + 1);
        }
        if (currentCell < smallestCell) {
          smallestCell = currentCell;
        }
        currentRow[j] = currentCell;
      }
      if (smallestCell > threshold) {
        return void 0;
      }
    }
    const distance = rows[aLength % 3][bLength];
    return distance <= threshold ? distance : void 0;
  }
};
function stringToArray(str) {
  const strLength = str.length;
  const array = new Array(strLength);
  for (let i = 0; i < strLength; ++i) {
    array[i] = str.charCodeAt(i);
  }
  return array;
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/jsutils/toObjMap.mjs
function toObjMapWithSymbols(obj) {
  if (obj == null) {
    return /* @__PURE__ */ Object.create(null);
  }
  if (Object.getPrototypeOf(obj) === null) {
    return obj;
  }
  const map = /* @__PURE__ */ Object.create(null);
  for (const [key, value] of Object.entries(obj)) {
    map[key] = value;
  }
  for (const key of Object.getOwnPropertySymbols(obj)) {
    map[key] = obj[key];
  }
  return map;
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/language/characterClasses.mjs
function isWhiteSpace(code) {
  return code === 9 || code === 32;
}
function isDigit2(code) {
  return code >= 48 && code <= 57;
}
function isLetter(code) {
  return code >= 97 && code <= 122 || code >= 65 && code <= 90;
}
function isNameStart(code) {
  return isLetter(code) || code === 95;
}
function isNameContinue(code) {
  return isLetter(code) || isDigit2(code) || code === 95;
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/language/blockString.mjs
function dedentBlockStringLines(lines) {
  let commonIndent = Number.MAX_SAFE_INTEGER;
  let firstNonEmptyLine = null;
  let lastNonEmptyLine = -1;
  for (let i = 0; i < lines.length; ++i) {
    const line = lines[i];
    const indent2 = leadingWhitespace(line);
    if (indent2 === line.length) {
      continue;
    }
    firstNonEmptyLine ??= i;
    lastNonEmptyLine = i;
    if (i !== 0 && indent2 < commonIndent) {
      commonIndent = indent2;
    }
  }
  return lines.map((line, i) => i === 0 ? line : line.slice(commonIndent)).slice(firstNonEmptyLine ?? 0, lastNonEmptyLine + 1);
}
function leadingWhitespace(str) {
  let i = 0;
  while (i < str.length && isWhiteSpace(str.charCodeAt(i))) {
    ++i;
  }
  return i;
}
function printBlockString(value, options) {
  const escapedValue = value.replaceAll('"""', '\\"""');
  const lines = escapedValue.split(/\r\n|[\n\r]/g);
  const isSingleLine = lines.length === 1;
  const forceLeadingNewLine = lines.length > 1 && lines.slice(1).every((line) => line.length === 0 || isWhiteSpace(line.charCodeAt(0)));
  const hasTrailingTripleQuotes = escapedValue.endsWith('\\"""');
  const hasTrailingQuote = value.endsWith('"') && !hasTrailingTripleQuotes;
  const hasTrailingSlash = value.endsWith("\\");
  const forceTrailingNewline = hasTrailingQuote || hasTrailingSlash;
  const printAsMultipleLines = !options?.minimize && (!isSingleLine || value.length > 70 || forceTrailingNewline || forceLeadingNewLine || hasTrailingTripleQuotes);
  let result = "";
  const skipLeadingNewLine = isSingleLine && isWhiteSpace(value.charCodeAt(0));
  if (printAsMultipleLines && !skipLeadingNewLine || forceLeadingNewLine) {
    result += "\n";
  }
  result += escapedValue;
  if (printAsMultipleLines || forceTrailingNewline) {
    result += "\n";
  }
  return '"""' + result + '"""';
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/language/printString.mjs
function printString(str) {
  return `"${str.replace(escapedRegExp, escapedReplacer)}"`;
}
var escapedRegExp = /[\x00-\x1f\x22\x5c\x7f-\x9f]/g;
function escapedReplacer(str) {
  return escapeSequences[str.charCodeAt(0)];
}
var escapeSequences = [
  "\\u0000",
  "\\u0001",
  "\\u0002",
  "\\u0003",
  "\\u0004",
  "\\u0005",
  "\\u0006",
  "\\u0007",
  "\\b",
  "\\t",
  "\\n",
  "\\u000B",
  "\\f",
  "\\r",
  "\\u000E",
  "\\u000F",
  "\\u0010",
  "\\u0011",
  "\\u0012",
  "\\u0013",
  "\\u0014",
  "\\u0015",
  "\\u0016",
  "\\u0017",
  "\\u0018",
  "\\u0019",
  "\\u001A",
  "\\u001B",
  "\\u001C",
  "\\u001D",
  "\\u001E",
  "\\u001F",
  "",
  "",
  '\\"',
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "\\\\",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "\\u007F",
  "\\u0080",
  "\\u0081",
  "\\u0082",
  "\\u0083",
  "\\u0084",
  "\\u0085",
  "\\u0086",
  "\\u0087",
  "\\u0088",
  "\\u0089",
  "\\u008A",
  "\\u008B",
  "\\u008C",
  "\\u008D",
  "\\u008E",
  "\\u008F",
  "\\u0090",
  "\\u0091",
  "\\u0092",
  "\\u0093",
  "\\u0094",
  "\\u0095",
  "\\u0096",
  "\\u0097",
  "\\u0098",
  "\\u0099",
  "\\u009A",
  "\\u009B",
  "\\u009C",
  "\\u009D",
  "\\u009E",
  "\\u009F"
];

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/language/visitor.mjs
var BREAK = Object.freeze({});
function visit(root, visitor, visitorKeys = QueryDocumentKeys) {
  const enterLeaveMap = /* @__PURE__ */ new Map();
  for (const kind of Object.values(kinds_exports)) {
    enterLeaveMap.set(kind, getEnterLeaveForKind(visitor, kind));
  }
  let stack = void 0;
  let inArray = Array.isArray(root);
  let keys = [root];
  let index = -1;
  let edits = [];
  let node = root;
  let key = void 0;
  let parent = void 0;
  const path = [];
  const ancestors = [];
  do {
    index++;
    const isLeaving = index === keys.length;
    const isEdited = isLeaving && edits.length !== 0;
    if (isLeaving) {
      key = ancestors.length === 0 ? void 0 : path[path.length - 1];
      node = parent;
      parent = ancestors.pop();
      if (isEdited) {
        if (inArray) {
          node = node.slice();
          let editOffset = 0;
          for (const [editKey, editValue] of edits) {
            const arrayKey = editKey - editOffset;
            if (editValue === null) {
              node.splice(arrayKey, 1);
              editOffset++;
            } else {
              node[arrayKey] = editValue;
            }
          }
        } else {
          node = { ...node };
          for (const [editKey, editValue] of edits) {
            node[editKey] = editValue;
          }
        }
      }
      index = stack.index;
      keys = stack.keys;
      edits = stack.edits;
      inArray = stack.inArray;
      stack = stack.prev;
    } else if (parent != null) {
      key = inArray ? index : keys[index];
      node = parent[key];
      if (node === null || node === void 0) {
        continue;
      }
      path.push(key);
    }
    let result;
    if (!Array.isArray(node)) {
      if (!isNode(node))
        devAssert(false, `Invalid AST Node: ${inspect(node)}.`);
      const visitFn = isLeaving ? enterLeaveMap.get(node.kind)?.leave : enterLeaveMap.get(node.kind)?.enter;
      result = visitFn?.call(visitor, node, key, parent, path, ancestors);
      if (result === BREAK) {
        break;
      }
      if (result === false) {
        if (!isLeaving) {
          path.pop();
          continue;
        }
      } else if (result !== void 0) {
        edits.push([key, result]);
        if (!isLeaving) {
          if (isNode(result)) {
            node = result;
          } else {
            path.pop();
            continue;
          }
        }
      }
    }
    if (result === void 0 && isEdited) {
      edits.push([key, node]);
    }
    if (isLeaving) {
      path.pop();
    } else {
      stack = { inArray, index, keys, edits, prev: stack };
      inArray = Array.isArray(node);
      keys = inArray ? node : visitorKeys[node.kind] ?? [];
      index = -1;
      edits = [];
      if (parent != null) {
        ancestors.push(parent);
      }
      parent = node;
    }
  } while (stack !== void 0);
  if (edits.length !== 0) {
    return edits.at(-1)[1];
  }
  return root;
}
function visitInParallel(visitors) {
  const skipping = new Array(visitors.length).fill(null);
  const mergedVisitor = /* @__PURE__ */ Object.create(null);
  for (const kind of Object.values(kinds_exports)) {
    let hasVisitor = false;
    const enterList = new Array(visitors.length).fill(void 0);
    const leaveList = new Array(visitors.length).fill(void 0);
    for (let i = 0; i < visitors.length; ++i) {
      const { enter, leave } = getEnterLeaveForKind(visitors[i], kind);
      hasVisitor ||= enter != null || leave != null;
      enterList[i] = enter;
      leaveList[i] = leave;
    }
    if (!hasVisitor) {
      continue;
    }
    const mergedEnterLeave = {
      enter(...args) {
        const node = args[0];
        for (let i = 0; i < visitors.length; i++) {
          if (skipping[i] === null) {
            const result = enterList[i]?.apply(visitors[i], args);
            if (result === false) {
              skipping[i] = node;
            } else if (result === BREAK) {
              skipping[i] = BREAK;
            } else if (result !== void 0) {
              return result;
            }
          }
        }
      },
      leave(...args) {
        const node = args[0];
        for (let i = 0; i < visitors.length; i++) {
          if (skipping[i] === null) {
            const result = leaveList[i]?.apply(visitors[i], args);
            if (result === BREAK) {
              skipping[i] = BREAK;
            } else if (result !== void 0 && result !== false) {
              return result;
            }
          } else if (skipping[i] === node) {
            skipping[i] = null;
          }
        }
      }
    };
    mergedVisitor[kind] = mergedEnterLeave;
  }
  return mergedVisitor;
}
function getEnterLeaveForKind(visitor, kind) {
  const kindVisitor = visitor[kind];
  if (typeof kindVisitor === "object") {
    return kindVisitor;
  } else if (typeof kindVisitor === "function") {
    return { enter: kindVisitor, leave: void 0 };
  }
  return { enter: visitor.enter, leave: visitor.leave };
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/language/printer.mjs
function print(ast) {
  return visit(ast, printDocASTReducer);
}
var MAX_LINE_LENGTH = 80;
var printDocASTReducer = {
  Name: { leave: (node) => node.value },
  Variable: { leave: (node) => "$" + node.name },
  Document: {
    leave: (node) => join(node.definitions, "\n\n")
  },
  OperationDefinition: {
    leave(node) {
      const varDefs = hasMultilineItems(node.variableDefinitions) ? wrap("(\n", join(node.variableDefinitions, "\n"), "\n)") : wrap("(", join(node.variableDefinitions, ", "), ")");
      const prefix = wrap("", node.description, "\n") + join([
        node.operation,
        join([node.name, varDefs]),
        join(node.directives, " ")
      ], " ");
      return (prefix === "query" ? "" : prefix + " ") + node.selectionSet;
    }
  },
  VariableDefinition: {
    leave: ({ variable, type, defaultValue, directives, description }) => wrap("", description, "\n") + variable + ": " + type + wrap(" = ", defaultValue) + wrap(" ", join(directives, " "))
  },
  SelectionSet: { leave: ({ selections }) => block(selections) },
  Field: {
    leave({ alias, name, arguments: args, directives, selectionSet }) {
      const prefix = join([wrap("", alias, ": "), name], "");
      return join([
        wrappedLineAndArgs(prefix, args),
        wrap(" ", join(directives, " ")),
        wrap(" ", selectionSet)
      ]);
    }
  },
  Argument: { leave: ({ name, value }) => name + ": " + value },
  FragmentArgument: { leave: ({ name, value }) => name + ": " + value },
  FragmentSpread: {
    leave: ({ name, arguments: args, directives }) => {
      const prefix = "..." + name;
      return wrappedLineAndArgs(prefix, args) + wrap(" ", join(directives, " "));
    }
  },
  InlineFragment: {
    leave: ({ typeCondition, directives, selectionSet }) => join([
      "...",
      wrap("on ", typeCondition),
      join(directives, " "),
      selectionSet
    ], " ")
  },
  FragmentDefinition: {
    leave: ({ name, typeCondition, variableDefinitions, directives, selectionSet, description }) => wrap("", description, "\n") + `fragment ${name}${wrap("(", join(variableDefinitions, ", "), ")")} on ${typeCondition} ${wrap("", join(directives, " "), " ")}` + selectionSet
  },
  IntValue: { leave: ({ value }) => value },
  FloatValue: { leave: ({ value }) => value },
  StringValue: {
    leave: ({ value, block: isBlockString }) => isBlockString === true ? printBlockString(value) : printString(value)
  },
  BooleanValue: { leave: ({ value }) => value ? "true" : "false" },
  NullValue: { leave: () => "null" },
  EnumValue: { leave: ({ value }) => value },
  ListValue: {
    leave: ({ values }) => {
      const valuesLine = "[" + join(values, ", ") + "]";
      if (valuesLine.length > MAX_LINE_LENGTH) {
        return "[\n" + indent(join(values, "\n")) + "\n]";
      }
      return valuesLine;
    }
  },
  ObjectValue: {
    leave: ({ fields }) => {
      const fieldsLine = "{ " + join(fields, ", ") + " }";
      return fieldsLine.length > MAX_LINE_LENGTH ? block(fields) : fieldsLine;
    }
  },
  ObjectField: { leave: ({ name, value }) => name + ": " + value },
  Directive: {
    leave: ({ name, arguments: args }) => "@" + name + wrap("(", join(args, ", "), ")")
  },
  NamedType: { leave: ({ name }) => name },
  ListType: { leave: ({ type }) => "[" + type + "]" },
  NonNullType: { leave: ({ type }) => type + "!" },
  SchemaDefinition: {
    leave: ({ description, directives, operationTypes }) => wrap("", description, "\n") + join(["schema", join(directives, " "), block(operationTypes)], " ")
  },
  OperationTypeDefinition: {
    leave: ({ operation, type }) => operation + ": " + type
  },
  ScalarTypeDefinition: {
    leave: ({ description, name, directives }) => wrap("", description, "\n") + join(["scalar", name, join(directives, " ")], " ")
  },
  ObjectTypeDefinition: {
    leave: ({ description, name, interfaces, directives, fields }) => wrap("", description, "\n") + join([
      "type",
      name,
      wrap("implements ", join(interfaces, " & ")),
      join(directives, " "),
      block(fields)
    ], " ")
  },
  FieldDefinition: {
    leave: ({ description, name, arguments: args, type, directives }) => wrap("", description, "\n") + name + (hasMultilineItems(args) ? wrap("(\n", indent(join(args, "\n")), "\n)") : wrap("(", join(args, ", "), ")")) + ": " + type + wrap(" ", join(directives, " "))
  },
  InputValueDefinition: {
    leave: ({ description, name, type, defaultValue, directives }) => wrap("", description, "\n") + join([name + ": " + type, wrap("= ", defaultValue), join(directives, " ")], " ")
  },
  InterfaceTypeDefinition: {
    leave: ({ description, name, interfaces, directives, fields }) => wrap("", description, "\n") + join([
      "interface",
      name,
      wrap("implements ", join(interfaces, " & ")),
      join(directives, " "),
      block(fields)
    ], " ")
  },
  UnionTypeDefinition: {
    leave: ({ description, name, directives, types }) => wrap("", description, "\n") + join(["union", name, join(directives, " "), wrap("= ", join(types, " | "))], " ")
  },
  EnumTypeDefinition: {
    leave: ({ description, name, directives, values }) => wrap("", description, "\n") + join(["enum", name, join(directives, " "), block(values)], " ")
  },
  EnumValueDefinition: {
    leave: ({ description, name, directives }) => wrap("", description, "\n") + join([name, join(directives, " ")], " ")
  },
  InputObjectTypeDefinition: {
    leave: ({ description, name, directives, fields }) => wrap("", description, "\n") + join(["input", name, join(directives, " "), block(fields)], " ")
  },
  DirectiveDefinition: {
    leave: ({ description, name, arguments: args, directives, repeatable, locations }) => wrap("", description, "\n") + "directive @" + name + (hasMultilineItems(args) ? wrap("(\n", indent(join(args, "\n")), "\n)") : wrap("(", join(args, ", "), ")")) + wrap(" ", join(directives, " ")) + (repeatable ? " repeatable" : "") + " on " + join(locations, " | ")
  },
  SchemaExtension: {
    leave: ({ directives, operationTypes }) => join(["extend schema", join(directives, " "), block(operationTypes)], " ")
  },
  ScalarTypeExtension: {
    leave: ({ name, directives }) => join(["extend scalar", name, join(directives, " ")], " ")
  },
  ObjectTypeExtension: {
    leave: ({ name, interfaces, directives, fields }) => join([
      "extend type",
      name,
      wrap("implements ", join(interfaces, " & ")),
      join(directives, " "),
      block(fields)
    ], " ")
  },
  InterfaceTypeExtension: {
    leave: ({ name, interfaces, directives, fields }) => join([
      "extend interface",
      name,
      wrap("implements ", join(interfaces, " & ")),
      join(directives, " "),
      block(fields)
    ], " ")
  },
  UnionTypeExtension: {
    leave: ({ name, directives, types }) => join([
      "extend union",
      name,
      join(directives, " "),
      wrap("= ", join(types, " | "))
    ], " ")
  },
  EnumTypeExtension: {
    leave: ({ name, directives, values }) => join(["extend enum", name, join(directives, " "), block(values)], " ")
  },
  InputObjectTypeExtension: {
    leave: ({ name, directives, fields }) => join(["extend input", name, join(directives, " "), block(fields)], " ")
  },
  DirectiveExtension: {
    leave: ({ name, directives }) => join(["extend directive @" + name, join(directives, " ")], " ")
  },
  TypeCoordinate: { leave: ({ name }) => name },
  MemberCoordinate: {
    leave: ({ name, memberName }) => join([name, wrap(".", memberName)])
  },
  ArgumentCoordinate: {
    leave: ({ name, fieldName, argumentName }) => join([name, wrap(".", fieldName), wrap("(", argumentName, ":)")])
  },
  DirectiveCoordinate: { leave: ({ name }) => join(["@", name]) },
  DirectiveArgumentCoordinate: {
    leave: ({ name, argumentName }) => join(["@", name, wrap("(", argumentName, ":)")])
  }
};
function join(maybeArray, separator = "") {
  return maybeArray?.filter((x) => x !== void 0 && x !== "").join(separator) ?? "";
}
function block(array) {
  return wrap("{\n", indent(join(array, "\n")), "\n}");
}
function wrap(start, maybeString, end = "") {
  return maybeString != null && maybeString !== "" ? start + maybeString + end : "";
}
function indent(str) {
  return wrap("  ", str.replaceAll("\n", "\n  "));
}
function hasMultilineItems(maybeArray) {
  return maybeArray?.some((str) => str.includes("\n")) ?? false;
}
function wrappedLineAndArgs(prefix, args) {
  let argsLine = prefix + wrap("(", join(args, ", "), ")");
  if (argsLine.length > MAX_LINE_LENGTH) {
    argsLine = prefix + wrap("(\n", indent(join(args, "\n")), "\n)");
  }
  return argsLine;
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/utilities/valueFromASTUntyped.mjs
function valueFromASTUntyped(valueNode, variables) {
  switch (valueNode.kind) {
    case kinds_exports.NULL:
      return null;
    case kinds_exports.INT:
      return parseInt(valueNode.value, 10);
    case kinds_exports.FLOAT:
      return parseFloat(valueNode.value);
    case kinds_exports.STRING:
    case kinds_exports.ENUM:
    case kinds_exports.BOOLEAN:
      return valueNode.value;
    case kinds_exports.LIST:
      return valueNode.values.map((node) => valueFromASTUntyped(node, variables));
    case kinds_exports.OBJECT:
      return keyValMap(valueNode.fields, (field) => field.name.value, (field) => valueFromASTUntyped(field.value, variables));
    case kinds_exports.VARIABLE:
      return variables?.[valueNode.name.value];
  }
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/type/assertName.mjs
function assertName(name) {
  if (name.length === 0) {
    throw new GraphQLError("Expected name to be a non-empty string.");
  }
  for (let i = 1; i < name.length; ++i) {
    if (!isNameContinue(name.charCodeAt(i))) {
      throw new GraphQLError(`Names must only contain [_a-zA-Z0-9] but "${name}" does not.`);
    }
  }
  if (!isNameStart(name.charCodeAt(0))) {
    throw new GraphQLError(`Names must start with [_a-zA-Z] but "${name}" does not.`);
  }
  return name;
}
function assertEnumValueName(name) {
  if (name === "true" || name === "false" || name === "null") {
    throw new GraphQLError(`Enum values cannot be named: ${name}`);
  }
  return assertName(name);
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/type/definition.mjs
function isType(type) {
  return isScalarType(type) || isObjectType(type) || isInterfaceType(type) || isUnionType(type) || isEnumType(type) || isInputObjectType(type) || isListType(type) || isNonNullType(type);
}
var scalarSymbol = /* @__PURE__ */ Symbol("Scalar");
function isScalarType(type) {
  return instanceOf(type, scalarSymbol, GraphQLScalarType);
}
var objectSymbol = /* @__PURE__ */ Symbol("Object");
function isObjectType(type) {
  return instanceOf(type, objectSymbol, GraphQLObjectType);
}
var fieldSymbol = /* @__PURE__ */ Symbol("Field");
var argumentSymbol = /* @__PURE__ */ Symbol("Argument");
function isArgument(arg) {
  return instanceOf(arg, argumentSymbol, GraphQLArgument);
}
var interfaceSymbol = /* @__PURE__ */ Symbol("Interface");
function isInterfaceType(type) {
  return instanceOf(type, interfaceSymbol, GraphQLInterfaceType);
}
var unionSymbol = /* @__PURE__ */ Symbol("Union");
function isUnionType(type) {
  return instanceOf(type, unionSymbol, GraphQLUnionType);
}
var enumSymbol = /* @__PURE__ */ Symbol("Enum");
function isEnumType(type) {
  return instanceOf(type, enumSymbol, GraphQLEnumType);
}
var enumValueSymbol = /* @__PURE__ */ Symbol("EnumValue");
var inputObjectSymbol = /* @__PURE__ */ Symbol("InputObject");
function isInputObjectType(type) {
  return instanceOf(type, inputObjectSymbol, GraphQLInputObjectType);
}
var inputFieldSymbol = /* @__PURE__ */ Symbol("InputField");
var listSymbol = /* @__PURE__ */ Symbol("List");
function isListType(type) {
  return instanceOf(type, listSymbol, GraphQLList);
}
var nonNullSymbol = /* @__PURE__ */ Symbol("NonNull");
function isNonNullType(type) {
  return instanceOf(type, nonNullSymbol, GraphQLNonNull);
}
function isInputType(type) {
  return isScalarType(type) || isEnumType(type) || isInputObjectType(type) || isWrappingType(type) && isInputType(type.ofType);
}
function isOutputType(type) {
  return isScalarType(type) || isObjectType(type) || isInterfaceType(type) || isUnionType(type) || isEnumType(type) || isWrappingType(type) && isOutputType(type.ofType);
}
function isLeafType(type) {
  return isScalarType(type) || isEnumType(type);
}
function assertLeafType(type) {
  if (!isLeafType(type)) {
    throw new Error(`Expected ${inspect(type)} to be a GraphQL leaf type.`);
  }
  return type;
}
function isCompositeType(type) {
  return isObjectType(type) || isInterfaceType(type) || isUnionType(type);
}
function isAbstractType(type) {
  return isInterfaceType(type) || isUnionType(type);
}
var GraphQLList = class {
  constructor(ofType) {
    this.__kind = listSymbol;
    this.ofType = ofType;
  }
  get [Symbol.toStringTag]() {
    return "GraphQLList";
  }
  toString() {
    return "[" + String(this.ofType) + "]";
  }
  toJSON() {
    return this.toString();
  }
};
var GraphQLNonNull = class {
  constructor(ofType) {
    this.__kind = nonNullSymbol;
    this.ofType = ofType;
  }
  get [Symbol.toStringTag]() {
    return "GraphQLNonNull";
  }
  toString() {
    return String(this.ofType) + "!";
  }
  toJSON() {
    return this.toString();
  }
};
function isWrappingType(type) {
  return isListType(type) || isNonNullType(type);
}
function isNullableType(type) {
  return isType(type) && !isNonNullType(type);
}
function getNullableType(type) {
  if (type) {
    return isNonNullType(type) ? type.ofType : type;
  }
}
function isNamedType(type) {
  return isScalarType(type) || isObjectType(type) || isInterfaceType(type) || isUnionType(type) || isEnumType(type) || isInputObjectType(type);
}
function getNamedType(type) {
  if (type) {
    let unwrappedType = type;
    while (isWrappingType(unwrappedType)) {
      unwrappedType = unwrappedType.ofType;
    }
    return unwrappedType;
  }
}
function resolveReadonlyArrayThunk(thunk) {
  return typeof thunk === "function" ? thunk() : thunk;
}
function resolveObjMapThunk(thunk) {
  return typeof thunk === "function" ? thunk() : thunk;
}
var GraphQLScalarType = class {
  constructor(config) {
    this.__kind = scalarSymbol;
    this.name = assertName(config.name);
    this.description = config.description;
    this.specifiedByURL = config.specifiedByURL;
    this.serialize = config.serialize ?? config.coerceOutputValue ?? identityFunc;
    this.parseValue = config.parseValue ?? config.coerceInputValue ?? identityFunc;
    this.parseLiteral = config.parseLiteral ?? ((node, variables) => this.coerceInputValue(valueFromASTUntyped(node, variables)));
    this.coerceOutputValue = config.coerceOutputValue ?? this.serialize;
    this.coerceInputValue = config.coerceInputValue ?? this.parseValue;
    this.coerceInputLiteral = config.coerceInputLiteral;
    this.valueToLiteral = config.valueToLiteral;
    this.extensions = toObjMapWithSymbols(config.extensions);
    this.astNode = config.astNode;
    this.extensionASTNodes = config.extensionASTNodes ?? [];
    if (config.parseLiteral) {
      if (!(typeof config.parseValue === "function" && typeof config.parseLiteral === "function"))
        devAssert(false, `${this.name} must provide both "parseValue" and "parseLiteral" functions.`);
    }
    if (config.coerceInputLiteral) {
      if (!(typeof config.coerceInputValue === "function" && typeof config.coerceInputLiteral === "function"))
        devAssert(false, `${this.name} must provide both "coerceInputValue" and "coerceInputLiteral" functions.`);
    }
  }
  get [Symbol.toStringTag]() {
    return "GraphQLScalarType";
  }
  toConfig() {
    return {
      name: this.name,
      description: this.description,
      specifiedByURL: this.specifiedByURL,
      serialize: this.serialize,
      parseValue: this.parseValue,
      parseLiteral: this.parseLiteral,
      coerceOutputValue: this.coerceOutputValue,
      coerceInputValue: this.coerceInputValue,
      coerceInputLiteral: this.coerceInputLiteral,
      valueToLiteral: this.valueToLiteral,
      extensions: this.extensions,
      astNode: this.astNode,
      extensionASTNodes: this.extensionASTNodes
    };
  }
  toString() {
    return this.name;
  }
  toJSON() {
    return this.toString();
  }
};
var GraphQLObjectType = class {
  constructor(config) {
    this.__kind = objectSymbol;
    this.__kind = objectSymbol;
    this.name = assertName(config.name);
    this.description = config.description;
    this.isTypeOf = config.isTypeOf;
    this.extensions = toObjMapWithSymbols(config.extensions);
    this.astNode = config.astNode;
    this.extensionASTNodes = config.extensionASTNodes ?? [];
    this._fields = defineFieldMap.bind(void 0, this, config.fields);
    this._interfaces = defineInterfaces.bind(void 0, config.interfaces);
  }
  get [Symbol.toStringTag]() {
    return "GraphQLObjectType";
  }
  getFields() {
    if (typeof this._fields === "function") {
      this._fields = this._fields();
    }
    return this._fields;
  }
  getInterfaces() {
    if (typeof this._interfaces === "function") {
      this._interfaces = this._interfaces();
    }
    return this._interfaces;
  }
  toConfig() {
    return {
      name: this.name,
      description: this.description,
      interfaces: this.getInterfaces(),
      fields: mapValue(this.getFields(), (field) => field.toConfig()),
      isTypeOf: this.isTypeOf,
      extensions: this.extensions,
      astNode: this.astNode,
      extensionASTNodes: this.extensionASTNodes
    };
  }
  toString() {
    return this.name;
  }
  toJSON() {
    return this.toString();
  }
};
function defineInterfaces(interfaces) {
  return resolveReadonlyArrayThunk(interfaces ?? []);
}
function defineFieldMap(parentType, fields) {
  const fieldMap = resolveObjMapThunk(fields);
  return mapValue(fieldMap, (fieldConfig, fieldName) => new GraphQLField(parentType, fieldName, fieldConfig));
}
var GraphQLField = class {
  constructor(parentType, name, config) {
    this.__kind = fieldSymbol;
    this.parentType = parentType;
    this.name = assertName(name);
    this.description = config.description;
    this.type = config.type;
    const argsConfig = config.args;
    this.args = argsConfig ? Object.entries(argsConfig).map(([argName, argConfig]) => new GraphQLArgument(this, argName, argConfig)) : [];
    this.resolve = config.resolve;
    this.subscribe = config.subscribe;
    this.deprecationReason = config.deprecationReason;
    this.extensions = toObjMapWithSymbols(config.extensions);
    this.astNode = config.astNode;
  }
  get [Symbol.toStringTag]() {
    return "GraphQLField";
  }
  toConfig() {
    return {
      description: this.description,
      type: this.type,
      args: keyValMap(this.args, (arg) => arg.name, (arg) => arg.toConfig()),
      resolve: this.resolve,
      subscribe: this.subscribe,
      deprecationReason: this.deprecationReason,
      extensions: this.extensions,
      astNode: this.astNode
    };
  }
  toString() {
    return `${this.parentType ?? "<meta>"}.${this.name}`;
  }
  toJSON() {
    return this.toString();
  }
};
var GraphQLArgument = class {
  constructor(parent, name, config) {
    this.__kind = argumentSymbol;
    this.parent = parent;
    this.name = assertName(name);
    this.description = config.description;
    this.type = config.type;
    this.defaultValue = config.defaultValue;
    this.default = config.default;
    this._memoizedCoercedDefaultValue = void 0;
    this.deprecationReason = config.deprecationReason;
    this.extensions = toObjMapWithSymbols(config.extensions);
    this.astNode = config.astNode;
  }
  get [Symbol.toStringTag]() {
    return "GraphQLArgument";
  }
  toConfig() {
    return {
      description: this.description,
      type: this.type,
      defaultValue: this.defaultValue,
      default: this.default,
      deprecationReason: this.deprecationReason,
      extensions: this.extensions,
      astNode: this.astNode
    };
  }
  toString() {
    return `${this.parent}(${this.name}:)`;
  }
  toJSON() {
    return this.toString();
  }
};
function isRequiredArgument(arg) {
  return isNonNullType(arg.type) && arg.default === void 0 && arg.defaultValue === void 0;
}
var GraphQLInterfaceType = class {
  constructor(config) {
    this.__kind = interfaceSymbol;
    this.name = assertName(config.name);
    this.description = config.description;
    this.resolveType = config.resolveType;
    this.extensions = toObjMapWithSymbols(config.extensions);
    this.astNode = config.astNode;
    this.extensionASTNodes = config.extensionASTNodes ?? [];
    this._fields = defineFieldMap.bind(void 0, this, config.fields);
    this._interfaces = defineInterfaces.bind(void 0, config.interfaces);
  }
  get [Symbol.toStringTag]() {
    return "GraphQLInterfaceType";
  }
  getFields() {
    if (typeof this._fields === "function") {
      this._fields = this._fields();
    }
    return this._fields;
  }
  getInterfaces() {
    if (typeof this._interfaces === "function") {
      this._interfaces = this._interfaces();
    }
    return this._interfaces;
  }
  toConfig() {
    return {
      name: this.name,
      description: this.description,
      interfaces: this.getInterfaces(),
      fields: mapValue(this.getFields(), (field) => field.toConfig()),
      resolveType: this.resolveType,
      extensions: this.extensions,
      astNode: this.astNode,
      extensionASTNodes: this.extensionASTNodes
    };
  }
  toString() {
    return this.name;
  }
  toJSON() {
    return this.toString();
  }
};
var GraphQLUnionType = class {
  constructor(config) {
    this.__kind = unionSymbol;
    this.name = assertName(config.name);
    this.description = config.description;
    this.resolveType = config.resolveType;
    this.extensions = toObjMapWithSymbols(config.extensions);
    this.astNode = config.astNode;
    this.extensionASTNodes = config.extensionASTNodes ?? [];
    this._types = defineTypes.bind(void 0, config.types);
  }
  get [Symbol.toStringTag]() {
    return "GraphQLUnionType";
  }
  getTypes() {
    if (typeof this._types === "function") {
      this._types = this._types();
    }
    return this._types;
  }
  toConfig() {
    return {
      name: this.name,
      description: this.description,
      types: this.getTypes(),
      resolveType: this.resolveType,
      extensions: this.extensions,
      astNode: this.astNode,
      extensionASTNodes: this.extensionASTNodes
    };
  }
  toString() {
    return this.name;
  }
  toJSON() {
    return this.toString();
  }
};
function defineTypes(types) {
  return resolveReadonlyArrayThunk(types);
}
var GraphQLEnumType = class {
  constructor(config) {
    this.__kind = enumSymbol;
    this.name = assertName(config.name);
    this.description = config.description;
    this.extensions = toObjMapWithSymbols(config.extensions);
    this.astNode = config.astNode;
    this.extensionASTNodes = config.extensionASTNodes ?? [];
    this._values = defineEnumValues.bind(void 0, this, config.values);
    this._valueLookup = null;
    this._nameLookup = null;
  }
  get [Symbol.toStringTag]() {
    return "GraphQLEnumType";
  }
  getValues() {
    if (typeof this._values === "function") {
      this._values = this._values();
    }
    return this._values;
  }
  getValue(name) {
    this._nameLookup ??= keyMap(this.getValues(), (value) => value.name);
    return this._nameLookup[name];
  }
  serialize(outputValue) {
    return this.coerceOutputValue(outputValue);
  }
  coerceOutputValue(outputValue) {
    this._valueLookup ??= new Map(this.getValues().map((enumValue2) => [enumValue2.value, enumValue2]));
    const enumValue = this._valueLookup.get(outputValue);
    if (enumValue === void 0) {
      throw new GraphQLError(`Enum "${this.name}" cannot represent value: ${inspect(outputValue)}`);
    }
    return enumValue.name;
  }
  parseValue(inputValue, hideSuggestions) {
    return this.coerceInputValue(inputValue, hideSuggestions);
  }
  coerceInputValue(inputValue, hideSuggestions) {
    if (typeof inputValue !== "string") {
      const valueStr = inspect(inputValue);
      throw new GraphQLError(`Enum "${this.name}" cannot represent non-string value: ${valueStr}.` + (hideSuggestions ? "" : didYouMeanEnumValue(this, valueStr)));
    }
    const enumValue = this.getValue(inputValue);
    if (enumValue == null) {
      throw new GraphQLError(`Value "${inputValue}" does not exist in "${this.name}" enum.` + (hideSuggestions ? "" : didYouMeanEnumValue(this, inputValue)));
    }
    return enumValue.value;
  }
  parseLiteral(valueNode, _variables, hideSuggestions) {
    return this.coerceInputLiteral(valueNode, hideSuggestions);
  }
  coerceInputLiteral(valueNode, hideSuggestions) {
    if (valueNode.kind !== kinds_exports.ENUM) {
      const valueStr = print(valueNode);
      throw new GraphQLError(`Enum "${this.name}" cannot represent non-enum value: ${valueStr}.` + (hideSuggestions ? "" : didYouMeanEnumValue(this, valueStr)), { nodes: valueNode });
    }
    const enumValue = this.getValue(valueNode.value);
    if (enumValue == null) {
      const valueStr = print(valueNode);
      throw new GraphQLError(`Value "${valueStr}" does not exist in "${this.name}" enum.` + (hideSuggestions ? "" : didYouMeanEnumValue(this, valueStr)), { nodes: valueNode });
    }
    return enumValue.value;
  }
  valueToLiteral(value) {
    if (typeof value === "string" && this.getValue(value)) {
      return { kind: kinds_exports.ENUM, value };
    }
  }
  toConfig() {
    return {
      name: this.name,
      description: this.description,
      values: keyValMap(this.getValues(), (value) => value.name, (value) => value.toConfig()),
      extensions: this.extensions,
      astNode: this.astNode,
      extensionASTNodes: this.extensionASTNodes
    };
  }
  toString() {
    return this.name;
  }
  toJSON() {
    return this.toString();
  }
};
function defineEnumValues(parentEnum, values) {
  const valueMap = resolveObjMapThunk(values);
  return Object.entries(valueMap).map(([valueName, valueConfig]) => new GraphQLEnumValue(parentEnum, valueName, valueConfig));
}
function didYouMeanEnumValue(enumType, unknownValueStr) {
  const allNames = enumType.getValues().map((value) => value.name);
  const suggestedValues = suggestionList(unknownValueStr, allNames);
  return didYouMean("the enum value", suggestedValues);
}
var GraphQLEnumValue = class {
  constructor(parentEnum, name, config) {
    this.__kind = enumValueSymbol;
    this.parentEnum = parentEnum;
    this.name = assertEnumValueName(name);
    this.description = config.description;
    this.value = config.value !== void 0 ? config.value : name;
    this.deprecationReason = config.deprecationReason;
    this.extensions = toObjMapWithSymbols(config.extensions);
    this.astNode = config.astNode;
  }
  get [Symbol.toStringTag]() {
    return "GraphQLEnumValue";
  }
  toConfig() {
    return {
      description: this.description,
      value: this.value,
      deprecationReason: this.deprecationReason,
      extensions: this.extensions,
      astNode: this.astNode
    };
  }
  toString() {
    return `${this.parentEnum.name}.${this.name}`;
  }
  toJSON() {
    return this.toString();
  }
};
var GraphQLInputObjectType = class {
  constructor(config) {
    this.__kind = inputObjectSymbol;
    this.name = assertName(config.name);
    this.description = config.description;
    this.extensions = toObjMapWithSymbols(config.extensions);
    this.astNode = config.astNode;
    this.extensionASTNodes = config.extensionASTNodes ?? [];
    this.isOneOf = config.isOneOf ?? false;
    this._fields = defineInputFieldMap.bind(void 0, this, config.fields);
  }
  get [Symbol.toStringTag]() {
    return "GraphQLInputObjectType";
  }
  getFields() {
    if (typeof this._fields === "function") {
      this._fields = this._fields();
    }
    return this._fields;
  }
  toConfig() {
    return {
      name: this.name,
      description: this.description,
      fields: mapValue(this.getFields(), (field) => field.toConfig()),
      extensions: this.extensions,
      astNode: this.astNode,
      extensionASTNodes: this.extensionASTNodes,
      isOneOf: this.isOneOf
    };
  }
  toString() {
    return this.name;
  }
  toJSON() {
    return this.toString();
  }
};
function defineInputFieldMap(parentType, fields) {
  const fieldMap = resolveObjMapThunk(fields);
  return mapValue(fieldMap, (fieldConfig, fieldName) => new GraphQLInputField(parentType, fieldName, fieldConfig));
}
var GraphQLInputField = class {
  constructor(parentType, name, config) {
    if (!!("resolve" in config))
      devAssert(false, `${parentType}.${name} field has a resolve property, but Input Types cannot define resolvers.`);
    this.__kind = inputFieldSymbol;
    this.parentType = parentType;
    this.name = assertName(name);
    this.description = config.description;
    this.type = config.type;
    this.defaultValue = config.defaultValue;
    this.default = config.default;
    this._memoizedCoercedDefaultValue = void 0;
    this.deprecationReason = config.deprecationReason;
    this.extensions = toObjMapWithSymbols(config.extensions);
    this.astNode = config.astNode;
  }
  get [Symbol.toStringTag]() {
    return "GraphQLInputField";
  }
  toConfig() {
    return {
      description: this.description,
      type: this.type,
      defaultValue: this.defaultValue,
      default: this.default,
      deprecationReason: this.deprecationReason,
      extensions: this.extensions,
      astNode: this.astNode
    };
  }
  toString() {
    return `${this.parentType}.${this.name}`;
  }
  toJSON() {
    return this.toString();
  }
};
function isRequiredInputField(field) {
  return isNonNullType(field.type) && field.defaultValue === void 0 && field.default === void 0;
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/utilities/typeComparators.mjs
function isEqualType(typeA, typeB) {
  if (typeA === typeB) {
    return true;
  }
  if (isNonNullType(typeA) && isNonNullType(typeB)) {
    return isEqualType(typeA.ofType, typeB.ofType);
  }
  if (isListType(typeA) && isListType(typeB)) {
    return isEqualType(typeA.ofType, typeB.ofType);
  }
  return false;
}
function isTypeSubTypeOf(schema2, maybeSubType, superType) {
  if (maybeSubType === superType) {
    return true;
  }
  if (isNonNullType(superType)) {
    if (isNonNullType(maybeSubType)) {
      return isTypeSubTypeOf(schema2, maybeSubType.ofType, superType.ofType);
    }
    return false;
  }
  if (isNonNullType(maybeSubType)) {
    return isTypeSubTypeOf(schema2, maybeSubType.ofType, superType);
  }
  if (isListType(superType)) {
    if (isListType(maybeSubType)) {
      return isTypeSubTypeOf(schema2, maybeSubType.ofType, superType.ofType);
    }
    return false;
  }
  if (isListType(maybeSubType)) {
    return false;
  }
  return isAbstractType(superType) && (isInterfaceType(maybeSubType) || isObjectType(maybeSubType)) && schema2.isSubType(superType, maybeSubType);
}
function doTypesOverlap(schema2, typeA, typeB) {
  if (typeA === typeB) {
    return true;
  }
  if (isAbstractType(typeA)) {
    if (isAbstractType(typeB)) {
      return schema2.getPossibleTypes(typeA).some((type) => schema2.isSubType(typeB, type));
    }
    return schema2.isSubType(typeA, typeB);
  }
  if (isAbstractType(typeB)) {
    return schema2.isSubType(typeB, typeA);
  }
  return false;
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/jsutils/Path.mjs
function addPath(prev, key, typename) {
  return { prev, key, typename };
}
function pathToArray(path) {
  const flattened = [];
  let curr = path;
  while (curr) {
    flattened.push(curr.key);
    curr = curr.prev;
  }
  return flattened.reverse();
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/utilities/valueToLiteral.mjs
function valueToLiteral(value, type) {
  if (isNonNullType(type)) {
    if (value == null) {
      return;
    }
    return valueToLiteral(value, type.ofType);
  }
  if (value == null) {
    return { kind: kinds_exports.NULL };
  }
  if (isListType(type)) {
    if (!isIterableObject(value)) {
      return valueToLiteral(value, type.ofType);
    }
    const values = [];
    for (const itemValue of value) {
      const itemNode = valueToLiteral(itemValue, type.ofType);
      if (!itemNode) {
        return;
      }
      values.push(itemNode);
    }
    return { kind: kinds_exports.LIST, values };
  }
  if (isInputObjectType(type)) {
    if (!isObjectLike(value)) {
      return;
    }
    const fields = [];
    const fieldDefs = type.getFields();
    const hasUndefinedField = Object.keys(value).some((name) => value[name] !== void 0 && !Object.hasOwn(fieldDefs, name));
    if (hasUndefinedField) {
      return;
    }
    for (const field of Object.values(type.getFields())) {
      const fieldValue = value[field.name];
      if (fieldValue === void 0) {
        if (isRequiredInputField(field)) {
          return;
        }
      } else {
        const fieldNode = valueToLiteral(value[field.name], field.type);
        if (!fieldNode) {
          return;
        }
        fields.push({
          kind: kinds_exports.OBJECT_FIELD,
          name: { kind: kinds_exports.NAME, value: field.name },
          value: fieldNode
        });
      }
    }
    return { kind: kinds_exports.OBJECT, fields };
  }
  const leafType = assertLeafType(type);
  if (leafType.valueToLiteral) {
    try {
      return leafType.valueToLiteral(value);
    } catch (_error) {
      return;
    }
  }
  return defaultScalarValueToLiteral(value);
}
function defaultScalarValueToLiteral(value) {
  if (value == null) {
    return { kind: kinds_exports.NULL };
  }
  switch (typeof value) {
    case "boolean":
      return { kind: kinds_exports.BOOLEAN, value };
    case "string":
      return { kind: kinds_exports.STRING, value, block: false };
    case "bigint":
      return { kind: kinds_exports.INT, value: value.toString() };
    case "number": {
      if (!Number.isFinite(value)) {
        return { kind: kinds_exports.NULL };
      }
      const stringValue = String(value);
      return /^-?(?:0|[1-9][0-9]*)$/.test(stringValue) ? { kind: kinds_exports.INT, value: stringValue } : { kind: kinds_exports.FLOAT, value: stringValue };
    }
    case "object": {
      if (isIterableObject(value)) {
        return {
          kind: kinds_exports.LIST,
          values: Array.from(value, defaultScalarValueToLiteral)
        };
      }
      const objValue = value;
      const fields = [];
      for (const fieldName of Object.keys(objValue)) {
        const fieldValue = objValue[fieldName];
        if (fieldValue !== void 0) {
          fields.push({
            kind: kinds_exports.OBJECT_FIELD,
            name: { kind: kinds_exports.NAME, value: fieldName },
            value: defaultScalarValueToLiteral(fieldValue)
          });
        }
      }
      return { kind: kinds_exports.OBJECT, fields };
    }
  }
  throw new TypeError(`Cannot convert value to AST: ${inspect(value)}.`);
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/utilities/replaceVariables.mjs
function replaceVariables(valueNode, variableValues, fragmentVariableValues) {
  switch (valueNode.kind) {
    case kinds_exports.VARIABLE: {
      const varName = valueNode.name.value;
      const fragmentVariableValueSource = fragmentVariableValues?.sources[varName];
      if (fragmentVariableValueSource) {
        const value = fragmentVariableValueSource.value;
        if (value === void 0) {
          const defaultValue = fragmentVariableValueSource.signature.default;
          if (defaultValue !== void 0) {
            return defaultValue.literal;
          }
          return { kind: kinds_exports.NULL };
        }
        return replaceVariables(value, variableValues, fragmentVariableValueSource.fragmentVariableValues);
      }
      const variableValueSource = variableValues?.sources[varName];
      if (variableValueSource == null) {
        return { kind: kinds_exports.NULL };
      }
      if (variableValueSource.value === void 0) {
        const defaultValue = variableValueSource.signature.default;
        if (defaultValue !== void 0) {
          return defaultValue.literal;
        }
      }
      return valueToLiteral(variableValueSource.value, variableValueSource.signature.type);
    }
    case kinds_exports.OBJECT: {
      const newFields = [];
      for (const field of valueNode.fields) {
        if (field.value.kind === kinds_exports.VARIABLE) {
          const scopedVariableSource = fragmentVariableValues?.sources[field.value.name.value] ?? variableValues?.sources[field.value.name.value];
          if (scopedVariableSource?.value === void 0 && scopedVariableSource?.signature.default === void 0) {
            continue;
          }
        }
        const newFieldNodeValue = replaceVariables(field.value, variableValues, fragmentVariableValues);
        newFields.push({
          ...field,
          value: newFieldNodeValue
        });
      }
      return {
        ...valueNode,
        fields: newFields
      };
    }
    case kinds_exports.LIST: {
      const newValues = [];
      for (const value of valueNode.values) {
        const newItemNodeValue = replaceVariables(value, variableValues, fragmentVariableValues);
        newValues.push(newItemNodeValue);
      }
      return {
        ...valueNode,
        values: newValues
      };
    }
    default: {
      return valueNode;
    }
  }
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/utilities/validateInputValue.mjs
function validateInputValue(inputValue, type, onError, hideSuggestions) {
  return validateInputValueImpl(inputValue, type, onError, hideSuggestions, void 0);
}
function validateInputValueImpl(inputValue, type, onError, hideSuggestions, path) {
  if (isNonNullType(type)) {
    if (inputValue === void 0) {
      reportInvalidValue(onError, `Expected a value of non-null type "${type}" to be provided.`, path);
      return;
    }
    if (inputValue === null) {
      reportInvalidValue(onError, `Expected value of non-null type "${type}" not to be null.`, path);
      return;
    }
    return validateInputValueImpl(inputValue, type.ofType, onError, hideSuggestions, path);
  }
  if (inputValue == null) {
    return;
  }
  if (isListType(type)) {
    if (!isIterableObject(inputValue)) {
      validateInputValueImpl(inputValue, type.ofType, onError, hideSuggestions, path);
    } else {
      let index = 0;
      for (const itemValue of inputValue) {
        validateInputValueImpl(itemValue, type.ofType, onError, hideSuggestions, addPath(path, index++, void 0));
      }
    }
  } else if (isInputObjectType(type)) {
    if (!isObjectLike(inputValue) || Array.isArray(inputValue)) {
      reportInvalidValue(onError, `Expected value of type "${type}" to be an object, found: ${inspect(inputValue)}.`, path);
      return;
    }
    const fieldDefs = type.getFields();
    for (const field of Object.values(fieldDefs)) {
      const fieldValue = inputValue[field.name];
      if (fieldValue === void 0) {
        if (isRequiredInputField(field)) {
          reportInvalidValue(onError, `Expected value of type "${type}" to include required field "${field.name}", found: ${inspect(inputValue)}.`, path);
        }
      } else {
        validateInputValueImpl(fieldValue, field.type, onError, hideSuggestions, addPath(path, field.name, type.name));
      }
    }
    const fields = [];
    for (const fieldName of Object.keys(inputValue)) {
      if (inputValue[fieldName] === void 0) {
        continue;
      }
      if (!Object.hasOwn(fieldDefs, fieldName)) {
        const suggestion = hideSuggestions ? "" : didYouMean(suggestionList(fieldName, Object.keys(fieldDefs)));
        reportInvalidValue(onError, `Expected value of type "${type}" not to include unknown field "${fieldName}"${suggestion ? `.${suggestion} Found` : ", found"}: ${inspect(inputValue)}.`, path);
        continue;
      }
      fields.push(fieldName);
    }
    if (type.isOneOf) {
      if (fields.length !== 1) {
        reportInvalidValue(onError, getOneOfInputObjectErrorMessage(type), path);
      }
      const field = fields[0];
      const value = inputValue[field];
      if (value === null) {
        reportInvalidValue(onError, getOneOfInputObjectErrorMessage(type), addPath(path, field, type.name));
      }
    }
  } else {
    assertLeafType(type);
    let result;
    let caughtError;
    try {
      result = type.coerceInputValue(inputValue, hideSuggestions);
    } catch (error) {
      if (error instanceof GraphQLError) {
        onError(error, pathToArray(path));
        return;
      }
      caughtError = error;
    }
    if (result === void 0) {
      reportInvalidValue(onError, `Expected value of type "${type}"${caughtError != null ? `, but encountered error "${getCaughtErrorMessage(caughtError)}"; found` : ", found"}: ${inspect(inputValue)}.`, path, ensureGraphQLError(caughtError));
    }
  }
}
function reportInvalidValue(onError, message, path, originalError) {
  onError(new GraphQLError(message, { originalError }), pathToArray(path));
}
function validateInputLiteral(valueNode, type, onError, variables, fragmentVariableValues, hideSuggestions) {
  const context = {
    static: !variables && !fragmentVariableValues,
    onError,
    variables,
    fragmentVariableValues
  };
  return validateInputLiteralImpl(context, valueNode, type, hideSuggestions, void 0);
}
function validateInputLiteralImpl(context, valueNode, type, hideSuggestions, path) {
  if (valueNode.kind === kinds_exports.VARIABLE) {
    if (context.static) {
      return;
    }
    const scopedVariableValues = getScopedVariableValues(context, valueNode);
    const value = scopedVariableValues?.coerced[valueNode.name.value];
    if (isNonNullType(type)) {
      if (value === void 0) {
        reportInvalidLiteral(context.onError, `Expected variable "$${valueNode.name.value}" provided to type "${type}" to provide a runtime value.`, valueNode, path);
      } else if (value === null) {
        reportInvalidLiteral(context.onError, `Expected variable "$${valueNode.name.value}" provided to non-null type "${type}" not to be null.`, valueNode, path);
      }
    }
    return;
  }
  if (isNonNullType(type)) {
    if (valueNode.kind === kinds_exports.NULL) {
      reportInvalidLiteral(context.onError, `Expected value of non-null type "${type}" not to be null.`, valueNode, path);
      return;
    }
    return validateInputLiteralImpl(context, valueNode, type.ofType, hideSuggestions, path);
  }
  if (valueNode.kind === kinds_exports.NULL) {
    return;
  }
  if (isListType(type)) {
    if (valueNode.kind !== kinds_exports.LIST) {
      validateInputLiteralImpl(context, valueNode, type.ofType, hideSuggestions, path);
    } else {
      let index = 0;
      for (const itemNode of valueNode.values) {
        validateInputLiteralImpl(context, itemNode, type.ofType, hideSuggestions, addPath(path, index++, void 0));
      }
    }
  } else if (isInputObjectType(type)) {
    if (valueNode.kind !== kinds_exports.OBJECT) {
      reportInvalidLiteral(context.onError, `Expected value of type "${type}" to be an object, found: ${print(valueNode)}.`, valueNode, path);
      return;
    }
    const fieldDefs = type.getFields();
    const fieldNodes = keyMap(valueNode.fields, (field) => field.name.value);
    for (const field of Object.values(fieldDefs)) {
      const fieldNode = fieldNodes[field.name];
      if (fieldNode === void 0) {
        if (isRequiredInputField(field)) {
          reportInvalidLiteral(context.onError, `Expected value of type "${type}" to include required field "${field.name}", found: ${print(valueNode)}.`, valueNode, path);
        }
      } else {
        const fieldValueNode = fieldNode.value;
        if (fieldValueNode.kind === kinds_exports.VARIABLE && !context.static) {
          const scopedVariableValues = getScopedVariableValues(context, fieldValueNode);
          const variableName = fieldValueNode.name.value;
          const value = scopedVariableValues?.coerced[variableName];
          if (type.isOneOf) {
            if (value === void 0) {
              reportInvalidLiteral(context.onError, `Expected variable "$${variableName}" provided to field "${field.name}" for OneOf Input Object type "${type}" to provide a runtime value.`, valueNode, path);
            } else if (value === null) {
              reportInvalidLiteral(context.onError, `Expected variable "$${variableName}" provided to field "${field.name}" for OneOf Input Object type "${type}" not to be null.`, valueNode, path);
            }
          } else if (value === void 0 && !isRequiredInputField(field)) {
            continue;
          }
        }
        validateInputLiteralImpl(context, fieldValueNode, field.type, hideSuggestions, addPath(path, field.name, type.name));
      }
    }
    const fields = valueNode.fields;
    const knownFields = [];
    for (const fieldNode of fields) {
      const fieldName = fieldNode.name.value;
      if (!Object.hasOwn(fieldDefs, fieldName)) {
        const suggestion = hideSuggestions ? "" : didYouMean(suggestionList(fieldName, Object.keys(fieldDefs)));
        reportInvalidLiteral(context.onError, `Expected value of type "${type}" not to include unknown field "${fieldName}"${suggestion ? `.${suggestion} Found` : ", found"}: ${print(valueNode)}.`, fieldNode, path);
      } else {
        knownFields.push(fieldNode);
      }
    }
    if (type.isOneOf) {
      const isNotExactlyOneField = knownFields.length !== 1;
      if (isNotExactlyOneField) {
        reportInvalidLiteral(context.onError, getOneOfInputObjectErrorMessage(type), valueNode, path);
        return;
      }
      const fieldValueNode = knownFields[0].value;
      if (fieldValueNode.kind === kinds_exports.NULL) {
        const fieldName = knownFields[0].name.value;
        reportInvalidLiteral(context.onError, getOneOfInputObjectErrorMessage(type), valueNode, addPath(path, fieldName, void 0));
      }
    }
  } else {
    assertLeafType(type);
    let result;
    let caughtError;
    try {
      result = type.coerceInputLiteral ? type.coerceInputLiteral(replaceVariables(valueNode, context.variables, context.fragmentVariableValues), hideSuggestions) : type.parseLiteral(valueNode, void 0, hideSuggestions);
    } catch (error) {
      if (error instanceof GraphQLError) {
        context.onError(error, pathToArray(path));
        return;
      }
      caughtError = error;
    }
    if (result === void 0) {
      reportInvalidLiteral(context.onError, `Expected value of type "${type}"${caughtError != null ? `, but encountered error "${getCaughtErrorMessage(caughtError)}"; found` : ", found"}: ${print(valueNode)}.`, valueNode, path, ensureGraphQLError(caughtError));
    }
  }
}
function getScopedVariableValues(context, valueNode) {
  const variableName = valueNode.name.value;
  const { fragmentVariableValues, variables } = context;
  return fragmentVariableValues?.sources[variableName] ? fragmentVariableValues : variables;
}
function reportInvalidLiteral(onError, message, valueNode, path, originalError) {
  onError(new GraphQLError(message, {
    nodes: valueNode,
    originalError
  }), pathToArray(path));
}
function getCaughtErrorMessage(caughtError) {
  if (isObjectLike(caughtError)) {
    const message = caughtError.message;
    if (typeof message === "string" && message !== "") {
      return message;
    }
  }
  return String(caughtError);
}
function getOneOfInputObjectErrorMessage(type) {
  return `Within OneOf Input Object type "${type}", exactly one field must be specified, and the value for that field must be non-null.`;
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/language/directiveLocation.mjs
var DirectiveLocation = {
  QUERY: "QUERY",
  MUTATION: "MUTATION",
  SUBSCRIPTION: "SUBSCRIPTION",
  FIELD: "FIELD",
  FRAGMENT_DEFINITION: "FRAGMENT_DEFINITION",
  FRAGMENT_SPREAD: "FRAGMENT_SPREAD",
  INLINE_FRAGMENT: "INLINE_FRAGMENT",
  VARIABLE_DEFINITION: "VARIABLE_DEFINITION",
  FRAGMENT_VARIABLE_DEFINITION: "FRAGMENT_VARIABLE_DEFINITION",
  SCHEMA: "SCHEMA",
  SCALAR: "SCALAR",
  OBJECT: "OBJECT",
  FIELD_DEFINITION: "FIELD_DEFINITION",
  ARGUMENT_DEFINITION: "ARGUMENT_DEFINITION",
  INTERFACE: "INTERFACE",
  UNION: "UNION",
  ENUM: "ENUM",
  ENUM_VALUE: "ENUM_VALUE",
  INPUT_OBJECT: "INPUT_OBJECT",
  INPUT_FIELD_DEFINITION: "INPUT_FIELD_DEFINITION",
  DIRECTIVE_DEFINITION: "DIRECTIVE_DEFINITION"
};

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/type/scalars.mjs
var GRAPHQL_MAX_INT = 2147483647;
var GRAPHQL_MIN_INT = -2147483648;
var GraphQLInt = new GraphQLScalarType({
  name: "Int",
  description: "The `Int` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1.",
  coerceOutputValue(outputValue) {
    const coercedValue = coerceOutputValueObject(outputValue);
    if (typeof coercedValue === "number") {
      return coerceIntFromNumber(coercedValue);
    }
    if (typeof coercedValue === "boolean") {
      return coercedValue ? 1 : 0;
    }
    if (typeof coercedValue === "string") {
      return coerceIntFromString(coercedValue);
    }
    if (typeof coercedValue === "bigint") {
      return coerceIntFromBigInt(coercedValue);
    }
    throw new GraphQLError(`Int cannot represent non-integer value: ${inspect(coercedValue)}`);
  },
  coerceInputValue(inputValue) {
    if (typeof inputValue === "number") {
      return coerceIntFromNumber(inputValue);
    }
    if (typeof inputValue === "bigint") {
      return coerceIntFromBigInt(inputValue);
    }
    throw new GraphQLError(`Int cannot represent non-integer value: ${inspect(inputValue)}`);
  },
  coerceInputLiteral(valueNode) {
    if (valueNode.kind !== kinds_exports.INT) {
      throw new GraphQLError(`Int cannot represent non-integer value: ${print(valueNode)}`, { nodes: valueNode });
    }
    const num = parseInt(valueNode.value, 10);
    if (num > GRAPHQL_MAX_INT || num < GRAPHQL_MIN_INT) {
      throw new GraphQLError(`Int cannot represent non 32-bit signed integer value: ${valueNode.value}`, { nodes: valueNode });
    }
    return num;
  },
  valueToLiteral(value) {
    if ((typeof value === "number" && Number.isInteger(value) || typeof value === "bigint") && value <= GRAPHQL_MAX_INT && value >= GRAPHQL_MIN_INT) {
      return { kind: kinds_exports.INT, value: String(value) };
    }
  }
});
var GraphQLFloat = new GraphQLScalarType({
  name: "Float",
  description: "The `Float` scalar type represents signed double-precision fractional values as specified by [IEEE 754](https://en.wikipedia.org/wiki/IEEE_floating_point).",
  coerceOutputValue(outputValue) {
    const coercedValue = coerceOutputValueObject(outputValue);
    if (typeof coercedValue === "number") {
      return coerceFloatFromNumber(coercedValue);
    }
    if (typeof coercedValue === "boolean") {
      return coercedValue ? 1 : 0;
    }
    if (typeof coercedValue === "string") {
      return coerceFloatFromString(coercedValue);
    }
    if (typeof coercedValue === "bigint") {
      return coerceFloatFromBigInt(coercedValue);
    }
    throw new GraphQLError(`Float cannot represent non numeric value: ${inspect(coercedValue)}`);
  },
  coerceInputValue(inputValue) {
    if (typeof inputValue === "number") {
      return coerceFloatFromNumber(inputValue);
    }
    if (typeof inputValue === "bigint") {
      return coerceFloatFromBigInt(inputValue);
    }
    throw new GraphQLError(`Float cannot represent non numeric value: ${inspect(inputValue)}`);
  },
  coerceInputLiteral(valueNode) {
    if (valueNode.kind !== kinds_exports.FLOAT && valueNode.kind !== kinds_exports.INT) {
      throw new GraphQLError(`Float cannot represent non numeric value: ${print(valueNode)}`, { nodes: valueNode });
    }
    return parseFloat(valueNode.value);
  },
  valueToLiteral(value) {
    const literal = defaultScalarValueToLiteral(value);
    if (literal.kind === kinds_exports.FLOAT || literal.kind === kinds_exports.INT) {
      return literal;
    }
  }
});
var GraphQLString = new GraphQLScalarType({
  name: "String",
  description: "The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text.",
  coerceOutputValue(outputValue) {
    const coercedValue = coerceOutputValueObject(outputValue);
    if (typeof coercedValue === "string") {
      return coercedValue;
    }
    if (typeof coercedValue === "boolean") {
      return coercedValue ? "true" : "false";
    }
    if (typeof coercedValue === "number") {
      return coerceStringFromNumber(coercedValue);
    }
    if (typeof coercedValue === "bigint") {
      return String(coercedValue);
    }
    throw new GraphQLError(`String cannot represent value: ${inspect(outputValue)}`);
  },
  coerceInputValue(inputValue) {
    if (typeof inputValue !== "string") {
      throw new GraphQLError(`String cannot represent a non string value: ${inspect(inputValue)}`);
    }
    return inputValue;
  },
  coerceInputLiteral(valueNode) {
    if (valueNode.kind !== kinds_exports.STRING) {
      throw new GraphQLError(`String cannot represent a non string value: ${print(valueNode)}`, { nodes: valueNode });
    }
    return valueNode.value;
  },
  valueToLiteral(value) {
    const literal = defaultScalarValueToLiteral(value);
    if (literal.kind === kinds_exports.STRING) {
      return literal;
    }
  }
});
var GraphQLBoolean = new GraphQLScalarType({
  name: "Boolean",
  description: "The `Boolean` scalar type represents `true` or `false`.",
  coerceOutputValue(outputValue) {
    const coercedValue = coerceOutputValueObject(outputValue);
    if (typeof coercedValue === "boolean") {
      return coercedValue;
    }
    if (typeof coercedValue === "number") {
      return coerceBooleanFromNumber(coercedValue);
    }
    if (typeof coercedValue === "bigint") {
      return coercedValue !== 0n;
    }
    throw new GraphQLError(`Boolean cannot represent a non boolean value: ${inspect(coercedValue)}`);
  },
  coerceInputValue(inputValue) {
    if (typeof inputValue !== "boolean") {
      throw new GraphQLError(`Boolean cannot represent a non boolean value: ${inspect(inputValue)}`);
    }
    return inputValue;
  },
  coerceInputLiteral(valueNode) {
    if (valueNode.kind !== kinds_exports.BOOLEAN) {
      throw new GraphQLError(`Boolean cannot represent a non boolean value: ${print(valueNode)}`, { nodes: valueNode });
    }
    return valueNode.value;
  },
  valueToLiteral(value) {
    const literal = defaultScalarValueToLiteral(value);
    if (literal.kind === kinds_exports.BOOLEAN) {
      return literal;
    }
  }
});
var GraphQLID = new GraphQLScalarType({
  name: "ID",
  description: 'The `ID` scalar type represents a unique identifier, often used to refetch an object or as key for a cache. The ID type appears in a JSON response as a String; however, it is not intended to be human-readable. When expected as an input type, any string (such as `"4"`) or integer (such as `4`) input value will be accepted as an ID.',
  coerceOutputValue(outputValue) {
    const coercedValue = coerceOutputValueObject(outputValue);
    if (typeof coercedValue === "string") {
      return coercedValue;
    }
    if (typeof coercedValue === "number") {
      return coerceIDFromNumber(coercedValue);
    }
    if (typeof coercedValue === "bigint") {
      return String(coercedValue);
    }
    throw new GraphQLError(`ID cannot represent value: ${inspect(outputValue)}`);
  },
  coerceInputValue(inputValue) {
    if (typeof inputValue === "string") {
      return inputValue;
    }
    if (typeof inputValue === "number") {
      return coerceIDFromNumber(inputValue);
    }
    if (typeof inputValue === "bigint") {
      return String(inputValue);
    }
    throw new GraphQLError(`ID cannot represent value: ${inspect(inputValue)}`);
  },
  coerceInputLiteral(valueNode) {
    if (valueNode.kind !== kinds_exports.STRING && valueNode.kind !== kinds_exports.INT) {
      throw new GraphQLError("ID cannot represent a non-string and non-integer value: " + print(valueNode), { nodes: valueNode });
    }
    return valueNode.value;
  },
  valueToLiteral(value) {
    if (typeof value === "string") {
      return /^-?(?:0|[1-9][0-9]*)$/.test(value) ? { kind: kinds_exports.INT, value } : { kind: kinds_exports.STRING, value, block: false };
    }
    if (typeof value === "number") {
      return { kind: kinds_exports.INT, value: coerceIDFromNumber(value) };
    }
    if (typeof value === "bigint") {
      return { kind: kinds_exports.INT, value: String(value) };
    }
  }
});
var specifiedScalarTypes = Object.freeze([
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLID
]);
function isSpecifiedScalarType(type) {
  return specifiedScalarTypes.some(({ name }) => type.name === name);
}
function coerceOutputValueObject(outputValue) {
  if (isObjectLike(outputValue)) {
    if (typeof outputValue.valueOf === "function") {
      const valueOfResult = outputValue.valueOf();
      if (!isObjectLike(valueOfResult)) {
        return valueOfResult;
      }
    }
    if (typeof outputValue.toJSON === "function") {
      return outputValue.toJSON();
    }
  }
  return outputValue;
}
function coerceIntFromNumber(value) {
  if (!Number.isInteger(value)) {
    throw new GraphQLError(`Int cannot represent non-integer value: ${inspect(value)}`);
  }
  if (value > GRAPHQL_MAX_INT || value < GRAPHQL_MIN_INT) {
    throw new GraphQLError(`Int cannot represent non 32-bit signed integer value: ${inspect(value)}`);
  }
  return value;
}
function coerceIntFromString(value) {
  if (value === "") {
    throw new GraphQLError(`Int cannot represent non-integer value: ${inspect(value)}`);
  }
  const num = Number(value);
  if (!Number.isInteger(num)) {
    throw new GraphQLError(`Int cannot represent non-integer value: ${inspect(value)}`);
  }
  if (num > GRAPHQL_MAX_INT || num < GRAPHQL_MIN_INT) {
    throw new GraphQLError(`Int cannot represent non 32-bit signed integer value: ${inspect(value)}`);
  }
  return num;
}
function coerceIntFromBigInt(value) {
  if (value > GRAPHQL_MAX_INT || value < GRAPHQL_MIN_INT) {
    throw new GraphQLError(`Int cannot represent non 32-bit signed integer value: ${String(value)}`);
  }
  return Number(value);
}
function coerceFloatFromNumber(value) {
  if (!Number.isFinite(value)) {
    throw new GraphQLError(`Float cannot represent non numeric value: ${inspect(value)}`);
  }
  return value;
}
function coerceFloatFromString(value) {
  if (value === "") {
    throw new GraphQLError(`Float cannot represent non numeric value: ${inspect(value)}`);
  }
  const num = Number(value);
  if (!Number.isFinite(num)) {
    throw new GraphQLError(`Float cannot represent non numeric value: ${inspect(value)}`);
  }
  return num;
}
function coerceFloatFromBigInt(coercedValue) {
  const num = Number(coercedValue);
  if (!Number.isFinite(num)) {
    throw new GraphQLError(`Float cannot represent non numeric value: ${inspect(coercedValue)} (value is too large)`);
  }
  if (BigInt(num) !== coercedValue) {
    throw new GraphQLError(`Float cannot represent non numeric value: ${inspect(coercedValue)} (value would lose precision)`);
  }
  return num;
}
function coerceStringFromNumber(value) {
  if (!Number.isFinite(value)) {
    throw new GraphQLError(`String cannot represent value: ${inspect(value)}`);
  }
  return String(value);
}
function coerceBooleanFromNumber(value) {
  if (!Number.isFinite(value)) {
    throw new GraphQLError(`Boolean cannot represent a non boolean value: ${inspect(value)}`);
  }
  return value !== 0;
}
function coerceIDFromNumber(value) {
  if (!Number.isInteger(value)) {
    throw new GraphQLError(`ID cannot represent value: ${inspect(value)}`);
  }
  return String(value);
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/type/directives.mjs
var directiveSymbol = /* @__PURE__ */ Symbol("Directive");
function isDirective(directive) {
  return instanceOf(directive, directiveSymbol, GraphQLDirective);
}
var GraphQLDirective = class {
  constructor(config) {
    this.__kind = directiveSymbol;
    this.name = assertName(config.name);
    this.description = config.description;
    this.locations = config.locations;
    this.isRepeatable = config.isRepeatable ?? false;
    this.deprecationReason = config.deprecationReason;
    this.extensions = toObjMapWithSymbols(config.extensions);
    this.astNode = config.astNode;
    this.extensionASTNodes = config.extensionASTNodes ?? [];
    if (!Array.isArray(config.locations))
      devAssert(false, `@${this.name} locations must be an Array.`);
    const args = config.args ?? {};
    if (!(isObjectLike(args) && !Array.isArray(args)))
      devAssert(false, `@${this.name} args must be an object with argument names as keys.`);
    this.args = Object.entries(args).map(([argName, argConfig]) => new GraphQLArgument(this, argName, argConfig));
  }
  get [Symbol.toStringTag]() {
    return "GraphQLDirective";
  }
  toConfig() {
    return {
      name: this.name,
      description: this.description,
      locations: this.locations,
      args: keyValMap(this.args, (arg) => arg.name, (arg) => arg.toConfig()),
      isRepeatable: this.isRepeatable,
      deprecationReason: this.deprecationReason,
      extensions: this.extensions,
      astNode: this.astNode,
      extensionASTNodes: this.extensionASTNodes
    };
  }
  toString() {
    return "@" + this.name;
  }
  toJSON() {
    return this.toString();
  }
};
var GraphQLIncludeDirective = new GraphQLDirective({
  name: "include",
  description: "Directs the executor to include this field or fragment only when the `if` argument is true.",
  locations: [
    DirectiveLocation.FIELD,
    DirectiveLocation.FRAGMENT_SPREAD,
    DirectiveLocation.INLINE_FRAGMENT
  ],
  args: {
    if: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: "Included when true."
    }
  }
});
var GraphQLSkipDirective = new GraphQLDirective({
  name: "skip",
  description: "Directs the executor to skip this field or fragment when the `if` argument is true.",
  locations: [
    DirectiveLocation.FIELD,
    DirectiveLocation.FRAGMENT_SPREAD,
    DirectiveLocation.INLINE_FRAGMENT
  ],
  args: {
    if: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: "Skipped when true."
    }
  }
});
var GraphQLDeferDirective = new GraphQLDirective({
  name: "defer",
  description: "Directs the executor to defer this fragment when the `if` argument is true or undefined.",
  locations: [
    DirectiveLocation.FRAGMENT_SPREAD,
    DirectiveLocation.INLINE_FRAGMENT
  ],
  args: {
    if: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: "Deferred when true or undefined.",
      default: { value: true }
    },
    label: {
      type: GraphQLString,
      description: "Unique name"
    }
  }
});
var GraphQLStreamDirective = new GraphQLDirective({
  name: "stream",
  description: "Directs the executor to stream plural fields when the `if` argument is true or undefined.",
  locations: [DirectiveLocation.FIELD],
  args: {
    initialCount: {
      default: { value: 0 },
      type: new GraphQLNonNull(GraphQLInt),
      description: "Number of items to return immediately"
    },
    if: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: "Stream when true or undefined.",
      default: { value: true }
    },
    label: {
      type: GraphQLString,
      description: "Unique name"
    }
  }
});
var DEFAULT_DEPRECATION_REASON = "No longer supported";
var GraphQLDeprecatedDirective = new GraphQLDirective({
  name: "deprecated",
  description: "Marks an element of a GraphQL schema as no longer supported.",
  locations: [
    DirectiveLocation.FIELD_DEFINITION,
    DirectiveLocation.ARGUMENT_DEFINITION,
    DirectiveLocation.INPUT_FIELD_DEFINITION,
    DirectiveLocation.ENUM_VALUE,
    DirectiveLocation.DIRECTIVE_DEFINITION
  ],
  args: {
    reason: {
      type: new GraphQLNonNull(GraphQLString),
      description: "Explains why this element was deprecated, usually also including a suggestion for how to access supported similar data. Formatted using the Markdown syntax, as specified by [CommonMark](https://commonmark.org/).",
      default: { value: DEFAULT_DEPRECATION_REASON }
    }
  }
});
var GraphQLSpecifiedByDirective = new GraphQLDirective({
  name: "specifiedBy",
  description: "Exposes a URL that specifies the behavior of this scalar.",
  locations: [DirectiveLocation.SCALAR],
  args: {
    url: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The URL that specifies the behavior of this scalar."
    }
  }
});
var GraphQLOneOfDirective = new GraphQLDirective({
  name: "oneOf",
  description: "Indicates exactly one field must be supplied and this field must not be `null`.",
  locations: [DirectiveLocation.INPUT_OBJECT],
  args: {}
});
var GraphQLDisableErrorPropagationDirective = new GraphQLDirective({
  name: "experimental_disableErrorPropagation",
  description: "Disables error propagation.",
  locations: [
    DirectiveLocation.QUERY,
    DirectiveLocation.MUTATION,
    DirectiveLocation.SUBSCRIPTION
  ]
});
var specifiedDirectives = Object.freeze([
  GraphQLIncludeDirective,
  GraphQLSkipDirective,
  GraphQLDeprecatedDirective,
  GraphQLSpecifiedByDirective,
  GraphQLOneOfDirective
]);
function isSpecifiedDirective(directive) {
  return specifiedDirectives.some(({ name }) => name === directive.name);
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/utilities/astFromValue.mjs
function astFromValue(value, type) {
  if (isNonNullType(type)) {
    const astValue = astFromValue(value, type.ofType);
    if (astValue?.kind === kinds_exports.NULL) {
      return null;
    }
    return astValue;
  }
  if (value === null) {
    return { kind: kinds_exports.NULL };
  }
  if (value === void 0) {
    return null;
  }
  if (isListType(type)) {
    const itemType = type.ofType;
    if (isIterableObject(value)) {
      const valuesNodes = [];
      for (const item of value) {
        const itemNode = astFromValue(item, itemType);
        if (itemNode != null) {
          valuesNodes.push(itemNode);
        }
      }
      return { kind: kinds_exports.LIST, values: valuesNodes };
    }
    return astFromValue(value, itemType);
  }
  if (isInputObjectType(type)) {
    if (!isObjectLike(value)) {
      return null;
    }
    const fieldNodes = [];
    for (const field of Object.values(type.getFields())) {
      const fieldValue = astFromValue(value[field.name], field.type);
      if (fieldValue) {
        fieldNodes.push({
          kind: kinds_exports.OBJECT_FIELD,
          name: { kind: kinds_exports.NAME, value: field.name },
          value: fieldValue
        });
      }
    }
    return { kind: kinds_exports.OBJECT, fields: fieldNodes };
  }
  if (isLeafType(type)) {
    const coerced = type.coerceOutputValue(value);
    if (coerced == null) {
      return null;
    }
    if (typeof coerced === "boolean") {
      return { kind: kinds_exports.BOOLEAN, value: coerced };
    }
    if (typeof coerced === "number" && Number.isFinite(coerced)) {
      const stringNum = String(coerced);
      return integerStringRegExp.test(stringNum) ? { kind: kinds_exports.INT, value: stringNum } : { kind: kinds_exports.FLOAT, value: stringNum };
    }
    if (typeof coerced === "bigint") {
      return { kind: kinds_exports.INT, value: String(coerced) };
    }
    if (typeof coerced === "string") {
      if (isEnumType(type)) {
        return { kind: kinds_exports.ENUM, value: coerced };
      }
      if (type === GraphQLID && integerStringRegExp.test(coerced)) {
        return { kind: kinds_exports.INT, value: coerced };
      }
      return {
        kind: kinds_exports.STRING,
        value: coerced
      };
    }
    throw new TypeError(`Cannot convert value to AST: ${inspect(coerced)}.`);
  }
  invariant(false, "Unexpected input type: " + inspect(type));
}
var integerStringRegExp = /^-?(?:0|[1-9][0-9]*)$/;

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/utilities/getDefaultValueAST.mjs
function getDefaultValueAST(argOrInputField) {
  const type = argOrInputField.type;
  const defaultInput = argOrInputField.default;
  if (defaultInput) {
    const literal = defaultInput.literal ?? valueToLiteral(defaultInput.value, type);
    if (!(literal != null))
      invariant(false, "Invalid default value");
    return literal;
  }
  const defaultValue = argOrInputField.defaultValue;
  if (defaultValue !== void 0) {
    const valueAST = astFromValue(defaultValue, type);
    if (!(valueAST != null))
      invariant(false, "Invalid default value");
    return valueAST;
  }
  return void 0;
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/type/introspection.mjs
var __Schema = new GraphQLObjectType({
  name: "__Schema",
  description: "A GraphQL Schema defines the capabilities of a GraphQL server. It exposes all available types and directives on the server, as well as the entry points for query, mutation, and subscription operations.",
  fields: () => ({
    description: {
      type: GraphQLString,
      resolve: (schema2) => schema2.description
    },
    types: {
      description: "A list of all types supported by this server.",
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(__Type))),
      resolve(schema2) {
        return Object.values(schema2.getTypeMap());
      }
    },
    queryType: {
      description: "The type that query operations will be rooted at.",
      type: new GraphQLNonNull(__Type),
      resolve: (schema2) => schema2.getQueryType()
    },
    mutationType: {
      description: "If this server supports mutation, the type that mutation operations will be rooted at.",
      type: __Type,
      resolve: (schema2) => schema2.getMutationType()
    },
    subscriptionType: {
      description: "If this server support subscription, the type that subscription operations will be rooted at.",
      type: __Type,
      resolve: (schema2) => schema2.getSubscriptionType()
    },
    directives: {
      description: "A list of all directives supported by this server.",
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(__Directive))),
      args: {
        includeDeprecated: {
          type: new GraphQLNonNull(GraphQLBoolean),
          default: { value: false }
        }
      },
      resolve: (schema2, { includeDeprecated }) => includeDeprecated === true ? schema2.getDirectives() : schema2.getDirectives().filter((directive) => directive.deprecationReason == null)
    }
  })
});
var __Directive = new GraphQLObjectType({
  name: "__Directive",
  description: "A Directive provides a way to describe alternate runtime execution and type validation behavior in a GraphQL document.\n\nIn some cases, you need to provide options to alter GraphQL's execution behavior in ways field arguments will not suffice, such as conditionally including or skipping a field. Directives provide this by describing additional information to the executor.",
  fields: () => ({
    name: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (directive) => directive.name
    },
    description: {
      type: GraphQLString,
      resolve: (directive) => directive.description
    },
    isRepeatable: {
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve: (directive) => directive.isRepeatable
    },
    locations: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(__DirectiveLocation))),
      resolve: (directive) => directive.locations
    },
    args: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(__InputValue))),
      args: {
        includeDeprecated: {
          type: new GraphQLNonNull(GraphQLBoolean),
          default: { value: false }
        }
      },
      resolve(field, { includeDeprecated }) {
        return includeDeprecated === true ? field.args : field.args.filter((arg) => arg.deprecationReason == null);
      }
    },
    isDeprecated: {
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve: (directive) => directive.deprecationReason != null
    },
    deprecationReason: {
      type: GraphQLString,
      resolve: (directive) => directive.deprecationReason
    }
  })
});
var __DirectiveLocation = new GraphQLEnumType({
  name: "__DirectiveLocation",
  description: "A Directive can be adjacent to many parts of the GraphQL language, a __DirectiveLocation describes one such possible adjacencies.",
  values: {
    QUERY: {
      value: DirectiveLocation.QUERY,
      description: "Location adjacent to a query operation."
    },
    MUTATION: {
      value: DirectiveLocation.MUTATION,
      description: "Location adjacent to a mutation operation."
    },
    SUBSCRIPTION: {
      value: DirectiveLocation.SUBSCRIPTION,
      description: "Location adjacent to a subscription operation."
    },
    FIELD: {
      value: DirectiveLocation.FIELD,
      description: "Location adjacent to a field."
    },
    FRAGMENT_DEFINITION: {
      value: DirectiveLocation.FRAGMENT_DEFINITION,
      description: "Location adjacent to a fragment definition."
    },
    FRAGMENT_SPREAD: {
      value: DirectiveLocation.FRAGMENT_SPREAD,
      description: "Location adjacent to a fragment spread."
    },
    INLINE_FRAGMENT: {
      value: DirectiveLocation.INLINE_FRAGMENT,
      description: "Location adjacent to an inline fragment."
    },
    VARIABLE_DEFINITION: {
      value: DirectiveLocation.VARIABLE_DEFINITION,
      description: "Location adjacent to an operation variable definition."
    },
    FRAGMENT_VARIABLE_DEFINITION: {
      value: DirectiveLocation.FRAGMENT_VARIABLE_DEFINITION,
      description: "Location adjacent to a fragment variable definition."
    },
    SCHEMA: {
      value: DirectiveLocation.SCHEMA,
      description: "Location adjacent to a schema definition."
    },
    SCALAR: {
      value: DirectiveLocation.SCALAR,
      description: "Location adjacent to a scalar definition."
    },
    OBJECT: {
      value: DirectiveLocation.OBJECT,
      description: "Location adjacent to an object type definition."
    },
    FIELD_DEFINITION: {
      value: DirectiveLocation.FIELD_DEFINITION,
      description: "Location adjacent to a field definition."
    },
    ARGUMENT_DEFINITION: {
      value: DirectiveLocation.ARGUMENT_DEFINITION,
      description: "Location adjacent to an argument definition."
    },
    INTERFACE: {
      value: DirectiveLocation.INTERFACE,
      description: "Location adjacent to an interface definition."
    },
    UNION: {
      value: DirectiveLocation.UNION,
      description: "Location adjacent to a union definition."
    },
    ENUM: {
      value: DirectiveLocation.ENUM,
      description: "Location adjacent to an enum definition."
    },
    ENUM_VALUE: {
      value: DirectiveLocation.ENUM_VALUE,
      description: "Location adjacent to an enum value definition."
    },
    INPUT_OBJECT: {
      value: DirectiveLocation.INPUT_OBJECT,
      description: "Location adjacent to an input object type definition."
    },
    INPUT_FIELD_DEFINITION: {
      value: DirectiveLocation.INPUT_FIELD_DEFINITION,
      description: "Location adjacent to an input object field definition."
    },
    DIRECTIVE_DEFINITION: {
      value: DirectiveLocation.DIRECTIVE_DEFINITION,
      description: "Location adjacent to a directive definition."
    }
  }
});
var __Type = new GraphQLObjectType({
  name: "__Type",
  description: "The fundamental unit of any GraphQL Schema is the type. There are many kinds of types in GraphQL as represented by the `__TypeKind` enum.\n\nDepending on the kind of a type, certain fields describe information about that type. Scalar types provide no information beyond a name, description and optional `specifiedByURL`, while Enum types provide their values. Object and Interface types provide the fields they describe. Abstract types, Union and Interface, provide the Object types possible at runtime. List and NonNull types compose other types.",
  fields: () => ({
    kind: {
      type: new GraphQLNonNull(__TypeKind),
      resolve(type) {
        if (isScalarType(type)) {
          return TypeKind.SCALAR;
        }
        if (isObjectType(type)) {
          return TypeKind.OBJECT;
        }
        if (isInterfaceType(type)) {
          return TypeKind.INTERFACE;
        }
        if (isUnionType(type)) {
          return TypeKind.UNION;
        }
        if (isEnumType(type)) {
          return TypeKind.ENUM;
        }
        if (isInputObjectType(type)) {
          return TypeKind.INPUT_OBJECT;
        }
        if (isListType(type)) {
          return TypeKind.LIST;
        }
        if (isNonNullType(type)) {
          return TypeKind.NON_NULL;
        }
        invariant(false, `Unexpected type: "${inspect(type)}".`);
      }
    },
    name: {
      type: GraphQLString,
      resolve: (type) => "name" in type ? type.name : void 0
    },
    description: {
      type: GraphQLString,
      resolve: (type) => "description" in type ? type.description : void 0
    },
    specifiedByURL: {
      type: GraphQLString,
      resolve: (obj) => "specifiedByURL" in obj ? obj.specifiedByURL : void 0
    },
    fields: {
      type: new GraphQLList(new GraphQLNonNull(__Field)),
      args: {
        includeDeprecated: {
          type: new GraphQLNonNull(GraphQLBoolean),
          default: { value: false }
        }
      },
      resolve(type, { includeDeprecated }) {
        if (isObjectType(type) || isInterfaceType(type)) {
          const fields = Object.values(type.getFields());
          return includeDeprecated === true ? fields : fields.filter((field) => field.deprecationReason == null);
        }
      }
    },
    interfaces: {
      type: new GraphQLList(new GraphQLNonNull(__Type)),
      resolve(type) {
        if (isObjectType(type) || isInterfaceType(type)) {
          return type.getInterfaces();
        }
      }
    },
    possibleTypes: {
      type: new GraphQLList(new GraphQLNonNull(__Type)),
      resolve(type, _args, _context, { schema: schema2 }) {
        if (isAbstractType(type)) {
          return schema2.getPossibleTypes(type);
        }
      }
    },
    enumValues: {
      type: new GraphQLList(new GraphQLNonNull(__EnumValue)),
      args: {
        includeDeprecated: {
          type: new GraphQLNonNull(GraphQLBoolean),
          default: { value: false }
        }
      },
      resolve(type, { includeDeprecated }) {
        if (isEnumType(type)) {
          const values = type.getValues();
          return includeDeprecated === true ? values : values.filter((field) => field.deprecationReason == null);
        }
      }
    },
    inputFields: {
      type: new GraphQLList(new GraphQLNonNull(__InputValue)),
      args: {
        includeDeprecated: {
          type: new GraphQLNonNull(GraphQLBoolean),
          default: { value: false }
        }
      },
      resolve(type, { includeDeprecated }) {
        if (isInputObjectType(type)) {
          const values = Object.values(type.getFields());
          return includeDeprecated === true ? values : values.filter((field) => field.deprecationReason == null);
        }
      }
    },
    ofType: {
      type: __Type,
      resolve: (type) => "ofType" in type ? type.ofType : void 0
    },
    isOneOf: {
      type: GraphQLBoolean,
      resolve: (type) => {
        if (isInputObjectType(type)) {
          return type.isOneOf;
        }
      }
    }
  })
});
var __Field = new GraphQLObjectType({
  name: "__Field",
  description: "Object and Interface types are described by a list of Fields, each of which has a name, potentially a list of arguments, and a return type.",
  fields: () => ({
    name: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (field) => field.name
    },
    description: {
      type: GraphQLString,
      resolve: (field) => field.description
    },
    args: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(__InputValue))),
      args: {
        includeDeprecated: {
          type: new GraphQLNonNull(GraphQLBoolean),
          default: { value: false }
        }
      },
      resolve(field, { includeDeprecated }) {
        return includeDeprecated === true ? field.args : field.args.filter((arg) => arg.deprecationReason == null);
      }
    },
    type: {
      type: new GraphQLNonNull(__Type),
      resolve: (field) => field.type
    },
    isDeprecated: {
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve: (field) => field.deprecationReason != null
    },
    deprecationReason: {
      type: GraphQLString,
      resolve: (field) => field.deprecationReason
    }
  })
});
var __InputValue = new GraphQLObjectType({
  name: "__InputValue",
  description: "Arguments provided to Fields or Directives and the input fields of an InputObject are represented as Input Values which describe their type and optionally a default value.",
  fields: () => ({
    name: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (inputValue) => inputValue.name
    },
    description: {
      type: GraphQLString,
      resolve: (inputValue) => inputValue.description
    },
    type: {
      type: new GraphQLNonNull(__Type),
      resolve: (inputValue) => inputValue.type
    },
    defaultValue: {
      type: GraphQLString,
      description: "A GraphQL-formatted string representing the default value for this input value.",
      resolve(inputValue) {
        const ast = getDefaultValueAST(inputValue);
        if (ast) {
          return print(ast);
        }
        return null;
      }
    },
    isDeprecated: {
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve: (field) => field.deprecationReason != null
    },
    deprecationReason: {
      type: GraphQLString,
      resolve: (obj) => obj.deprecationReason
    }
  })
});
var __EnumValue = new GraphQLObjectType({
  name: "__EnumValue",
  description: "One possible value for a given Enum. Enum values are unique values, not a placeholder for a string or numeric value. However an Enum value is returned in a JSON response as a string.",
  fields: () => ({
    name: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (enumValue) => enumValue.name
    },
    description: {
      type: GraphQLString,
      resolve: (enumValue) => enumValue.description
    },
    isDeprecated: {
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve: (enumValue) => enumValue.deprecationReason != null
    },
    deprecationReason: {
      type: GraphQLString,
      resolve: (enumValue) => enumValue.deprecationReason
    }
  })
});
var TypeKind = {
  SCALAR: "SCALAR",
  OBJECT: "OBJECT",
  INTERFACE: "INTERFACE",
  UNION: "UNION",
  ENUM: "ENUM",
  INPUT_OBJECT: "INPUT_OBJECT",
  LIST: "LIST",
  NON_NULL: "NON_NULL"
};
var __TypeKind = new GraphQLEnumType({
  name: "__TypeKind",
  description: "An enum describing what kind of type a given `__Type` is.",
  values: {
    SCALAR: {
      value: TypeKind.SCALAR,
      description: "Indicates this type is a scalar."
    },
    OBJECT: {
      value: TypeKind.OBJECT,
      description: "Indicates this type is an object. `fields` and `interfaces` are valid fields."
    },
    INTERFACE: {
      value: TypeKind.INTERFACE,
      description: "Indicates this type is an interface. `fields`, `interfaces`, and `possibleTypes` are valid fields."
    },
    UNION: {
      value: TypeKind.UNION,
      description: "Indicates this type is a union. `possibleTypes` is a valid field."
    },
    ENUM: {
      value: TypeKind.ENUM,
      description: "Indicates this type is an enum. `enumValues` is a valid field."
    },
    INPUT_OBJECT: {
      value: TypeKind.INPUT_OBJECT,
      description: "Indicates this type is an input object. `inputFields` is a valid field."
    },
    LIST: {
      value: TypeKind.LIST,
      description: "Indicates this type is a list. `ofType` is a valid field."
    },
    NON_NULL: {
      value: TypeKind.NON_NULL,
      description: "Indicates this type is a non-null. `ofType` is a valid field."
    }
  }
});
var SchemaMetaFieldDef = new GraphQLField(void 0, "__schema", {
  type: new GraphQLNonNull(__Schema),
  description: "Access the current type schema of this server.",
  resolve: (_source, _args, _context, { schema: schema2 }) => schema2
});
var TypeMetaFieldDef = new GraphQLField(void 0, "__type", {
  type: __Type,
  description: "Request the type information of a single type.",
  args: { name: { type: new GraphQLNonNull(GraphQLString) } },
  resolve: (_source, { name }, _context, { schema: schema2 }) => schema2.getType(name)
});
var TypeNameMetaFieldDef = new GraphQLField(void 0, "__typename", {
  type: new GraphQLNonNull(GraphQLString),
  description: "The name of the current Object type at runtime.",
  resolve: (_source, _args, _context, { parentType }) => parentType.name
});
var introspectionTypes = Object.freeze([
  __Schema,
  __Directive,
  __DirectiveLocation,
  __Type,
  __Field,
  __InputValue,
  __EnumValue,
  __TypeKind
]);
function isIntrospectionType(type) {
  return introspectionTypes.some(({ name }) => type.name === name);
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/type/schema.mjs
function isSchema(schema2) {
  return instanceOf(schema2, schemaSymbol, GraphQLSchema);
}
function assertSchema(schema2) {
  if (!isSchema(schema2)) {
    throw new Error(`Expected ${inspect(schema2)} to be a GraphQL schema.`);
  }
  return schema2;
}
var schemaSymbol = /* @__PURE__ */ Symbol("Schema");
var GraphQLSchema = class {
  constructor(config) {
    this.__kind = schemaSymbol;
    this.assumeValid = config.assumeValid ?? false;
    this.__validationErrors = config.assumeValid === true ? [] : void 0;
    this.description = config.description;
    this.extensions = toObjMapWithSymbols(config.extensions);
    this.astNode = config.astNode;
    this.extensionASTNodes = config.extensionASTNodes ?? [];
    this._queryType = config.query;
    this._mutationType = config.mutation;
    this._subscriptionType = config.subscription;
    this._directives = config.directives ?? specifiedDirectives;
    const allReferencedTypes = new Set(config.types);
    if (config.types != null) {
      for (const type of config.types) {
        allReferencedTypes.delete(type);
        collectReferencedTypes(type, allReferencedTypes);
      }
    }
    if (this._queryType != null) {
      collectReferencedTypes(this._queryType, allReferencedTypes);
    }
    if (this._mutationType != null) {
      collectReferencedTypes(this._mutationType, allReferencedTypes);
    }
    if (this._subscriptionType != null) {
      collectReferencedTypes(this._subscriptionType, allReferencedTypes);
    }
    for (const directive of this._directives) {
      if (isDirective(directive)) {
        for (const arg of directive.args) {
          collectReferencedTypes(arg.type, allReferencedTypes);
        }
      }
    }
    collectReferencedTypes(__Schema, allReferencedTypes);
    this._typeMap = /* @__PURE__ */ Object.create(null);
    this._subTypeMap = /* @__PURE__ */ new Map();
    this._implementationsMap = /* @__PURE__ */ Object.create(null);
    for (const namedType of allReferencedTypes) {
      if (namedType == null) {
        continue;
      }
      const typeName = namedType.name;
      if (this._typeMap[typeName] !== void 0) {
        throw new Error(`Schema must contain uniquely named types but contains multiple types named "${typeName}".`);
      }
      this._typeMap[typeName] = namedType;
      if (isInterfaceType(namedType)) {
        for (const iface of namedType.getInterfaces()) {
          if (isInterfaceType(iface)) {
            let implementations = this._implementationsMap[iface.name];
            implementations ??= this._implementationsMap[iface.name] = {
              objects: [],
              interfaces: []
            };
            implementations.interfaces.push(namedType);
          }
        }
      } else if (isObjectType(namedType)) {
        for (const iface of namedType.getInterfaces()) {
          if (isInterfaceType(iface)) {
            let implementations = this._implementationsMap[iface.name];
            implementations ??= this._implementationsMap[iface.name] = {
              objects: [],
              interfaces: []
            };
            implementations.objects.push(namedType);
          }
        }
      }
    }
  }
  get [Symbol.toStringTag]() {
    return "GraphQLSchema";
  }
  getQueryType() {
    return this._queryType;
  }
  getMutationType() {
    return this._mutationType;
  }
  getSubscriptionType() {
    return this._subscriptionType;
  }
  getRootType(operation) {
    switch (operation) {
      case OperationTypeNode.QUERY:
        return this.getQueryType();
      case OperationTypeNode.MUTATION:
        return this.getMutationType();
      case OperationTypeNode.SUBSCRIPTION:
        return this.getSubscriptionType();
    }
  }
  getTypeMap() {
    return this._typeMap;
  }
  getType(name) {
    return this.getTypeMap()[name];
  }
  getPossibleTypes(abstractType) {
    return isUnionType(abstractType) ? abstractType.getTypes() : this.getImplementations(abstractType).objects;
  }
  getImplementations(interfaceType) {
    const implementations = this._implementationsMap[interfaceType.name];
    return implementations ?? { objects: [], interfaces: [] };
  }
  isSubType(abstractType, maybeSubType) {
    let set = this._subTypeMap.get(abstractType);
    if (set === void 0) {
      if (isUnionType(abstractType)) {
        set = new Set(abstractType.getTypes());
      } else {
        const implementations = this.getImplementations(abstractType);
        set = /* @__PURE__ */ new Set([
          ...implementations.objects,
          ...implementations.interfaces
        ]);
      }
      this._subTypeMap.set(abstractType, set);
    }
    return set.has(maybeSubType);
  }
  getDirectives() {
    return this._directives;
  }
  getDirective(name) {
    return this.getDirectives().find((directive) => directive.name === name);
  }
  getField(parentType, fieldName) {
    switch (fieldName) {
      case SchemaMetaFieldDef.name:
        return this.getQueryType() === parentType ? SchemaMetaFieldDef : void 0;
      case TypeMetaFieldDef.name:
        return this.getQueryType() === parentType ? TypeMetaFieldDef : void 0;
      case TypeNameMetaFieldDef.name:
        return TypeNameMetaFieldDef;
    }
    if ("getFields" in parentType) {
      return parentType.getFields()[fieldName];
    }
    return void 0;
  }
  toConfig() {
    return {
      description: this.description,
      query: this.getQueryType(),
      mutation: this.getMutationType(),
      subscription: this.getSubscriptionType(),
      types: Object.values(this.getTypeMap()),
      directives: this.getDirectives(),
      extensions: this.extensions,
      astNode: this.astNode,
      extensionASTNodes: this.extensionASTNodes,
      assumeValid: this.assumeValid
    };
  }
};
function collectReferencedTypes(type, typeSet) {
  const namedType = getNamedType(type);
  if (!typeSet.has(namedType)) {
    typeSet.add(namedType);
    if (isUnionType(namedType)) {
      for (const memberType of namedType.getTypes()) {
        collectReferencedTypes(memberType, typeSet);
      }
    } else if (isObjectType(namedType) || isInterfaceType(namedType)) {
      for (const interfaceType of namedType.getInterfaces()) {
        collectReferencedTypes(interfaceType, typeSet);
      }
      for (const field of Object.values(namedType.getFields())) {
        collectReferencedTypes(field.type, typeSet);
        for (const arg of field.args) {
          collectReferencedTypes(arg.type, typeSet);
        }
      }
    } else if (isInputObjectType(namedType)) {
      for (const field of Object.values(namedType.getFields())) {
        collectReferencedTypes(field.type, typeSet);
      }
    }
  }
  return typeSet;
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/type/validate.mjs
function validateSchema(schema2) {
  assertSchema(schema2);
  if (schema2.__validationErrors) {
    return schema2.__validationErrors;
  }
  const context = new SchemaValidationContext(schema2);
  validateRootTypes(context);
  validateDirectives(context);
  validateTypes(context);
  const errors = context.getErrors();
  schema2.__validationErrors = errors;
  return errors;
}
function assertValidSchema(schema2) {
  const errors = validateSchema(schema2);
  if (errors.length !== 0) {
    throw new Error(errors.map((error) => error.message).join("\n\n"));
  }
}
var SchemaValidationContext = class {
  constructor(schema2) {
    this._errors = [];
    this.schema = schema2;
  }
  reportError(message, nodes) {
    const _nodes = Array.isArray(nodes) ? nodes.filter(Boolean) : nodes;
    this._errors.push(new GraphQLError(message, { nodes: _nodes }));
  }
  getErrors() {
    return this._errors;
  }
};
function validateRootTypes(context) {
  const schema2 = context.schema;
  if (schema2.getQueryType() == null) {
    context.reportError("Query root type must be provided.", schema2.astNode);
  }
  const rootTypesMap = new AccumulatorMap();
  for (const operationType of Object.values(OperationTypeNode)) {
    const rootType = schema2.getRootType(operationType);
    if (rootType != null) {
      if (!isObjectType(rootType)) {
        const operationTypeStr = capitalize(operationType);
        const rootTypeStr = inspect(rootType);
        context.reportError(operationType === OperationTypeNode.QUERY ? `${operationTypeStr} root type must be Object type, it cannot be ${rootTypeStr}.` : `${operationTypeStr} root type must be Object type if provided, it cannot be ${rootTypeStr}.`, getOperationTypeNode(schema2, operationType) ?? rootType.astNode);
      } else {
        rootTypesMap.add(rootType, operationType);
      }
    }
  }
  for (const [rootType, operationTypes] of rootTypesMap) {
    if (operationTypes.length > 1) {
      const operationList = andList(operationTypes);
      context.reportError(`All root types must be different, "${rootType}" type is used as ${operationList} root types.`, operationTypes.map((operationType) => getOperationTypeNode(schema2, operationType)));
    }
  }
}
function getOperationTypeNode(schema2, operation) {
  return [schema2.astNode, ...schema2.extensionASTNodes].flatMap((schemaNode) => schemaNode?.operationTypes ?? []).find((operationNode) => operationNode.operation === operation)?.type;
}
function validateDirectives(context) {
  for (const directive of context.schema.getDirectives()) {
    if (!isDirective(directive)) {
      context.reportError(`Expected directive but got: ${inspect(directive)}.`, directive?.astNode);
      continue;
    }
    validateName(context, directive);
    if (directive.locations.length === 0) {
      context.reportError(`Directive ${directive} must include 1 or more locations.`, directive.astNode);
    }
    for (const arg of directive.args) {
      validateName(context, arg);
      if (!isInputType(arg.type)) {
        context.reportError(`The type of ${arg} must be Input Type but got: ${inspect(arg.type)}.`, arg.astNode);
      }
      if (isRequiredArgument(arg) && arg.deprecationReason != null) {
        context.reportError(`Required argument ${arg} cannot be deprecated.`, [
          getDeprecatedDirectiveNode(arg.astNode),
          arg.astNode?.type
        ]);
      }
      validateDefaultValue(context, arg);
    }
  }
}
function validateDefaultValue(context, inputValue) {
  const defaultInput = inputValue.default;
  if (!defaultInput) {
    return;
  }
  const errors = [];
  validateDefaultInput(defaultInput, inputValue.type, (error, path) => {
    errors.push([error, path]);
  });
  if (errors.length === 0) {
    return;
  }
  if (!defaultInput.literal) {
    try {
      const uncoercedValue = uncoerceDefaultValue(defaultInput.value, inputValue.type);
      const uncoercedErrors = [];
      validateInputValue(uncoercedValue, inputValue.type, (error, path) => {
        uncoercedErrors.push([error, path]);
      });
      if (uncoercedErrors.length === 0) {
        context.reportError(`${inputValue} has invalid default value: ${inspect(defaultInput.value)}. Did you mean: ${inspect(uncoercedValue)}?`, inputValue.astNode?.defaultValue);
        return;
      }
    } catch (_error) {
    }
  }
  for (const [error, path] of errors) {
    context.reportError(`${inputValue} has invalid default value${printPathArray(path)}: ${error.message}`, error.nodes ?? inputValue.astNode?.defaultValue);
  }
}
function validateDefaultInput(defaultInput, inputType, onError, hideSuggestions) {
  if (defaultInput.literal) {
    validateInputLiteral(defaultInput.literal, inputType, onError, void 0, void 0, hideSuggestions);
    return;
  }
  validateInputValue(defaultInput.value, inputType, onError, hideSuggestions);
}
function uncoerceDefaultValue(value, type) {
  if (isNonNullType(type)) {
    return uncoerceDefaultValue(value, type.ofType);
  }
  if (value === null) {
    return null;
  }
  if (isListType(type)) {
    if (isIterableObject(value)) {
      return Array.from(value, (itemValue) => uncoerceDefaultValue(itemValue, type.ofType));
    }
    return [uncoerceDefaultValue(value, type.ofType)];
  }
  if (isInputObjectType(type)) {
    if (!isObjectLike(value))
      invariant(false);
    const fieldDefs = type.getFields();
    return mapValue(value, (fieldValue, fieldName) => {
      if (!(fieldName in fieldDefs))
        invariant(false);
      return uncoerceDefaultValue(fieldValue, fieldDefs[fieldName].type);
    });
  }
  assertLeafType(type);
  return type.coerceOutputValue(value);
}
function validateName(context, node) {
  if (node.name.startsWith("__")) {
    context.reportError(`Name "${node.name}" must not begin with "__", which is reserved by GraphQL introspection.`, node.astNode);
  }
}
function validateTypes(context) {
  const validateInputObjectDefaultValueCircularRefs = createInputObjectDefaultValueCircularRefsValidator(context);
  const typeMap = context.schema.getTypeMap();
  const finiteValueStates = /* @__PURE__ */ new Map();
  for (const type of Object.values(typeMap)) {
    if (!isNamedType(type)) {
      context.reportError(`Expected GraphQL named type but got: ${inspect(type)}.`, type.astNode);
      continue;
    }
    if (!isIntrospectionType(type)) {
      validateName(context, type);
    }
    if (isObjectType(type)) {
      validateFields(context, type);
      validateInterfaces(context, type);
    } else if (isInterfaceType(type)) {
      validateFields(context, type);
      validateInterfaces(context, type);
    } else if (isUnionType(type)) {
      validateUnionMembers(context, type);
    } else if (isEnumType(type)) {
      validateEnumValues(context, type);
    } else if (isInputObjectType(type)) {
      validateInputFields(context, type);
      initializeInputObjectFiniteValueState(type);
      validateInputObjectDefaultValueCircularRefs(type);
    }
  }
  detectInputObjectNonFiniteValues(context, finiteValueStates);
  function initializeInputObjectFiniteValueState(inputObj) {
    finiteValueStates.set(inputObj, {
      inputObj,
      targets: [],
      dependents: [],
      unresolvedTargetCount: 0,
      hasFiniteValue: false
    });
  }
}
function validateFields(context, type) {
  const fields = Object.values(type.getFields());
  if (fields.length === 0) {
    context.reportError(`Type ${type} must define one or more fields.`, [
      type.astNode,
      ...type.extensionASTNodes
    ]);
  }
  for (const field of fields) {
    validateName(context, field);
    if (!isOutputType(field.type)) {
      context.reportError(`The type of ${field} must be Output Type but got: ${inspect(field.type)}.`, field.astNode?.type);
    }
    for (const arg of field.args) {
      validateName(context, arg);
      if (!isInputType(arg.type)) {
        context.reportError(`The type of ${arg} must be Input Type but got: ${inspect(arg.type)}.`, arg.astNode?.type);
      }
      if (isRequiredArgument(arg) && arg.deprecationReason != null) {
        context.reportError(`Required argument ${arg} cannot be deprecated.`, [
          getDeprecatedDirectiveNode(arg.astNode),
          arg.astNode?.type
        ]);
      }
      validateDefaultValue(context, arg);
    }
  }
}
function validateInterfaces(context, type) {
  const ifaceTypeNames = /* @__PURE__ */ new Set();
  for (const iface of type.getInterfaces()) {
    if (!isInterfaceType(iface)) {
      context.reportError(`Type ${type} must only implement Interface types, it cannot implement ${inspect(iface)}.`, getAllImplementsInterfaceNodes(type, iface));
      continue;
    }
    if (type === iface) {
      context.reportError(`Type ${type} cannot implement itself because it would create a circular reference.`, getAllImplementsInterfaceNodes(type, iface));
      continue;
    }
    if (ifaceTypeNames.has(iface.name)) {
      context.reportError(`Type ${type} can only implement ${iface} once.`, getAllImplementsInterfaceNodes(type, iface));
      continue;
    }
    ifaceTypeNames.add(iface.name);
    validateTypeImplementsAncestors(context, type, iface);
    validateTypeImplementsInterface(context, type, iface);
  }
}
function validateTypeImplementsInterface(context, type, iface) {
  const typeFieldMap = type.getFields();
  for (const ifaceField of Object.values(iface.getFields())) {
    const typeField = typeFieldMap[ifaceField.name];
    if (typeField == null) {
      context.reportError(`Interface field ${ifaceField} expected but ${type} does not provide it.`, [ifaceField.astNode, type.astNode, ...type.extensionASTNodes]);
      continue;
    }
    if (!isTypeSubTypeOf(context.schema, typeField.type, ifaceField.type)) {
      context.reportError(`Interface field ${ifaceField} expects type ${ifaceField.type} but ${typeField} is type ${typeField.type}.`, [ifaceField.astNode?.type, typeField.astNode?.type]);
    }
    for (const ifaceArg of ifaceField.args) {
      const typeArg = typeField.args.find((arg) => arg.name === ifaceArg.name);
      if (!typeArg) {
        context.reportError(`Interface field argument ${ifaceArg} expected but ${typeField} does not provide it.`, [ifaceArg.astNode, typeField.astNode]);
        continue;
      }
      if (!isEqualType(ifaceArg.type, typeArg.type)) {
        context.reportError(`Interface field argument ${ifaceArg} expects type ${ifaceArg.type} but ${typeArg} is type ${typeArg.type}.`, [ifaceArg.astNode?.type, typeArg.astNode?.type]);
      }
    }
    for (const typeArg of typeField.args) {
      if (isRequiredArgument(typeArg)) {
        const ifaceArg = ifaceField.args.find((arg) => arg.name === typeArg.name);
        if (!ifaceArg) {
          context.reportError(`Argument "${typeArg}" must not be required type "${typeArg.type}" if not provided by the Interface field "${ifaceField}".`, [typeArg.astNode, ifaceField.astNode]);
        }
      }
    }
    if (typeField.deprecationReason != null && ifaceField.deprecationReason == null) {
      context.reportError(`Interface field ${iface.name}.${ifaceField.name} is not deprecated, so implementation field ${type.name}.${typeField.name} must not be deprecated.`, [
        getDeprecatedDirectiveNode(typeField.astNode),
        typeField.astNode?.type
      ]);
    }
  }
}
function validateTypeImplementsAncestors(context, type, iface) {
  const ifaceInterfaces = type.getInterfaces();
  for (const transitive of iface.getInterfaces()) {
    if (!ifaceInterfaces.includes(transitive)) {
      context.reportError(transitive === type ? `Type ${type} cannot implement ${iface} because it would create a circular reference.` : `Type ${type} must implement ${transitive} because it is implemented by ${iface}.`, [
        ...getAllImplementsInterfaceNodes(iface, transitive),
        ...getAllImplementsInterfaceNodes(type, iface)
      ]);
    }
  }
}
function validateUnionMembers(context, union) {
  const memberTypes = union.getTypes();
  if (memberTypes.length === 0) {
    context.reportError(`Union type ${union} must define one or more member types.`, [union.astNode, ...union.extensionASTNodes]);
  }
  const includedTypeNames = /* @__PURE__ */ new Set();
  for (const memberType of memberTypes) {
    if (includedTypeNames.has(memberType.name)) {
      context.reportError(`Union type ${union} can only include type ${memberType} once.`, getUnionMemberTypeNodes(union, memberType.name));
      continue;
    }
    includedTypeNames.add(memberType.name);
    if (!isObjectType(memberType)) {
      context.reportError(`Union type ${union} can only include Object types, it cannot include ${inspect(memberType)}.`, getUnionMemberTypeNodes(union, String(memberType)));
    }
  }
}
function validateEnumValues(context, enumType) {
  const enumValues = enumType.getValues();
  if (enumValues.length === 0) {
    context.reportError(`Enum type ${enumType} must define one or more values.`, [enumType.astNode, ...enumType.extensionASTNodes]);
  }
  for (const enumValue of enumValues) {
    validateName(context, enumValue);
  }
}
function validateInputFields(context, inputObj) {
  const fields = Object.values(inputObj.getFields());
  if (fields.length === 0) {
    context.reportError(`Input Object type ${inputObj} must define one or more fields.`, [inputObj.astNode, ...inputObj.extensionASTNodes]);
  }
  for (const field of fields) {
    validateName(context, field);
    if (!isInputType(field.type)) {
      context.reportError(`The type of ${field} must be Input Type but got: ${inspect(field.type)}.`, field.astNode?.type);
    }
    if (isRequiredInputField(field) && field.deprecationReason != null) {
      context.reportError(`Required input field ${field} cannot be deprecated.`, [getDeprecatedDirectiveNode(field.astNode), field.astNode?.type]);
    }
    validateDefaultValue(context, field);
    if (inputObj.isOneOf) {
      validateOneOfInputObjectField(inputObj, field, context);
    }
  }
}
function validateOneOfInputObjectField(type, field, context) {
  if (isNonNullType(field.type)) {
    context.reportError(`OneOf input field ${type}.${field.name} must be nullable.`, field.astNode?.type);
  }
  if (field.default !== void 0 || field.defaultValue !== void 0) {
    context.reportError(`OneOf input field ${type}.${field.name} cannot have a default value.`, field.astNode);
  }
}
function detectInputObjectNonFiniteValues(context, finiteValueStates) {
  const inputObjectsWithFiniteValues = [];
  for (const state of finiteValueStates.values()) {
    const inputObj = state.inputObj;
    const fields = Object.values(inputObj.getFields());
    for (const field of fields) {
      const target = getFiniteValueTarget(inputObj, field.type);
      if (target === void 0) {
        continue;
      }
      state.targets.push({ field, target });
      const targetState = finiteValueStates.get(target);
      if (targetState !== void 0) {
        targetState.dependents.push(state);
      }
    }
    if (inputObj.isOneOf) {
      if (fields.length === 0 || state.targets.length < fields.length) {
        markInputObjectHasFiniteValue(state);
      }
    } else {
      state.unresolvedTargetCount = state.targets.length;
      if (state.targets.length === 0) {
        markInputObjectHasFiniteValue(state);
      }
    }
  }
  let nextFiniteValueState;
  while ((nextFiniteValueState = inputObjectsWithFiniteValues.pop()) !== void 0) {
    for (const dependentState of nextFiniteValueState.dependents) {
      if (dependentState.hasFiniteValue) {
        continue;
      }
      if (dependentState.inputObj.isOneOf) {
        markInputObjectHasFiniteValue(dependentState);
        continue;
      }
      --dependentState.unresolvedTargetCount;
      if (dependentState.unresolvedTargetCount === 0) {
        markInputObjectHasFiniteValue(dependentState);
      }
    }
  }
  const visitedTypes = /* @__PURE__ */ new Set();
  const fieldPath = [];
  const fieldPathIndexByType = /* @__PURE__ */ new Map();
  for (const state of finiteValueStates.values()) {
    if (!state.hasFiniteValue) {
      reportCycleRecursive(state);
    }
  }
  function markInputObjectHasFiniteValue(finiteValueState) {
    if (!finiteValueState.hasFiniteValue) {
      finiteValueState.hasFiniteValue = true;
      inputObjectsWithFiniteValues.push(finiteValueState);
    }
  }
  function reportCycleRecursive(state) {
    const inputObj = state.inputObj;
    if (visitedTypes.has(inputObj)) {
      return;
    }
    visitedTypes.add(inputObj);
    fieldPathIndexByType.set(inputObj, fieldPath.length);
    for (const { field, target } of state.targets) {
      const targetState = finiteValueStates.get(target);
      if (targetState?.hasFiniteValue !== false) {
        continue;
      }
      const cycleIndex = fieldPathIndexByType.get(target);
      fieldPath.push({
        fieldStr: `${inputObj}.${field.name}`,
        astNode: field.astNode
      });
      if (cycleIndex === void 0) {
        reportCycleRecursive(targetState);
      } else {
        const cyclePath = fieldPath.slice(cycleIndex);
        const pathStr = cyclePath.map((p) => p.fieldStr).join(", ");
        context.reportError(`Input Object ${target} cannot be provided a finite value because it references itself through fields: ${pathStr}.`, cyclePath.map((p) => p.astNode));
      }
      fieldPath.pop();
    }
    fieldPathIndexByType.delete(inputObj);
  }
}
function getFiniteValueTarget(inputObj, fieldType) {
  if (inputObj.isOneOf) {
    if (isInputObjectType(fieldType)) {
      return fieldType;
    }
    return;
  }
  if (isNonNullType(fieldType) && isInputObjectType(fieldType.ofType)) {
    return fieldType.ofType;
  }
}
function createInputObjectDefaultValueCircularRefsValidator(context) {
  const visitedFields = /* @__PURE__ */ Object.create(null);
  const fieldPath = [];
  const fieldPathIndex = /* @__PURE__ */ Object.create(null);
  return function validateInputObjectDefaultValueCircularRefs(inputObj) {
    return detectValueDefaultValueCycle(inputObj, /* @__PURE__ */ Object.create(null));
  };
  function detectValueDefaultValueCycle(inputObj, defaultValue) {
    if (isIterableObject(defaultValue)) {
      for (const itemValue of defaultValue) {
        detectValueDefaultValueCycle(inputObj, itemValue);
      }
      return;
    } else if (!isObjectLike(defaultValue)) {
      return;
    }
    for (const field of Object.values(inputObj.getFields())) {
      const namedFieldType = getNamedType(field.type);
      if (!isInputObjectType(namedFieldType)) {
        continue;
      }
      if (Object.hasOwn(defaultValue, field.name)) {
        detectValueDefaultValueCycle(namedFieldType, defaultValue[field.name]);
      } else {
        detectFieldDefaultValueCycle(field, namedFieldType, `${inputObj}.${field.name}`);
      }
    }
  }
  function detectLiteralDefaultValueCycle(inputObj, defaultValue) {
    if (defaultValue.kind === kinds_exports.LIST) {
      for (const itemLiteral of defaultValue.values) {
        detectLiteralDefaultValueCycle(inputObj, itemLiteral);
      }
      return;
    } else if (defaultValue.kind !== kinds_exports.OBJECT) {
      return;
    }
    const fieldNodes = keyMap(defaultValue.fields, (field) => field.name.value);
    for (const field of Object.values(inputObj.getFields())) {
      const namedFieldType = getNamedType(field.type);
      if (!isInputObjectType(namedFieldType)) {
        continue;
      }
      if (Object.hasOwn(fieldNodes, field.name)) {
        detectLiteralDefaultValueCycle(namedFieldType, fieldNodes[field.name].value);
      } else {
        detectFieldDefaultValueCycle(field, namedFieldType, `${inputObj}.${field.name}`);
      }
    }
  }
  function detectFieldDefaultValueCycle(field, fieldType, fieldStr) {
    const defaultInput = field.default;
    if (defaultInput === void 0) {
      return;
    }
    const cycleIndex = fieldPathIndex[fieldStr];
    if (cycleIndex !== void 0) {
      context.reportError(`Invalid circular reference. The default value of Input Object field ${fieldStr} references itself${cycleIndex < fieldPath.length ? ` via the default values of: ${fieldPath.slice(cycleIndex).map(([stringForMessage]) => stringForMessage).join(", ")}` : ""}.`, fieldPath.slice(cycleIndex - 1).map(([, node]) => node));
      return;
    }
    if (visitedFields[fieldStr] === void 0) {
      visitedFields[fieldStr] = true;
      fieldPathIndex[fieldStr] = fieldPath.push([
        fieldStr,
        field.astNode?.defaultValue
      ]);
      if (defaultInput.literal) {
        detectLiteralDefaultValueCycle(fieldType, defaultInput.literal);
      } else {
        detectValueDefaultValueCycle(fieldType, defaultInput.value);
      }
      fieldPath.pop();
      fieldPathIndex[fieldStr] = void 0;
    }
  }
}
function getAllImplementsInterfaceNodes(type, iface) {
  const { astNode, extensionASTNodes } = type;
  const nodes = astNode != null ? [astNode, ...extensionASTNodes] : extensionASTNodes;
  return nodes.flatMap((typeNode) => typeNode.interfaces ?? []).filter((ifaceNode) => ifaceNode.name.value === iface.name);
}
function getUnionMemberTypeNodes(union, typeName) {
  const { astNode, extensionASTNodes } = union;
  const nodes = astNode != null ? [astNode, ...extensionASTNodes] : extensionASTNodes;
  return nodes.flatMap((unionNode) => unionNode.types ?? []).filter((typeNode) => typeNode.name.value === typeName);
}
function getDeprecatedDirectiveNode(definitionNode) {
  return definitionNode?.directives?.find((node) => node.name.value === GraphQLDeprecatedDirective.name);
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/error/syntaxError.mjs
function syntaxError(source, position, description) {
  return new GraphQLError(`Syntax Error: ${description}`, {
    source,
    positions: [position]
  });
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/diagnostics.mjs
function resolveDiagnosticsChannel() {
  let dc2;
  try {
    const processRef = globalThis.process;
    if (typeof processRef?.getBuiltinModule === "function") {
      dc2 = processRef.getBuiltinModule("node:diagnostics_channel");
    }
  } catch {
  }
  return dc2;
}
var dc = resolveDiagnosticsChannel();
var parseChannel = dc?.tracingChannel("graphql:parse");
var validateChannel = dc?.tracingChannel("graphql:validate");
var executeChannel = dc?.tracingChannel("graphql:execute");
var executeVariableCoercionChannel = dc?.tracingChannel("graphql:execute:variableCoercion");
var executeRootSelectionSetChannel = dc?.tracingChannel("graphql:execute:rootSelectionSet");
var subscribeChannel = dc?.tracingChannel("graphql:subscribe");
var resolveChannel = dc?.tracingChannel("graphql:resolve");
var SUB_CHANNEL_KEYS = ["start", "end", "asyncStart", "asyncEnd", "error"];
function shouldTrace(channel) {
  if (channel == null) {
    return false;
  }
  const aggregate = channel.hasSubscribers;
  if (aggregate !== void 0) {
    return aggregate;
  }
  for (const key of SUB_CHANNEL_KEYS) {
    if (channel[key].hasSubscribers) {
      return true;
    }
  }
  return false;
}
function traceMixed(channel, contextInput, fn) {
  const context = contextInput;
  return channel.start.runStores(context, () => {
    let result;
    try {
      result = fn();
    } catch (err) {
      context.error = err;
      channel.error.publish(context);
      channel.end.publish(context);
      throw err;
    }
    if (!isPromiseLike(result)) {
      context.result = result;
      channel.end.publish(context);
      return result;
    }
    channel.end.publish(context);
    channel.asyncStart.publish(context);
    return result.then((value) => {
      context.result = value;
      channel.asyncEnd.publish(context);
      return value;
    }, (err) => {
      context.error = err;
      channel.error.publish(context);
      channel.asyncEnd.publish(context);
      throw err;
    });
  });
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/language/tokenKind.mjs
var TokenKind = {
  SOF: "<SOF>",
  EOF: "<EOF>",
  BANG: "!",
  DOLLAR: "$",
  AMP: "&",
  PAREN_L: "(",
  PAREN_R: ")",
  DOT: ".",
  SPREAD: "...",
  COLON: ":",
  EQUALS: "=",
  AT: "@",
  BRACKET_L: "[",
  BRACKET_R: "]",
  BRACE_L: "{",
  PIPE: "|",
  BRACE_R: "}",
  NAME: "Name",
  INT: "Int",
  FLOAT: "Float",
  STRING: "String",
  BLOCK_STRING: "BlockString",
  COMMENT: "Comment"
};

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/language/lexer.mjs
var Lexer = class {
  constructor(source) {
    const startOfFileToken = new Token(TokenKind.SOF, 0, 0, 0, 0);
    this.source = source;
    this.lastToken = startOfFileToken;
    this.token = startOfFileToken;
    this.line = 1;
    this.lineStart = 0;
  }
  get [Symbol.toStringTag]() {
    return "Lexer";
  }
  advance() {
    this.lastToken = this.token;
    const token2 = this.token = this.lookahead();
    return token2;
  }
  lookahead() {
    let token2 = this.token;
    if (token2.kind !== TokenKind.EOF) {
      do {
        if (token2.next) {
          token2 = token2.next;
        } else {
          const nextToken = readNextToken(this, token2.end);
          token2.next = nextToken;
          nextToken.prev = token2;
          token2 = nextToken;
        }
      } while (token2.kind === TokenKind.COMMENT);
    }
    return token2;
  }
};
function isPunctuatorTokenKind(kind) {
  return kind === TokenKind.BANG || kind === TokenKind.DOLLAR || kind === TokenKind.AMP || kind === TokenKind.PAREN_L || kind === TokenKind.PAREN_R || kind === TokenKind.DOT || kind === TokenKind.SPREAD || kind === TokenKind.COLON || kind === TokenKind.EQUALS || kind === TokenKind.AT || kind === TokenKind.BRACKET_L || kind === TokenKind.BRACKET_R || kind === TokenKind.BRACE_L || kind === TokenKind.PIPE || kind === TokenKind.BRACE_R;
}
function isUnicodeScalarValue(code) {
  return code >= 0 && code <= 55295 || code >= 57344 && code <= 1114111;
}
function isSupplementaryCodePoint(body, location) {
  return isLeadingSurrogate(body.charCodeAt(location)) && isTrailingSurrogate(body.charCodeAt(location + 1));
}
function isLeadingSurrogate(code) {
  return code >= 55296 && code <= 56319;
}
function isTrailingSurrogate(code) {
  return code >= 56320 && code <= 57343;
}
function printCodePointAt(lexer, location) {
  const code = lexer.source.body.codePointAt(location);
  if (code === void 0) {
    return TokenKind.EOF;
  } else if (code >= 32 && code <= 126) {
    const char = String.fromCodePoint(code);
    return char === '"' ? `'"'` : `"${char}"`;
  }
  return "U+" + code.toString(16).toUpperCase().padStart(4, "0");
}
function createToken(lexer, kind, start, end, value) {
  const line = lexer.line;
  const col = 1 + start - lexer.lineStart;
  return new Token(kind, start, end, line, col, value);
}
function readNextToken(lexer, start) {
  const body = lexer.source.body;
  const bodyLength = body.length;
  let position = start;
  while (position < bodyLength) {
    const code = body.charCodeAt(position);
    switch (code) {
      case 65279:
      case 9:
      case 32:
      case 44:
        ++position;
        continue;
      case 10:
        ++position;
        ++lexer.line;
        lexer.lineStart = position;
        continue;
      case 13:
        if (body.charCodeAt(position + 1) === 10) {
          position += 2;
        } else {
          ++position;
        }
        ++lexer.line;
        lexer.lineStart = position;
        continue;
      case 35:
        return readComment(lexer, position);
      case 33:
        return createToken(lexer, TokenKind.BANG, position, position + 1);
      case 36:
        return createToken(lexer, TokenKind.DOLLAR, position, position + 1);
      case 38:
        return createToken(lexer, TokenKind.AMP, position, position + 1);
      case 40:
        return createToken(lexer, TokenKind.PAREN_L, position, position + 1);
      case 41:
        return createToken(lexer, TokenKind.PAREN_R, position, position + 1);
      case 46: {
        const nextCode = body.charCodeAt(position + 1);
        if (nextCode === 46 && body.charCodeAt(position + 2) === 46) {
          return createToken(lexer, TokenKind.SPREAD, position, position + 3);
        }
        if (nextCode === 46) {
          throw syntaxError(lexer.source, position, 'Unexpected "..", did you mean "..."?');
        } else if (isDigit2(nextCode)) {
          const digits = lexer.source.body.slice(position + 1, readDigits(lexer, position + 1, nextCode));
          throw syntaxError(lexer.source, position, `Invalid number, expected digit before ".", did you mean "0.${digits}"?`);
        }
        break;
      }
      case 58:
        return createToken(lexer, TokenKind.COLON, position, position + 1);
      case 61:
        return createToken(lexer, TokenKind.EQUALS, position, position + 1);
      case 64:
        return createToken(lexer, TokenKind.AT, position, position + 1);
      case 91:
        return createToken(lexer, TokenKind.BRACKET_L, position, position + 1);
      case 93:
        return createToken(lexer, TokenKind.BRACKET_R, position, position + 1);
      case 123:
        return createToken(lexer, TokenKind.BRACE_L, position, position + 1);
      case 124:
        return createToken(lexer, TokenKind.PIPE, position, position + 1);
      case 125:
        return createToken(lexer, TokenKind.BRACE_R, position, position + 1);
      case 34:
        if (body.charCodeAt(position + 1) === 34 && body.charCodeAt(position + 2) === 34) {
          return readBlockString(lexer, position);
        }
        return readString(lexer, position);
    }
    if (isDigit2(code) || code === 45) {
      return readNumber(lexer, position, code);
    }
    if (isNameStart(code)) {
      return readName(lexer, position);
    }
    throw syntaxError(lexer.source, position, code === 39 ? `Unexpected single quote character ('), did you mean to use a double quote (")?` : isUnicodeScalarValue(code) || isSupplementaryCodePoint(body, position) ? `Unexpected character: ${printCodePointAt(lexer, position)}.` : `Invalid character: ${printCodePointAt(lexer, position)}.`);
  }
  return createToken(lexer, TokenKind.EOF, bodyLength, bodyLength);
}
function readComment(lexer, start) {
  const body = lexer.source.body;
  const bodyLength = body.length;
  let position = start + 1;
  while (position < bodyLength) {
    const code = body.charCodeAt(position);
    if (code === 10 || code === 13) {
      break;
    }
    if (isUnicodeScalarValue(code)) {
      ++position;
    } else if (isSupplementaryCodePoint(body, position)) {
      position += 2;
    } else {
      break;
    }
  }
  return createToken(lexer, TokenKind.COMMENT, start, position, body.slice(start + 1, position));
}
function readNumber(lexer, start, firstCode) {
  const body = lexer.source.body;
  let position = start;
  let code = firstCode;
  let isFloat = false;
  if (code === 45) {
    code = body.charCodeAt(++position);
  }
  if (code === 48) {
    code = body.charCodeAt(++position);
    if (isDigit2(code)) {
      throw syntaxError(lexer.source, position, `Invalid number, unexpected digit after 0: ${printCodePointAt(lexer, position)}.`);
    }
  } else {
    position = readDigits(lexer, position, code);
    code = body.charCodeAt(position);
  }
  if (code === 46) {
    isFloat = true;
    code = body.charCodeAt(++position);
    position = readDigits(lexer, position, code);
    code = body.charCodeAt(position);
  }
  if (code === 69 || code === 101) {
    isFloat = true;
    code = body.charCodeAt(++position);
    if (code === 43 || code === 45) {
      code = body.charCodeAt(++position);
    }
    position = readDigits(lexer, position, code);
    code = body.charCodeAt(position);
  }
  if (code === 46 || isNameStart(code)) {
    throw syntaxError(lexer.source, position, `Invalid number, expected digit but got: ${printCodePointAt(lexer, position)}.`);
  }
  return createToken(lexer, isFloat ? TokenKind.FLOAT : TokenKind.INT, start, position, body.slice(start, position));
}
function readDigits(lexer, start, firstCode) {
  if (!isDigit2(firstCode)) {
    throw syntaxError(lexer.source, start, `Invalid number, expected digit but got: ${printCodePointAt(lexer, start)}.`);
  }
  const body = lexer.source.body;
  let position = start + 1;
  while (isDigit2(body.charCodeAt(position))) {
    ++position;
  }
  return position;
}
function readString(lexer, start) {
  const body = lexer.source.body;
  const bodyLength = body.length;
  let position = start + 1;
  let chunkStart = position;
  let value = "";
  while (position < bodyLength) {
    const code = body.charCodeAt(position);
    if (code === 34) {
      value += body.slice(chunkStart, position);
      return createToken(lexer, TokenKind.STRING, start, position + 1, value);
    }
    if (code === 92) {
      value += body.slice(chunkStart, position);
      const escape = body.charCodeAt(position + 1) === 117 ? body.charCodeAt(position + 2) === 123 ? readEscapedUnicodeVariableWidth(lexer, position) : readEscapedUnicodeFixedWidth(lexer, position) : readEscapedCharacter(lexer, position);
      value += escape.value;
      position += escape.size;
      chunkStart = position;
      continue;
    }
    if (code === 10 || code === 13) {
      break;
    }
    if (isUnicodeScalarValue(code)) {
      ++position;
    } else if (isSupplementaryCodePoint(body, position)) {
      position += 2;
    } else {
      throw syntaxError(lexer.source, position, `Invalid character within String: ${printCodePointAt(lexer, position)}.`);
    }
  }
  throw syntaxError(lexer.source, position, "Unterminated string.");
}
function readEscapedUnicodeVariableWidth(lexer, position) {
  const body = lexer.source.body;
  let point = 0;
  let size = 3;
  while (size < 12) {
    const code = body.charCodeAt(position + size++);
    if (code === 125) {
      if (size < 5 || !isUnicodeScalarValue(point)) {
        break;
      }
      return { value: String.fromCodePoint(point), size };
    }
    point = point << 4 | readHexDigit(code);
    if (point < 0) {
      break;
    }
  }
  throw syntaxError(lexer.source, position, `Invalid Unicode escape sequence: "${body.slice(position, position + size)}".`);
}
function readEscapedUnicodeFixedWidth(lexer, position) {
  const body = lexer.source.body;
  const code = read16BitHexCode(body, position + 2);
  if (isUnicodeScalarValue(code)) {
    return { value: String.fromCodePoint(code), size: 6 };
  }
  if (isLeadingSurrogate(code)) {
    if (body.charCodeAt(position + 6) === 92 && body.charCodeAt(position + 7) === 117) {
      const trailingCode = read16BitHexCode(body, position + 8);
      if (isTrailingSurrogate(trailingCode)) {
        return { value: String.fromCodePoint(code, trailingCode), size: 12 };
      }
    }
  }
  throw syntaxError(lexer.source, position, `Invalid Unicode escape sequence: "${body.slice(position, position + 6)}".`);
}
function read16BitHexCode(body, position) {
  return readHexDigit(body.charCodeAt(position)) << 12 | readHexDigit(body.charCodeAt(position + 1)) << 8 | readHexDigit(body.charCodeAt(position + 2)) << 4 | readHexDigit(body.charCodeAt(position + 3));
}
function readHexDigit(code) {
  return code >= 48 && code <= 57 ? code - 48 : code >= 65 && code <= 70 ? code - 55 : code >= 97 && code <= 102 ? code - 87 : -1;
}
function readEscapedCharacter(lexer, position) {
  const body = lexer.source.body;
  const code = body.charCodeAt(position + 1);
  switch (code) {
    case 34:
      return { value: '"', size: 2 };
    case 92:
      return { value: "\\", size: 2 };
    case 47:
      return { value: "/", size: 2 };
    case 98:
      return { value: "\b", size: 2 };
    case 102:
      return { value: "\f", size: 2 };
    case 110:
      return { value: "\n", size: 2 };
    case 114:
      return { value: "\r", size: 2 };
    case 116:
      return { value: "	", size: 2 };
  }
  throw syntaxError(lexer.source, position, `Invalid character escape sequence: "${body.slice(position, position + 2)}".`);
}
function readBlockString(lexer, start) {
  const body = lexer.source.body;
  const bodyLength = body.length;
  let lineStart = lexer.lineStart;
  let position = start + 3;
  let chunkStart = position;
  let currentLine = "";
  const blockLines = [];
  while (position < bodyLength) {
    const code = body.charCodeAt(position);
    if (code === 34 && body.charCodeAt(position + 1) === 34 && body.charCodeAt(position + 2) === 34) {
      currentLine += body.slice(chunkStart, position);
      blockLines.push(currentLine);
      const token2 = createToken(lexer, TokenKind.BLOCK_STRING, start, position + 3, dedentBlockStringLines(blockLines).join("\n"));
      lexer.line += blockLines.length - 1;
      lexer.lineStart = lineStart;
      return token2;
    }
    if (code === 92 && body.charCodeAt(position + 1) === 34 && body.charCodeAt(position + 2) === 34 && body.charCodeAt(position + 3) === 34) {
      currentLine += body.slice(chunkStart, position);
      chunkStart = position + 1;
      position += 4;
      continue;
    }
    if (code === 10 || code === 13) {
      currentLine += body.slice(chunkStart, position);
      blockLines.push(currentLine);
      if (code === 13 && body.charCodeAt(position + 1) === 10) {
        position += 2;
      } else {
        ++position;
      }
      currentLine = "";
      chunkStart = position;
      lineStart = position;
      continue;
    }
    if (isUnicodeScalarValue(code)) {
      ++position;
    } else if (isSupplementaryCodePoint(body, position)) {
      position += 2;
    } else {
      throw syntaxError(lexer.source, position, `Invalid character within String: ${printCodePointAt(lexer, position)}.`);
    }
  }
  throw syntaxError(lexer.source, position, "Unterminated string.");
}
function readName(lexer, start) {
  const body = lexer.source.body;
  const bodyLength = body.length;
  let position = start + 1;
  while (position < bodyLength) {
    const code = body.charCodeAt(position);
    if (isNameContinue(code)) {
      ++position;
    } else {
      break;
    }
  }
  return createToken(lexer, TokenKind.NAME, start, position, body.slice(start, position));
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/language/source.mjs
var sourceSymbol = /* @__PURE__ */ Symbol("Source");
var Source = class {
  constructor(body, name = "GraphQL request", locationOffset = { line: 1, column: 1 }) {
    this.__kind = sourceSymbol;
    this.body = body;
    this.name = name;
    this.locationOffset = locationOffset;
    if (!(this.locationOffset.line > 0))
      devAssert(false, "line in locationOffset is 1-indexed and must be positive.");
    if (!(this.locationOffset.column > 0))
      devAssert(false, "column in locationOffset is 1-indexed and must be positive.");
  }
  get [Symbol.toStringTag]() {
    return "Source";
  }
};
function isSource(source) {
  return instanceOf(source, sourceSymbol, Source);
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/language/parser.mjs
function parse(source, options) {
  return shouldTrace(parseChannel) ? parseChannel.traceSync(() => parseImpl(source, options), { source }) : parseImpl(source, options);
}
function parseImpl(source, options) {
  const parser = new Parser(source, options);
  const document = parser.parseDocument();
  Object.defineProperty(document, "tokenCount", {
    enumerable: false,
    value: parser.tokenCount
  });
  return document;
}
var Parser = class {
  constructor(source, options = {}) {
    const { lexer, ..._options } = options;
    if (lexer) {
      this._lexer = lexer;
    } else {
      const sourceObj = isSource(source) ? source : new Source(source);
      this._lexer = new Lexer(sourceObj);
    }
    this._options = _options;
    this._tokenCounter = 0;
  }
  get tokenCount() {
    return this._tokenCounter;
  }
  parseName() {
    const token2 = this.expectToken(TokenKind.NAME);
    return this.node(token2, {
      kind: kinds_exports.NAME,
      value: token2.value
    });
  }
  parseDocument() {
    return this.node(this._lexer.token, {
      kind: kinds_exports.DOCUMENT,
      definitions: this.many(TokenKind.SOF, this.parseDefinition, TokenKind.EOF)
    });
  }
  parseDefinition() {
    if (this.peek(TokenKind.BRACE_L)) {
      return this.parseOperationDefinition();
    }
    const hasDescription = this.peekDescription();
    const keywordToken = hasDescription ? this._lexer.lookahead() : this._lexer.token;
    if (hasDescription && keywordToken.kind === TokenKind.BRACE_L) {
      throw syntaxError(this._lexer.source, this._lexer.token.start, "Unexpected description, descriptions are not supported on shorthand queries.");
    }
    if (keywordToken.kind === TokenKind.NAME) {
      switch (keywordToken.value) {
        case "schema":
          return this.parseSchemaDefinition();
        case "scalar":
          return this.parseScalarTypeDefinition();
        case "type":
          return this.parseObjectTypeDefinition();
        case "interface":
          return this.parseInterfaceTypeDefinition();
        case "union":
          return this.parseUnionTypeDefinition();
        case "enum":
          return this.parseEnumTypeDefinition();
        case "input":
          return this.parseInputObjectTypeDefinition();
        case "directive":
          return this.parseDirectiveDefinition();
      }
      switch (keywordToken.value) {
        case "query":
        case "mutation":
        case "subscription":
          return this.parseOperationDefinition();
        case "fragment":
          return this.parseFragmentDefinition();
      }
      if (hasDescription) {
        throw syntaxError(this._lexer.source, this._lexer.token.start, "Unexpected description, only GraphQL definitions support descriptions.");
      }
      switch (keywordToken.value) {
        case "extend":
          return this.parseTypeSystemExtension();
      }
    }
    throw this.unexpected(keywordToken);
  }
  parseOperationDefinition() {
    const start = this._lexer.token;
    if (this.peek(TokenKind.BRACE_L)) {
      return this.node(start, {
        kind: kinds_exports.OPERATION_DEFINITION,
        operation: OperationTypeNode.QUERY,
        description: void 0,
        name: void 0,
        variableDefinitions: void 0,
        directives: void 0,
        selectionSet: this.parseSelectionSet()
      });
    }
    const description = this.parseDescription();
    const operation = this.parseOperationType();
    let name;
    if (this.peek(TokenKind.NAME)) {
      name = this.parseName();
    }
    return this.node(start, {
      kind: kinds_exports.OPERATION_DEFINITION,
      operation,
      description,
      name,
      variableDefinitions: this.parseVariableDefinitions(),
      directives: this.parseDirectives(false),
      selectionSet: this.parseSelectionSet()
    });
  }
  parseOperationType() {
    const operationToken = this.expectToken(TokenKind.NAME);
    switch (operationToken.value) {
      case "query":
        return OperationTypeNode.QUERY;
      case "mutation":
        return OperationTypeNode.MUTATION;
      case "subscription":
        return OperationTypeNode.SUBSCRIPTION;
    }
    throw this.unexpected(operationToken);
  }
  parseVariableDefinitions() {
    return this.optionalMany(TokenKind.PAREN_L, this.parseVariableDefinition, TokenKind.PAREN_R);
  }
  parseVariableDefinition() {
    return this.node(this._lexer.token, {
      kind: kinds_exports.VARIABLE_DEFINITION,
      description: this.parseDescription(),
      variable: this.parseVariable(),
      type: (this.expectToken(TokenKind.COLON), this.parseTypeReference()),
      defaultValue: this.expectOptionalToken(TokenKind.EQUALS) ? this.parseConstValueLiteral() : void 0,
      directives: this.parseConstDirectives()
    });
  }
  parseVariable() {
    const start = this._lexer.token;
    this.expectToken(TokenKind.DOLLAR);
    return this.node(start, {
      kind: kinds_exports.VARIABLE,
      name: this.parseName()
    });
  }
  parseSelectionSet() {
    return this.node(this._lexer.token, {
      kind: kinds_exports.SELECTION_SET,
      selections: this.many(TokenKind.BRACE_L, this.parseSelection, TokenKind.BRACE_R)
    });
  }
  parseSelection() {
    return this.peek(TokenKind.SPREAD) ? this.parseFragment() : this.parseField();
  }
  parseField() {
    const start = this._lexer.token;
    const nameOrAlias = this.parseName();
    let alias;
    let name;
    if (this.expectOptionalToken(TokenKind.COLON)) {
      alias = nameOrAlias;
      name = this.parseName();
    } else {
      name = nameOrAlias;
    }
    return this.node(start, {
      kind: kinds_exports.FIELD,
      alias,
      name,
      arguments: this.parseArguments(false),
      directives: this.parseDirectives(false),
      selectionSet: this.peek(TokenKind.BRACE_L) ? this.parseSelectionSet() : void 0
    });
  }
  parseArguments(isConst) {
    const item = isConst ? this.parseConstArgument : this.parseArgument;
    return this.optionalMany(TokenKind.PAREN_L, item, TokenKind.PAREN_R);
  }
  parseFragmentArguments() {
    const item = this.parseFragmentArgument;
    return this.optionalMany(TokenKind.PAREN_L, item, TokenKind.PAREN_R);
  }
  parseArgument(isConst = false) {
    const start = this._lexer.token;
    const name = this.parseName();
    this.expectToken(TokenKind.COLON);
    return this.node(start, {
      kind: kinds_exports.ARGUMENT,
      name,
      value: this.parseValueLiteral(isConst)
    });
  }
  parseConstArgument() {
    return this.parseArgument(true);
  }
  parseFragmentArgument() {
    const start = this._lexer.token;
    const name = this.parseName();
    this.expectToken(TokenKind.COLON);
    return this.node(start, {
      kind: kinds_exports.FRAGMENT_ARGUMENT,
      name,
      value: this.parseValueLiteral(false)
    });
  }
  parseFragment() {
    const start = this._lexer.token;
    this.expectToken(TokenKind.SPREAD);
    const hasTypeCondition = this.expectOptionalKeyword("on");
    if (!hasTypeCondition && this.peek(TokenKind.NAME)) {
      const name = this.parseFragmentName();
      if (this.peek(TokenKind.PAREN_L) && this._options.experimentalFragmentArguments) {
        return this.node(start, {
          kind: kinds_exports.FRAGMENT_SPREAD,
          name,
          arguments: this.parseFragmentArguments(),
          directives: this.parseDirectives(false)
        });
      }
      return this.node(start, {
        kind: kinds_exports.FRAGMENT_SPREAD,
        name,
        directives: this.parseDirectives(false)
      });
    }
    return this.node(start, {
      kind: kinds_exports.INLINE_FRAGMENT,
      typeCondition: hasTypeCondition ? this.parseNamedType() : void 0,
      directives: this.parseDirectives(false),
      selectionSet: this.parseSelectionSet()
    });
  }
  parseFragmentDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    this.expectKeyword("fragment");
    if (this._options.experimentalFragmentArguments === true) {
      return this.node(start, {
        kind: kinds_exports.FRAGMENT_DEFINITION,
        description,
        name: this.parseFragmentName(),
        variableDefinitions: this.parseVariableDefinitions(),
        typeCondition: (this.expectKeyword("on"), this.parseNamedType()),
        directives: this.parseDirectives(false),
        selectionSet: this.parseSelectionSet()
      });
    }
    return this.node(start, {
      kind: kinds_exports.FRAGMENT_DEFINITION,
      description,
      name: this.parseFragmentName(),
      typeCondition: (this.expectKeyword("on"), this.parseNamedType()),
      directives: this.parseDirectives(false),
      selectionSet: this.parseSelectionSet()
    });
  }
  parseFragmentName() {
    if (this._lexer.token.value === "on") {
      throw this.unexpected();
    }
    return this.parseName();
  }
  parseValueLiteral(isConst) {
    const token2 = this._lexer.token;
    switch (token2.kind) {
      case TokenKind.BRACKET_L:
        return this.parseList(isConst);
      case TokenKind.BRACE_L:
        return this.parseObject(isConst);
      case TokenKind.INT:
        this.advanceLexer();
        return this.node(token2, {
          kind: kinds_exports.INT,
          value: token2.value
        });
      case TokenKind.FLOAT:
        this.advanceLexer();
        return this.node(token2, {
          kind: kinds_exports.FLOAT,
          value: token2.value
        });
      case TokenKind.STRING:
      case TokenKind.BLOCK_STRING:
        return this.parseStringLiteral();
      case TokenKind.NAME:
        this.advanceLexer();
        switch (token2.value) {
          case "true":
            return this.node(token2, {
              kind: kinds_exports.BOOLEAN,
              value: true
            });
          case "false":
            return this.node(token2, {
              kind: kinds_exports.BOOLEAN,
              value: false
            });
          case "null":
            return this.node(token2, { kind: kinds_exports.NULL });
          default:
            return this.node(token2, {
              kind: kinds_exports.ENUM,
              value: token2.value
            });
        }
      case TokenKind.DOLLAR:
        if (isConst) {
          this.expectToken(TokenKind.DOLLAR);
          if (this._lexer.token.kind === TokenKind.NAME) {
            const varName = this._lexer.token.value;
            throw syntaxError(this._lexer.source, token2.start, `Unexpected variable "$${varName}" in constant value.`);
          } else {
            throw this.unexpected(token2);
          }
        }
        return this.parseVariable();
      default:
        throw this.unexpected();
    }
  }
  parseConstValueLiteral() {
    return this.parseValueLiteral(true);
  }
  parseStringLiteral() {
    const token2 = this._lexer.token;
    this.advanceLexer();
    return this.node(token2, {
      kind: kinds_exports.STRING,
      value: token2.value,
      block: token2.kind === TokenKind.BLOCK_STRING
    });
  }
  parseList(isConst) {
    const item = () => this.parseValueLiteral(isConst);
    return this.node(this._lexer.token, {
      kind: kinds_exports.LIST,
      values: this.any(TokenKind.BRACKET_L, item, TokenKind.BRACKET_R)
    });
  }
  parseObject(isConst) {
    const item = () => this.parseObjectField(isConst);
    return this.node(this._lexer.token, {
      kind: kinds_exports.OBJECT,
      fields: this.any(TokenKind.BRACE_L, item, TokenKind.BRACE_R)
    });
  }
  parseObjectField(isConst) {
    const start = this._lexer.token;
    const name = this.parseName();
    this.expectToken(TokenKind.COLON);
    return this.node(start, {
      kind: kinds_exports.OBJECT_FIELD,
      name,
      value: this.parseValueLiteral(isConst)
    });
  }
  parseDirectives(isConst) {
    const directives = [];
    while (this.peek(TokenKind.AT)) {
      directives.push(this.parseDirective(isConst));
    }
    if (directives.length) {
      return directives;
    }
    return void 0;
  }
  parseConstDirectives() {
    return this.parseDirectives(true);
  }
  parseDirective(isConst) {
    const start = this._lexer.token;
    this.expectToken(TokenKind.AT);
    return this.node(start, {
      kind: kinds_exports.DIRECTIVE,
      name: this.parseName(),
      arguments: this.parseArguments(isConst)
    });
  }
  parseTypeReference() {
    const start = this._lexer.token;
    let type;
    if (this.expectOptionalToken(TokenKind.BRACKET_L)) {
      const innerType = this.parseTypeReference();
      this.expectToken(TokenKind.BRACKET_R);
      type = this.node(start, {
        kind: kinds_exports.LIST_TYPE,
        type: innerType
      });
    } else {
      type = this.parseNamedType();
    }
    if (this.expectOptionalToken(TokenKind.BANG)) {
      return this.node(start, {
        kind: kinds_exports.NON_NULL_TYPE,
        type
      });
    }
    return type;
  }
  parseNamedType() {
    return this.node(this._lexer.token, {
      kind: kinds_exports.NAMED_TYPE,
      name: this.parseName()
    });
  }
  peekDescription() {
    return this.peek(TokenKind.STRING) || this.peek(TokenKind.BLOCK_STRING);
  }
  parseDescription() {
    if (this.peekDescription()) {
      return this.parseStringLiteral();
    }
  }
  parseSchemaDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    this.expectKeyword("schema");
    const directives = this.parseConstDirectives();
    const operationTypes = this.many(TokenKind.BRACE_L, this.parseOperationTypeDefinition, TokenKind.BRACE_R);
    return this.node(start, {
      kind: kinds_exports.SCHEMA_DEFINITION,
      description,
      directives,
      operationTypes
    });
  }
  parseOperationTypeDefinition() {
    const start = this._lexer.token;
    const operation = this.parseOperationType();
    this.expectToken(TokenKind.COLON);
    const type = this.parseNamedType();
    return this.node(start, {
      kind: kinds_exports.OPERATION_TYPE_DEFINITION,
      operation,
      type
    });
  }
  parseScalarTypeDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    this.expectKeyword("scalar");
    const name = this.parseName();
    const directives = this.parseConstDirectives();
    return this.node(start, {
      kind: kinds_exports.SCALAR_TYPE_DEFINITION,
      description,
      name,
      directives
    });
  }
  parseObjectTypeDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    this.expectKeyword("type");
    const name = this.parseName();
    const interfaces = this.parseImplementsInterfaces();
    const directives = this.parseConstDirectives();
    const fields = this.parseFieldsDefinition();
    return this.node(start, {
      kind: kinds_exports.OBJECT_TYPE_DEFINITION,
      description,
      name,
      interfaces,
      directives,
      fields
    });
  }
  parseImplementsInterfaces() {
    return this.expectOptionalKeyword("implements") ? this.delimitedMany(TokenKind.AMP, this.parseNamedType) : void 0;
  }
  parseFieldsDefinition() {
    return this.optionalMany(TokenKind.BRACE_L, this.parseFieldDefinition, TokenKind.BRACE_R);
  }
  parseFieldDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    const name = this.parseName();
    const args = this.parseArgumentDefs();
    this.expectToken(TokenKind.COLON);
    const type = this.parseTypeReference();
    const directives = this.parseConstDirectives();
    return this.node(start, {
      kind: kinds_exports.FIELD_DEFINITION,
      description,
      name,
      arguments: args,
      type,
      directives
    });
  }
  parseArgumentDefs() {
    return this.optionalMany(TokenKind.PAREN_L, this.parseInputValueDef, TokenKind.PAREN_R);
  }
  parseInputValueDef() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    const name = this.parseName();
    this.expectToken(TokenKind.COLON);
    const type = this.parseTypeReference();
    let defaultValue;
    if (this.expectOptionalToken(TokenKind.EQUALS)) {
      defaultValue = this.parseConstValueLiteral();
    }
    const directives = this.parseConstDirectives();
    return this.node(start, {
      kind: kinds_exports.INPUT_VALUE_DEFINITION,
      description,
      name,
      type,
      defaultValue,
      directives
    });
  }
  parseInterfaceTypeDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    this.expectKeyword("interface");
    const name = this.parseName();
    const interfaces = this.parseImplementsInterfaces();
    const directives = this.parseConstDirectives();
    const fields = this.parseFieldsDefinition();
    return this.node(start, {
      kind: kinds_exports.INTERFACE_TYPE_DEFINITION,
      description,
      name,
      interfaces,
      directives,
      fields
    });
  }
  parseUnionTypeDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    this.expectKeyword("union");
    const name = this.parseName();
    const directives = this.parseConstDirectives();
    const types = this.parseUnionMemberTypes();
    return this.node(start, {
      kind: kinds_exports.UNION_TYPE_DEFINITION,
      description,
      name,
      directives,
      types
    });
  }
  parseUnionMemberTypes() {
    return this.expectOptionalToken(TokenKind.EQUALS) ? this.delimitedMany(TokenKind.PIPE, this.parseNamedType) : void 0;
  }
  parseEnumTypeDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    this.expectKeyword("enum");
    const name = this.parseName();
    const directives = this.parseConstDirectives();
    const values = this.parseEnumValuesDefinition();
    return this.node(start, {
      kind: kinds_exports.ENUM_TYPE_DEFINITION,
      description,
      name,
      directives,
      values
    });
  }
  parseEnumValuesDefinition() {
    return this.optionalMany(TokenKind.BRACE_L, this.parseEnumValueDefinition, TokenKind.BRACE_R);
  }
  parseEnumValueDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    const name = this.parseEnumValueName();
    const directives = this.parseConstDirectives();
    return this.node(start, {
      kind: kinds_exports.ENUM_VALUE_DEFINITION,
      description,
      name,
      directives
    });
  }
  parseEnumValueName() {
    if (this._lexer.token.value === "true" || this._lexer.token.value === "false" || this._lexer.token.value === "null") {
      throw syntaxError(this._lexer.source, this._lexer.token.start, `${getTokenDesc(this._lexer.token)} is reserved and cannot be used for an enum value.`);
    }
    return this.parseName();
  }
  parseInputObjectTypeDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    this.expectKeyword("input");
    const name = this.parseName();
    const directives = this.parseConstDirectives();
    const fields = this.parseInputFieldsDefinition();
    return this.node(start, {
      kind: kinds_exports.INPUT_OBJECT_TYPE_DEFINITION,
      description,
      name,
      directives,
      fields
    });
  }
  parseInputFieldsDefinition() {
    return this.optionalMany(TokenKind.BRACE_L, this.parseInputValueDef, TokenKind.BRACE_R);
  }
  parseTypeSystemExtension() {
    const keywordToken = this._lexer.lookahead();
    if (keywordToken.kind === TokenKind.NAME) {
      switch (keywordToken.value) {
        case "schema":
          return this.parseSchemaExtension();
        case "scalar":
          return this.parseScalarTypeExtension();
        case "type":
          return this.parseObjectTypeExtension();
        case "interface":
          return this.parseInterfaceTypeExtension();
        case "union":
          return this.parseUnionTypeExtension();
        case "enum":
          return this.parseEnumTypeExtension();
        case "input":
          return this.parseInputObjectTypeExtension();
        case "directive":
          return this.parseDirectiveExtension();
      }
    }
    throw this.unexpected(keywordToken);
  }
  parseSchemaExtension() {
    const start = this._lexer.token;
    this.expectKeyword("extend");
    this.expectKeyword("schema");
    const directives = this.parseConstDirectives();
    const operationTypes = this.optionalMany(TokenKind.BRACE_L, this.parseOperationTypeDefinition, TokenKind.BRACE_R);
    if (directives === void 0 && operationTypes === void 0) {
      throw this.unexpected();
    }
    return this.node(start, {
      kind: kinds_exports.SCHEMA_EXTENSION,
      directives,
      operationTypes
    });
  }
  parseScalarTypeExtension() {
    const start = this._lexer.token;
    this.expectKeyword("extend");
    this.expectKeyword("scalar");
    const name = this.parseName();
    const directives = this.parseConstDirectives();
    if (directives === void 0) {
      throw this.unexpected();
    }
    return this.node(start, {
      kind: kinds_exports.SCALAR_TYPE_EXTENSION,
      name,
      directives
    });
  }
  parseObjectTypeExtension() {
    const start = this._lexer.token;
    this.expectKeyword("extend");
    this.expectKeyword("type");
    const name = this.parseName();
    const interfaces = this.parseImplementsInterfaces();
    const directives = this.parseConstDirectives();
    const fields = this.parseFieldsDefinition();
    if (interfaces === void 0 && directives === void 0 && fields === void 0) {
      throw this.unexpected();
    }
    return this.node(start, {
      kind: kinds_exports.OBJECT_TYPE_EXTENSION,
      name,
      interfaces,
      directives,
      fields
    });
  }
  parseInterfaceTypeExtension() {
    const start = this._lexer.token;
    this.expectKeyword("extend");
    this.expectKeyword("interface");
    const name = this.parseName();
    const interfaces = this.parseImplementsInterfaces();
    const directives = this.parseConstDirectives();
    const fields = this.parseFieldsDefinition();
    if (interfaces === void 0 && directives === void 0 && fields === void 0) {
      throw this.unexpected();
    }
    return this.node(start, {
      kind: kinds_exports.INTERFACE_TYPE_EXTENSION,
      name,
      interfaces,
      directives,
      fields
    });
  }
  parseUnionTypeExtension() {
    const start = this._lexer.token;
    this.expectKeyword("extend");
    this.expectKeyword("union");
    const name = this.parseName();
    const directives = this.parseConstDirectives();
    const types = this.parseUnionMemberTypes();
    if (directives === void 0 && types === void 0) {
      throw this.unexpected();
    }
    return this.node(start, {
      kind: kinds_exports.UNION_TYPE_EXTENSION,
      name,
      directives,
      types
    });
  }
  parseEnumTypeExtension() {
    const start = this._lexer.token;
    this.expectKeyword("extend");
    this.expectKeyword("enum");
    const name = this.parseName();
    const directives = this.parseConstDirectives();
    const values = this.parseEnumValuesDefinition();
    if (directives === void 0 && values === void 0) {
      throw this.unexpected();
    }
    return this.node(start, {
      kind: kinds_exports.ENUM_TYPE_EXTENSION,
      name,
      directives,
      values
    });
  }
  parseInputObjectTypeExtension() {
    const start = this._lexer.token;
    this.expectKeyword("extend");
    this.expectKeyword("input");
    const name = this.parseName();
    const directives = this.parseConstDirectives();
    const fields = this.parseInputFieldsDefinition();
    if (directives === void 0 && fields === void 0) {
      throw this.unexpected();
    }
    return this.node(start, {
      kind: kinds_exports.INPUT_OBJECT_TYPE_EXTENSION,
      name,
      directives,
      fields
    });
  }
  parseDirectiveExtension() {
    const start = this._lexer.token;
    this.expectKeyword("extend");
    this.expectKeyword("directive");
    this.expectToken(TokenKind.AT);
    const name = this.parseName();
    const directives = this.parseConstDirectives();
    if (directives === void 0) {
      throw this.unexpected();
    }
    return this.node(start, {
      kind: kinds_exports.DIRECTIVE_EXTENSION,
      name,
      directives
    });
  }
  parseDirectiveDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    this.expectKeyword("directive");
    this.expectToken(TokenKind.AT);
    const name = this.parseName();
    const args = this.parseArgumentDefs();
    const directives = this.parseConstDirectives();
    const repeatable = this.expectOptionalKeyword("repeatable");
    this.expectKeyword("on");
    const locations = this.parseDirectiveLocations();
    return this.node(start, {
      kind: kinds_exports.DIRECTIVE_DEFINITION,
      description,
      name,
      arguments: args,
      directives,
      repeatable,
      locations
    });
  }
  parseDirectiveLocations() {
    return this.delimitedMany(TokenKind.PIPE, this.parseDirectiveLocation);
  }
  parseDirectiveLocation() {
    const start = this._lexer.token;
    const name = this.parseName();
    if (Object.hasOwn(DirectiveLocation, name.value)) {
      return name;
    }
    throw this.unexpected(start);
  }
  parseSchemaCoordinate() {
    const start = this._lexer.token;
    const ofDirective = this.expectOptionalToken(TokenKind.AT);
    const name = this.parseName();
    let memberName;
    if (!ofDirective && this.expectOptionalToken(TokenKind.DOT)) {
      memberName = this.parseName();
    }
    let argumentName;
    if ((ofDirective || memberName) && this.expectOptionalToken(TokenKind.PAREN_L)) {
      argumentName = this.parseName();
      this.expectToken(TokenKind.COLON);
      this.expectToken(TokenKind.PAREN_R);
    }
    if (ofDirective) {
      if (argumentName) {
        return this.node(start, {
          kind: kinds_exports.DIRECTIVE_ARGUMENT_COORDINATE,
          name,
          argumentName
        });
      }
      return this.node(start, {
        kind: kinds_exports.DIRECTIVE_COORDINATE,
        name
      });
    } else if (memberName) {
      if (argumentName) {
        return this.node(start, {
          kind: kinds_exports.ARGUMENT_COORDINATE,
          name,
          fieldName: memberName,
          argumentName
        });
      }
      return this.node(start, {
        kind: kinds_exports.MEMBER_COORDINATE,
        name,
        memberName
      });
    }
    return this.node(start, {
      kind: kinds_exports.TYPE_COORDINATE,
      name
    });
  }
  node(startToken, node) {
    if (this._options.noLocation !== true) {
      node.loc = new Location(startToken, this._lexer.lastToken, this._lexer.source);
    }
    return node;
  }
  peek(kind) {
    return this._lexer.token.kind === kind;
  }
  expectToken(kind) {
    const token2 = this._lexer.token;
    if (token2.kind === kind) {
      this.advanceLexer();
      return token2;
    }
    throw syntaxError(this._lexer.source, token2.start, `Expected ${getTokenKindDesc(kind)}, found ${getTokenDesc(token2)}.`);
  }
  expectOptionalToken(kind) {
    const token2 = this._lexer.token;
    if (token2.kind === kind) {
      this.advanceLexer();
      return true;
    }
    return false;
  }
  expectKeyword(value) {
    const token2 = this._lexer.token;
    if (token2.kind === TokenKind.NAME && token2.value === value) {
      this.advanceLexer();
    } else {
      throw syntaxError(this._lexer.source, token2.start, `Expected "${value}", found ${getTokenDesc(token2)}.`);
    }
  }
  expectOptionalKeyword(value) {
    const token2 = this._lexer.token;
    if (token2.kind === TokenKind.NAME && token2.value === value) {
      this.advanceLexer();
      return true;
    }
    return false;
  }
  unexpected(atToken) {
    const token2 = atToken ?? this._lexer.token;
    return syntaxError(this._lexer.source, token2.start, `Unexpected ${getTokenDesc(token2)}.`);
  }
  any(openKind, parseFn, closeKind) {
    this.expectToken(openKind);
    const nodes = [];
    while (!this.expectOptionalToken(closeKind)) {
      nodes.push(parseFn.call(this));
    }
    return nodes;
  }
  optionalMany(openKind, parseFn, closeKind) {
    if (this.expectOptionalToken(openKind)) {
      const nodes = [];
      do {
        nodes.push(parseFn.call(this));
      } while (!this.expectOptionalToken(closeKind));
      return nodes;
    }
    return void 0;
  }
  many(openKind, parseFn, closeKind) {
    this.expectToken(openKind);
    const nodes = [];
    do {
      nodes.push(parseFn.call(this));
    } while (!this.expectOptionalToken(closeKind));
    return nodes;
  }
  delimitedMany(delimiterKind, parseFn) {
    this.expectOptionalToken(delimiterKind);
    const nodes = [];
    do {
      nodes.push(parseFn.call(this));
    } while (this.expectOptionalToken(delimiterKind));
    return nodes;
  }
  advanceLexer() {
    const { maxTokens } = this._options;
    const token2 = this._lexer.advance();
    if (token2.kind !== TokenKind.EOF) {
      ++this._tokenCounter;
      if (maxTokens !== void 0 && this._tokenCounter > maxTokens) {
        throw syntaxError(this._lexer.source, token2.start, `Document contains more than ${maxTokens} tokens. Parsing aborted.`);
      }
    }
  }
};
function getTokenDesc(token2) {
  const value = token2.value;
  return getTokenKindDesc(token2.kind) + (value != null ? ` "${value}"` : "");
}
function getTokenKindDesc(kind) {
  return isPunctuatorTokenKind(kind) ? `"${kind}"` : kind;
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/utilities/typeFromAST.mjs
function typeFromAST(schema2, typeNode) {
  switch (typeNode.kind) {
    case kinds_exports.LIST_TYPE: {
      const innerType = typeFromAST(schema2, typeNode.type);
      return innerType && new GraphQLList(innerType);
    }
    case kinds_exports.NON_NULL_TYPE: {
      const innerType = typeFromAST(schema2, typeNode.type);
      return innerType && new GraphQLNonNull(innerType);
    }
    case kinds_exports.NAMED_TYPE:
      return schema2.getType(typeNode.name.value);
  }
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/utilities/TypeInfo.mjs
var TypeInfo = class {
  constructor(schema2, initialType, fragmentSignatures) {
    this._schema = schema2;
    this._typeStack = [];
    this._parentTypeStack = [];
    this._inputTypeStack = [];
    this._fieldDefStack = [];
    this._defaultValueStack = [];
    this._directive = null;
    this._argument = null;
    this._enumValue = null;
    this._fragmentSignaturesByName = fragmentSignatures ?? (() => null);
    this._fragmentSignature = null;
    this._fragmentArgument = null;
    if (initialType) {
      if (isInputType(initialType)) {
        this._inputTypeStack.push(initialType);
      }
      if (isCompositeType(initialType)) {
        this._parentTypeStack.push(initialType);
      }
      if (isOutputType(initialType)) {
        this._typeStack.push(initialType);
      }
    }
  }
  get [Symbol.toStringTag]() {
    return "TypeInfo";
  }
  getType() {
    return this._typeStack.at(-1);
  }
  getParentType() {
    return this._parentTypeStack.at(-1);
  }
  getInputType() {
    return this._inputTypeStack.at(-1);
  }
  getParentInputType() {
    return this._inputTypeStack.at(-2);
  }
  getFieldDef() {
    return this._fieldDefStack.at(-1);
  }
  getDefaultValue() {
    return this._defaultValueStack.at(-1);
  }
  getDirective() {
    return this._directive;
  }
  getArgument() {
    return this._argument;
  }
  getFragmentSignature() {
    return this._fragmentSignature;
  }
  getFragmentSignatureByName() {
    return this._fragmentSignaturesByName;
  }
  getFragmentArgument() {
    return this._fragmentArgument;
  }
  getEnumValue() {
    return this._enumValue;
  }
  enter(node) {
    const schema2 = this._schema;
    switch (node.kind) {
      case kinds_exports.DOCUMENT: {
        const fragmentSignatures = getFragmentSignatures(node);
        this._fragmentSignaturesByName = (fragmentName) => fragmentSignatures.get(fragmentName);
        break;
      }
      case kinds_exports.SELECTION_SET: {
        const namedType = getNamedType(this.getType());
        this._parentTypeStack.push(isCompositeType(namedType) ? namedType : void 0);
        break;
      }
      case kinds_exports.FIELD: {
        const parentType = this.getParentType();
        let fieldDef;
        let fieldType;
        if (parentType) {
          fieldDef = schema2.getField(parentType, node.name.value);
          if (fieldDef) {
            fieldType = fieldDef.type;
          }
        }
        this._fieldDefStack.push(fieldDef);
        this._typeStack.push(isOutputType(fieldType) ? fieldType : void 0);
        break;
      }
      case kinds_exports.DIRECTIVE:
        this._directive = schema2.getDirective(node.name.value);
        break;
      case kinds_exports.OPERATION_DEFINITION: {
        const rootType = schema2.getRootType(node.operation);
        this._typeStack.push(isObjectType(rootType) ? rootType : void 0);
        break;
      }
      case kinds_exports.FRAGMENT_SPREAD: {
        this._fragmentSignature = this.getFragmentSignatureByName()(node.name.value);
        break;
      }
      case kinds_exports.INLINE_FRAGMENT:
      case kinds_exports.FRAGMENT_DEFINITION: {
        const typeConditionAST = node.typeCondition;
        const outputType = typeConditionAST ? typeFromAST(schema2, typeConditionAST) : getNamedType(this.getType());
        this._typeStack.push(isOutputType(outputType) ? outputType : void 0);
        break;
      }
      case kinds_exports.VARIABLE_DEFINITION: {
        const inputType = typeFromAST(schema2, node.type);
        this._inputTypeStack.push(isInputType(inputType) ? inputType : void 0);
        break;
      }
      case kinds_exports.ARGUMENT: {
        let argDef;
        let argType;
        const fieldOrDirective = this.getDirective() ?? this.getFieldDef();
        if (fieldOrDirective) {
          argDef = fieldOrDirective.args.find((arg) => arg.name === node.name.value);
          if (argDef) {
            argType = argDef.type;
          }
        }
        this._argument = argDef;
        this._defaultValueStack.push(argDef?.default ?? argDef?.defaultValue ?? void 0);
        this._inputTypeStack.push(isInputType(argType) ? argType : void 0);
        break;
      }
      case kinds_exports.FRAGMENT_ARGUMENT: {
        const fragmentSignature = this.getFragmentSignature();
        const argDef = fragmentSignature?.variableDefinitions.get(node.name.value);
        this._fragmentArgument = argDef;
        let argType;
        if (argDef) {
          argType = typeFromAST(this._schema, argDef.type);
        }
        this._inputTypeStack.push(isInputType(argType) ? argType : void 0);
        break;
      }
      case kinds_exports.LIST: {
        const listType = getNullableType(this.getInputType());
        const itemType = isListType(listType) ? listType.ofType : void 0;
        this._defaultValueStack.push(void 0);
        this._inputTypeStack.push(isInputType(itemType) ? itemType : void 0);
        break;
      }
      case kinds_exports.OBJECT_FIELD: {
        const objectType = getNamedType(this.getInputType());
        let inputFieldType;
        let inputField;
        if (isInputObjectType(objectType)) {
          inputField = objectType.getFields()[node.name.value];
          if (inputField != null) {
            inputFieldType = inputField.type;
          }
        }
        this._defaultValueStack.push(inputField?.default ?? inputField?.defaultValue ?? void 0);
        this._inputTypeStack.push(isInputType(inputFieldType) ? inputFieldType : void 0);
        break;
      }
      case kinds_exports.ENUM: {
        const enumType = getNamedType(this.getInputType());
        let enumValue;
        if (isEnumType(enumType)) {
          enumValue = enumType.getValue(node.value);
        }
        this._enumValue = enumValue;
        break;
      }
      default:
    }
  }
  leave(node) {
    switch (node.kind) {
      case kinds_exports.DOCUMENT:
        this._fragmentSignaturesByName = () => null;
        break;
      case kinds_exports.SELECTION_SET:
        this._parentTypeStack.pop();
        break;
      case kinds_exports.FIELD:
        this._fieldDefStack.pop();
        this._typeStack.pop();
        break;
      case kinds_exports.DIRECTIVE:
        this._directive = null;
        break;
      case kinds_exports.FRAGMENT_SPREAD:
        this._fragmentSignature = null;
        break;
      case kinds_exports.OPERATION_DEFINITION:
      case kinds_exports.INLINE_FRAGMENT:
      case kinds_exports.FRAGMENT_DEFINITION:
        this._typeStack.pop();
        break;
      case kinds_exports.VARIABLE_DEFINITION:
        this._inputTypeStack.pop();
        break;
      case kinds_exports.ARGUMENT:
        this._argument = null;
        this._defaultValueStack.pop();
        this._inputTypeStack.pop();
        break;
      case kinds_exports.FRAGMENT_ARGUMENT: {
        this._fragmentArgument = null;
        this._defaultValueStack.pop();
        this._inputTypeStack.pop();
        break;
      }
      case kinds_exports.LIST:
      case kinds_exports.OBJECT_FIELD:
        this._defaultValueStack.pop();
        this._inputTypeStack.pop();
        break;
      case kinds_exports.ENUM:
        this._enumValue = null;
        break;
      default:
    }
  }
};
function getFragmentSignatures(document) {
  const fragmentSignatures = /* @__PURE__ */ new Map();
  for (const definition of document.definitions) {
    if (definition.kind === kinds_exports.FRAGMENT_DEFINITION) {
      const variableDefinitions = /* @__PURE__ */ new Map();
      if (definition.variableDefinitions) {
        for (const varDef of definition.variableDefinitions) {
          variableDefinitions.set(varDef.variable.name.value, varDef);
        }
      }
      const signature = { definition, variableDefinitions };
      fragmentSignatures.set(definition.name.value, signature);
    }
  }
  return fragmentSignatures;
}
function visitWithTypeInfo(typeInfo, visitor) {
  return {
    enter(...args) {
      const node = args[0];
      typeInfo.enter(node);
      const fn = getEnterLeaveForKind(visitor, node.kind).enter;
      if (fn) {
        const result = fn.apply(visitor, args);
        if (result !== void 0) {
          typeInfo.leave(node);
          if (isNode(result)) {
            typeInfo.enter(result);
          }
        }
        return result;
      }
    },
    leave(...args) {
      const node = args[0];
      const fn = getEnterLeaveForKind(visitor, node.kind).leave;
      let result;
      if (fn) {
        result = fn.apply(visitor, args);
      }
      typeInfo.leave(node);
      return result;
    }
  };
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/DeferStreamDirectiveLabelRule.mjs
function DeferStreamDirectiveLabelRule(context) {
  const knownLabels = /* @__PURE__ */ new Map();
  return {
    Directive(node) {
      if (node.name.value === GraphQLDeferDirective.name || node.name.value === GraphQLStreamDirective.name) {
        const labelArgument = node.arguments?.find((arg) => arg.name.value === "label");
        const labelValue = labelArgument?.value;
        if (!labelValue || labelValue.kind === kinds_exports.NULL) {
          return;
        }
        if (labelValue.kind !== kinds_exports.STRING) {
          context.reportError(new GraphQLError(`Argument "@${node.name.value}(label:)" must be a static string.`, { nodes: node }));
          return;
        }
        const knownLabel = knownLabels.get(labelValue.value);
        if (knownLabel != null) {
          context.reportError(new GraphQLError('Value for arguments "defer(label:)" and "stream(label:)" must be unique across all Defer/Stream directive usages.', { nodes: [knownLabel, node] }));
        } else {
          knownLabels.set(labelValue.value, node);
        }
      }
    }
  };
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/DeferStreamDirectiveOnRootFieldRule.mjs
function DeferStreamDirectiveOnRootFieldRule(context) {
  return {
    OperationDefinition(node) {
      const document = context.getDocument();
      const fragments = /* @__PURE__ */ new Map();
      for (const definition of document.definitions) {
        if (definition.kind === kinds_exports.FRAGMENT_DEFINITION) {
          fragments.set(definition.name.value, definition);
        }
      }
      if (node.operation !== "subscription" && node.operation !== "mutation") {
        return;
      }
      const schema2 = context.getSchema();
      const rootType = schema2.getRootType(node.operation);
      if (rootType) {
        forbidDeferStream({
          context,
          operationType: node.operation,
          rootType,
          fragments,
          selectionSet: node.selectionSet,
          visitedFragments: /* @__PURE__ */ new Set()
        });
      }
    }
  };
}
function forbidDeferStream({ context, operationType, rootType, fragments, selectionSet, visitedFragments }) {
  for (const selection of selectionSet.selections) {
    if (selection.kind === "Field") {
      const stream = selection.directives?.find((d) => d.name.value === GraphQLStreamDirective.name);
      if (stream) {
        context.reportError(new GraphQLError(`Stream directive cannot be used on root ${operationType} type "${rootType}".`, { nodes: stream }));
      }
    } else if (selection.kind === "FragmentSpread") {
      const fragmentName = selection.name.value;
      if (visitedFragments.has(fragmentName)) {
        continue;
      }
      const fragment = fragments.get(fragmentName);
      if (fragment) {
        const defer = getDeferDirective(selection);
        if (defer !== void 0) {
          context.reportError(new GraphQLError(`Defer directive cannot be used on root ${operationType} type "${rootType}".`, { nodes: defer }));
        }
        forbidDeferStream({
          context,
          operationType,
          rootType,
          fragments,
          selectionSet: fragment.selectionSet,
          visitedFragments
        });
      }
      visitedFragments.add(fragmentName);
    } else if (selection.kind === "InlineFragment") {
      const defer = getDeferDirective(selection);
      if (defer !== void 0) {
        context.reportError(new GraphQLError(`Defer directive cannot be used on root ${operationType} type "${rootType}".`, { nodes: defer }));
      }
      forbidDeferStream({
        context,
        operationType,
        rootType,
        fragments,
        selectionSet: selection.selectionSet,
        visitedFragments
      });
    }
  }
}
function getDeferDirective(fragment) {
  return fragment.directives?.find((d) => d.name.value === GraphQLDeferDirective.name);
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/DeferStreamDirectiveOnValidOperationsRule.mjs
function ifArgumentCanBeFalse(node) {
  const ifArgument = node.arguments?.find((arg) => arg.name.value === "if");
  if (!ifArgument) {
    return false;
  }
  if (ifArgument.value.kind === kinds_exports.BOOLEAN) {
    if (ifArgument.value.value) {
      return false;
    }
  } else if (ifArgument.value.kind !== kinds_exports.VARIABLE) {
    return false;
  }
  return true;
}
function canBeSkippedViaSkipDirective(node) {
  const ifArgument = node.arguments?.find((arg) => arg.name.value === "if");
  if (!ifArgument) {
    return true;
  }
  if (ifArgument.value.kind === kinds_exports.BOOLEAN) {
    if (ifArgument.value.value) {
      return true;
    }
    return false;
  }
  return true;
}
function canBeSkippedViaIncludeDirective(node) {
  const ifArgument = node.arguments?.find((arg) => arg.name.value === "if");
  if (!ifArgument) {
    return false;
  }
  if (ifArgument?.value.kind === kinds_exports.BOOLEAN) {
    if (ifArgument.value.value) {
      return false;
    }
    return true;
  }
  return true;
}
function DeferStreamDirectiveOnValidOperationsRule(context) {
  return {
    OperationDefinition(operation) {
      if (operation.operation !== OperationTypeNode.SUBSCRIPTION) {
        return;
      }
      const document = context.getDocument();
      const fragments = /* @__PURE__ */ new Map();
      for (const definition of document.definitions) {
        if (definition.kind === kinds_exports.FRAGMENT_DEFINITION) {
          fragments.set(definition.name.value, definition);
        }
      }
      const visitedFragments = /* @__PURE__ */ new Set();
      forbidUnconditionalDeferStream({
        context,
        fragments,
        selectionSet: operation.selectionSet,
        parentNodes: [],
        visitedFragments
      });
    }
  };
}
function forbidUnconditionalDeferStream({ context, fragments, selectionSet, parentNodes, visitedFragments }) {
  for (const selection of selectionSet.selections) {
    const skip = selection.directives?.find((d) => d.name.value === GraphQLSkipDirective.name);
    if (skip && canBeSkippedViaSkipDirective(skip)) {
      continue;
    }
    const include = selection.directives?.find((d) => d.name.value === GraphQLIncludeDirective.name);
    if (include && canBeSkippedViaIncludeDirective(include)) {
      continue;
    }
    for (const directive of selection.directives ?? []) {
      if (directive.name.value === GraphQLDeferDirective.name) {
        if (!ifArgumentCanBeFalse(directive)) {
          context.reportError(new GraphQLError("Defer directive not supported on subscription operations. Disable `@defer` by setting the `if` argument to `false`.", { nodes: [directive, ...parentNodes] }));
        }
      } else if (directive.name.value === GraphQLStreamDirective.name) {
        if (!ifArgumentCanBeFalse(directive)) {
          context.reportError(new GraphQLError("Stream directive not supported on subscription operations. Disable `@stream` by setting the `if` argument to `false`.", { nodes: [directive, ...parentNodes] }));
        }
      }
    }
    if (selection.kind === "FragmentSpread") {
      const fragmentName = selection.name.value;
      if (visitedFragments.has(fragmentName)) {
        continue;
      }
      visitedFragments.add(fragmentName);
      const fragment = fragments.get(fragmentName);
      if (fragment) {
        forbidUnconditionalDeferStream({
          context,
          fragments,
          parentNodes: [selection, ...parentNodes],
          selectionSet: fragment?.selectionSet,
          visitedFragments
        });
      }
    } else if (selection.selectionSet) {
      forbidUnconditionalDeferStream({
        context,
        fragments,
        selectionSet: selection.selectionSet,
        parentNodes,
        visitedFragments
      });
    }
  }
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/language/predicates.mjs
function isExecutableDefinitionNode(node) {
  return node.kind === kinds_exports.OPERATION_DEFINITION || node.kind === kinds_exports.FRAGMENT_DEFINITION;
}
function isSubscriptionOperationDefinitionNode(node) {
  return node.operation === OperationTypeNode.SUBSCRIPTION;
}
function isTypeSystemDefinitionNode(node) {
  return node.kind === kinds_exports.SCHEMA_DEFINITION || isTypeDefinitionNode(node) || node.kind === kinds_exports.DIRECTIVE_DEFINITION;
}
function isTypeDefinitionNode(node) {
  return node.kind === kinds_exports.SCALAR_TYPE_DEFINITION || node.kind === kinds_exports.OBJECT_TYPE_DEFINITION || node.kind === kinds_exports.INTERFACE_TYPE_DEFINITION || node.kind === kinds_exports.UNION_TYPE_DEFINITION || node.kind === kinds_exports.ENUM_TYPE_DEFINITION || node.kind === kinds_exports.INPUT_OBJECT_TYPE_DEFINITION;
}
function isTypeSystemExtensionNode(node) {
  return node.kind === kinds_exports.SCHEMA_EXTENSION || node.kind === kinds_exports.DIRECTIVE_EXTENSION || isTypeExtensionNode(node);
}
function isTypeExtensionNode(node) {
  return node.kind === kinds_exports.SCALAR_TYPE_EXTENSION || node.kind === kinds_exports.OBJECT_TYPE_EXTENSION || node.kind === kinds_exports.INTERFACE_TYPE_EXTENSION || node.kind === kinds_exports.UNION_TYPE_EXTENSION || node.kind === kinds_exports.ENUM_TYPE_EXTENSION || node.kind === kinds_exports.INPUT_OBJECT_TYPE_EXTENSION;
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/ExecutableDefinitionsRule.mjs
function ExecutableDefinitionsRule(context) {
  return {
    Document(node) {
      for (const definition of node.definitions) {
        if (!isExecutableDefinitionNode(definition)) {
          const defName = definition.kind === kinds_exports.SCHEMA_DEFINITION || definition.kind === kinds_exports.SCHEMA_EXTENSION ? "schema" : '"' + definition.name.value + '"';
          context.reportError(new GraphQLError(`The ${defName} definition is not executable.`, {
            nodes: definition
          }));
        }
      }
      return false;
    }
  };
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/FieldsOnCorrectTypeRule.mjs
function FieldsOnCorrectTypeRule(context) {
  return {
    Field(node) {
      const type = context.getParentType();
      if (type) {
        const fieldDef = context.getFieldDef();
        if (!fieldDef) {
          const schema2 = context.getSchema();
          const fieldName = node.name.value;
          let suggestion = didYouMean("to use an inline fragment on", context.hideSuggestions ? [] : getSuggestedTypeNames(schema2, type, fieldName));
          if (suggestion === "") {
            suggestion = didYouMean(context.hideSuggestions ? [] : getSuggestedFieldNames(type, fieldName));
          }
          context.reportError(new GraphQLError(`Cannot query field "${fieldName}" on type "${type}".` + suggestion, { nodes: node }));
        }
      }
    }
  };
}
function getSuggestedTypeNames(schema2, type, fieldName) {
  if (!isAbstractType(type)) {
    return [];
  }
  const suggestedTypes = /* @__PURE__ */ new Set();
  const usageCount = /* @__PURE__ */ Object.create(null);
  for (const possibleType of schema2.getPossibleTypes(type)) {
    if (possibleType.getFields()[fieldName] == null) {
      continue;
    }
    suggestedTypes.add(possibleType);
    usageCount[possibleType.name] = 1;
    for (const possibleInterface of possibleType.getInterfaces()) {
      if (possibleInterface.getFields()[fieldName] == null) {
        continue;
      }
      suggestedTypes.add(possibleInterface);
      usageCount[possibleInterface.name] = (usageCount[possibleInterface.name] ?? 0) + 1;
    }
  }
  return [...suggestedTypes].sort((typeA, typeB) => {
    const usageCountDiff = usageCount[typeB.name] - usageCount[typeA.name];
    if (usageCountDiff !== 0) {
      return usageCountDiff;
    }
    if (isInterfaceType(typeA) && schema2.isSubType(typeA, typeB)) {
      return -1;
    }
    if (isInterfaceType(typeB) && schema2.isSubType(typeB, typeA)) {
      return 1;
    }
    return naturalCompare(typeA.name, typeB.name);
  }).map((x) => x.name);
}
function getSuggestedFieldNames(type, fieldName) {
  if (isObjectType(type) || isInterfaceType(type)) {
    const possibleFieldNames = Object.keys(type.getFields());
    return suggestionList(fieldName, possibleFieldNames);
  }
  return [];
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/FragmentsOnCompositeTypesRule.mjs
function FragmentsOnCompositeTypesRule(context) {
  return {
    InlineFragment(node) {
      const typeCondition = node.typeCondition;
      if (typeCondition) {
        const type = typeFromAST(context.getSchema(), typeCondition);
        if (type && !isCompositeType(type)) {
          const typeStr = print(typeCondition);
          context.reportError(new GraphQLError(`Fragment cannot condition on non composite type "${typeStr}".`, { nodes: typeCondition }));
        }
      }
    },
    FragmentDefinition(node) {
      const type = typeFromAST(context.getSchema(), node.typeCondition);
      if (type && !isCompositeType(type)) {
        const typeStr = print(node.typeCondition);
        context.reportError(new GraphQLError(`Fragment "${node.name.value}" cannot condition on non composite type "${typeStr}".`, { nodes: node.typeCondition }));
      }
    }
  };
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/KnownArgumentNamesRule.mjs
function KnownArgumentNamesRule(context) {
  return {
    ...KnownArgumentNamesOnDirectivesRule(context),
    FragmentArgument(argNode) {
      const fragmentSignature = context.getFragmentSignature();
      if (fragmentSignature) {
        const varDef = fragmentSignature.variableDefinitions.get(argNode.name.value);
        if (!varDef) {
          const argName = argNode.name.value;
          const suggestions = context.hideSuggestions ? [] : suggestionList(argName, Array.from(fragmentSignature.variableDefinitions.values()).map((varSignature) => varSignature.variable.name.value));
          context.reportError(new GraphQLError(`Unknown argument "${argName}" on fragment "${fragmentSignature.definition.name.value}".` + didYouMean(suggestions), { nodes: argNode }));
        }
      }
    },
    Argument(argNode) {
      const argDef = context.getArgument();
      const fieldDef = context.getFieldDef();
      if (!argDef && fieldDef) {
        const argName = argNode.name.value;
        const suggestions = context.hideSuggestions ? [] : suggestionList(argName, fieldDef.args.map((arg) => arg.name));
        context.reportError(new GraphQLError(`Unknown argument "${argName}" on field "${fieldDef}".` + didYouMean(suggestions), { nodes: argNode }));
      }
    }
  };
}
function KnownArgumentNamesOnDirectivesRule(context) {
  const directiveArgs = /* @__PURE__ */ new Map();
  const schema2 = context.getSchema();
  const definedDirectives = schema2 ? schema2.getDirectives() : specifiedDirectives;
  for (const directive of definedDirectives) {
    directiveArgs.set(directive.name, directive.args.map((arg) => arg.name));
  }
  const astDefinitions = context.getDocument().definitions;
  for (const def of astDefinitions) {
    if (def.kind === kinds_exports.DIRECTIVE_DEFINITION) {
      const argsNodes = def.arguments ?? [];
      directiveArgs.set(def.name.value, argsNodes.map((arg) => arg.name.value));
    }
  }
  return {
    Directive(directiveNode) {
      const directiveName = directiveNode.name.value;
      const knownArgs = directiveArgs.get(directiveName);
      if (directiveNode.arguments != null && knownArgs != null) {
        for (const argNode of directiveNode.arguments) {
          const argName = argNode.name.value;
          if (!knownArgs.includes(argName)) {
            const suggestions = suggestionList(argName, knownArgs);
            context.reportError(new GraphQLError(`Unknown argument "${argName}" on directive "@${directiveName}".` + (context.hideSuggestions ? "" : didYouMean(suggestions)), { nodes: argNode }));
          }
        }
      }
      return false;
    }
  };
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/KnownDirectivesRule.mjs
function KnownDirectivesRule(context) {
  const locationsMap = /* @__PURE__ */ new Map();
  const schema2 = context.getSchema();
  const definedDirectives = schema2 ? schema2.getDirectives() : specifiedDirectives;
  for (const directive of definedDirectives) {
    locationsMap.set(directive.name, directive.locations);
  }
  const astDefinitions = context.getDocument().definitions;
  for (const def of astDefinitions) {
    if (def.kind === kinds_exports.DIRECTIVE_DEFINITION) {
      locationsMap.set(def.name.value, def.locations.map((name) => name.value));
    }
  }
  return {
    Directive(node, _key, _parent, _path, ancestors) {
      const name = node.name.value;
      const locations = locationsMap.get(name);
      if (locations == null) {
        context.reportError(new GraphQLError(`Unknown directive "@${name}".`, { nodes: node }));
        return;
      }
      const candidateLocation = getDirectiveLocationForASTPath(ancestors);
      if (candidateLocation != null && !locations.includes(candidateLocation)) {
        context.reportError(new GraphQLError(`Directive "@${name}" may not be used on ${candidateLocation}.`, { nodes: node }));
      }
    }
  };
}
function getDirectiveLocationForASTPath(ancestors) {
  const appliedTo = ancestors.at(-1);
  if (!(appliedTo != null && "kind" in appliedTo))
    invariant(false);
  switch (appliedTo.kind) {
    case kinds_exports.OPERATION_DEFINITION:
      return getDirectiveLocationForOperation(appliedTo.operation);
    case kinds_exports.FIELD:
      return DirectiveLocation.FIELD;
    case kinds_exports.FRAGMENT_SPREAD:
      return DirectiveLocation.FRAGMENT_SPREAD;
    case kinds_exports.INLINE_FRAGMENT:
      return DirectiveLocation.INLINE_FRAGMENT;
    case kinds_exports.FRAGMENT_DEFINITION:
      return DirectiveLocation.FRAGMENT_DEFINITION;
    case kinds_exports.VARIABLE_DEFINITION: {
      const parentNode = ancestors[ancestors.length - 3];
      if (!("kind" in parentNode))
        invariant(false);
      return parentNode.kind === kinds_exports.OPERATION_DEFINITION ? DirectiveLocation.VARIABLE_DEFINITION : DirectiveLocation.FRAGMENT_VARIABLE_DEFINITION;
    }
    case kinds_exports.SCHEMA_DEFINITION:
    case kinds_exports.SCHEMA_EXTENSION:
      return DirectiveLocation.SCHEMA;
    case kinds_exports.SCALAR_TYPE_DEFINITION:
    case kinds_exports.SCALAR_TYPE_EXTENSION:
      return DirectiveLocation.SCALAR;
    case kinds_exports.OBJECT_TYPE_DEFINITION:
    case kinds_exports.OBJECT_TYPE_EXTENSION:
      return DirectiveLocation.OBJECT;
    case kinds_exports.FIELD_DEFINITION:
      return DirectiveLocation.FIELD_DEFINITION;
    case kinds_exports.INTERFACE_TYPE_DEFINITION:
    case kinds_exports.INTERFACE_TYPE_EXTENSION:
      return DirectiveLocation.INTERFACE;
    case kinds_exports.UNION_TYPE_DEFINITION:
    case kinds_exports.UNION_TYPE_EXTENSION:
      return DirectiveLocation.UNION;
    case kinds_exports.ENUM_TYPE_DEFINITION:
    case kinds_exports.ENUM_TYPE_EXTENSION:
      return DirectiveLocation.ENUM;
    case kinds_exports.ENUM_VALUE_DEFINITION:
      return DirectiveLocation.ENUM_VALUE;
    case kinds_exports.INPUT_OBJECT_TYPE_DEFINITION:
    case kinds_exports.INPUT_OBJECT_TYPE_EXTENSION:
      return DirectiveLocation.INPUT_OBJECT;
    case kinds_exports.INPUT_VALUE_DEFINITION: {
      const parentNode = ancestors.at(-3);
      if (!(parentNode != null && "kind" in parentNode))
        invariant(false);
      return parentNode.kind === kinds_exports.INPUT_OBJECT_TYPE_DEFINITION || parentNode.kind === kinds_exports.INPUT_OBJECT_TYPE_EXTENSION ? DirectiveLocation.INPUT_FIELD_DEFINITION : DirectiveLocation.ARGUMENT_DEFINITION;
    }
    case kinds_exports.DIRECTIVE_DEFINITION:
    case kinds_exports.DIRECTIVE_EXTENSION:
      return DirectiveLocation.DIRECTIVE_DEFINITION;
    default:
      invariant(false, "Unexpected kind: " + inspect(appliedTo.kind));
  }
}
function getDirectiveLocationForOperation(operation) {
  switch (operation) {
    case OperationTypeNode.QUERY:
      return DirectiveLocation.QUERY;
    case OperationTypeNode.MUTATION:
      return DirectiveLocation.MUTATION;
    case OperationTypeNode.SUBSCRIPTION:
      return DirectiveLocation.SUBSCRIPTION;
  }
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/KnownFragmentNamesRule.mjs
function KnownFragmentNamesRule(context) {
  return {
    FragmentSpread(node) {
      const fragmentName = node.name.value;
      const fragment = context.getFragment(fragmentName);
      if (!fragment) {
        context.reportError(new GraphQLError(`Unknown fragment "${fragmentName}".`, {
          nodes: node.name
        }));
      }
    }
  };
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/KnownOperationTypesRule.mjs
function KnownOperationTypesRule(context) {
  const schema2 = context.getSchema();
  return {
    OperationDefinition(node) {
      const operation = node.operation;
      if (!schema2.getRootType(operation)) {
        context.reportError(new GraphQLError(`The ${operation} operation is not supported by the schema.`, { nodes: node }));
      }
    }
  };
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/KnownTypeNamesRule.mjs
function KnownTypeNamesRule(context) {
  const { definitions } = context.getDocument();
  const existingTypesMap = context.getSchema()?.getTypeMap() ?? {};
  const typeNames = /* @__PURE__ */ new Set([
    ...Object.keys(existingTypesMap),
    ...definitions.filter(isTypeDefinitionNode).map((def) => def.name.value)
  ]);
  return {
    NamedType(node, _1, parent, _2, ancestors) {
      const typeName = node.name.value;
      if (!typeNames.has(typeName)) {
        const definitionNode = ancestors[2] ?? parent;
        const isSDL = definitionNode != null && isSDLNode(definitionNode);
        if (isSDL && standardTypeNames.has(typeName)) {
          return;
        }
        const suggestedTypes = context.hideSuggestions ? [] : suggestionList(typeName, isSDL ? [...standardTypeNames, ...typeNames] : [...typeNames]);
        context.reportError(new GraphQLError(`Unknown type "${typeName}".` + didYouMean(suggestedTypes), { nodes: node }));
      }
    }
  };
}
var standardTypeNames = new Set([...specifiedScalarTypes, ...introspectionTypes].map((type) => type.name));
function isSDLNode(value) {
  return "kind" in value && (isTypeSystemDefinitionNode(value) || isTypeSystemExtensionNode(value));
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/LoneAnonymousOperationRule.mjs
function LoneAnonymousOperationRule(context) {
  let operationCount = 0;
  return {
    Document(node) {
      operationCount = node.definitions.filter((definition) => definition.kind === kinds_exports.OPERATION_DEFINITION).length;
    },
    OperationDefinition(node) {
      if (!node.name && operationCount > 1) {
        context.reportError(new GraphQLError("This anonymous operation must be the only defined operation.", { nodes: node }));
      }
    }
  };
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/LoneSchemaDefinitionRule.mjs
function LoneSchemaDefinitionRule(context) {
  const oldSchema = context.getSchema();
  const alreadyDefined = oldSchema?.astNode ?? oldSchema?.getQueryType() ?? oldSchema?.getMutationType() ?? oldSchema?.getSubscriptionType();
  let schemaDefinitionsCount = 0;
  return {
    SchemaDefinition(node) {
      if (alreadyDefined) {
        context.reportError(new GraphQLError("Cannot define a new schema within a schema extension.", { nodes: node }));
        return;
      }
      if (schemaDefinitionsCount > 0) {
        context.reportError(new GraphQLError("Must provide only one schema definition.", {
          nodes: node
        }));
      }
      ++schemaDefinitionsCount;
    }
  };
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/MaxIntrospectionDepthRule.mjs
var MAX_LISTS_DEPTH = 3;
function MaxIntrospectionDepthRule(context) {
  function checkDepth(node, visitedFragments = /* @__PURE__ */ Object.create(null), depth = 0) {
    if (node.kind === kinds_exports.FRAGMENT_SPREAD) {
      const fragmentName = node.name.value;
      if (visitedFragments[fragmentName] === true) {
        return false;
      }
      const fragment = context.getFragment(fragmentName);
      if (!fragment) {
        return false;
      }
      try {
        visitedFragments[fragmentName] = true;
        return checkDepth(fragment, visitedFragments, depth);
      } finally {
        visitedFragments[fragmentName] = void 0;
      }
    }
    if (node.kind === kinds_exports.FIELD && (node.name.value === "fields" || node.name.value === "interfaces" || node.name.value === "possibleTypes" || node.name.value === "inputFields")) {
      depth++;
      if (depth >= MAX_LISTS_DEPTH) {
        return true;
      }
    }
    if ("selectionSet" in node && node.selectionSet) {
      for (const child of node.selectionSet.selections) {
        if (checkDepth(child, visitedFragments, depth)) {
          return true;
        }
      }
    }
    return false;
  }
  return {
    Field(node) {
      if (node.name.value === "__schema" || node.name.value === "__type") {
        if (checkDepth(node)) {
          context.reportError(new GraphQLError("Maximum introspection depth exceeded", {
            nodes: [node]
          }));
          return false;
        }
      }
    }
  };
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/NoFragmentCyclesRule.mjs
function NoFragmentCyclesRule(context) {
  const visitedFrags = /* @__PURE__ */ new Set();
  const spreadPath = [];
  const spreadPathIndexByName = /* @__PURE__ */ Object.create(null);
  return {
    OperationDefinition: () => false,
    FragmentDefinition(node) {
      detectCycleRecursive(node);
      return false;
    }
  };
  function detectCycleRecursive(fragment) {
    if (visitedFrags.has(fragment.name.value)) {
      return;
    }
    const fragmentName = fragment.name.value;
    visitedFrags.add(fragmentName);
    const spreadNodes = context.getFragmentSpreads(fragment.selectionSet);
    if (spreadNodes.length === 0) {
      return;
    }
    spreadPathIndexByName[fragmentName] = spreadPath.length;
    for (const spreadNode of spreadNodes) {
      const spreadName = spreadNode.name.value;
      const cycleIndex = spreadPathIndexByName[spreadName];
      spreadPath.push(spreadNode);
      if (cycleIndex === void 0) {
        const spreadFragment = context.getFragment(spreadName);
        if (spreadFragment) {
          detectCycleRecursive(spreadFragment);
        }
      } else {
        const cyclePath = spreadPath.slice(cycleIndex);
        const viaPath = cyclePath.slice(0, -1).map((s) => '"' + s.name.value + '"').join(", ");
        context.reportError(new GraphQLError(`Cannot spread fragment "${spreadName}" within itself` + (viaPath !== "" ? ` via ${viaPath}.` : "."), { nodes: cyclePath }));
      }
      spreadPath.pop();
    }
    spreadPathIndexByName[fragmentName] = void 0;
  }
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/NoUndefinedVariablesRule.mjs
function NoUndefinedVariablesRule(context) {
  return {
    OperationDefinition(operation) {
      const variableNameDefined = new Set(operation.variableDefinitions?.map((node) => node.variable.name.value));
      const usages = context.getRecursiveVariableUsages(operation);
      for (const { node, fragmentVariableDefinition } of usages) {
        if (fragmentVariableDefinition) {
          continue;
        }
        const varName = node.name.value;
        if (!variableNameDefined.has(varName)) {
          context.reportError(new GraphQLError(operation.name ? `Variable "$${varName}" is not defined by operation "${operation.name.value}".` : `Variable "$${varName}" is not defined.`, { nodes: [node, operation] }));
        }
      }
    }
  };
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/NoUnusedFragmentsRule.mjs
function NoUnusedFragmentsRule(context) {
  const fragmentNameUsed = /* @__PURE__ */ new Set();
  const fragmentDefs = [];
  return {
    OperationDefinition(operation) {
      for (const fragment of context.getRecursivelyReferencedFragments(operation)) {
        fragmentNameUsed.add(fragment.name.value);
      }
      return false;
    },
    FragmentDefinition(node) {
      fragmentDefs.push(node);
      return false;
    },
    Document: {
      leave() {
        for (const fragmentDef of fragmentDefs) {
          const fragName = fragmentDef.name.value;
          if (!fragmentNameUsed.has(fragName)) {
            context.reportError(new GraphQLError(`Fragment "${fragName}" is never used.`, {
              nodes: fragmentDef
            }));
          }
        }
      }
    }
  };
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/NoUnusedVariablesRule.mjs
function NoUnusedVariablesRule(context) {
  return {
    FragmentDefinition(fragment) {
      const usages = context.getVariableUsages(fragment);
      const argumentNameUsed = new Set(usages.map(({ node }) => node.name.value));
      const variableDefinitions = fragment.variableDefinitions ?? [];
      for (const varDef of variableDefinitions) {
        const argName = varDef.variable.name.value;
        if (!argumentNameUsed.has(argName)) {
          context.reportError(new GraphQLError(`Variable "$${argName}" is never used in fragment "${fragment.name.value}".`, { nodes: varDef }));
        }
      }
    },
    OperationDefinition(operation) {
      const usages = context.getRecursiveVariableUsages(operation);
      const operationVariableNameUsed = /* @__PURE__ */ new Set();
      for (const { node, fragmentVariableDefinition } of usages) {
        const varName = node.name.value;
        if (!fragmentVariableDefinition) {
          operationVariableNameUsed.add(varName);
        }
      }
      const variableDefinitions = operation.variableDefinitions ?? [];
      for (const variableDef of variableDefinitions) {
        const variableName = variableDef.variable.name.value;
        if (!operationVariableNameUsed.has(variableName)) {
          context.reportError(new GraphQLError(operation.name ? `Variable "$${variableName}" is never used in operation "${operation.name.value}".` : `Variable "$${variableName}" is never used.`, { nodes: variableDef }));
        }
      }
    }
  };
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/utilities/sortValueNode.mjs
function sortValueNode(valueNode) {
  switch (valueNode.kind) {
    case kinds_exports.OBJECT:
      return {
        ...valueNode,
        fields: sortFields(valueNode.fields)
      };
    case kinds_exports.LIST:
      return {
        ...valueNode,
        values: valueNode.values.map(sortValueNode)
      };
    case kinds_exports.INT:
    case kinds_exports.FLOAT:
    case kinds_exports.STRING:
    case kinds_exports.BOOLEAN:
    case kinds_exports.NULL:
    case kinds_exports.ENUM:
    case kinds_exports.VARIABLE:
      return valueNode;
  }
}
function sortFields(fields) {
  return fields.map((fieldNode) => ({
    ...fieldNode,
    value: sortValueNode(fieldNode.value)
  })).sort((fieldA, fieldB) => naturalCompare(fieldA.name.value, fieldB.name.value));
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/OverlappingFieldsCanBeMergedRule.mjs
function reasonMessage(reason) {
  if (Array.isArray(reason)) {
    return reason.map(([responseName, subReason]) => `subfields "${responseName}" conflict because ` + reasonMessage(subReason)).join(" and ");
  }
  return reason;
}
function OverlappingFieldsCanBeMergedRule(context) {
  const comparedFieldsAndFragmentPairs = new OrderedPairSet();
  const comparedFragmentPairs = new PairSet();
  const cachedFieldsAndFragmentSpreads = /* @__PURE__ */ new Map();
  return {
    SelectionSet(selectionSet) {
      const conflicts = findConflictsWithinSelectionSet(context, cachedFieldsAndFragmentSpreads, comparedFieldsAndFragmentPairs, comparedFragmentPairs, context.getParentType(), selectionSet);
      for (const [[responseName, reason], fields1, fields2] of conflicts) {
        const reasonMsg = reasonMessage(reason);
        context.reportError(new GraphQLError(`Fields "${responseName}" conflict because ${reasonMsg}. Use different aliases on the fields to fetch both if this was intentional.`, { nodes: fields1.concat(fields2) }));
      }
    }
  };
}
function findConflictsWithinSelectionSet(context, cachedFieldsAndFragmentSpreads, comparedFieldsAndFragmentPairs, comparedFragmentPairs, parentType, selectionSet) {
  const conflicts = [];
  const [fieldMap, fragmentSpreads] = getFieldsAndFragmentSpreads(context, cachedFieldsAndFragmentSpreads, parentType, selectionSet, void 0);
  collectConflictsWithin(context, conflicts, cachedFieldsAndFragmentSpreads, comparedFieldsAndFragmentPairs, comparedFragmentPairs, fieldMap);
  if (fragmentSpreads.length !== 0) {
    for (let i = 0; i < fragmentSpreads.length; i++) {
      collectConflictsBetweenFieldsAndFragment(context, conflicts, cachedFieldsAndFragmentSpreads, comparedFieldsAndFragmentPairs, comparedFragmentPairs, false, fieldMap, fragmentSpreads[i]);
      for (let j = i + 1; j < fragmentSpreads.length; j++) {
        collectConflictsBetweenFragments(context, conflicts, cachedFieldsAndFragmentSpreads, comparedFieldsAndFragmentPairs, comparedFragmentPairs, false, fragmentSpreads[i], fragmentSpreads[j]);
      }
    }
  }
  return conflicts;
}
function collectConflictsBetweenFieldsAndFragment(context, conflicts, cachedFieldsAndFragmentSpreads, comparedFieldsAndFragmentPairs, comparedFragmentPairs, areMutuallyExclusive, fieldMap, fragmentSpread) {
  if (comparedFieldsAndFragmentPairs.has(fieldMap, fragmentSpread.key, areMutuallyExclusive)) {
    return;
  }
  comparedFieldsAndFragmentPairs.add(fieldMap, fragmentSpread.key, areMutuallyExclusive);
  const fragment = context.getFragment(fragmentSpread.node.name.value);
  if (!fragment) {
    return;
  }
  const [fieldMap2, referencedFragmentSpreads] = getReferencedFieldsAndFragmentSpreads(context, cachedFieldsAndFragmentSpreads, fragment, fragmentSpread.varMap);
  if (fieldMap === fieldMap2) {
    return;
  }
  collectConflictsBetween(context, conflicts, cachedFieldsAndFragmentSpreads, comparedFieldsAndFragmentPairs, comparedFragmentPairs, areMutuallyExclusive, fieldMap, void 0, fieldMap2, fragmentSpread.varMap);
  for (const referencedFragmentSpread of referencedFragmentSpreads) {
    collectConflictsBetweenFieldsAndFragment(context, conflicts, cachedFieldsAndFragmentSpreads, comparedFieldsAndFragmentPairs, comparedFragmentPairs, areMutuallyExclusive, fieldMap, referencedFragmentSpread);
  }
}
function collectConflictsBetweenFragments(context, conflicts, cachedFieldsAndFragmentSpreads, comparedFieldsAndFragmentPairs, comparedFragmentPairs, areMutuallyExclusive, fragmentSpread1, fragmentSpread2) {
  if (fragmentSpread1.key === fragmentSpread2.key) {
    return;
  }
  if (fragmentSpread1.node.name.value === fragmentSpread2.node.name.value) {
    if (!sameArguments(fragmentSpread1.node.arguments, fragmentSpread1.varMap, fragmentSpread2.node.arguments, fragmentSpread2.varMap)) {
      context.reportError(new GraphQLError(`Spreads "${fragmentSpread1.node.name.value}" conflict because ${fragmentSpread1.key} and ${fragmentSpread2.key} have different fragment arguments.`, { nodes: [fragmentSpread1.node, fragmentSpread2.node] }));
      return;
    }
  }
  if (comparedFragmentPairs.has(fragmentSpread1.key, fragmentSpread2.key, areMutuallyExclusive)) {
    return;
  }
  comparedFragmentPairs.add(fragmentSpread1.key, fragmentSpread2.key, areMutuallyExclusive);
  const fragment1 = context.getFragment(fragmentSpread1.node.name.value);
  const fragment2 = context.getFragment(fragmentSpread2.node.name.value);
  if (!fragment1 || !fragment2) {
    return;
  }
  const [fieldMap1, referencedFragmentSpreads1] = getReferencedFieldsAndFragmentSpreads(context, cachedFieldsAndFragmentSpreads, fragment1, fragmentSpread1.varMap);
  const [fieldMap2, referencedFragmentSpreads2] = getReferencedFieldsAndFragmentSpreads(context, cachedFieldsAndFragmentSpreads, fragment2, fragmentSpread2.varMap);
  collectConflictsBetween(context, conflicts, cachedFieldsAndFragmentSpreads, comparedFieldsAndFragmentPairs, comparedFragmentPairs, areMutuallyExclusive, fieldMap1, fragmentSpread1.varMap, fieldMap2, fragmentSpread2.varMap);
  for (const referencedFragmentSpread2 of referencedFragmentSpreads2) {
    collectConflictsBetweenFragments(context, conflicts, cachedFieldsAndFragmentSpreads, comparedFieldsAndFragmentPairs, comparedFragmentPairs, areMutuallyExclusive, fragmentSpread1, referencedFragmentSpread2);
  }
  for (const referencedFragmentSpread1 of referencedFragmentSpreads1) {
    collectConflictsBetweenFragments(context, conflicts, cachedFieldsAndFragmentSpreads, comparedFieldsAndFragmentPairs, comparedFragmentPairs, areMutuallyExclusive, referencedFragmentSpread1, fragmentSpread2);
  }
}
function findConflictsBetweenSubSelectionSets(context, cachedFieldsAndFragmentSpreads, comparedFieldsAndFragmentPairs, comparedFragmentPairs, areMutuallyExclusive, parentType1, selectionSet1, varMap1, parentType2, selectionSet2, varMap2) {
  const conflicts = [];
  const [fieldMap1, fragmentSpreads1] = getFieldsAndFragmentSpreads(context, cachedFieldsAndFragmentSpreads, parentType1, selectionSet1, varMap1);
  const [fieldMap2, fragmentSpreads2] = getFieldsAndFragmentSpreads(context, cachedFieldsAndFragmentSpreads, parentType2, selectionSet2, varMap2);
  collectConflictsBetween(context, conflicts, cachedFieldsAndFragmentSpreads, comparedFieldsAndFragmentPairs, comparedFragmentPairs, areMutuallyExclusive, fieldMap1, varMap1, fieldMap2, varMap2);
  for (const fragmentSpread2 of fragmentSpreads2) {
    collectConflictsBetweenFieldsAndFragment(context, conflicts, cachedFieldsAndFragmentSpreads, comparedFieldsAndFragmentPairs, comparedFragmentPairs, areMutuallyExclusive, fieldMap1, fragmentSpread2);
  }
  for (const fragmentSpread1 of fragmentSpreads1) {
    collectConflictsBetweenFieldsAndFragment(context, conflicts, cachedFieldsAndFragmentSpreads, comparedFieldsAndFragmentPairs, comparedFragmentPairs, areMutuallyExclusive, fieldMap2, fragmentSpread1);
  }
  for (const fragmentSpread1 of fragmentSpreads1) {
    for (const fragmentSpread2 of fragmentSpreads2) {
      collectConflictsBetweenFragments(context, conflicts, cachedFieldsAndFragmentSpreads, comparedFieldsAndFragmentPairs, comparedFragmentPairs, areMutuallyExclusive, fragmentSpread1, fragmentSpread2);
    }
  }
  return conflicts;
}
function collectConflictsWithin(context, conflicts, cachedFieldsAndFragmentSpreads, comparedFieldsAndFragmentPairs, comparedFragmentPairs, fieldMap) {
  for (const [responseName, fields] of fieldMap.entries()) {
    if (fields.length > 1) {
      for (let i = 0; i < fields.length; i++) {
        for (let j = i + 1; j < fields.length; j++) {
          const conflict = findConflict(context, cachedFieldsAndFragmentSpreads, comparedFieldsAndFragmentPairs, comparedFragmentPairs, false, responseName, fields[i], void 0, fields[j], void 0);
          if (conflict) {
            conflicts.push(conflict);
          }
        }
      }
    }
  }
}
function collectConflictsBetween(context, conflicts, cachedFieldsAndFragmentSpreads, comparedFieldsAndFragmentPairs, comparedFragmentPairs, parentFieldsAreMutuallyExclusive, fieldMap1, varMap1, fieldMap2, varMap2) {
  for (const [responseName, fields1] of fieldMap1.entries()) {
    const fields2 = fieldMap2.get(responseName);
    if (fields2 != null) {
      for (const field1 of fields1) {
        for (const field2 of fields2) {
          const conflict = findConflict(context, cachedFieldsAndFragmentSpreads, comparedFieldsAndFragmentPairs, comparedFragmentPairs, parentFieldsAreMutuallyExclusive, responseName, field1, varMap1, field2, varMap2);
          if (conflict) {
            conflicts.push(conflict);
          }
        }
      }
    }
  }
}
function findConflict(context, cachedFieldsAndFragmentSpreads, comparedFieldsAndFragmentPairs, comparedFragmentPairs, parentFieldsAreMutuallyExclusive, responseName, field1, varMap1, field2, varMap2) {
  const [parentType1, node1, def1] = field1;
  const [parentType2, node2, def2] = field2;
  const areMutuallyExclusive = parentFieldsAreMutuallyExclusive || parentType1 !== parentType2 && isObjectType(parentType1) && isObjectType(parentType2);
  if (!areMutuallyExclusive) {
    const name1 = node1.name.value;
    const name2 = node2.name.value;
    if (name1 !== name2) {
      return [
        [responseName, `"${name1}" and "${name2}" are different fields`],
        [node1],
        [node2]
      ];
    }
    if (!sameArguments(node1.arguments, varMap1, node2.arguments, varMap2)) {
      return [
        [responseName, "they have differing arguments"],
        [node1],
        [node2]
      ];
    }
  }
  const directives1 = node1.directives;
  const directives2 = node2.directives;
  const overlappingStreamReason = hasNoOverlappingStreams(directives1, varMap1, directives2, varMap2);
  if (overlappingStreamReason !== void 0) {
    return [[responseName, overlappingStreamReason], [node1], [node2]];
  }
  const type1 = def1?.type;
  const type2 = def2?.type;
  if (type1 && type2 && doTypesConflict(type1, type2)) {
    return [
      [
        responseName,
        `they return conflicting types "${inspect(type1)}" and "${inspect(type2)}"`
      ],
      [node1],
      [node2]
    ];
  }
  const selectionSet1 = node1.selectionSet;
  const selectionSet2 = node2.selectionSet;
  if (selectionSet1 && selectionSet2) {
    const conflicts = findConflictsBetweenSubSelectionSets(context, cachedFieldsAndFragmentSpreads, comparedFieldsAndFragmentPairs, comparedFragmentPairs, areMutuallyExclusive, getNamedType(type1), selectionSet1, varMap1, getNamedType(type2), selectionSet2, varMap2);
    return subfieldConflicts(conflicts, responseName, node1, node2);
  }
}
function sameArguments(args1, varMap1, args2, varMap2) {
  if (args1 === void 0 || args1.length === 0) {
    return args2 === void 0 || args2.length === 0;
  }
  if (args2 === void 0 || args2.length === 0) {
    return false;
  }
  if (args1.length !== args2.length) {
    return false;
  }
  const values2 = new Map(args2.map(({ name, value }) => [
    name.value,
    varMap2 === void 0 ? value : replaceFragmentVariables(value, varMap2)
  ]));
  return args1.every((arg1) => {
    let value1 = arg1.value;
    if (varMap1) {
      value1 = replaceFragmentVariables(value1, varMap1);
    }
    const value2 = values2.get(arg1.name.value);
    if (value2 === void 0) {
      return false;
    }
    return stringifyValue(value1) === stringifyValue(value2);
  });
}
function replaceFragmentVariables(valueNode, varMap) {
  switch (valueNode.kind) {
    case kinds_exports.VARIABLE:
      return varMap.get(valueNode.name.value) ?? valueNode;
    case kinds_exports.LIST:
      return {
        ...valueNode,
        values: valueNode.values.map((node) => replaceFragmentVariables(node, varMap))
      };
    case kinds_exports.OBJECT:
      return {
        ...valueNode,
        fields: valueNode.fields.map((field) => ({
          ...field,
          value: replaceFragmentVariables(field.value, varMap)
        }))
      };
    default: {
      return valueNode;
    }
  }
}
function stringifyValue(value) {
  return print(sortValueNode(value));
}
function getStreamDirective(directives) {
  return directives?.find((directive) => directive.name.value === "stream");
}
function hasNoOverlappingStreams(directives1, varMap1, directives2, varMap2) {
  const stream1 = getStreamDirective(directives1);
  const stream2 = getStreamDirective(directives2);
  if (!stream1 && !stream2) {
    return;
  } else if (stream1 && stream2) {
    if (sameArguments(stream1.arguments, varMap1, stream2.arguments, varMap2)) {
      return "they have overlapping stream directives. See https://github.com/graphql/defer-stream-wg/discussions/100";
    }
    return "they have overlapping stream directives";
  }
  return "they have overlapping stream directives";
}
function doTypesConflict(type1, type2) {
  if (isListType(type1)) {
    return isListType(type2) ? doTypesConflict(type1.ofType, type2.ofType) : true;
  }
  if (isListType(type2)) {
    return true;
  }
  if (isNonNullType(type1)) {
    return isNonNullType(type2) ? doTypesConflict(type1.ofType, type2.ofType) : true;
  }
  if (isNonNullType(type2)) {
    return true;
  }
  if (isLeafType(type1) || isLeafType(type2)) {
    return type1 !== type2;
  }
  return false;
}
function getFieldsAndFragmentSpreads(context, cachedFieldsAndFragmentSpreads, parentType, selectionSet, varMap) {
  const cached = cachedFieldsAndFragmentSpreads.get(selectionSet);
  if (cached) {
    return cached;
  }
  const nodeAndDefs = /* @__PURE__ */ new Map();
  const fragmentSpreads = /* @__PURE__ */ new Map();
  _collectFieldsAndFragmentSpreads(context, parentType, selectionSet, nodeAndDefs, fragmentSpreads, varMap);
  const result = [
    nodeAndDefs,
    Array.from(fragmentSpreads.values())
  ];
  cachedFieldsAndFragmentSpreads.set(selectionSet, result);
  return result;
}
function getReferencedFieldsAndFragmentSpreads(context, cachedFieldsAndFragmentSpreads, fragment, varMap) {
  const cached = cachedFieldsAndFragmentSpreads.get(fragment.selectionSet);
  if (cached) {
    return cached;
  }
  const fragmentType = typeFromAST(context.getSchema(), fragment.typeCondition);
  return getFieldsAndFragmentSpreads(context, cachedFieldsAndFragmentSpreads, fragmentType, fragment.selectionSet, varMap);
}
function _collectFieldsAndFragmentSpreads(context, parentType, selectionSet, nodeAndDefs, fragmentSpreads, varMap) {
  for (const selection of selectionSet.selections) {
    switch (selection.kind) {
      case kinds_exports.FIELD: {
        const fieldName = selection.name.value;
        let fieldDef;
        if (isObjectType(parentType) || isInterfaceType(parentType)) {
          fieldDef = parentType.getFields()[fieldName];
        }
        const responseName = selection.alias ? selection.alias.value : fieldName;
        let nodeAndDefsList = nodeAndDefs.get(responseName);
        if (nodeAndDefsList == null) {
          nodeAndDefsList = [];
          nodeAndDefs.set(responseName, nodeAndDefsList);
        }
        nodeAndDefsList.push([parentType, selection, fieldDef]);
        break;
      }
      case kinds_exports.FRAGMENT_SPREAD: {
        const fragmentSpread = getFragmentSpread(context, selection, varMap);
        fragmentSpreads.set(fragmentSpread.key, fragmentSpread);
        break;
      }
      case kinds_exports.INLINE_FRAGMENT: {
        const typeCondition = selection.typeCondition;
        const inlineFragmentType = typeCondition ? typeFromAST(context.getSchema(), typeCondition) : parentType;
        _collectFieldsAndFragmentSpreads(context, inlineFragmentType, selection.selectionSet, nodeAndDefs, fragmentSpreads, varMap);
        break;
      }
    }
  }
}
function getFragmentSpread(context, fragmentSpreadNode, varMap) {
  let key = "";
  const newVarMap = /* @__PURE__ */ new Map();
  const fragmentSignature = context.getFragmentSignatureByName()(fragmentSpreadNode.name.value);
  const argMap = /* @__PURE__ */ new Map();
  if (fragmentSpreadNode.arguments) {
    for (const arg of fragmentSpreadNode.arguments) {
      argMap.set(arg.name.value, arg.value);
    }
  }
  if (fragmentSignature?.variableDefinitions) {
    key += fragmentSpreadNode.name.value + "(";
    for (const [varName, variable] of fragmentSignature.variableDefinitions) {
      const value = argMap.get(varName);
      if (value) {
        key += varName + ": " + print(sortValueNode(value));
      }
      const arg = argMap.get(varName);
      if (arg !== void 0) {
        newVarMap.set(varName, varMap !== void 0 ? replaceFragmentVariables(arg, varMap) : arg);
      } else if (variable.defaultValue) {
        newVarMap.set(varName, variable.defaultValue);
      }
    }
    key += ")";
  }
  return {
    key,
    node: fragmentSpreadNode,
    varMap: newVarMap.size > 0 ? newVarMap : void 0
  };
}
function subfieldConflicts(conflicts, responseName, node1, node2) {
  if (conflicts.length > 0) {
    return [
      [responseName, conflicts.map(([reason]) => reason)],
      [node1, ...conflicts.map(([, fields1]) => fields1).flat()],
      [node2, ...conflicts.map(([, , fields2]) => fields2).flat()]
    ];
  }
}
var OrderedPairSet = class {
  constructor() {
    this._data = /* @__PURE__ */ new Map();
  }
  has(a, b, weaklyPresent) {
    const result = this._data.get(a)?.get(b);
    if (result === void 0) {
      return false;
    }
    return weaklyPresent ? true : weaklyPresent === result;
  }
  add(a, b, weaklyPresent) {
    const map = this._data.get(a);
    if (map === void 0) {
      this._data.set(a, /* @__PURE__ */ new Map([[b, weaklyPresent]]));
    } else {
      map.set(b, weaklyPresent);
    }
  }
};
var PairSet = class {
  constructor() {
    this._orderedPairSet = new OrderedPairSet();
  }
  has(a, b, weaklyPresent) {
    return a < b ? this._orderedPairSet.has(a, b, weaklyPresent) : this._orderedPairSet.has(b, a, weaklyPresent);
  }
  add(a, b, weaklyPresent) {
    if (a < b) {
      this._orderedPairSet.add(a, b, weaklyPresent);
    } else {
      this._orderedPairSet.add(b, a, weaklyPresent);
    }
  }
};

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/PossibleFragmentSpreadsRule.mjs
function PossibleFragmentSpreadsRule(context) {
  return {
    InlineFragment(node) {
      const fragType = context.getType();
      const parentType = context.getParentType();
      if (isCompositeType(fragType) && isCompositeType(parentType) && !doTypesOverlap(context.getSchema(), fragType, parentType)) {
        const parentTypeStr = inspect(parentType);
        const fragTypeStr = inspect(fragType);
        context.reportError(new GraphQLError(`Fragment cannot be spread here as objects of type "${parentTypeStr}" can never be of type "${fragTypeStr}".`, { nodes: node }));
      }
    },
    FragmentSpread(node) {
      const fragName = node.name.value;
      const fragType = getFragmentType(context, fragName);
      const parentType = context.getParentType();
      if (fragType && parentType && !doTypesOverlap(context.getSchema(), fragType, parentType)) {
        const parentTypeStr = inspect(parentType);
        const fragTypeStr = inspect(fragType);
        context.reportError(new GraphQLError(`Fragment "${fragName}" cannot be spread here as objects of type "${parentTypeStr}" can never be of type "${fragTypeStr}".`, { nodes: node }));
      }
    }
  };
}
function getFragmentType(context, name) {
  const frag = context.getFragment(name);
  if (frag) {
    const type = typeFromAST(context.getSchema(), frag.typeCondition);
    if (isCompositeType(type)) {
      return type;
    }
  }
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/PossibleTypeExtensionsRule.mjs
function PossibleTypeExtensionsRule(context) {
  const schema2 = context.getSchema();
  const definedTypes = /* @__PURE__ */ new Map();
  for (const def of context.getDocument().definitions) {
    if (isTypeDefinitionNode(def)) {
      definedTypes.set(def.name.value, def);
    }
  }
  return {
    ScalarTypeExtension: checkExtension,
    ObjectTypeExtension: checkExtension,
    InterfaceTypeExtension: checkExtension,
    UnionTypeExtension: checkExtension,
    EnumTypeExtension: checkExtension,
    InputObjectTypeExtension: checkExtension
  };
  function checkExtension(node) {
    const typeName = node.name.value;
    const defNode = definedTypes.get(typeName);
    const existingType = schema2?.getType(typeName);
    let expectedKind;
    if (defNode != null) {
      expectedKind = defKindToExtKind[defNode.kind];
    } else if (existingType) {
      expectedKind = typeToExtKind(existingType);
    }
    if (expectedKind != null) {
      if (expectedKind !== node.kind) {
        const kindStr = extensionKindToTypeName(node.kind);
        context.reportError(new GraphQLError(`Cannot extend non-${kindStr} type "${typeName}".`, {
          nodes: defNode ? [defNode, node] : node
        }));
      }
    } else {
      const allTypeNames = [
        ...definedTypes.keys(),
        ...Object.keys(schema2?.getTypeMap() ?? {})
      ];
      context.reportError(new GraphQLError(`Cannot extend type "${typeName}" because it is not defined.` + didYouMean(suggestionList(typeName, allTypeNames)), { nodes: node.name }));
    }
  }
}
var defKindToExtKind = {
  [kinds_exports.SCALAR_TYPE_DEFINITION]: kinds_exports.SCALAR_TYPE_EXTENSION,
  [kinds_exports.OBJECT_TYPE_DEFINITION]: kinds_exports.OBJECT_TYPE_EXTENSION,
  [kinds_exports.INTERFACE_TYPE_DEFINITION]: kinds_exports.INTERFACE_TYPE_EXTENSION,
  [kinds_exports.UNION_TYPE_DEFINITION]: kinds_exports.UNION_TYPE_EXTENSION,
  [kinds_exports.ENUM_TYPE_DEFINITION]: kinds_exports.ENUM_TYPE_EXTENSION,
  [kinds_exports.INPUT_OBJECT_TYPE_DEFINITION]: kinds_exports.INPUT_OBJECT_TYPE_EXTENSION
};
function typeToExtKind(type) {
  if (isScalarType(type)) {
    return kinds_exports.SCALAR_TYPE_EXTENSION;
  }
  if (isObjectType(type)) {
    return kinds_exports.OBJECT_TYPE_EXTENSION;
  }
  if (isInterfaceType(type)) {
    return kinds_exports.INTERFACE_TYPE_EXTENSION;
  }
  if (isUnionType(type)) {
    return kinds_exports.UNION_TYPE_EXTENSION;
  }
  if (isEnumType(type)) {
    return kinds_exports.ENUM_TYPE_EXTENSION;
  }
  if (isInputObjectType(type)) {
    return kinds_exports.INPUT_OBJECT_TYPE_EXTENSION;
  }
  invariant(false, "Unexpected type: " + inspect(type));
}
function extensionKindToTypeName(kind) {
  switch (kind) {
    case kinds_exports.SCALAR_TYPE_EXTENSION:
      return "scalar";
    case kinds_exports.OBJECT_TYPE_EXTENSION:
      return "object";
    case kinds_exports.INTERFACE_TYPE_EXTENSION:
      return "interface";
    case kinds_exports.UNION_TYPE_EXTENSION:
      return "union";
    case kinds_exports.ENUM_TYPE_EXTENSION:
      return "enum";
    case kinds_exports.INPUT_OBJECT_TYPE_EXTENSION:
      return "input object";
    default:
      invariant(false, "Unexpected kind: " + inspect(kind));
  }
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/ProvidedRequiredArgumentsRule.mjs
function ProvidedRequiredArgumentsRule(context) {
  return {
    ...ProvidedRequiredArgumentsOnDirectivesRule(context),
    Field: {
      leave(fieldNode) {
        const fieldDef = context.getFieldDef();
        if (!fieldDef) {
          return false;
        }
        const providedArgs = new Set(fieldNode.arguments?.map((arg) => arg.name.value));
        for (const argDef of fieldDef.args) {
          if (!providedArgs.has(argDef.name) && isRequiredArgument(argDef)) {
            context.reportError(new GraphQLError(`Argument "${argDef}" of type "${argDef.type}" is required, but it was not provided.`, { nodes: fieldNode }));
          }
        }
      }
    },
    FragmentSpread: {
      leave(spreadNode) {
        const fragmentSignature = context.getFragmentSignature();
        if (!fragmentSignature) {
          return false;
        }
        const providedArgs = new Set(spreadNode.arguments?.map((arg) => arg.name.value));
        for (const [varName, variableDefinition] of fragmentSignature.variableDefinitions) {
          if (!providedArgs.has(varName) && isRequiredArgumentNode(variableDefinition)) {
            const type = typeFromAST(context.getSchema(), variableDefinition.type);
            const argTypeStr = inspect(type);
            context.reportError(new GraphQLError(`Fragment "${spreadNode.name.value}" argument "${varName}" of type "${argTypeStr}" is required, but it was not provided.`, { nodes: spreadNode }));
          }
        }
      }
    }
  };
}
function ProvidedRequiredArgumentsOnDirectivesRule(context) {
  const requiredArgsMap = /* @__PURE__ */ new Map();
  const schema2 = context.getSchema();
  const definedDirectives = schema2?.getDirectives() ?? specifiedDirectives;
  for (const directive of definedDirectives) {
    requiredArgsMap.set(directive.name, new Map(directive.args.filter(isRequiredArgument).map((arg) => [arg.name, arg])));
  }
  const astDefinitions = context.getDocument().definitions;
  for (const def of astDefinitions) {
    if (def.kind === kinds_exports.DIRECTIVE_DEFINITION) {
      const argNodes = def.arguments ?? [];
      requiredArgsMap.set(def.name.value, new Map(argNodes.filter(isRequiredArgumentNode).map((arg) => [arg.name.value, arg])));
    }
  }
  return {
    Directive: {
      leave(directiveNode) {
        const directiveName = directiveNode.name.value;
        const requiredArgs = requiredArgsMap.get(directiveName);
        if (requiredArgs != null) {
          const argNodes = directiveNode.arguments ?? [];
          const argNodeMap = new Set(argNodes.map((arg) => arg.name.value));
          for (const [argName, argDef] of requiredArgs.entries()) {
            if (!argNodeMap.has(argName)) {
              const argType = isType(argDef.type) ? inspect(argDef.type) : print(argDef.type);
              context.reportError(new GraphQLError(`Argument "@${directiveName}(${argName}:)" of type "${argType}" is required, but it was not provided.`, { nodes: directiveNode }));
            }
          }
        }
      }
    }
  };
}
function isRequiredArgumentNode(arg) {
  return arg.type.kind === kinds_exports.NON_NULL_TYPE && arg.defaultValue == null;
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/ScalarLeafsRule.mjs
function ScalarLeafsRule(context) {
  return {
    Field(node) {
      const type = context.getType();
      const selectionSet = node.selectionSet;
      if (type) {
        if (isLeafType(getNamedType(type))) {
          if (selectionSet) {
            const fieldName = node.name.value;
            const typeStr = inspect(type);
            context.reportError(new GraphQLError(`Field "${fieldName}" must not have a selection since type "${typeStr}" has no subfields.`, { nodes: selectionSet }));
          }
        } else if (!selectionSet) {
          const fieldName = node.name.value;
          const typeStr = inspect(type);
          context.reportError(new GraphQLError(`Field "${fieldName}" of type "${typeStr}" must have a selection of subfields. Did you mean "${fieldName} { ... }"?`, { nodes: node }));
        } else if (selectionSet.selections.length === 0) {
          const fieldName = node.name.value;
          const typeStr = inspect(type);
          context.reportError(new GraphQLError(`Field "${fieldName}" of type "${typeStr}" must have at least one field selected.`, { nodes: node }));
        }
      }
    }
  };
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/utilities/coerceInputValue.mjs
function coerceInputValue(inputValue, type) {
  if (isNonNullType(type)) {
    if (inputValue == null) {
      return;
    }
    return coerceInputValue(inputValue, type.ofType);
  }
  if (inputValue == null) {
    return null;
  }
  if (isListType(type)) {
    if (!isIterableObject(inputValue)) {
      const coercedItem = coerceInputValue(inputValue, type.ofType);
      if (coercedItem === void 0) {
        return;
      }
      return [coercedItem];
    }
    const coercedValue = [];
    for (const itemValue of inputValue) {
      const coercedItem = coerceInputValue(itemValue, type.ofType);
      if (coercedItem === void 0) {
        return;
      }
      coercedValue.push(coercedItem);
    }
    return coercedValue;
  }
  if (isInputObjectType(type)) {
    if (!isObjectLike(inputValue) || Array.isArray(inputValue)) {
      return;
    }
    const coercedValue = /* @__PURE__ */ Object.create(null);
    const fieldDefs = type.getFields();
    let definedFieldCount = 0;
    for (const fieldName of Object.keys(inputValue)) {
      if (inputValue[fieldName] === void 0) {
        continue;
      }
      definedFieldCount++;
      if (!Object.hasOwn(fieldDefs, fieldName)) {
        return;
      }
    }
    for (const field of Object.values(fieldDefs)) {
      const fieldValue = inputValue[field.name];
      if (fieldValue === void 0) {
        if (isRequiredInputField(field)) {
          return;
        }
        const coercedDefaultValue = coerceDefaultValue(field);
        if (coercedDefaultValue !== void 0) {
          coercedValue[field.name] = coercedDefaultValue;
        }
      } else {
        const coercedField = coerceInputValue(fieldValue, field.type);
        if (coercedField === void 0) {
          return;
        }
        coercedValue[field.name] = coercedField;
      }
    }
    if (type.isOneOf) {
      const keys = Object.keys(coercedValue);
      if (definedFieldCount !== 1 || keys.length !== 1) {
        return;
      }
      const key = keys[0];
      const value = coercedValue[key];
      if (value === null) {
        return;
      }
    }
    return coercedValue;
  }
  const leafType = assertLeafType(type);
  try {
    return leafType.coerceInputValue(inputValue);
  } catch (_error) {
  }
}
function coerceInputLiteral(valueNode, type, variableValues, fragmentVariableValues) {
  if (valueNode.kind === kinds_exports.VARIABLE) {
    const coercedVariableValue = getCoercedVariableValue(valueNode, variableValues, fragmentVariableValues);
    if (coercedVariableValue == null && isNonNullType(type)) {
      return;
    }
    return coercedVariableValue;
  }
  if (isNonNullType(type)) {
    if (valueNode.kind === kinds_exports.NULL) {
      return;
    }
    return coerceInputLiteral(valueNode, type.ofType, variableValues, fragmentVariableValues);
  }
  if (valueNode.kind === kinds_exports.NULL) {
    return null;
  }
  if (isListType(type)) {
    if (valueNode.kind !== kinds_exports.LIST) {
      const itemValue = coerceInputLiteral(valueNode, type.ofType, variableValues, fragmentVariableValues);
      if (itemValue === void 0) {
        return;
      }
      return [itemValue];
    }
    const coercedValue = [];
    for (const itemNode of valueNode.values) {
      let itemValue = coerceInputLiteral(itemNode, type.ofType, variableValues, fragmentVariableValues);
      if (itemValue === void 0) {
        if (itemNode.kind === kinds_exports.VARIABLE && getCoercedVariableValue(itemNode, variableValues, fragmentVariableValues) == null && !isNonNullType(type.ofType)) {
          itemValue = null;
        } else {
          return;
        }
      }
      coercedValue.push(itemValue);
    }
    return coercedValue;
  }
  if (isInputObjectType(type)) {
    if (valueNode.kind !== kinds_exports.OBJECT) {
      return;
    }
    const coercedValue = /* @__PURE__ */ Object.create(null);
    const fieldDefs = type.getFields();
    const hasUndefinedField = valueNode.fields.some((field) => !Object.hasOwn(fieldDefs, field.name.value));
    if (hasUndefinedField) {
      return;
    }
    const fieldNodes = new Map(valueNode.fields.map((field) => [field.name.value, field]));
    for (const field of Object.values(fieldDefs)) {
      const fieldNode = fieldNodes.get(field.name);
      if (!fieldNode || fieldNode.value.kind === kinds_exports.VARIABLE && isMissingVariable(fieldNode.value, variableValues, fragmentVariableValues)) {
        if (isRequiredInputField(field)) {
          return;
        }
        const coercedDefaultValue = coerceDefaultValue(field);
        if (coercedDefaultValue !== void 0) {
          coercedValue[field.name] = coercedDefaultValue;
        }
      } else {
        const fieldValue = coerceInputLiteral(fieldNode.value, field.type, variableValues, fragmentVariableValues);
        if (fieldValue === void 0) {
          return;
        }
        coercedValue[field.name] = fieldValue;
      }
    }
    if (type.isOneOf) {
      const coercedKeys = Object.keys(coercedValue);
      if (fieldNodes.size !== 1 || coercedKeys.length !== 1) {
        return;
      }
      for (const [fieldName, fieldNode] of fieldNodes) {
        if (fieldNode.value.kind === kinds_exports.NULL || coercedValue[fieldName] === null) {
          return;
        }
      }
    }
    return coercedValue;
  }
  const leafType = assertLeafType(type);
  try {
    return leafType.coerceInputLiteral ? leafType.coerceInputLiteral(replaceVariables(valueNode, variableValues, fragmentVariableValues)) : leafType.parseLiteral(valueNode, variableValues?.coerced);
  } catch (_error) {
  }
}
function getCoercedVariableValue(variableNode, variableValues, fragmentVariableValues) {
  const varName = variableNode.name.value;
  if (fragmentVariableValues?.sources[varName] !== void 0) {
    return fragmentVariableValues.coerced[varName];
  }
  return variableValues?.coerced[varName];
}
function isMissingVariable(variableNode, variableValues, fragmentVariableValues) {
  const varName = variableNode.name.value;
  const scopedValues = fragmentVariableValues?.sources[varName] !== void 0 ? fragmentVariableValues.coerced : variableValues?.coerced;
  return scopedValues?.[varName] === void 0;
}
function coerceDefaultValue(inputValue) {
  let coercedDefaultValue = inputValue._memoizedCoercedDefaultValue;
  if (coercedDefaultValue !== void 0) {
    return coercedDefaultValue;
  }
  const defaultInput = inputValue.default;
  if (defaultInput !== void 0) {
    coercedDefaultValue = defaultInput.literal ? coerceInputLiteral(defaultInput.literal, inputValue.type) : coerceInputValue(defaultInput.value, inputValue.type);
    if (!(coercedDefaultValue !== void 0))
      invariant(false, `Expected value of type "${inputValue.type}" to be valid, found: ${inspect(defaultInput.literal ?? defaultInput.value)}.`);
    inputValue._memoizedCoercedDefaultValue = coercedDefaultValue;
    return coercedDefaultValue;
  }
  const defaultValue = inputValue.defaultValue;
  if (defaultValue !== void 0) {
    inputValue._memoizedCoercedDefaultValue = defaultValue;
  }
  return defaultValue;
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/execution/getVariableSignature.mjs
function getVariableSignature(schema2, varDefNode) {
  const varName = varDefNode.variable.name.value;
  const varType = typeFromAST(schema2, varDefNode.type);
  if (!isInputType(varType)) {
    const varTypeStr = print(varDefNode.type);
    return new GraphQLError(`Variable "$${varName}" expected value of type "${varTypeStr}" which cannot be used as an input type.`, { nodes: varDefNode.type });
  }
  const defaultValue = varDefNode.defaultValue;
  return {
    name: varName,
    type: varType,
    default: defaultValue && { literal: defaultValue }
  };
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/execution/values.mjs
function getVariableValues(schema2, varDefNodes, inputs, options) {
  const errors = [];
  const maxErrors = options?.maxErrors;
  try {
    const variableValues = coerceVariableValues(schema2, varDefNodes, inputs, (error) => {
      if (maxErrors != null && errors.length >= maxErrors) {
        throw new GraphQLError("Too many errors processing variables, error limit reached. Execution aborted.");
      }
      errors.push(error);
    }, options?.hideSuggestions);
    if (errors.length === 0) {
      return { variableValues };
    }
  } catch (error) {
    errors.push(ensureGraphQLError(error));
  }
  return { errors };
}
function coerceVariableValues(schema2, varDefNodes, inputs, onError, hideSuggestions) {
  const sources = /* @__PURE__ */ Object.create(null);
  const coerced = /* @__PURE__ */ Object.create(null);
  for (const varDefNode of varDefNodes) {
    const varSignature = getVariableSignature(schema2, varDefNode);
    if (varSignature instanceof GraphQLError) {
      onError(varSignature);
      continue;
    }
    const { name: varName, type: varType } = varSignature;
    const value = Object.hasOwn(inputs, varName) ? inputs[varName] : void 0;
    if (value === void 0) {
      sources[varName] = { signature: varSignature };
      if (varDefNode.defaultValue) {
        maybeUseDefaultValue(coerced, varName, varSignature, (error, path) => {
          onError(new GraphQLError(`Variable "$${varName}" has invalid default value${printPathArray(path)}: ${error.message}`, { nodes: varDefNode }));
        }, hideSuggestions);
        continue;
      } else if (!isNonNullType(varType)) {
        continue;
      }
    } else {
      sources[varName] = { signature: varSignature, value };
    }
    const coercedValue = coerceInputValue(value, varType);
    if (coercedValue !== void 0) {
      coerced[varName] = coercedValue;
    } else {
      validateInputValue(value, varType, (error, path) => {
        onError(new GraphQLError(`Variable "$${varName}" has invalid value${printPathArray(path)}: ${error.message}`, { nodes: varDefNode, originalError: error }));
      }, hideSuggestions);
    }
  }
  return { sources, coerced };
}
function maybeUseDefaultValue(coercedValues, name, inputValue, onError, hideSuggestions) {
  try {
    const coercedDefaultValue = coerceDefaultValue(inputValue);
    if (coercedDefaultValue !== void 0) {
      coercedValues[name] = coercedDefaultValue;
    }
  } catch (error) {
    const defaultInput = inputValue.default;
    if (defaultInput === void 0) {
      throw error;
    }
    let reportedValidationError = false;
    validateDefaultInput(defaultInput, inputValue.type, (defaultError, path) => {
      reportedValidationError = true;
      onError(defaultError, path);
    }, hideSuggestions);
    if (!reportedValidationError) {
      onError(ensureGraphQLError(error), []);
    }
  }
}
function getFragmentVariableValues(fragmentSpreadNode, fragmentSignatures, variableValues, fragmentVariableValues, hideSuggestions) {
  const argumentNodes = fragmentSpreadNode.arguments ?? [];
  const argNodeMap = new Map(argumentNodes.map((arg) => [arg.name.value, arg]));
  const sources = /* @__PURE__ */ Object.create(null);
  const coerced = /* @__PURE__ */ Object.create(null);
  for (const [varName, varSignature] of Object.entries(fragmentSignatures)) {
    const argumentNode = argNodeMap.get(varName);
    if (argumentNode !== void 0) {
      sources[varName] = fragmentVariableValues == null ? { signature: varSignature, value: argumentNode.value } : {
        signature: varSignature,
        value: argumentNode.value,
        fragmentVariableValues
      };
    } else {
      sources[varName] = {
        signature: varSignature
      };
    }
    coerceArgument(coerced, fragmentSpreadNode, varName, varSignature, argumentNode, variableValues, fragmentVariableValues, hideSuggestions);
  }
  return { sources, coerced };
}
function getArgumentValues(def, node, variableValues, fragmentVariableValues, hideSuggestions) {
  const coercedValues = /* @__PURE__ */ Object.create(null);
  const argumentNodes = node.arguments ?? [];
  const argNodeMap = new Map(argumentNodes.map((arg) => [arg.name.value, arg]));
  for (const argDef of def.args) {
    const name = argDef.name;
    coerceArgument(coercedValues, node, name, argDef, argNodeMap.get(argDef.name), variableValues, fragmentVariableValues, hideSuggestions);
  }
  return coercedValues;
}
function coerceArgument(coercedValues, node, argName, argDef, argumentNode, variableValues, fragmentVariableValues, hideSuggestions) {
  const argType = argDef.type;
  const onArgDefaultValueError = (error, path) => {
    throw new GraphQLError(`${printArgumentOrFragmentVariable(argDef, node)} has invalid default value${printPathArray(path)}: ${error.message}`, { nodes: node });
  };
  if (!argumentNode) {
    if (isRequiredArgument(argDef)) {
      throw new GraphQLError(`${printArgumentOrFragmentVariable(argDef, node)} of required type "${argType}" was not provided.`, { nodes: node });
    }
    maybeUseDefaultValue(coercedValues, argName, argDef, onArgDefaultValueError, hideSuggestions);
    return;
  }
  const valueNode = argumentNode.value;
  if (valueNode.kind === kinds_exports.VARIABLE) {
    const variableName = valueNode.name.value;
    const scopedVariableValues = fragmentVariableValues?.sources[variableName] ? fragmentVariableValues : variableValues;
    if ((scopedVariableValues == null || !Object.hasOwn(scopedVariableValues.coerced, variableName)) && !isRequiredArgument(argDef)) {
      maybeUseDefaultValue(coercedValues, argName, argDef, onArgDefaultValueError, hideSuggestions);
      return;
    }
  }
  const coercedValue = coerceInputLiteral(valueNode, argType, variableValues, fragmentVariableValues);
  if (coercedValue === void 0) {
    validateInputLiteral(valueNode, argType, (error, path) => {
      error.message = `${printArgumentOrFragmentVariable(argDef, node)} has invalid value${printPathArray(path)}: ${error.message}`;
      throw error;
    }, variableValues, fragmentVariableValues, hideSuggestions);
    invariant(false, "Invalid argument");
  }
  coercedValues[argName] = coercedValue;
}
function printArgumentOrFragmentVariable(argDef, node) {
  return isArgument(argDef) ? `Argument "${argDef}"` : `Variable "$${argDef.name}" defined by fragment "${node.name.value}"`;
}
function getDirectiveValues(directiveDef, node, variableValues, fragmentVariableValues, hideSuggestions) {
  const directiveNode = node.directives?.find((directive) => directive.name.value === directiveDef.name);
  if (directiveNode) {
    return getArgumentValues(directiveDef, directiveNode, variableValues, fragmentVariableValues, hideSuggestions);
  }
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/execution/collectFields.mjs
function collectFields(schema2, fragments, variableValues, runtimeType, selectionSet, hideSuggestions, forbidSkipAndInclude = false) {
  const groupedFieldSet = new AccumulatorMap();
  const newDeferUsages = [];
  const context = {
    schema: schema2,
    fragments,
    variableValues,
    runtimeType,
    visitedFragmentNames: /* @__PURE__ */ new Map(),
    hideSuggestions,
    forbiddenDirectiveInstances: [],
    forbidSkipAndInclude
  };
  collectFieldsImpl(context, selectionSet, groupedFieldSet, newDeferUsages);
  return {
    groupedFieldSet,
    newDeferUsages,
    forbiddenDirectiveInstances: context.forbiddenDirectiveInstances
  };
}
function collectSubfields(schema2, fragments, variableValues, returnType, fieldDetailsList, hideSuggestions) {
  const context = {
    schema: schema2,
    fragments,
    variableValues,
    runtimeType: returnType,
    visitedFragmentNames: /* @__PURE__ */ new Map(),
    hideSuggestions,
    forbiddenDirectiveInstances: [],
    forbidSkipAndInclude: false
  };
  const subGroupedFieldSet = new AccumulatorMap();
  const newDeferUsages = [];
  for (const fieldDetail of fieldDetailsList) {
    const selectionSet = fieldDetail.node.selectionSet;
    if (selectionSet) {
      const { deferUsage, fragmentVariableValues } = fieldDetail;
      collectFieldsImpl(context, selectionSet, subGroupedFieldSet, newDeferUsages, deferUsage, fragmentVariableValues);
    }
  }
  return {
    groupedFieldSet: subGroupedFieldSet,
    newDeferUsages
  };
}
function collectFieldsImpl(context, selectionSet, groupedFieldSet, newDeferUsages, deferUsage, fragmentVariableValues) {
  const { schema: schema2, fragments, variableValues, runtimeType, visitedFragmentNames, hideSuggestions } = context;
  for (const selection of selectionSet.selections) {
    switch (selection.kind) {
      case kinds_exports.FIELD: {
        if (!shouldIncludeNode(context, selection, variableValues, fragmentVariableValues)) {
          continue;
        }
        groupedFieldSet.add(getFieldEntryKey(selection), {
          node: selection,
          deferUsage,
          fragmentVariableValues
        });
        break;
      }
      case kinds_exports.INLINE_FRAGMENT: {
        if (!shouldIncludeNode(context, selection, variableValues, fragmentVariableValues) || !doesFragmentConditionMatch(schema2, selection, runtimeType)) {
          continue;
        }
        const newDeferUsage = getDeferUsage(variableValues, fragmentVariableValues, selection, deferUsage);
        if (!newDeferUsage) {
          collectFieldsImpl(context, selection.selectionSet, groupedFieldSet, newDeferUsages, deferUsage, fragmentVariableValues);
        } else {
          newDeferUsages.push(newDeferUsage);
          collectFieldsImpl(context, selection.selectionSet, groupedFieldSet, newDeferUsages, newDeferUsage, fragmentVariableValues);
        }
        break;
      }
      case kinds_exports.FRAGMENT_SPREAD: {
        const fragName = selection.name.value;
        if (!shouldIncludeNode(context, selection, variableValues, fragmentVariableValues)) {
          continue;
        }
        const fragment = fragments[fragName];
        if (fragment == null || !doesFragmentConditionMatch(schema2, fragment.definition, runtimeType)) {
          continue;
        }
        const newDeferUsage = getDeferUsage(variableValues, fragmentVariableValues, selection, deferUsage);
        const visitedAsDeferred = visitedFragmentNames.get(fragName);
        let maybeNewDeferUsage;
        if (!newDeferUsage) {
          if (visitedAsDeferred === false) {
            continue;
          }
          visitedFragmentNames.set(fragName, false);
          maybeNewDeferUsage = deferUsage;
        } else {
          if (visitedAsDeferred !== void 0) {
            continue;
          }
          visitedFragmentNames.set(fragName, true);
          newDeferUsages.push(newDeferUsage);
          maybeNewDeferUsage = newDeferUsage;
        }
        const fragmentVariableSignatures = fragment.variableSignatures;
        let newFragmentVariableValues;
        if (fragmentVariableSignatures) {
          newFragmentVariableValues = getFragmentVariableValues(selection, fragmentVariableSignatures, variableValues, fragmentVariableValues, hideSuggestions);
        }
        collectFieldsImpl(context, fragment.definition.selectionSet, groupedFieldSet, newDeferUsages, maybeNewDeferUsage, newFragmentVariableValues);
        break;
      }
    }
  }
}
function getDeferUsage(variableValues, fragmentVariableValues, node, parentDeferUsage) {
  const defer = getDirectiveValues(GraphQLDeferDirective, node, variableValues, fragmentVariableValues);
  if (!defer) {
    return;
  }
  if (defer.if === false) {
    return;
  }
  return {
    label: typeof defer.label === "string" ? defer.label : void 0,
    parentDeferUsage
  };
}
function shouldIncludeNode(context, node, variableValues, fragmentVariableValues) {
  const skipDirectiveNode = node.directives?.find((directive) => directive.name.value === GraphQLSkipDirective.name);
  if (skipDirectiveNode && context.forbidSkipAndInclude) {
    context.forbiddenDirectiveInstances.push(skipDirectiveNode);
    return false;
  }
  const skip = skipDirectiveNode ? getArgumentValues(GraphQLSkipDirective, skipDirectiveNode, variableValues, fragmentVariableValues, context.hideSuggestions) : void 0;
  if (skip?.if === true) {
    return false;
  }
  const includeDirectiveNode = node.directives?.find((directive) => directive.name.value === GraphQLIncludeDirective.name);
  if (includeDirectiveNode && context.forbidSkipAndInclude) {
    context.forbiddenDirectiveInstances.push(includeDirectiveNode);
    return false;
  }
  const include = includeDirectiveNode ? getArgumentValues(GraphQLIncludeDirective, includeDirectiveNode, variableValues, fragmentVariableValues, context.hideSuggestions) : void 0;
  if (include?.if === false) {
    return false;
  }
  return true;
}
function doesFragmentConditionMatch(schema2, fragment, type) {
  const typeConditionNode = fragment.typeCondition;
  if (!typeConditionNode) {
    return true;
  }
  const conditionalType = typeFromAST(schema2, typeConditionNode);
  if (conditionalType === type) {
    return true;
  }
  if (isAbstractType(conditionalType)) {
    return schema2.isSubType(conditionalType, type);
  }
  return false;
}
function getFieldEntryKey(node) {
  return node.alias ? node.alias.value : node.name.value;
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/SingleFieldSubscriptionsRule.mjs
function toNodes(fieldDetailsList) {
  return fieldDetailsList.map((fieldDetails) => fieldDetails.node);
}
function SingleFieldSubscriptionsRule(context) {
  return {
    OperationDefinition(node) {
      if (node.operation === "subscription") {
        const schema2 = context.getSchema();
        const subscriptionType = schema2.getSubscriptionType();
        if (subscriptionType) {
          const operationName = node.name ? node.name.value : null;
          const variableValues = /* @__PURE__ */ Object.create(null);
          const document = context.getDocument();
          const fragments = /* @__PURE__ */ Object.create(null);
          for (const definition of document.definitions) {
            if (definition.kind === kinds_exports.FRAGMENT_DEFINITION) {
              fragments[definition.name.value] = { definition };
            }
          }
          const { groupedFieldSet, forbiddenDirectiveInstances } = collectFields(schema2, fragments, variableValues, subscriptionType, node.selectionSet, context.hideSuggestions, true);
          if (forbiddenDirectiveInstances.length > 0) {
            context.reportError(new GraphQLError(operationName != null ? `Subscription "${operationName}" must not use \`@skip\` or \`@include\` directives in the top level selection.` : "Anonymous Subscription must not use `@skip` or `@include` directives in the top level selection.", { nodes: forbiddenDirectiveInstances }));
            return;
          }
          if (groupedFieldSet.size > 1) {
            const fieldDetailsLists = [...groupedFieldSet.values()];
            const extraFieldDetailsLists = fieldDetailsLists.slice(1);
            const extraFieldSelections = extraFieldDetailsLists.flatMap((fieldDetailsList) => toNodes(fieldDetailsList));
            context.reportError(new GraphQLError(operationName != null ? `Subscription "${operationName}" must select only one top level field.` : "Anonymous Subscription must select only one top level field.", { nodes: extraFieldSelections }));
          }
          for (const fieldDetailsList of groupedFieldSet.values()) {
            const fieldName = toNodes(fieldDetailsList)[0].name.value;
            if (fieldName.startsWith("__")) {
              context.reportError(new GraphQLError(operationName != null ? `Subscription "${operationName}" must not select an introspection top level field.` : "Anonymous Subscription must not select an introspection top level field.", { nodes: toNodes(fieldDetailsList) }));
            }
          }
        }
      }
    }
  };
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/StreamDirectiveOnListFieldRule.mjs
function StreamDirectiveOnListFieldRule(context) {
  return {
    Directive(node) {
      const fieldDef = context.getFieldDef();
      const parentType = context.getParentType();
      if (fieldDef && parentType && node.name.value === GraphQLStreamDirective.name && !(isListType(fieldDef.type) || isWrappingType(fieldDef.type) && isListType(fieldDef.type.ofType))) {
        context.reportError(new GraphQLError(`Directive "@stream" cannot be used on non-list field "${parentType}.${fieldDef.name}".`, { nodes: node }));
      }
    }
  };
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/jsutils/groupBy.mjs
function groupBy(list, keyFn) {
  const result = new AccumulatorMap();
  for (const item of list) {
    result.add(keyFn(item), item);
  }
  return result;
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/UniqueArgumentDefinitionNamesRule.mjs
function UniqueArgumentDefinitionNamesRule(context) {
  return {
    DirectiveDefinition(directiveNode) {
      const argumentNodes = directiveNode.arguments ?? [];
      return checkArgUniqueness(`@${directiveNode.name.value}`, argumentNodes);
    },
    InterfaceTypeDefinition: checkArgUniquenessPerField,
    InterfaceTypeExtension: checkArgUniquenessPerField,
    ObjectTypeDefinition: checkArgUniquenessPerField,
    ObjectTypeExtension: checkArgUniquenessPerField
  };
  function checkArgUniquenessPerField(typeNode) {
    const typeName = typeNode.name.value;
    const fieldNodes = typeNode.fields ?? [];
    for (const fieldDef of fieldNodes) {
      const fieldName = fieldDef.name.value;
      const argumentNodes = fieldDef.arguments ?? [];
      checkArgUniqueness(`${typeName}.${fieldName}`, argumentNodes);
    }
    return false;
  }
  function checkArgUniqueness(parentName, argumentNodes) {
    const seenArgs = groupBy(argumentNodes, (arg) => arg.name.value);
    for (const [argName, argNodes] of seenArgs) {
      if (argNodes.length > 1) {
        context.reportError(new GraphQLError(`Argument "${parentName}(${argName}:)" can only be defined once.`, { nodes: argNodes.map((node) => node.name) }));
      }
    }
    return false;
  }
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/UniqueArgumentNamesRule.mjs
function UniqueArgumentNamesRule(context) {
  return {
    Field: checkArgUniqueness,
    Directive: checkArgUniqueness
  };
  function checkArgUniqueness(parentNode) {
    const argumentNodes = parentNode.arguments ?? [];
    const seenArgs = groupBy(argumentNodes, (arg) => arg.name.value);
    for (const [argName, argNodes] of seenArgs) {
      if (argNodes.length > 1) {
        context.reportError(new GraphQLError(`There can be only one argument named "${argName}".`, { nodes: argNodes.map((node) => node.name) }));
      }
    }
  }
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/UniqueDirectiveNamesRule.mjs
function UniqueDirectiveNamesRule(context) {
  const knownDirectiveNames = /* @__PURE__ */ new Map();
  const schema2 = context.getSchema();
  return {
    DirectiveDefinition(node) {
      const directiveName = node.name.value;
      if (schema2?.getDirective(directiveName)) {
        context.reportError(new GraphQLError(`Directive "@${directiveName}" already exists in the schema. It cannot be redefined.`, { nodes: node.name }));
        return;
      }
      const knownName = knownDirectiveNames.get(directiveName);
      if (knownName) {
        context.reportError(new GraphQLError(`There can be only one directive named "@${directiveName}".`, { nodes: [knownName, node.name] }));
      } else {
        knownDirectiveNames.set(directiveName, node.name);
      }
      return false;
    }
  };
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/UniqueDirectivesPerLocationRule.mjs
function UniqueDirectivesPerLocationRule(context) {
  const uniqueDirectiveMap = /* @__PURE__ */ new Map();
  const schema2 = context.getSchema();
  const definedDirectives = schema2 ? schema2.getDirectives() : specifiedDirectives;
  for (const directive of definedDirectives) {
    uniqueDirectiveMap.set(directive.name, !directive.isRepeatable);
  }
  const astDefinitions = context.getDocument().definitions;
  for (const def of astDefinitions) {
    if (def.kind === kinds_exports.DIRECTIVE_DEFINITION) {
      uniqueDirectiveMap.set(def.name.value, !def.repeatable);
    }
  }
  const schemaDirectives = /* @__PURE__ */ new Map();
  const typeDirectivesMap = /* @__PURE__ */ new Map();
  const directiveDirectivesMap = /* @__PURE__ */ new Map();
  return {
    enter(node) {
      if (!("directives" in node) || !node.directives) {
        return;
      }
      let seenDirectives;
      if (node.kind === kinds_exports.SCHEMA_DEFINITION || node.kind === kinds_exports.SCHEMA_EXTENSION) {
        seenDirectives = schemaDirectives;
      } else if (isTypeDefinitionNode(node) || isTypeExtensionNode(node)) {
        const typeName = node.name.value;
        seenDirectives = typeDirectivesMap.get(typeName);
        if (seenDirectives === void 0) {
          seenDirectives = /* @__PURE__ */ new Map();
          typeDirectivesMap.set(typeName, seenDirectives);
        }
      } else if (node.kind === kinds_exports.DIRECTIVE_DEFINITION || node.kind === kinds_exports.DIRECTIVE_EXTENSION) {
        const directiveName = node.name.value;
        seenDirectives = directiveDirectivesMap.get(directiveName);
        if (seenDirectives === void 0) {
          seenDirectives = /* @__PURE__ */ new Map();
          directiveDirectivesMap.set(directiveName, seenDirectives);
        }
      } else {
        seenDirectives = /* @__PURE__ */ new Map();
      }
      for (const directive of node.directives) {
        const directiveName = directive.name.value;
        if (uniqueDirectiveMap.get(directiveName) === true) {
          const seenDirective = seenDirectives.get(directiveName);
          if (seenDirective != null) {
            context.reportError(new GraphQLError(`The directive "@${directiveName}" can only be used once at this location.`, { nodes: [seenDirective, directive] }));
          } else {
            seenDirectives.set(directiveName, directive);
          }
        }
      }
    }
  };
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/UniqueEnumValueNamesRule.mjs
function UniqueEnumValueNamesRule(context) {
  const schema2 = context.getSchema();
  const existingTypeMap = schema2 ? schema2.getTypeMap() : /* @__PURE__ */ Object.create(null);
  const knownValueNames = /* @__PURE__ */ new Map();
  return {
    EnumTypeDefinition: checkValueUniqueness,
    EnumTypeExtension: checkValueUniqueness
  };
  function checkValueUniqueness(node) {
    const typeName = node.name.value;
    let valueNames = knownValueNames.get(typeName);
    if (valueNames == null) {
      valueNames = /* @__PURE__ */ new Map();
      knownValueNames.set(typeName, valueNames);
    }
    const valueNodes = node.values ?? [];
    for (const valueDef of valueNodes) {
      const valueName = valueDef.name.value;
      const existingType = existingTypeMap[typeName];
      if (isEnumType(existingType) && existingType.getValue(valueName)) {
        context.reportError(new GraphQLError(`Enum value "${typeName}.${valueName}" already exists in the schema. It cannot also be defined in this type extension.`, { nodes: valueDef.name }));
        continue;
      }
      const knownValueName = valueNames.get(valueName);
      if (knownValueName != null) {
        context.reportError(new GraphQLError(`Enum value "${typeName}.${valueName}" can only be defined once.`, { nodes: [knownValueName, valueDef.name] }));
      } else {
        valueNames.set(valueName, valueDef.name);
      }
    }
    return false;
  }
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/UniqueFieldDefinitionNamesRule.mjs
function UniqueFieldDefinitionNamesRule(context) {
  const schema2 = context.getSchema();
  const existingTypeMap = schema2 ? schema2.getTypeMap() : /* @__PURE__ */ Object.create(null);
  const knownFieldNames = /* @__PURE__ */ new Map();
  return {
    InputObjectTypeDefinition: checkFieldUniqueness,
    InputObjectTypeExtension: checkFieldUniqueness,
    InterfaceTypeDefinition: checkFieldUniqueness,
    InterfaceTypeExtension: checkFieldUniqueness,
    ObjectTypeDefinition: checkFieldUniqueness,
    ObjectTypeExtension: checkFieldUniqueness
  };
  function checkFieldUniqueness(node) {
    const typeName = node.name.value;
    let fieldNames = knownFieldNames.get(typeName);
    if (fieldNames == null) {
      fieldNames = /* @__PURE__ */ new Map();
      knownFieldNames.set(typeName, fieldNames);
    }
    const fieldNodes = node.fields ?? [];
    for (const fieldDef of fieldNodes) {
      const fieldName = fieldDef.name.value;
      if (hasField(existingTypeMap[typeName], fieldName)) {
        context.reportError(new GraphQLError(`Field "${typeName}.${fieldName}" already exists in the schema. It cannot also be defined in this type extension.`, { nodes: fieldDef.name }));
        continue;
      }
      const knownFieldName = fieldNames.get(fieldName);
      if (knownFieldName != null) {
        context.reportError(new GraphQLError(`Field "${typeName}.${fieldName}" can only be defined once.`, { nodes: [knownFieldName, fieldDef.name] }));
      } else {
        fieldNames.set(fieldName, fieldDef.name);
      }
    }
    return false;
  }
}
function hasField(type, fieldName) {
  if (isObjectType(type) || isInterfaceType(type) || isInputObjectType(type)) {
    return type.getFields()[fieldName] != null;
  }
  return false;
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/UniqueFragmentNamesRule.mjs
function UniqueFragmentNamesRule(context) {
  const knownFragmentNames = /* @__PURE__ */ new Map();
  return {
    OperationDefinition: () => false,
    FragmentDefinition(node) {
      const fragmentName = node.name.value;
      const knownFragmentName = knownFragmentNames.get(fragmentName);
      if (knownFragmentName != null) {
        context.reportError(new GraphQLError(`There can be only one fragment named "${fragmentName}".`, { nodes: [knownFragmentName, node.name] }));
      } else {
        knownFragmentNames.set(fragmentName, node.name);
      }
      return false;
    }
  };
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/UniqueInputFieldNamesRule.mjs
function UniqueInputFieldNamesRule(context) {
  const knownNameStack = [];
  let knownNames = /* @__PURE__ */ new Map();
  return {
    ObjectValue: {
      enter() {
        knownNameStack.push(knownNames);
        knownNames = /* @__PURE__ */ new Map();
      },
      leave() {
        const prevKnownNames = knownNameStack.pop();
        if (!(prevKnownNames != null))
          invariant(false);
        knownNames = prevKnownNames;
      }
    },
    ObjectField(node) {
      const fieldName = node.name.value;
      const knownName = knownNames.get(fieldName);
      if (knownName != null) {
        context.reportError(new GraphQLError(`There can be only one input field named "${fieldName}".`, { nodes: [knownName, node.name] }));
      } else {
        knownNames.set(fieldName, node.name);
      }
    }
  };
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/UniqueOperationNamesRule.mjs
function UniqueOperationNamesRule(context) {
  const knownOperationNames = /* @__PURE__ */ new Map();
  return {
    OperationDefinition(node) {
      const operationName = node.name;
      if (operationName != null) {
        const knownOperationName = knownOperationNames.get(operationName.value);
        if (knownOperationName != null) {
          context.reportError(new GraphQLError(`There can be only one operation named "${operationName.value}".`, { nodes: [knownOperationName, operationName] }));
        } else {
          knownOperationNames.set(operationName.value, operationName);
        }
      }
      return false;
    },
    FragmentDefinition: () => false
  };
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/UniqueOperationTypesRule.mjs
function UniqueOperationTypesRule(context) {
  const schema2 = context.getSchema();
  const definedOperationTypes = /* @__PURE__ */ new Map();
  const existingOperationTypes = schema2 ? {
    query: schema2.getQueryType(),
    mutation: schema2.getMutationType(),
    subscription: schema2.getSubscriptionType()
  } : {};
  return {
    SchemaDefinition: checkOperationTypes,
    SchemaExtension: checkOperationTypes
  };
  function checkOperationTypes(node) {
    const operationTypesNodes = node.operationTypes ?? [];
    for (const operationType of operationTypesNodes) {
      const operation = operationType.operation;
      const alreadyDefinedOperationType = definedOperationTypes.get(operation);
      if (existingOperationTypes[operation]) {
        context.reportError(new GraphQLError(`Type for ${operation} already defined in the schema. It cannot be redefined.`, { nodes: operationType }));
      } else if (alreadyDefinedOperationType) {
        context.reportError(new GraphQLError(`There can be only one ${operation} type in schema.`, { nodes: [alreadyDefinedOperationType, operationType] }));
      } else {
        definedOperationTypes.set(operation, operationType);
      }
    }
    return false;
  }
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/UniqueTypeNamesRule.mjs
function UniqueTypeNamesRule(context) {
  const knownTypeNames = /* @__PURE__ */ new Map();
  const schema2 = context.getSchema();
  return {
    ScalarTypeDefinition: checkTypeName,
    ObjectTypeDefinition: checkTypeName,
    InterfaceTypeDefinition: checkTypeName,
    UnionTypeDefinition: checkTypeName,
    EnumTypeDefinition: checkTypeName,
    InputObjectTypeDefinition: checkTypeName
  };
  function checkTypeName(node) {
    const typeName = node.name.value;
    if (schema2?.getType(typeName)) {
      context.reportError(new GraphQLError(`Type "${typeName}" already exists in the schema. It cannot also be defined in this type definition.`, { nodes: node.name }));
      return;
    }
    const knownNameNode = knownTypeNames.get(typeName);
    if (knownNameNode != null) {
      context.reportError(new GraphQLError(`There can be only one type named "${typeName}".`, {
        nodes: [knownNameNode, node.name]
      }));
    } else {
      knownTypeNames.set(typeName, node.name);
    }
    return false;
  }
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/UniqueVariableNamesRule.mjs
function UniqueVariableNamesRule(context) {
  return {
    OperationDefinition(operationNode) {
      const variableDefinitions = operationNode.variableDefinitions ?? [];
      const seenVariableDefinitions = groupBy(variableDefinitions, (node) => node.variable.name.value);
      for (const [variableName, variableNodes] of seenVariableDefinitions) {
        if (variableNodes.length > 1) {
          context.reportError(new GraphQLError(`There can be only one variable named "$${variableName}".`, { nodes: variableNodes.map((node) => node.variable.name) }));
        }
      }
    }
  };
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/ValuesOfCorrectTypeRule.mjs
function ValuesOfCorrectTypeRule(context) {
  return {
    NullValue: (node) => isValidValueNode(context, node, context.getInputType()),
    ListValue: (node) => isValidValueNode(context, node, context.getParentInputType()),
    ObjectValue: (node) => isValidValueNode(context, node, context.getInputType()),
    EnumValue: (node) => isValidValueNode(context, node, context.getInputType()),
    IntValue: (node) => isValidValueNode(context, node, context.getInputType()),
    FloatValue: (node) => isValidValueNode(context, node, context.getInputType()),
    StringValue: (node) => isValidValueNode(context, node, context.getInputType()),
    BooleanValue: (node) => isValidValueNode(context, node, context.getInputType())
  };
}
function isValidValueNode(context, node, inputType) {
  if (inputType) {
    validateInputLiteral(node, inputType, (error) => {
      context.reportError(error);
    }, void 0, void 0, context.hideSuggestions);
  }
  return false;
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/VariablesAreInputTypesRule.mjs
function VariablesAreInputTypesRule(context) {
  return {
    VariableDefinition(node) {
      const type = typeFromAST(context.getSchema(), node.type);
      if (type !== void 0 && !isInputType(type)) {
        const variableName = node.variable.name.value;
        const typeName = print(node.type);
        context.reportError(new GraphQLError(`Variable "$${variableName}" cannot be non-input type "${typeName}".`, { nodes: node.type }));
      }
    }
  };
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/rules/VariablesInAllowedPositionRule.mjs
function VariablesInAllowedPositionRule(context) {
  let varDefMap;
  return {
    OperationDefinition: {
      enter() {
        varDefMap = /* @__PURE__ */ new Map();
      },
      leave(operation) {
        const usages = context.getRecursiveVariableUsages(operation);
        for (const { node, type, parentType, defaultValue, fragmentVariableDefinition } of usages) {
          const varName = node.name.value;
          let varDef = fragmentVariableDefinition;
          varDef ??= varDefMap.get(varName);
          if (varDef && type) {
            const schema2 = context.getSchema();
            const varType = typeFromAST(schema2, varDef.type);
            if (varType && !allowedVariableUsage(schema2, varType, varDef.defaultValue, type, defaultValue)) {
              context.reportError(new GraphQLError(`Variable "$${varName}" of type "${varType}" used in position expecting type "${type}".`, { nodes: [varDef, node] }));
            }
            if (isInputObjectType(parentType) && parentType.isOneOf && isNullableType(varType)) {
              context.reportError(new GraphQLError(`Variable "$${varName}" is of type "${varType}" but must be non-nullable to be used for OneOf Input Object "${parentType}".`, { nodes: [varDef, node] }));
            }
          }
        }
      }
    },
    VariableDefinition(node) {
      varDefMap.set(node.variable.name.value, node);
    }
  };
}
function allowedVariableUsage(schema2, varType, varDefaultValue, locationType, locationDefaultValue) {
  if (isNonNullType(locationType) && !isNonNullType(varType)) {
    const hasNonNullVariableDefaultValue = varDefaultValue != null && varDefaultValue.kind !== kinds_exports.NULL;
    const hasLocationDefaultValue = locationDefaultValue !== void 0;
    if (!hasNonNullVariableDefaultValue && !hasLocationDefaultValue) {
      return false;
    }
    const nullableLocationType = locationType.ofType;
    return isTypeSubTypeOf(schema2, varType, nullableLocationType);
  }
  return isTypeSubTypeOf(schema2, varType, locationType);
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/specifiedRules.mjs
var recommendedRules = Object.freeze([
  MaxIntrospectionDepthRule
]);
var specifiedRules = Object.freeze([
  ExecutableDefinitionsRule,
  KnownOperationTypesRule,
  UniqueOperationNamesRule,
  LoneAnonymousOperationRule,
  SingleFieldSubscriptionsRule,
  KnownTypeNamesRule,
  FragmentsOnCompositeTypesRule,
  VariablesAreInputTypesRule,
  ScalarLeafsRule,
  FieldsOnCorrectTypeRule,
  UniqueFragmentNamesRule,
  KnownFragmentNamesRule,
  NoUnusedFragmentsRule,
  PossibleFragmentSpreadsRule,
  NoFragmentCyclesRule,
  UniqueVariableNamesRule,
  NoUndefinedVariablesRule,
  NoUnusedVariablesRule,
  KnownDirectivesRule,
  UniqueDirectivesPerLocationRule,
  DeferStreamDirectiveOnRootFieldRule,
  DeferStreamDirectiveOnValidOperationsRule,
  DeferStreamDirectiveLabelRule,
  StreamDirectiveOnListFieldRule,
  KnownArgumentNamesRule,
  UniqueArgumentNamesRule,
  ValuesOfCorrectTypeRule,
  ProvidedRequiredArgumentsRule,
  VariablesInAllowedPositionRule,
  OverlappingFieldsCanBeMergedRule,
  UniqueInputFieldNamesRule,
  ...recommendedRules
]);
var specifiedSDLRules = Object.freeze([
  LoneSchemaDefinitionRule,
  UniqueOperationTypesRule,
  UniqueTypeNamesRule,
  UniqueEnumValueNamesRule,
  UniqueFieldDefinitionNamesRule,
  UniqueArgumentDefinitionNamesRule,
  UniqueDirectiveNamesRule,
  KnownTypeNamesRule,
  KnownDirectivesRule,
  UniqueDirectivesPerLocationRule,
  PossibleTypeExtensionsRule,
  KnownArgumentNamesOnDirectivesRule,
  UniqueArgumentNamesRule,
  UniqueInputFieldNamesRule,
  ProvidedRequiredArgumentsOnDirectivesRule
]);

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/ValidationContext.mjs
var ASTValidationContext = class {
  constructor(ast, onError) {
    this._ast = ast;
    this._fragments = void 0;
    this._fragmentSpreads = /* @__PURE__ */ new Map();
    this._recursivelyReferencedFragments = /* @__PURE__ */ new Map();
    this._onError = onError;
  }
  get [Symbol.toStringTag]() {
    return "ASTValidationContext";
  }
  reportError(error) {
    this._onError(error);
  }
  getDocument() {
    return this._ast;
  }
  getFragment(name) {
    let fragments;
    if (this._fragments) {
      fragments = this._fragments;
    } else {
      fragments = /* @__PURE__ */ Object.create(null);
      for (const defNode of this.getDocument().definitions) {
        if (defNode.kind === kinds_exports.FRAGMENT_DEFINITION) {
          fragments[defNode.name.value] = defNode;
        }
      }
      this._fragments = fragments;
    }
    return fragments[name];
  }
  getFragmentSpreads(node) {
    let spreads = this._fragmentSpreads.get(node);
    if (!spreads) {
      spreads = [];
      const setsToVisit = [node];
      let set;
      while (set = setsToVisit.pop()) {
        for (const selection of set.selections) {
          if (selection.kind === kinds_exports.FRAGMENT_SPREAD) {
            spreads.push(selection);
          } else if (selection.selectionSet) {
            setsToVisit.push(selection.selectionSet);
          }
        }
      }
      this._fragmentSpreads.set(node, spreads);
    }
    return spreads;
  }
  getRecursivelyReferencedFragments(operation) {
    let fragments = this._recursivelyReferencedFragments.get(operation);
    if (!fragments) {
      fragments = [];
      const collectedNames = /* @__PURE__ */ new Set();
      const nodesToVisit = [operation.selectionSet];
      let node;
      while (node = nodesToVisit.pop()) {
        for (const spread of this.getFragmentSpreads(node)) {
          const fragName = spread.name.value;
          if (!collectedNames.has(fragName)) {
            collectedNames.add(fragName);
            const fragment = this.getFragment(fragName);
            if (fragment) {
              fragments.push(fragment);
              nodesToVisit.push(fragment.selectionSet);
            }
          }
        }
      }
      this._recursivelyReferencedFragments.set(operation, fragments);
    }
    return fragments;
  }
};
var SDLValidationContext = class extends ASTValidationContext {
  constructor(ast, schema2, onError) {
    super(ast, onError);
    this._schema = schema2;
  }
  get hideSuggestions() {
    return false;
  }
  get [Symbol.toStringTag]() {
    return "SDLValidationContext";
  }
  getSchema() {
    return this._schema;
  }
};
var ValidationContext = class extends ASTValidationContext {
  constructor(schema2, ast, typeInfo, onError, hideSuggestions) {
    super(ast, onError);
    this._schema = schema2;
    this._typeInfo = typeInfo;
    this._variableUsages = /* @__PURE__ */ new Map();
    this._recursiveVariableUsages = /* @__PURE__ */ new Map();
    this._hideSuggestions = hideSuggestions ?? false;
  }
  get [Symbol.toStringTag]() {
    return "ValidationContext";
  }
  get hideSuggestions() {
    return this._hideSuggestions;
  }
  getSchema() {
    return this._schema;
  }
  getVariableUsages(node) {
    let usages = this._variableUsages.get(node);
    if (!usages) {
      const newUsages = [];
      const typeInfo = new TypeInfo(this._schema, void 0, this._typeInfo.getFragmentSignatureByName());
      const fragmentDefinition = node.kind === kinds_exports.FRAGMENT_DEFINITION ? node : void 0;
      visit(node, visitWithTypeInfo(typeInfo, {
        VariableDefinition: () => false,
        Variable(variable) {
          let fragmentVariableDefinition;
          if (fragmentDefinition) {
            const fragmentSignature = typeInfo.getFragmentSignatureByName()(fragmentDefinition.name.value);
            fragmentVariableDefinition = fragmentSignature?.variableDefinitions.get(variable.name.value);
            newUsages.push({
              node: variable,
              type: typeInfo.getInputType(),
              parentType: typeInfo.getParentInputType(),
              defaultValue: void 0,
              fragmentVariableDefinition
            });
          } else {
            newUsages.push({
              node: variable,
              type: typeInfo.getInputType(),
              parentType: typeInfo.getParentInputType(),
              defaultValue: typeInfo.getDefaultValue(),
              fragmentVariableDefinition: void 0
            });
          }
        }
      }));
      usages = newUsages;
      this._variableUsages.set(node, usages);
    }
    return usages;
  }
  getRecursiveVariableUsages(operation) {
    let usages = this._recursiveVariableUsages.get(operation);
    if (!usages) {
      usages = this.getVariableUsages(operation);
      for (const frag of this.getRecursivelyReferencedFragments(operation)) {
        usages = usages.concat(this.getVariableUsages(frag));
      }
      this._recursiveVariableUsages.set(operation, usages);
    }
    return usages;
  }
  getType() {
    return this._typeInfo.getType();
  }
  getParentType() {
    return this._typeInfo.getParentType();
  }
  getInputType() {
    return this._typeInfo.getInputType();
  }
  getParentInputType() {
    return this._typeInfo.getParentInputType();
  }
  getFieldDef() {
    return this._typeInfo.getFieldDef();
  }
  getDirective() {
    return this._typeInfo.getDirective();
  }
  getArgument() {
    return this._typeInfo.getArgument();
  }
  getFragmentSignature() {
    return this._typeInfo.getFragmentSignature();
  }
  getFragmentSignatureByName() {
    return this._typeInfo.getFragmentSignatureByName();
  }
  getEnumValue() {
    return this._typeInfo.getEnumValue();
  }
};

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/validation/validate.mjs
var QueryDocumentKeysToValidate = mapValue(QueryDocumentKeys, (keys) => keys.filter((key) => key !== "description"));
var tooManyValidationErrorsError = new GraphQLError("Too many validation errors, error limit reached. Validation aborted.");
function validate(schema2, documentAST, rules = specifiedRules, options) {
  return shouldTrace(validateChannel) ? validateChannel.traceSync(() => validateImpl(schema2, documentAST, rules, options), { schema: schema2, document: documentAST }) : validateImpl(schema2, documentAST, rules, options);
}
function validateImpl(schema2, documentAST, rules, options) {
  const maxErrors = options?.maxErrors ?? 100;
  const hideSuggestions = options?.hideSuggestions ?? false;
  assertValidSchema(schema2);
  const errors = [];
  const typeInfo = new TypeInfo(schema2);
  const context = new ValidationContext(schema2, documentAST, typeInfo, (error) => {
    if (errors.length >= maxErrors) {
      throw tooManyValidationErrorsError;
    }
    errors.push(error);
  }, hideSuggestions);
  const visitor = visitInParallel(rules.map((rule) => rule(context)));
  try {
    visit(documentAST, visitWithTypeInfo(typeInfo, visitor), QueryDocumentKeysToValidate);
  } catch (e) {
    if (e === tooManyValidationErrorsError) {
      errors.push(tooManyValidationErrorsError);
    } else {
      throw e;
    }
  }
  return errors;
}
function validateSDL(documentAST, schemaToExtend, rules = specifiedSDLRules) {
  const errors = [];
  const context = new SDLValidationContext(documentAST, schemaToExtend, (error) => {
    errors.push(error);
  });
  const visitors = rules.map((rule) => rule(context));
  visit(documentAST, visitInParallel(visitors));
  return errors;
}
function assertValidSDL(documentAST) {
  const errors = validateSDL(documentAST);
  if (errors.length !== 0) {
    throw new Error(errors.map((error) => error.message).join("\n\n"));
  }
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/jsutils/isAsyncIterable.mjs
function isAsyncIterable(maybeAsyncIterable) {
  return typeof maybeAsyncIterable?.[Symbol.asyncIterator] === "function";
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/error/locatedError.mjs
function locatedError(rawOriginalError, nodes, path) {
  const originalError = toError(rawOriginalError);
  if (isLocatedGraphQLError(originalError)) {
    return originalError;
  }
  return new GraphQLError(originalError.message, {
    nodes: originalError.nodes ?? nodes,
    source: originalError.source,
    positions: originalError.positions,
    path,
    originalError
  });
}
function isLocatedGraphQLError(error) {
  return Array.isArray(error.path);
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/utilities/getOperationAST.mjs
function getOperationAST(documentAST, operationName) {
  let operation = null;
  for (const definition of documentAST.definitions) {
    if (definition.kind === kinds_exports.OPERATION_DEFINITION) {
      if (operationName == null) {
        if (operation) {
          return null;
        }
        operation = definition;
      } else if (definition.name?.value === operationName) {
        return definition;
      }
    }
  }
  return operation;
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/execution/buildResolveInfo.mjs
function buildResolveInfo(validatedExecutionArgs, fieldDef, fieldNodes, parentType, path, getAbortSignal, getAsyncHelpers) {
  const { schema: schema2, fragmentDefinitions, rootValue, operation, variableValues } = validatedExecutionArgs;
  return {
    fieldName: fieldDef.name,
    fieldNodes,
    returnType: fieldDef.type,
    parentType,
    path,
    schema: schema2,
    fragments: fragmentDefinitions,
    rootValue,
    operation,
    variableValues,
    getAbortSignal,
    getAsyncHelpers
  };
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/jsutils/promiseWithResolvers.mjs
function promiseWithResolvers() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/execution/cancellablePromise.mjs
function withCancellation(originalPromise) {
  const { promise, resolve, reject } = promiseWithResolvers();
  let settled = false;
  const settleResolve = (value) => {
    if (settled) {
      return;
    }
    settled = true;
    resolve(value);
  };
  const settleReject = (error) => {
    if (settled) {
      return;
    }
    settled = true;
    reject(error);
  };
  originalPromise.then(settleResolve, settleReject);
  return {
    promise,
    abort(reason) {
      settleReject(reason);
    }
  };
}
function cancellablePromise(promise, abortSignal) {
  const withAbort = withCancellation(promise);
  if (abortSignal.aborted) {
    withAbort.abort(abortSignal.reason);
    return withAbort.promise;
  }
  const onAbort = () => {
    abortSignal.removeEventListener("abort", onAbort);
    withAbort.abort(abortSignal.reason);
  };
  abortSignal.addEventListener("abort", onAbort);
  withAbort.promise.then(() => {
    abortSignal.removeEventListener("abort", onAbort);
  }, () => {
    abortSignal.removeEventListener("abort", onAbort);
  });
  return withAbort.promise;
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/execution/AsyncWorkTracker.mjs
var AsyncWorkTracker = class {
  constructor() {
    this.pendingAsyncWork = /* @__PURE__ */ new Set();
  }
  add(promiseLike) {
    const pendingAsyncWork = this.pendingAsyncWork;
    const promiseToSettle = promiseLike.then(() => {
      pendingAsyncWork.delete(promiseToSettle);
    }, () => {
      pendingAsyncWork.delete(promiseToSettle);
    });
    pendingAsyncWork.add(promiseToSettle);
  }
  addValues(values) {
    for (const value of values) {
      if (isPromiseLike(value)) {
        this.add(value);
      }
    }
  }
  wait() {
    if (this.pendingAsyncWork.size === 0) {
      return;
    }
    return this.waitForPendingAsyncWork();
  }
  promiseAllTrackOnReject(values) {
    const promise = Promise.all(values);
    promise.then(void 0, () => {
      this.addValues(values);
    });
    return promise;
  }
  async waitForPendingAsyncWork() {
    while (this.pendingAsyncWork.size > 0) {
      await Promise.allSettled(Array.from(this.pendingAsyncWork));
    }
  }
};

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/execution/createSharedExecutionContext.mjs
function createSharedExecutionContext(abortSignal) {
  const asyncWorkTracker = new AsyncWorkTracker();
  let resolveInfoHelpers;
  const promiseAll = (values) => asyncWorkTracker.promiseAllTrackOnReject(values);
  const getAsyncHelpers = () => resolveInfoHelpers ??= {
    promiseAll,
    track: (maybePromises) => asyncWorkTracker.addValues(maybePromises)
  };
  return {
    asyncWorkTracker,
    getAbortSignal: () => abortSignal,
    getAsyncHelpers,
    promiseAll
  };
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/jsutils/memoize2.mjs
function memoize2(fn) {
  let cache0;
  return function memoized(a1, a2) {
    cache0 ??= /* @__PURE__ */ new WeakMap();
    let cache1 = cache0.get(a1);
    if (cache1 === void 0) {
      cache1 = /* @__PURE__ */ new WeakMap();
      cache0.set(a1, cache1);
    }
    let fnResult = cache1.get(a2);
    if (fnResult === void 0) {
      fnResult = fn(a1, a2);
      cache1.set(a2, fnResult);
    }
    return fnResult;
  };
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/jsutils/memoize3.mjs
function memoize3(fn) {
  let cache0;
  return function memoized(a1, a2, a3) {
    cache0 ??= /* @__PURE__ */ new WeakMap();
    let cache1 = cache0.get(a1);
    if (cache1 === void 0) {
      cache1 = /* @__PURE__ */ new WeakMap();
      cache0.set(a1, cache1);
    }
    let cache2 = cache1.get(a2);
    if (cache2 === void 0) {
      cache2 = /* @__PURE__ */ new WeakMap();
      cache1.set(a2, cache2);
    }
    let fnResult = cache2.get(a3);
    if (fnResult === void 0) {
      fnResult = fn(a1, a2, a3);
      cache2.set(a3, fnResult);
    }
    return fnResult;
  };
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/jsutils/promiseForObject.mjs
function promiseForObject(object, promiseAll) {
  const keys = Object.keys(object);
  const values = Object.values(object);
  return promiseAll(values).then((resolvedValues) => {
    const resolvedObject = /* @__PURE__ */ Object.create(null);
    for (let i = 0; i < keys.length; ++i) {
      resolvedObject[keys[i]] = resolvedValues[i];
    }
    return resolvedObject;
  });
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/jsutils/promiseReduce.mjs
function promiseReduce(values, callbackFn, initialValue) {
  let accumulator = initialValue;
  for (const value of values) {
    accumulator = isPromise(accumulator) ? accumulator.then((resolved) => callbackFn(resolved, value)) : callbackFn(accumulator, value);
  }
  return accumulator;
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/execution/AbortedGraphQLExecutionError.mjs
var AbortedGraphQLExecutionError = class extends Error {
  constructor(reason, result) {
    super(getAbortReasonMessage(reason), { cause: reason });
    this.name = "AbortedGraphQLExecutionError";
    this.abortedResult = result;
  }
  get [Symbol.toStringTag]() {
    return "AbortedGraphQLExecutionError";
  }
};
function getAbortReasonMessage(reason) {
  if (reason instanceof Error) {
    return reason.message;
  }
  if (typeof reason === "object" && reason !== null && "message" in reason && typeof reason.message === "string") {
    return reason.message;
  }
  return String(reason);
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/execution/collectIteratorPromises.mjs
function collectIteratorPromises(iterator) {
  const promises = [];
  try {
    while (true) {
      const iteration = iterator.next();
      if (iteration.done) {
        return promises;
      }
      if (isPromiseLike(iteration.value)) {
        promises.push(iteration.value);
      }
    }
  } catch {
    return promises;
  }
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/execution/getStreamUsage.mjs
function getStreamUsage(validatedExecutionArgs, fieldDetailsList) {
  const { operation, variableValues } = validatedExecutionArgs;
  const stream = getDirectiveValues(GraphQLStreamDirective, fieldDetailsList[0].node, variableValues, fieldDetailsList[0].fragmentVariableValues);
  if (!stream) {
    return;
  }
  if (stream.if === false) {
    return;
  }
  if (!(typeof stream.initialCount === "number"))
    invariant(false, "initialCount must be a number");
  if (!(stream.initialCount >= 0))
    invariant(false, "initialCount must be a positive integer");
  if (!(operation.operation !== OperationTypeNode.SUBSCRIPTION))
    invariant(false, "`@stream` directive not supported on subscription operations. Disable `@stream` by setting the `if` argument to `false`.");
  const streamedFieldDetailsList = fieldDetailsList.map((fieldDetails) => ({
    node: fieldDetails.node,
    deferUsage: void 0,
    fragmentVariableValues: fieldDetails.fragmentVariableValues
  }));
  return {
    initialCount: stream.initialCount,
    label: typeof stream.label === "string" ? stream.label : void 0,
    fieldDetailsList: streamedFieldDetailsList
  };
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/execution/hooks.mjs
function runHookSafely(hook, info) {
  try {
    hook?.(info);
  } catch {
  }
}
function runAsyncWorkFinishedHook(validatedExecutionArgs, sharedExecutionContext, asyncWorkFinishedHook) {
  const maybeWaitForAsyncWork = sharedExecutionContext.asyncWorkTracker.wait();
  if (maybeWaitForAsyncWork === void 0) {
    runHookSafely(asyncWorkFinishedHook, { validatedExecutionArgs });
    return;
  }
  maybeWaitForAsyncWork.then(() => {
    runHookSafely(asyncWorkFinishedHook, { validatedExecutionArgs });
  }).catch(() => void 0);
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/execution/returnIteratorCatchingErrors.mjs
async function returnIteratorCatchingErrors(iterator) {
  try {
    await iterator.return?.();
  } catch {
  }
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/execution/Executor.mjs
var collectSubfields2 = memoize3((validatedExecutionArgs, returnType, fieldDetailsList) => {
  const { schema: schema2, fragments, variableValues, hideSuggestions } = validatedExecutionArgs;
  return collectSubfields(schema2, fragments, variableValues, returnType, fieldDetailsList, hideSuggestions);
});
var getStreamUsage2 = memoize2((validatedExecutionArgs, fieldDetailsList) => getStreamUsage(validatedExecutionArgs, fieldDetailsList));
var CollectedErrors = class {
  constructor() {
    this._errorPositions = /* @__PURE__ */ new Set();
    this._errors = [];
  }
  get errors() {
    return this._errors;
  }
  add(error, path) {
    if (this.hasNulledPosition(path)) {
      return;
    }
    this._errorPositions.add(path);
    this._errors.push(error);
  }
  hasNulledPosition(startPath) {
    let path = startPath;
    while (path !== void 0) {
      if (this._errorPositions.has(path)) {
        return true;
      }
      path = path.prev;
    }
    return this._errorPositions.has(void 0);
  }
};
var defaultAbortReason = new Error("This operation was aborted");
var Executor = class {
  constructor(validatedExecutionArgs, sharedExecutionContext) {
    this.validatedExecutionArgs = validatedExecutionArgs;
    this.aborted = false;
    this.abortReason = defaultAbortReason;
    this.collectedErrors = new CollectedErrors();
    if (sharedExecutionContext === void 0) {
      this.resolverAbortController = new AbortController();
      this.sharedExecutionContext = createSharedExecutionContext(this.resolverAbortController.signal);
    } else {
      this.sharedExecutionContext = sharedExecutionContext;
    }
    const { getAbortSignal, getAsyncHelpers, promiseAll } = this.sharedExecutionContext;
    this.getAbortSignal = getAbortSignal;
    this.getAsyncHelpers = getAsyncHelpers;
    this.promiseAll = promiseAll;
  }
  executeRootSelectionSet(serially) {
    if (!shouldTrace(executeRootSelectionSetChannel)) {
      return this.executeRootSelectionSetImpl(serially);
    }
    return traceMixed(executeRootSelectionSetChannel, this.buildExecuteContextFromValidatedArgs(this.validatedExecutionArgs), () => this.executeRootSelectionSetImpl(serially));
  }
  buildExecuteContextFromValidatedArgs(args) {
    return {
      schema: args.schema,
      document: args.document,
      operation: args.operation,
      rawVariableValues: args.rawVariableValues,
      operationName: args.operation.name?.value,
      operationType: args.operation.operation
    };
  }
  executeRootSelectionSetImpl(serially) {
    const externalAbortSignal = this.validatedExecutionArgs.externalAbortSignal;
    let removeExternalAbortListener;
    if (externalAbortSignal) {
      externalAbortSignal.throwIfAborted();
      const onExternalAbort = () => {
        this.abort(externalAbortSignal.reason);
      };
      removeExternalAbortListener = () => externalAbortSignal.removeEventListener("abort", onExternalAbort);
      externalAbortSignal.addEventListener("abort", onExternalAbort);
    }
    const maybeRemoveExternalAbortListener = () => {
      removeExternalAbortListener?.();
    };
    let result;
    try {
      const { schema: schema2, fragments, rootValue, operation, variableValues, hideSuggestions } = this.validatedExecutionArgs;
      const { operation: operationType, selectionSet } = operation;
      const rootType = schema2.getRootType(operationType);
      if (rootType == null) {
        throw new GraphQLError(`Schema is not configured to execute ${operationType} operation.`, { nodes: operation });
      }
      const { groupedFieldSet, newDeferUsages } = collectFields(schema2, fragments, variableValues, rootType, selectionSet, hideSuggestions);
      result = this.executeCollectedRootFields(rootType, rootValue, groupedFieldSet, serially ?? operationType === OperationTypeNode.MUTATION, newDeferUsages);
      if (isPromise(result)) {
        const promise = result.then((data) => {
          maybeRemoveExternalAbortListener();
          return this.buildResponse(data);
        }, (error) => {
          maybeRemoveExternalAbortListener();
          this.collectedErrors.add(ensureGraphQLError(error), void 0);
          return this.buildResponse(null);
        });
        this.sharedExecutionContext.asyncWorkTracker.add(promise);
        const { promise: cancellablePromise2, abort: abortResultPromise } = withCancellation(promise.then((resolved) => this.finish(resolved)));
        this.abortResultPromise = () => {
          abortResultPromise(this.createAbortedExecutionError(promise));
        };
        if (this.aborted) {
          this.abortResultPromise();
        }
        return cancellablePromise2;
      }
      maybeRemoveExternalAbortListener();
    } catch (error) {
      maybeRemoveExternalAbortListener();
      this.collectedErrors.add(ensureGraphQLError(error), void 0);
      return this.finish(this.buildResponse(null));
    }
    return this.finish(this.buildResponse(result));
  }
  abort(reason) {
    if (this.aborted) {
      return;
    }
    this.aborted = true;
    if (reason !== void 0) {
      this.abortReason = reason;
    }
    this.abortResultPromise?.();
    this.resolverAbortController?.abort(this.abortReason);
  }
  finish(result) {
    if (this.aborted) {
      throw this.createAbortedExecutionError(result);
    }
    this.aborted = true;
    return result;
  }
  createAbortedExecutionError(result) {
    return new AbortedGraphQLExecutionError(this.abortReason, result);
  }
  getFinishSharedExecution() {
    const resolverAbortController = this.resolverAbortController;
    const asyncWorkFinishedHook = this.validatedExecutionArgs.hooks?.asyncWorkFinished;
    if (asyncWorkFinishedHook === void 0) {
      return () => resolverAbortController?.abort();
    }
    const validatedExecutionArgs = this.validatedExecutionArgs;
    const sharedExecutionContext = this.sharedExecutionContext;
    return () => {
      resolverAbortController?.abort();
      runAsyncWorkFinishedHook(validatedExecutionArgs, sharedExecutionContext, asyncWorkFinishedHook);
    };
  }
  buildResponse(data) {
    this.getFinishSharedExecution()();
    const errors = this.collectedErrors.errors;
    return errors.length ? { errors, data } : { data };
  }
  executeCollectedRootFields(rootType, rootValue, originalGroupedFieldSet, serially, _newDeferUsages) {
    return this.executeRootGroupedFieldSet(rootType, rootValue, originalGroupedFieldSet, serially, void 0);
  }
  executeRootGroupedFieldSet(rootType, rootValue, groupedFieldSet, serially, positionContext) {
    return serially ? this.executeFieldsSerially(rootType, rootValue, void 0, groupedFieldSet, positionContext) : this.executeFields(rootType, rootValue, void 0, groupedFieldSet, positionContext);
  }
  executeFieldsSerially(parentType, sourceValue, path, groupedFieldSet, positionContext) {
    let tracingChannel = shouldTrace(resolveChannel) ? resolveChannel : void 0;
    return promiseReduce(groupedFieldSet, (results, [responseName, fieldDetailsList]) => {
      if (this.aborted) {
        throw new Error("Aborted!");
      }
      const fieldPath = addPath(path, responseName, parentType.name);
      const result = this.executeField(parentType, sourceValue, fieldDetailsList, fieldPath, positionContext, tracingChannel);
      if (result === void 0) {
        return results;
      }
      if (isPromise(result)) {
        return result.then((resolved) => {
          results[responseName] = resolved;
          tracingChannel = shouldTrace(resolveChannel) ? resolveChannel : void 0;
          return results;
        });
      }
      results[responseName] = result;
      return results;
    }, /* @__PURE__ */ Object.create(null));
  }
  executeFields(parentType, sourceValue, path, groupedFieldSet, positionContext) {
    const results = /* @__PURE__ */ Object.create(null);
    let containsPromise = false;
    const tracingChannel = shouldTrace(resolveChannel) ? resolveChannel : void 0;
    try {
      for (const [responseName, fieldDetailsList] of groupedFieldSet) {
        const fieldPath = addPath(path, responseName, parentType.name);
        const result = this.executeField(parentType, sourceValue, fieldDetailsList, fieldPath, positionContext, tracingChannel);
        if (result !== void 0) {
          results[responseName] = result;
          if (isPromise(result)) {
            containsPromise = true;
          }
        }
      }
    } catch (error) {
      if (containsPromise) {
        this.sharedExecutionContext.asyncWorkTracker.addValues(Object.values(results));
      }
      throw error;
    }
    if (!containsPromise) {
      return results;
    }
    return promiseForObject(results, this.promiseAll);
  }
  executeField(parentType, source, fieldDetailsList, path, positionContext, tracingChannel) {
    const validatedExecutionArgs = this.validatedExecutionArgs;
    const { schema: schema2, contextValue, variableValues, hideSuggestions } = validatedExecutionArgs;
    const firstFieldDetails = fieldDetailsList[0];
    const firstNode = firstFieldDetails.node;
    const fieldName = firstNode.name.value;
    const fieldDef = schema2.getField(parentType, fieldName);
    if (!fieldDef) {
      return;
    }
    const returnType = fieldDef.type;
    let resolveFn = fieldDef.resolve ?? validatedExecutionArgs.fieldResolver;
    if (tracingChannel !== void 0) {
      const originalResolveFn = resolveFn;
      resolveFn = (s, args, c, info2) => traceMixed(tracingChannel, this.buildResolveContext(args, info2, fieldDef.resolve === void 0), () => originalResolveFn(s, args, c, info2));
    }
    const info = buildResolveInfo(validatedExecutionArgs, fieldDef, toNodes2(fieldDetailsList), parentType, path, this.getAbortSignal, this.getAsyncHelpers);
    try {
      const args = getArgumentValues(fieldDef, firstNode, variableValues, firstFieldDetails.fragmentVariableValues, hideSuggestions);
      const result = resolveFn(source, args, contextValue, info);
      if (isPromiseLike(result)) {
        return this.completePromisedValue(returnType, fieldDetailsList, info, path, result, positionContext);
      }
      const completed = this.completeValue(returnType, fieldDetailsList, info, path, result, positionContext);
      if (isPromise(completed)) {
        return completed.then(void 0, (rawError) => {
          this.handleFieldError(rawError, returnType, fieldDetailsList, path);
          return null;
        });
      }
      return completed;
    } catch (rawError) {
      this.handleFieldError(rawError, returnType, fieldDetailsList, path);
      return null;
    }
  }
  buildResolveContext(args, info, isDefaultResolver) {
    let cachedFieldPath;
    return {
      fieldName: info.fieldName,
      alias: String(info.path.key),
      parentType: info.parentType.name,
      fieldType: String(info.returnType),
      args,
      isDefaultResolver,
      get fieldPath() {
        cachedFieldPath ??= pathToArray(info.path).join(".");
        return cachedFieldPath;
      }
    };
  }
  handleFieldError(rawError, returnType, fieldDetailsList, path) {
    const error = locatedError(rawError, toNodes2(fieldDetailsList), pathToArray(path));
    if (this.validatedExecutionArgs.errorPropagation && isNonNullType(returnType)) {
      throw error;
    }
    this.collectedErrors.add(error, path);
  }
  completeValue(returnType, fieldDetailsList, info, path, result, positionContext) {
    if (result instanceof Error) {
      throw result;
    }
    if (isNonNullType(returnType)) {
      const completed = this.completeValue(returnType.ofType, fieldDetailsList, info, path, result, positionContext);
      if (completed === null) {
        throw new Error(`Cannot return null for non-nullable field ${info.parentType}.${info.fieldName}.`);
      }
      return completed;
    }
    if (result == null) {
      return null;
    }
    if (isListType(returnType)) {
      return this.completeListValue(returnType, fieldDetailsList, info, path, result, positionContext);
    }
    if (isLeafType(returnType)) {
      return this.completeLeafValue(returnType, result);
    }
    if (isAbstractType(returnType)) {
      return this.completeAbstractValue(returnType, fieldDetailsList, info, path, result, positionContext);
    }
    if (isObjectType(returnType)) {
      return this.completeObjectValue(returnType, fieldDetailsList, info, path, result, positionContext);
    }
    invariant(false, "Cannot complete value of unexpected output type: " + inspect(returnType));
  }
  async completePromisedValue(returnType, fieldDetailsList, info, path, result, positionContext) {
    try {
      const resolved = await result;
      if (this.aborted) {
        throw new Error("Aborted!");
      }
      let completed = this.completeValue(returnType, fieldDetailsList, info, path, resolved, positionContext);
      if (isPromise(completed)) {
        completed = await completed;
      }
      return completed;
    } catch (rawError) {
      this.handleFieldError(rawError, returnType, fieldDetailsList, path);
      return null;
    }
  }
  async completeAsyncIterableValue(itemType, fieldDetailsList, info, path, items, positionContext) {
    const streamUsage = typeof path.key === "number" ? void 0 : getStreamUsage2(this.validatedExecutionArgs, fieldDetailsList);
    let containsPromise = false;
    const completedResults = [];
    const asyncIterator = items[Symbol.asyncIterator]();
    let index = 0;
    let iteration;
    try {
      while (true) {
        if (streamUsage?.initialCount === index && this.handleStream(index, path, { handle: asyncIterator, isAsync: true }, streamUsage, info, itemType)) {
          break;
        }
        const itemPath = addPath(path, index, void 0);
        try {
          iteration = await asyncIterator.next();
        } catch (rawError) {
          throw locatedError(rawError, toNodes2(fieldDetailsList), pathToArray(path));
        }
        if (this.aborted || iteration.done) {
          break;
        }
        const item = iteration.value;
        if (this.completeMaybePromisedListItemValue(item, completedResults, itemType, fieldDetailsList, info, itemPath, positionContext)) {
          containsPromise = true;
        }
        index++;
      }
    } catch (error) {
      this.sharedExecutionContext.asyncWorkTracker.add(returnIteratorCatchingErrors(asyncIterator));
      if (containsPromise) {
        this.sharedExecutionContext.asyncWorkTracker.addValues(completedResults);
      }
      throw error;
    }
    if (this.aborted) {
      if (!iteration?.done) {
        this.sharedExecutionContext.asyncWorkTracker.add(returnIteratorCatchingErrors(asyncIterator));
      }
      throw new Error("Aborted!");
    }
    return containsPromise ? this.promiseAll(completedResults) : completedResults;
  }
  handleStream(_index, _path, _iterator, _streamUsage, _info, _itemType) {
    return false;
  }
  completeListValue(returnType, fieldDetailsList, info, path, result, positionContext) {
    const itemType = returnType.ofType;
    if (isAsyncIterable(result)) {
      return this.completeAsyncIterableValue(itemType, fieldDetailsList, info, path, result, positionContext);
    }
    if (!isIterableObject(result)) {
      throw new GraphQLError(`Expected Iterable, but did not find one for field "${info.parentType}.${info.fieldName}".`);
    }
    return this.completeIterableValue(itemType, fieldDetailsList, info, path, result, positionContext);
  }
  completeIterableValue(itemType, fieldDetailsList, info, path, items, positionContext) {
    const streamUsage = typeof path.key === "number" ? void 0 : getStreamUsage2(this.validatedExecutionArgs, fieldDetailsList);
    let containsPromise = false;
    const completedResults = [];
    let index = 0;
    const iterator = items[Symbol.iterator]();
    try {
      while (true) {
        if (streamUsage?.initialCount === index && this.handleStream(index, path, { handle: iterator }, streamUsage, info, itemType)) {
          break;
        }
        const iteration = iterator.next();
        if (iteration.done) {
          break;
        }
        const item = iteration.value;
        const itemPath = addPath(path, index, void 0);
        if (this.completeMaybePromisedListItemValue(item, completedResults, itemType, fieldDetailsList, info, itemPath, positionContext)) {
          containsPromise = true;
        }
        index++;
      }
    } catch (error) {
      const asyncWorkTracker = this.sharedExecutionContext.asyncWorkTracker;
      if (containsPromise) {
        asyncWorkTracker.addValues(completedResults);
      }
      asyncWorkTracker.addValues(collectIteratorPromises(iterator));
      throw error;
    }
    return containsPromise ? this.promiseAll(completedResults) : completedResults;
  }
  completeMaybePromisedListItemValue(item, completedResults, itemType, fieldDetailsList, info, itemPath, positionContext) {
    if (isPromiseLike(item)) {
      completedResults.push(this.completePromisedListItemValue(item, itemType, fieldDetailsList, info, itemPath, positionContext));
      return true;
    } else if (this.completeListItemValue(item, completedResults, itemType, fieldDetailsList, info, itemPath, positionContext)) {
      return true;
    }
    return false;
  }
  completeListItemValue(item, completedResults, itemType, fieldDetailsList, info, itemPath, positionContext) {
    try {
      const completedItem = this.completeValue(itemType, fieldDetailsList, info, itemPath, item, positionContext);
      if (isPromise(completedItem)) {
        completedResults.push(completedItem.then(void 0, (rawError) => {
          this.handleFieldError(rawError, itemType, fieldDetailsList, itemPath);
          return null;
        }));
        return true;
      }
      completedResults.push(completedItem);
    } catch (rawError) {
      this.handleFieldError(rawError, itemType, fieldDetailsList, itemPath);
      completedResults.push(null);
    }
    return false;
  }
  async completePromisedListItemValue(item, itemType, fieldDetailsList, info, itemPath, positionContext) {
    try {
      const resolved = await item;
      if (this.aborted) {
        throw new Error("Aborted!");
      }
      let completed = this.completeValue(itemType, fieldDetailsList, info, itemPath, resolved, positionContext);
      if (isPromise(completed)) {
        completed = await completed;
      }
      return completed;
    } catch (rawError) {
      this.handleFieldError(rawError, itemType, fieldDetailsList, itemPath);
      return null;
    }
  }
  completeLeafValue(returnType, result) {
    const coerced = returnType.coerceOutputValue(result);
    if (coerced == null) {
      throw new Error(`Expected \`${inspect(returnType)}.coerceOutputValue(${inspect(result)})\` to return non-nullable value, returned: ${inspect(coerced)}`);
    }
    return coerced;
  }
  completeAbstractValue(returnType, fieldDetailsList, info, path, result, positionContext) {
    const validatedExecutionArgs = this.validatedExecutionArgs;
    const { schema: schema2, contextValue } = validatedExecutionArgs;
    const resolveTypeFn = returnType.resolveType ?? validatedExecutionArgs.typeResolver;
    const runtimeType = resolveTypeFn(result, contextValue, info, returnType);
    if (isPromiseLike(runtimeType)) {
      return runtimeType.then((resolvedRuntimeType) => {
        if (this.aborted) {
          throw new Error("Aborted!");
        }
        return this.completeObjectValue(this.ensureValidRuntimeType(resolvedRuntimeType, schema2, returnType, fieldDetailsList, info, result), fieldDetailsList, info, path, result, positionContext);
      });
    }
    return this.completeObjectValue(this.ensureValidRuntimeType(runtimeType, schema2, returnType, fieldDetailsList, info, result), fieldDetailsList, info, path, result, positionContext);
  }
  ensureValidRuntimeType(runtimeTypeName, schema2, returnType, fieldDetailsList, info, result) {
    if (runtimeTypeName == null) {
      throw new GraphQLError(`Abstract type "${returnType}" must resolve to an Object type at runtime for field "${info.parentType}.${info.fieldName}". Either the "${returnType}" type should provide a "resolveType" function or each possible type should provide an "isTypeOf" function.`, { nodes: toNodes2(fieldDetailsList) });
    }
    if (typeof runtimeTypeName !== "string") {
      throw new GraphQLError(`Abstract type "${returnType}" must resolve to an Object type at runtime for field "${info.parentType}.${info.fieldName}" with value ${inspect(result)}, received "${inspect(runtimeTypeName)}", which is not a valid Object type name.`);
    }
    const runtimeType = schema2.getType(runtimeTypeName);
    if (runtimeType == null) {
      throw new GraphQLError(`Abstract type "${returnType}" was resolved to a type "${runtimeTypeName}" that does not exist inside the schema.`, { nodes: toNodes2(fieldDetailsList) });
    }
    if (!isObjectType(runtimeType)) {
      throw new GraphQLError(`Abstract type "${returnType}" was resolved to a non-object type "${runtimeTypeName}".`, { nodes: toNodes2(fieldDetailsList) });
    }
    if (!schema2.isSubType(returnType, runtimeType)) {
      throw new GraphQLError(`Runtime Object type "${runtimeType}" is not a possible type for "${returnType}".`, { nodes: toNodes2(fieldDetailsList) });
    }
    return runtimeType;
  }
  completeObjectValue(returnType, fieldDetailsList, info, path, result, positionContext) {
    if (returnType.isTypeOf) {
      const isTypeOf = returnType.isTypeOf(result, this.validatedExecutionArgs.contextValue, info);
      if (isPromiseLike(isTypeOf)) {
        return isTypeOf.then((resolvedIsTypeOf) => {
          if (this.aborted) {
            throw new Error("Aborted!");
          }
          if (!resolvedIsTypeOf) {
            throw this.invalidReturnTypeError(returnType, result, fieldDetailsList);
          }
          return this.collectAndExecuteSubfields(returnType, fieldDetailsList, path, result, positionContext);
        });
      }
      if (!isTypeOf) {
        throw this.invalidReturnTypeError(returnType, result, fieldDetailsList);
      }
    }
    return this.collectAndExecuteSubfields(returnType, fieldDetailsList, path, result, positionContext);
  }
  invalidReturnTypeError(returnType, result, fieldDetailsList) {
    return new GraphQLError(`Expected value of type "${returnType}" but got: ${inspect(result)}.`, { nodes: toNodes2(fieldDetailsList) });
  }
  collectAndExecuteSubfields(returnType, fieldDetailsList, path, result, positionContext) {
    const { groupedFieldSet, newDeferUsages } = collectSubfields2(this.validatedExecutionArgs, returnType, fieldDetailsList);
    return this.executeCollectedSubfields(returnType, result, path, groupedFieldSet, newDeferUsages, positionContext);
  }
  executeCollectedSubfields(parentType, sourceValue, path, originalGroupedFieldSet, _newDeferUsages, _positionContext) {
    return this.executeFields(parentType, sourceValue, path, originalGroupedFieldSet, void 0);
  }
};
function toNodes2(fieldDetailsList) {
  return fieldDetailsList.map((fieldDetails) => fieldDetails.node);
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/execution/ExecutorThrowingOnIncremental.mjs
var UNEXPECTED_MULTIPLE_PAYLOADS = "Executing this GraphQL operation would unexpectedly produce multiple payloads (due to @defer or @stream directive)";
var ExecutorThrowingOnIncremental = class extends Executor {
  executeCollectedRootFields(rootType, rootValue, originalGroupedFieldSet, serially, newDeferUsages) {
    if (newDeferUsages.length > 0) {
      if (!(this.validatedExecutionArgs.operation.operation !== OperationTypeNode.SUBSCRIPTION))
        invariant(false, "`@defer` directive not supported on subscription operations. Disable `@defer` by setting the `if` argument to `false`.");
      const reason = new Error(UNEXPECTED_MULTIPLE_PAYLOADS);
      this.abort(reason);
      throw reason;
    }
    return this.executeRootGroupedFieldSet(rootType, rootValue, originalGroupedFieldSet, serially, void 0);
  }
  executeCollectedSubfields(parentType, sourceValue, path, originalGroupedFieldSet, newDeferUsages) {
    if (newDeferUsages.length > 0) {
      if (!(this.validatedExecutionArgs.operation.operation !== OperationTypeNode.SUBSCRIPTION))
        invariant(false, "`@defer` directive not supported on subscription operations. Disable `@defer` by setting the `if` argument to `false`.");
      const reason = new Error(UNEXPECTED_MULTIPLE_PAYLOADS);
      this.abort(reason);
      throw reason;
    }
    return this.executeFields(parentType, sourceValue, path, originalGroupedFieldSet, void 0);
  }
  completeListValue(returnType, fieldDetailsList, info, path, result, positionContext) {
    const streamUsage = getStreamUsage2(this.validatedExecutionArgs, fieldDetailsList);
    if (streamUsage !== void 0) {
      if (!(this.validatedExecutionArgs.operation.operation !== OperationTypeNode.SUBSCRIPTION))
        invariant(false, "`@stream` directive not supported on subscription operations. Disable `@stream` by setting the `if` argument to `false`.");
      const reason = new Error(UNEXPECTED_MULTIPLE_PAYLOADS);
      this.abort(reason);
      throw reason;
    }
    return super.completeListValue(returnType, fieldDetailsList, info, path, result, positionContext);
  }
};

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/execution/withConcurrentAbruptClose.mjs
var asyncDispose = Symbol.asyncDispose ?? /* @__PURE__ */ Symbol.for("Symbol.asyncDispose");
function withConcurrentAbruptClose(generator, beforeReturn, beforeThrow = beforeReturn) {
  let completed = false;
  let abruptCloseRequested = false;
  const runAbruptCloseFn = (fn) => {
    if (completed || abruptCloseRequested) {
      return;
    }
    abruptCloseRequested = true;
    return ignoreErrors(fn);
  };
  return {
    [Symbol.asyncIterator]() {
      return this;
    },
    next() {
      const result = generator.next();
      result.then((iteration) => {
        if (iteration.done) {
          completed = true;
        }
      }).catch(() => void 0);
      return result;
    },
    async return() {
      await runAbruptCloseFn(beforeReturn);
      return generator.return();
    },
    async throw(error) {
      await runAbruptCloseFn(() => beforeThrow(error));
      return generator.throw(error);
    },
    async [asyncDispose]() {
      await runAbruptCloseFn(beforeReturn);
      if (typeof generator[asyncDispose] === "function") {
        await generator[asyncDispose]();
      }
    }
  };
}
function ignoreErrors(fn) {
  try {
    const result = fn();
    if (isPromise(result)) {
      return result.catch(() => {
      });
    }
  } catch {
  }
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/execution/mapAsyncIterable.mjs
function mapAsyncIterable(iterable, callback) {
  const iterator = iterable[Symbol.asyncIterator]();
  const returnFn = iterator.return?.bind(iterator);
  const throwFn = iterator.throw?.bind(iterator);
  const onReturn = returnFn ? () => callIgnoringErrors(returnFn) : () => Promise.resolve();
  const onThrow = throwFn ? (reason) => callIgnoringErrors(() => throwFn(reason)) : onReturn;
  return withConcurrentAbruptClose(mapAsyncIterableImpl(iterable, callback), onReturn, onThrow);
}
async function callIgnoringErrors(fn) {
  try {
    await fn();
  } catch {
  }
}
async function* mapAsyncIterableImpl(iterable, mapFn) {
  for await (const value of iterable) {
    const result = mapFn(value);
    if (isPromise(result)) {
      yield await result;
      continue;
    }
    yield result;
  }
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/execution/execute.mjs
var UNEXPECTED_EXPERIMENTAL_DIRECTIVES = "The provided schema unexpectedly contains experimental directives (@defer or @stream). These directives may only be utilized if experimental execution features are explicitly enabled.";
function execute(args) {
  if (!shouldTrace(executeChannel)) {
    return executeImpl(args);
  }
  return traceMixed(executeChannel, buildOperationContextFromArgs(args), () => executeImpl(args));
}
function buildOperationContextFromArgs(args) {
  let operation;
  const resolveOperation = () => {
    if (operation === void 0) {
      operation = getOperationAST(args.document, args.operationName);
    }
    return operation;
  };
  return {
    schema: args.schema,
    document: args.document,
    rawVariableValues: args.variableValues,
    get operationName() {
      return args.operationName ?? resolveOperation()?.name?.value;
    },
    get operationType() {
      return resolveOperation()?.operation;
    }
  };
}
function executeImpl(args) {
  if (args.schema.getDirective("defer") || args.schema.getDirective("stream")) {
    throw new Error(UNEXPECTED_EXPERIMENTAL_DIRECTIVES);
  }
  const validatedExecutionArgs = validateExecutionArgs(args);
  if (!("schema" in validatedExecutionArgs)) {
    return { errors: validatedExecutionArgs };
  }
  return executeRootSelectionSet(validatedExecutionArgs);
}
function executeRootSelectionSet(validatedExecutionArgs) {
  return new ExecutorThrowingOnIncremental(validatedExecutionArgs).executeRootSelectionSet();
}
function executeSubscriptionEvent(validatedExecutionArgs) {
  return new ExecutorThrowingOnIncremental(validatedExecutionArgs).executeRootSelectionSet(false);
}
function subscribe(args) {
  if (!shouldTrace(subscribeChannel)) {
    return subscribeImpl(args);
  }
  return traceMixed(subscribeChannel, buildOperationContextFromArgs(args), () => subscribeImpl(args));
}
function subscribeImpl(args) {
  const validatedExecutionArgs = validateSubscriptionArgs(args);
  if (!("schema" in validatedExecutionArgs)) {
    return { errors: validatedExecutionArgs };
  }
  const resultOrStream = createSourceEventStream(validatedExecutionArgs);
  if (isPromise(resultOrStream)) {
    return resultOrStream.then((resolvedResultOrStream) => isAsyncIterable(resolvedResultOrStream) ? mapSourceToResponseEvent(validatedExecutionArgs, resolvedResultOrStream) : resolvedResultOrStream);
  }
  return isAsyncIterable(resultOrStream) ? mapSourceToResponseEvent(validatedExecutionArgs, resultOrStream) : resultOrStream;
}
function createSourceEventStream(validatedExecutionArgs) {
  if (!("operation" in validatedExecutionArgs)) {
    throw new GraphQLError("Passing ExecutionArgs to createSourceEventStream() was removed in graphql-js@17.0.0; call validateSubscriptionArgs() first and pass the result instead, or use subscribe() for the full subscription pipeline.");
  }
  try {
    const eventStream = executeSubscription(validatedExecutionArgs);
    if (isPromise(eventStream)) {
      return eventStream.then(void 0, (error) => ({
        errors: [ensureGraphQLError(error)]
      }));
    }
    return eventStream;
  } catch (error) {
    return { errors: [ensureGraphQLError(error)] };
  }
}
function validateExecutionArgs(args) {
  const { schema: schema2, document, rootValue, contextValue, variableValues: rawVariableValues, operationName, fieldResolver, typeResolver, subscribeFieldResolver, abortSignal: externalAbortSignal, enableEarlyExecution, hooks, options } = args;
  assertValidSchema(schema2);
  let operation;
  const fragmentDefinitions = /* @__PURE__ */ Object.create(null);
  const fragments = /* @__PURE__ */ Object.create(null);
  const fragmentVariableSignatureErrors = [];
  for (const definition of document.definitions) {
    switch (definition.kind) {
      case kinds_exports.OPERATION_DEFINITION:
        if (operationName == null) {
          if (operation !== void 0) {
            return [
              new GraphQLError("Must provide operation name if query contains multiple operations.")
            ];
          }
          operation = definition;
        } else if (definition.name?.value === operationName) {
          operation = definition;
        }
        break;
      case kinds_exports.FRAGMENT_DEFINITION: {
        fragmentDefinitions[definition.name.value] = definition;
        let variableSignatures;
        if (definition.variableDefinitions) {
          const signatures = /* @__PURE__ */ Object.create(null);
          for (const varDef of definition.variableDefinitions) {
            const signature = getVariableSignature(schema2, varDef);
            if (signature instanceof GraphQLError) {
              fragmentVariableSignatureErrors.push(signature);
              continue;
            }
            signatures[signature.name] = signature;
          }
          variableSignatures = signatures;
        }
        fragments[definition.name.value] = { definition, variableSignatures };
        break;
      }
      default:
    }
  }
  if (!operation) {
    if (operationName != null) {
      return [new GraphQLError(`Unknown operation named "${operationName}".`)];
    }
    return [new GraphQLError("Must provide an operation.")];
  }
  if (fragmentVariableSignatureErrors.length > 0) {
    return fragmentVariableSignatureErrors;
  }
  const variableDefinitions = operation.variableDefinitions ?? [];
  const hideSuggestions = args.hideSuggestions ?? false;
  const coercionInput = rawVariableValues ?? {};
  const coercionOptions = {
    maxErrors: options?.maxCoercionErrors ?? 50,
    hideSuggestions
  };
  const coercionChannel = executeVariableCoercionChannel;
  const variableValuesOrErrors = shouldTrace(coercionChannel) ? traceMixed(coercionChannel, {
    schema: schema2,
    document,
    operation,
    rawVariableValues,
    operationName: operation.name?.value,
    operationType: operation.operation
  }, () => getVariableValues(schema2, variableDefinitions, coercionInput, coercionOptions)) : getVariableValues(schema2, variableDefinitions, coercionInput, coercionOptions);
  if (variableValuesOrErrors.errors) {
    return variableValuesOrErrors.errors;
  }
  const errorPropagation = !operation.directives?.find((directive) => directive.name.value === GraphQLDisableErrorPropagationDirective.name);
  return {
    schema: schema2,
    document,
    fragmentDefinitions,
    fragments,
    rootValue,
    contextValue,
    operation,
    variableValues: variableValuesOrErrors.variableValues,
    fieldResolver: fieldResolver ?? defaultFieldResolver,
    typeResolver: typeResolver ?? defaultTypeResolver,
    subscribeFieldResolver: subscribeFieldResolver ?? defaultFieldResolver,
    hideSuggestions,
    errorPropagation,
    externalAbortSignal: externalAbortSignal ?? void 0,
    enableEarlyExecution: enableEarlyExecution === true,
    hooks: hooks ?? void 0,
    rawVariableValues
  };
}
function validateSubscriptionArgs(args) {
  const validatedExecutionArgs = validateExecutionArgs(args);
  if (!("schema" in validatedExecutionArgs)) {
    return validatedExecutionArgs;
  }
  assertSubscriptionExecutionArgs(validatedExecutionArgs);
  return validatedExecutionArgs;
}
function assertSubscriptionExecutionArgs(validatedExecutionArgs) {
  if (!isSubscriptionOperationDefinitionNode(validatedExecutionArgs.operation)) {
    throw new GraphQLError("Expected subscription operation.");
  }
}
var defaultTypeResolver = function(value, contextValue, info, abstractType) {
  if (isObjectLike(value) && typeof value.__typename === "string") {
    return value.__typename;
  }
  const possibleTypes = info.schema.getPossibleTypes(abstractType);
  const promisedIsTypeOfResults = [];
  try {
    for (let i = 0; i < possibleTypes.length; i++) {
      const type = possibleTypes[i];
      if (type.isTypeOf) {
        const isTypeOfResult = type.isTypeOf(value, contextValue, info);
        if (isPromiseLike(isTypeOfResult)) {
          promisedIsTypeOfResults[i] = isTypeOfResult;
        } else if (isTypeOfResult) {
          if (promisedIsTypeOfResults.length) {
            info.getAsyncHelpers().track(promisedIsTypeOfResults);
          }
          return type.name;
        }
      }
    }
  } catch (error) {
    if (promisedIsTypeOfResults.length) {
      info.getAsyncHelpers().track(promisedIsTypeOfResults);
    }
    throw error;
  }
  if (promisedIsTypeOfResults.length) {
    return info.getAsyncHelpers().promiseAll(promisedIsTypeOfResults).then((isTypeOfResults) => {
      for (let i = 0; i < isTypeOfResults.length; i++) {
        if (isTypeOfResults[i]) {
          return possibleTypes[i].name;
        }
      }
    });
  }
};
var defaultFieldResolver = function(source, args, contextValue, info) {
  if (isObjectLike(source) || typeof source === "function") {
    const property = source[info.fieldName];
    if (typeof property === "function") {
      return source[info.fieldName](args, contextValue, info);
    }
    return property;
  }
};
function mapSourceToResponseEvent(validatedExecutionArgs, sourceEventStream, rootSelectionSetExecutor = executeSubscriptionEvent) {
  function mapFn(payload) {
    const perEventExecutionArgs = {
      ...validatedExecutionArgs,
      rootValue: payload
    };
    return rootSelectionSetExecutor(perEventExecutionArgs);
  }
  const externalAbortSignal = validatedExecutionArgs.externalAbortSignal;
  if (externalAbortSignal) {
    const generator = mapAsyncIterable(sourceEventStream, mapFn);
    return {
      ...generator,
      next: () => cancellablePromise(generator.next(), externalAbortSignal)
    };
  }
  return mapAsyncIterable(sourceEventStream, mapFn);
}
function executeSubscription(validatedExecutionArgs) {
  const { schema: schema2, fragments, rootValue, contextValue, operation, variableValues, hideSuggestions, externalAbortSignal } = validatedExecutionArgs;
  const rootType = schema2.getSubscriptionType();
  if (rootType == null) {
    throw new GraphQLError("Schema is not configured to execute subscription operation.", { nodes: operation });
  }
  const { groupedFieldSet } = collectFields(schema2, fragments, variableValues, rootType, operation.selectionSet, hideSuggestions);
  const firstRootField = groupedFieldSet.entries().next().value;
  const [responseName, fieldDetailsList] = firstRootField;
  const firstFieldDetails = fieldDetailsList[0];
  const firstNode = firstFieldDetails.node;
  const fieldName = firstNode.name.value;
  const fieldDef = schema2.getField(rootType, fieldName);
  const fieldNodes = fieldDetailsList.map((fieldDetails) => fieldDetails.node);
  if (!fieldDef) {
    throw new GraphQLError(`The subscription field "${fieldName}" is not defined.`, { nodes: fieldNodes });
  }
  const sharedExecutionContext = createSharedExecutionContext(externalAbortSignal);
  const path = addPath(void 0, responseName, rootType.name);
  const info = buildResolveInfo(validatedExecutionArgs, fieldDef, fieldNodes, rootType, path, sharedExecutionContext.getAbortSignal, sharedExecutionContext.getAsyncHelpers);
  try {
    const args = getArgumentValues(fieldDef, firstNode, variableValues, firstFieldDetails.fragmentVariableValues, hideSuggestions);
    const resolveFn = fieldDef.subscribe ?? validatedExecutionArgs.subscribeFieldResolver;
    const result = resolveFn(rootValue, args, contextValue, info);
    if (isPromiseLike(result)) {
      const promisedResult = Promise.resolve(result);
      const promise = externalAbortSignal ? cancellablePromise(promisedResult, externalAbortSignal) : promisedResult;
      return promise.then(assertEventStream).then(void 0, (error) => {
        throw locatedError(error, toNodes3(fieldDetailsList), pathToArray(path));
      });
    }
    return assertEventStream(result);
  } catch (error) {
    throw locatedError(error, fieldNodes, pathToArray(path));
  }
}
function assertEventStream(result) {
  if (result instanceof Error) {
    throw result;
  }
  if (!isAsyncIterable(result)) {
    throw new GraphQLError(`Subscription field must return Async Iterable. Received: ${inspect(result)}.`);
  }
  return result;
}
function toNodes3(fieldDetailsList) {
  return fieldDetailsList.map((fieldDetails) => fieldDetails.node);
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/harness.mjs
var defaultHarness = {
  parse,
  validate,
  execute,
  subscribe
};

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/graphql.mjs
function graphql(args) {
  return new Promise((resolve) => resolve(graphqlImpl(args)));
}
function graphqlImpl(args) {
  const harness = args.harness ?? defaultHarness;
  const { schema: schema2, source } = args;
  const schemaValidationErrors = validateSchema(schema2);
  if (schemaValidationErrors.length > 0) {
    return { errors: schemaValidationErrors };
  }
  let document;
  try {
    document = harness.parse(source, args);
  } catch (syntaxError2) {
    return { errors: [ensureGraphQLError(syntaxError2)] };
  }
  if (isPromise(document)) {
    return document.then((resolvedDocument) => validateAndExecute(harness, args, schema2, resolvedDocument), (syntaxError2) => ({ errors: [ensureGraphQLError(syntaxError2)] }));
  }
  return validateAndExecute(harness, args, schema2, document);
}
function validateAndExecute(harness, args, schema2, document) {
  const validationResult = harness.validate(schema2, document, args.rules, args);
  if (isPromise(validationResult)) {
    return validationResult.then((resolvedValidationResult) => checkValidationAndExecute(harness, args, resolvedValidationResult, document));
  }
  return checkValidationAndExecute(harness, args, validationResult, document);
}
function checkValidationAndExecute(harness, args, validationResult, document) {
  if (validationResult.length > 0) {
    return { errors: validationResult };
  }
  return harness.execute({ ...args, document });
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/utilities/mapSchemaConfig.mjs
var SchemaElementKind = {
  SCHEMA: "SCHEMA",
  SCALAR: "SCALAR",
  OBJECT: "OBJECT",
  FIELD: "FIELD",
  ARGUMENT: "ARGUMENT",
  INTERFACE: "INTERFACE",
  UNION: "UNION",
  ENUM: "ENUM",
  ENUM_VALUE: "ENUM_VALUE",
  INPUT_OBJECT: "INPUT_OBJECT",
  INPUT_FIELD: "INPUT_FIELD",
  DIRECTIVE: "DIRECTIVE"
};
function mapSchemaConfig(schemaConfig, configMapperMapFn) {
  const configMapperMap = configMapperMapFn({
    getNamedType: getNamedType2,
    setNamedType,
    getNamedTypes
  });
  const mappedTypeMap = /* @__PURE__ */ new Map();
  for (const type of schemaConfig.types) {
    const typeName = type.name;
    const mappedNamedType = mapNamedType(type);
    if (mappedNamedType) {
      mappedTypeMap.set(typeName, mappedNamedType);
    }
  }
  const mappedDirectives = [];
  for (const directive of schemaConfig.directives) {
    if (isSpecifiedDirective(directive)) {
      mappedDirectives.push(directive);
      continue;
    }
    const mappedDirectiveConfig = mapDirective(directive.toConfig());
    if (mappedDirectiveConfig) {
      mappedDirectives.push(new GraphQLDirective(mappedDirectiveConfig));
    }
  }
  const mappedSchemaConfig = {
    ...schemaConfig,
    query: schemaConfig.query && getNamedType2(schemaConfig.query.name),
    mutation: schemaConfig.mutation && getNamedType2(schemaConfig.mutation.name),
    subscription: schemaConfig.subscription && getNamedType2(schemaConfig.subscription.name),
    types: Array.from(mappedTypeMap.values()),
    directives: mappedDirectives
  };
  const schemaMapper = configMapperMap[SchemaElementKind.SCHEMA];
  return schemaMapper == null ? mappedSchemaConfig : schemaMapper(mappedSchemaConfig);
  function getType(type) {
    if (isListType(type)) {
      return new GraphQLList(getType(type.ofType));
    }
    if (isNonNullType(type)) {
      return new GraphQLNonNull(getType(type.ofType));
    }
    return getNamedType2(type.name);
  }
  function getNamedType2(typeName) {
    const type = stdTypeMap.get(typeName) ?? mappedTypeMap.get(typeName);
    if (!(type !== void 0))
      invariant(false, `Unknown type: "${typeName}".`);
    return type;
  }
  function setNamedType(type) {
    mappedTypeMap.set(type.name, type);
  }
  function getNamedTypes() {
    return Array.from(mappedTypeMap.values());
  }
  function mapNamedType(type) {
    if (isIntrospectionType(type) || isSpecifiedScalarType(type)) {
      return type;
    }
    if (isScalarType(type)) {
      return mapScalarType(type);
    }
    if (isObjectType(type)) {
      return mapObjectType(type);
    }
    if (isInterfaceType(type)) {
      return mapInterfaceType(type);
    }
    if (isUnionType(type)) {
      return mapUnionType(type);
    }
    if (isEnumType(type)) {
      return mapEnumType(type);
    }
    if (isInputObjectType(type)) {
      return mapInputObjectType(type);
    }
    invariant(false, "Unexpected type: " + inspect(type));
  }
  function mapScalarType(type) {
    let mappedConfig = type.toConfig();
    const mapper = configMapperMap[SchemaElementKind.SCALAR];
    mappedConfig = mapper == null ? mappedConfig : mapper(mappedConfig);
    return new GraphQLScalarType(mappedConfig);
  }
  function mapObjectType(type) {
    const config = type.toConfig();
    let mappedConfig = {
      ...config,
      interfaces: () => config.interfaces.map((iface) => getNamedType2(iface.name)),
      fields: () => mapFields(config.fields, type.name)
    };
    const mapper = configMapperMap[SchemaElementKind.OBJECT];
    mappedConfig = mapper == null ? mappedConfig : mapper(mappedConfig);
    return new GraphQLObjectType(mappedConfig);
  }
  function mapFields(fieldMap, parentTypeName) {
    const newFieldMap = /* @__PURE__ */ Object.create(null);
    for (const [fieldName, field] of Object.entries(fieldMap)) {
      let mappedField = {
        ...field,
        type: getType(field.type),
        args: mapArgs(field.args, parentTypeName, fieldName)
      };
      const mapper = configMapperMap[SchemaElementKind.FIELD];
      if (mapper) {
        mappedField = mapper(mappedField, parentTypeName);
      }
      newFieldMap[fieldName] = mappedField;
    }
    return newFieldMap;
  }
  function mapArgs(argumentMap, fieldOrDirectiveName, parentTypeName) {
    const newArgumentMap = /* @__PURE__ */ Object.create(null);
    for (const [argName, arg] of Object.entries(argumentMap)) {
      let mappedArg = {
        ...arg,
        type: getType(arg.type)
      };
      const mapper = configMapperMap[SchemaElementKind.ARGUMENT];
      if (mapper) {
        mappedArg = mapper(mappedArg, fieldOrDirectiveName, parentTypeName);
      }
      newArgumentMap[argName] = mappedArg;
    }
    return newArgumentMap;
  }
  function mapInterfaceType(type) {
    const config = type.toConfig();
    let mappedConfig = {
      ...config,
      interfaces: () => config.interfaces.map((iface) => getNamedType2(iface.name)),
      fields: () => mapFields(config.fields, type.name)
    };
    const mapper = configMapperMap[SchemaElementKind.INTERFACE];
    mappedConfig = mapper == null ? mappedConfig : mapper(mappedConfig);
    return new GraphQLInterfaceType(mappedConfig);
  }
  function mapUnionType(type) {
    const config = type.toConfig();
    let mappedConfig = {
      ...config,
      types: () => config.types.map((memberType) => getNamedType2(memberType.name))
    };
    const mapper = configMapperMap[SchemaElementKind.UNION];
    mappedConfig = mapper == null ? mappedConfig : mapper(mappedConfig);
    return new GraphQLUnionType(mappedConfig);
  }
  function mapEnumType(type) {
    const config = type.toConfig();
    let mappedConfig = {
      ...config,
      values: () => {
        const newEnumValues = /* @__PURE__ */ Object.create(null);
        for (const [valueName, value] of Object.entries(config.values)) {
          const mappedValue = mapEnumValue(value, valueName, type.name);
          newEnumValues[valueName] = mappedValue;
        }
        return newEnumValues;
      }
    };
    const mapper = configMapperMap[SchemaElementKind.ENUM];
    mappedConfig = mapper == null ? mappedConfig : mapper(mappedConfig);
    return new GraphQLEnumType(mappedConfig);
  }
  function mapEnumValue(valueConfig, valueName, enumName) {
    const mappedConfig = { ...valueConfig };
    const mapper = configMapperMap[SchemaElementKind.ENUM_VALUE];
    return mapper == null ? mappedConfig : mapper(mappedConfig, valueName, enumName);
  }
  function mapInputObjectType(type) {
    const config = type.toConfig();
    let mappedConfig = {
      ...config,
      fields: () => {
        const newInputFieldMap = /* @__PURE__ */ Object.create(null);
        for (const [fieldName, field] of Object.entries(config.fields)) {
          const mappedField = mapInputField(field, fieldName, type.name);
          newInputFieldMap[fieldName] = mappedField;
        }
        return newInputFieldMap;
      }
    };
    const mapper = configMapperMap[SchemaElementKind.INPUT_OBJECT];
    mappedConfig = mapper == null ? mappedConfig : mapper(mappedConfig);
    return new GraphQLInputObjectType(mappedConfig);
  }
  function mapInputField(inputFieldConfig, inputFieldName, inputObjectTypeName) {
    const mappedConfig = {
      ...inputFieldConfig,
      type: getType(inputFieldConfig.type)
    };
    const mapper = configMapperMap[SchemaElementKind.INPUT_FIELD];
    return mapper == null ? mappedConfig : mapper(mappedConfig, inputFieldName, inputObjectTypeName);
  }
  function mapDirective(config) {
    const mappedConfig = {
      ...config,
      args: mapArgs(config.args, config.name, void 0)
    };
    const mapper = configMapperMap[SchemaElementKind.DIRECTIVE];
    return mapper == null ? mappedConfig : mapper(mappedConfig);
  }
}
var stdTypeMap = new Map([...specifiedScalarTypes, ...introspectionTypes].map((type) => [
  type.name,
  type
]));

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/utilities/extendSchema.mjs
function extendSchemaImpl(schemaConfig, documentAST, options) {
  const typeDefs = [];
  const scalarExtensions = new AccumulatorMap();
  const objectExtensions = new AccumulatorMap();
  const interfaceExtensions = new AccumulatorMap();
  const unionExtensions = new AccumulatorMap();
  const enumExtensions = new AccumulatorMap();
  const inputObjectExtensions = new AccumulatorMap();
  const directiveExtensions = new AccumulatorMap();
  const directiveDefs = [];
  let schemaDef;
  const schemaExtensions = [];
  let isSchemaChanged = false;
  for (const def of documentAST.definitions) {
    switch (def.kind) {
      case kinds_exports.SCHEMA_DEFINITION:
        schemaDef = def;
        break;
      case kinds_exports.SCHEMA_EXTENSION:
        schemaExtensions.push(def);
        break;
      case kinds_exports.DIRECTIVE_DEFINITION:
        directiveDefs.push(def);
        break;
      case kinds_exports.DIRECTIVE_EXTENSION:
        directiveExtensions.add(def.name.value, def);
        break;
      case kinds_exports.SCALAR_TYPE_DEFINITION:
      case kinds_exports.OBJECT_TYPE_DEFINITION:
      case kinds_exports.INTERFACE_TYPE_DEFINITION:
      case kinds_exports.UNION_TYPE_DEFINITION:
      case kinds_exports.ENUM_TYPE_DEFINITION:
      case kinds_exports.INPUT_OBJECT_TYPE_DEFINITION:
        typeDefs.push(def);
        break;
      case kinds_exports.SCALAR_TYPE_EXTENSION:
        scalarExtensions.add(def.name.value, def);
        break;
      case kinds_exports.OBJECT_TYPE_EXTENSION:
        objectExtensions.add(def.name.value, def);
        break;
      case kinds_exports.INTERFACE_TYPE_EXTENSION:
        interfaceExtensions.add(def.name.value, def);
        break;
      case kinds_exports.UNION_TYPE_EXTENSION:
        unionExtensions.add(def.name.value, def);
        break;
      case kinds_exports.ENUM_TYPE_EXTENSION:
        enumExtensions.add(def.name.value, def);
        break;
      case kinds_exports.INPUT_OBJECT_TYPE_EXTENSION:
        inputObjectExtensions.add(def.name.value, def);
        break;
      default:
        continue;
    }
    isSchemaChanged = true;
  }
  if (!isSchemaChanged) {
    return schemaConfig;
  }
  return mapSchemaConfig(schemaConfig, (context) => {
    const { getNamedType: getNamedType2, setNamedType, getNamedTypes } = context;
    return {
      [SchemaElementKind.SCHEMA]: (config) => {
        for (const typeNode of typeDefs) {
          const type = stdTypeMap2.get(typeNode.name.value) ?? buildNamedType(typeNode);
          setNamedType(type);
        }
        const operationTypes = {
          query: config.query && getNamedType2(config.query.name),
          mutation: config.mutation && getNamedType2(config.mutation.name),
          subscription: config.subscription && getNamedType2(config.subscription.name),
          ...schemaDef && getOperationTypes([schemaDef]),
          ...getOperationTypes(schemaExtensions)
        };
        return {
          description: schemaDef?.description?.value ?? config.description,
          ...operationTypes,
          types: getNamedTypes(),
          directives: [
            ...config.directives.map(extendDirective),
            ...directiveDefs.map(buildDirective)
          ],
          extensions: config.extensions,
          astNode: schemaDef ?? config.astNode,
          extensionASTNodes: config.extensionASTNodes.concat(schemaExtensions),
          assumeValid: options?.assumeValid ?? false
        };
      },
      [SchemaElementKind.INPUT_OBJECT]: (config) => {
        const extensions = inputObjectExtensions.get(config.name) ?? [];
        return {
          ...config,
          fields: () => ({
            ...config.fields(),
            ...buildInputFieldMap(extensions)
          }),
          extensionASTNodes: config.extensionASTNodes.concat(extensions)
        };
      },
      [SchemaElementKind.ENUM]: (config) => {
        const extensions = enumExtensions.get(config.name) ?? [];
        return {
          ...config,
          values: () => ({
            ...config.values(),
            ...buildEnumValueMap(extensions)
          }),
          extensionASTNodes: config.extensionASTNodes.concat(extensions)
        };
      },
      [SchemaElementKind.SCALAR]: (config) => {
        const extensions = scalarExtensions.get(config.name) ?? [];
        let specifiedByURL = config.specifiedByURL;
        for (const extensionNode of extensions) {
          specifiedByURL = getSpecifiedByURL(extensionNode) ?? specifiedByURL;
        }
        return {
          ...config,
          specifiedByURL,
          extensionASTNodes: config.extensionASTNodes.concat(extensions)
        };
      },
      [SchemaElementKind.OBJECT]: (config) => {
        const extensions = objectExtensions.get(config.name) ?? [];
        return {
          ...config,
          interfaces: () => [
            ...config.interfaces(),
            ...buildInterfaces(extensions)
          ],
          fields: () => ({
            ...config.fields(),
            ...buildFieldMap(extensions)
          }),
          extensionASTNodes: config.extensionASTNodes.concat(extensions)
        };
      },
      [SchemaElementKind.INTERFACE]: (config) => {
        const extensions = interfaceExtensions.get(config.name) ?? [];
        return {
          ...config,
          interfaces: () => [
            ...config.interfaces(),
            ...buildInterfaces(extensions)
          ],
          fields: () => ({
            ...config.fields(),
            ...buildFieldMap(extensions)
          }),
          extensionASTNodes: config.extensionASTNodes.concat(extensions)
        };
      },
      [SchemaElementKind.UNION]: (config) => {
        const extensions = unionExtensions.get(config.name) ?? [];
        return {
          ...config,
          types: () => [...config.types(), ...buildUnionTypes(extensions)],
          extensionASTNodes: config.extensionASTNodes.concat(extensions)
        };
      }
    };
    function getOperationTypes(nodes) {
      const opTypes = {};
      for (const node of nodes) {
        const operationTypesNodes = node.operationTypes ?? [];
        for (const operationType of operationTypesNodes) {
          opTypes[operationType.operation] = namedTypeFromAST(operationType.type);
        }
      }
      return opTypes;
    }
    function namedTypeFromAST(node) {
      const name = node.name.value;
      const type = getNamedType2(name);
      if (!(type !== void 0))
        invariant(false, `Unknown type: "${name}".`);
      return type;
    }
    function typeFromAST2(node) {
      if (node.kind === kinds_exports.LIST_TYPE) {
        return new GraphQLList(typeFromAST2(node.type));
      }
      if (node.kind === kinds_exports.NON_NULL_TYPE) {
        return new GraphQLNonNull(typeFromAST2(node.type));
      }
      return namedTypeFromAST(node);
    }
    function buildDirective(node) {
      const extensionASTNodes = directiveExtensions.get(node.name.value) ?? [];
      const deprecationReason = getDeprecationReason(node) ?? extensionASTNodes.map((extensionNode) => getDeprecationReason(extensionNode)).find((reason) => reason != null);
      return new GraphQLDirective({
        name: node.name.value,
        description: node.description?.value,
        locations: node.locations.map(({ value }) => value),
        isRepeatable: node.repeatable,
        args: buildArgumentMap(node.arguments),
        deprecationReason,
        astNode: node,
        extensionASTNodes
      });
    }
    function extendDirective(directive) {
      const extensionASTNodes = directiveExtensions.get(directive.name) ?? [];
      if (extensionASTNodes.length === 0) {
        return directive;
      }
      const deprecationReason = directive.deprecationReason ?? extensionASTNodes.map((extensionNode) => getDeprecationReason(extensionNode)).find((reason) => reason != null);
      return new GraphQLDirective({
        ...directive.toConfig(),
        deprecationReason,
        extensionASTNodes: directive.extensionASTNodes.concat(extensionASTNodes)
      });
    }
    function buildFieldMap(nodes) {
      const fieldConfigMap = /* @__PURE__ */ Object.create(null);
      for (const node of nodes) {
        const nodeFields = node.fields ?? [];
        for (const field of nodeFields) {
          fieldConfigMap[field.name.value] = {
            type: typeFromAST2(field.type),
            description: field.description?.value,
            args: buildArgumentMap(field.arguments),
            deprecationReason: getDeprecationReason(field),
            astNode: field
          };
        }
      }
      return fieldConfigMap;
    }
    function buildArgumentMap(args) {
      const argsNodes = args ?? [];
      const argConfigMap = /* @__PURE__ */ Object.create(null);
      for (const arg of argsNodes) {
        const type = typeFromAST2(arg.type);
        argConfigMap[arg.name.value] = {
          type,
          description: arg.description?.value,
          default: arg.defaultValue && { literal: arg.defaultValue },
          deprecationReason: getDeprecationReason(arg),
          astNode: arg
        };
      }
      return argConfigMap;
    }
    function buildInputFieldMap(nodes) {
      const inputFieldMap = /* @__PURE__ */ Object.create(null);
      for (const node of nodes) {
        const fieldsNodes = node.fields ?? [];
        for (const field of fieldsNodes) {
          const type = typeFromAST2(field.type);
          inputFieldMap[field.name.value] = {
            type,
            description: field.description?.value,
            default: field.defaultValue && { literal: field.defaultValue },
            deprecationReason: getDeprecationReason(field),
            astNode: field
          };
        }
      }
      return inputFieldMap;
    }
    function buildEnumValueMap(nodes) {
      const enumValueMap = /* @__PURE__ */ Object.create(null);
      for (const node of nodes) {
        const valuesNodes = node.values ?? [];
        for (const value of valuesNodes) {
          enumValueMap[value.name.value] = {
            description: value.description?.value,
            deprecationReason: getDeprecationReason(value),
            astNode: value
          };
        }
      }
      return enumValueMap;
    }
    function buildInterfaces(nodes) {
      return nodes.flatMap((node) => node.interfaces?.map(namedTypeFromAST) ?? []);
    }
    function buildUnionTypes(nodes) {
      return nodes.flatMap((node) => node.types?.map(namedTypeFromAST) ?? []);
    }
    function buildNamedType(astNode) {
      const name = astNode.name.value;
      switch (astNode.kind) {
        case kinds_exports.OBJECT_TYPE_DEFINITION: {
          const extensionASTNodes = objectExtensions.get(name) ?? [];
          const allNodes = [astNode, ...extensionASTNodes];
          return new GraphQLObjectType({
            name,
            description: astNode.description?.value,
            interfaces: () => buildInterfaces(allNodes),
            fields: () => buildFieldMap(allNodes),
            astNode,
            extensionASTNodes
          });
        }
        case kinds_exports.INTERFACE_TYPE_DEFINITION: {
          const extensionASTNodes = interfaceExtensions.get(name) ?? [];
          const allNodes = [astNode, ...extensionASTNodes];
          return new GraphQLInterfaceType({
            name,
            description: astNode.description?.value,
            interfaces: () => buildInterfaces(allNodes),
            fields: () => buildFieldMap(allNodes),
            astNode,
            extensionASTNodes
          });
        }
        case kinds_exports.ENUM_TYPE_DEFINITION: {
          const extensionASTNodes = enumExtensions.get(name) ?? [];
          const allNodes = [astNode, ...extensionASTNodes];
          return new GraphQLEnumType({
            name,
            description: astNode.description?.value,
            values: () => buildEnumValueMap(allNodes),
            astNode,
            extensionASTNodes
          });
        }
        case kinds_exports.UNION_TYPE_DEFINITION: {
          const extensionASTNodes = unionExtensions.get(name) ?? [];
          const allNodes = [astNode, ...extensionASTNodes];
          return new GraphQLUnionType({
            name,
            description: astNode.description?.value,
            types: () => buildUnionTypes(allNodes),
            astNode,
            extensionASTNodes
          });
        }
        case kinds_exports.SCALAR_TYPE_DEFINITION: {
          const extensionASTNodes = scalarExtensions.get(name) ?? [];
          let specifiedByURL = getSpecifiedByURL(astNode);
          for (const extensionNode of extensionASTNodes) {
            specifiedByURL = getSpecifiedByURL(extensionNode) ?? specifiedByURL;
          }
          return new GraphQLScalarType({
            name,
            description: astNode.description?.value,
            specifiedByURL,
            astNode,
            extensionASTNodes
          });
        }
        case kinds_exports.INPUT_OBJECT_TYPE_DEFINITION: {
          const extensionASTNodes = inputObjectExtensions.get(name) ?? [];
          const allNodes = [astNode, ...extensionASTNodes];
          return new GraphQLInputObjectType({
            name,
            description: astNode.description?.value,
            fields: () => buildInputFieldMap(allNodes),
            astNode,
            extensionASTNodes,
            isOneOf: isOneOf(astNode)
          });
        }
      }
    }
  });
}
var stdTypeMap2 = new Map([...specifiedScalarTypes, ...introspectionTypes].map((type) => [
  type.name,
  type
]));
function getDeprecationReason(node) {
  const deprecated = getDirectiveValues(GraphQLDeprecatedDirective, node);
  return deprecated?.reason;
}
function getSpecifiedByURL(node) {
  const specifiedBy = getDirectiveValues(GraphQLSpecifiedByDirective, node);
  return specifiedBy?.url;
}
function isOneOf(node) {
  return Boolean(getDirectiveValues(GraphQLOneOfDirective, node));
}

// ../../node_modules/.pnpm/graphql@17.0.0/node_modules/graphql/utilities/buildASTSchema.mjs
function buildASTSchema(documentAST, options) {
  if (options?.assumeValid !== true && options?.assumeValidSDL !== true) {
    assertValidSDL(documentAST);
  }
  const emptySchemaConfig = {
    description: void 0,
    types: [],
    directives: [],
    extensions: /* @__PURE__ */ Object.create(null),
    extensionASTNodes: [],
    assumeValid: false
  };
  const config = extendSchemaImpl(emptySchemaConfig, documentAST, options);
  if (config.astNode == null) {
    for (const type of config.types) {
      switch (type.name) {
        case "Query":
          config.query = type;
          break;
        case "Mutation":
          config.mutation = type;
          break;
        case "Subscription":
          config.subscription = type;
          break;
      }
    }
  }
  const directives = [
    ...config.directives,
    ...specifiedDirectives.filter((stdDirective) => config.directives.every((directive) => directive.name !== stdDirective.name))
  ];
  return new GraphQLSchema({ ...config, directives });
}
function buildSchema(source, options) {
  const document = parse(source, {
    noLocation: options?.noLocation,
    experimentalFragmentArguments: options?.experimentalFragmentArguments
  });
  return buildASTSchema(document, {
    assumeValidSDL: options?.assumeValidSDL,
    assumeValid: options?.assumeValid
  });
}

// ../@emulators/linear/dist/index.js
import { createHmac } from "crypto";
import { createHash } from "crypto";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join as join2 } from "path";
import { timingSafeEqual } from "crypto";
function getLinearStore(store) {
  return {
    organizations: store.collection("linear.organizations", ["linear_id", "url_key"]),
    users: store.collection("linear.users", ["linear_id", "email"]),
    teams: store.collection("linear.teams", ["linear_id", "key"]),
    workflowStates: store.collection("linear.workflow_states", ["linear_id", "team_id", "name"]),
    issueLabels: store.collection("linear.issue_labels", ["linear_id", "team_id", "name"]),
    projects: store.collection("linear.projects", ["linear_id", "team_id", "name"]),
    cycles: store.collection("linear.cycles", ["linear_id", "team_id"]),
    issues: store.collection("linear.issues", ["linear_id", "identifier", "team_id", "state_id"]),
    comments: store.collection("linear.comments", ["linear_id", "issue_id"]),
    oauthApps: store.collection("linear.oauth_apps", ["linear_id", "client_id"]),
    tokens: store.collection("linear.tokens", ["token", "user_id", "app_id"]),
    webhooks: store.collection("linear.webhooks", ["linear_id", "team_id"]),
    webhookDeliveries: store.collection("linear.webhook_deliveries", [
      "linear_id",
      "webhook_id"
    ]),
    agentSessions: store.collection("linear.agent_sessions", [
      "linear_id",
      "issue_id",
      "comment_id"
    ]),
    agentActivities: store.collection("linear.agent_activities", ["linear_id", "session_id"])
  };
}
function linearId() {
  return randomUUID();
}
function token(prefix) {
  return `${prefix}_${randomBytes(24).toString("base64url")}`;
}
function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function connectionFromArray(items, args = {}) {
  const beforeIndex = args.before ? decodeCursor(args.before) : items.length;
  const afterIndex = args.after ? decodeCursor(args.after) + 1 : 0;
  let start = Math.max(0, afterIndex);
  let end = Math.min(items.length, beforeIndex);
  if (typeof args.first === "number") {
    end = Math.min(end, start + Math.max(0, args.first));
  } else if (typeof args.last === "number") {
    start = Math.max(start, end - Math.max(0, args.last));
  } else {
    end = Math.min(end, start + 50);
  }
  const slice = items.slice(start, end);
  const edges = slice.map((node, offset) => ({
    node,
    cursor: encodeCursor(start + offset)
  }));
  return {
    nodes: slice,
    edges,
    pageInfo: {
      hasNextPage: end < items.length,
      hasPreviousPage: start > 0,
      startCursor: edges[0]?.cursor ?? null,
      endCursor: edges[edges.length - 1]?.cursor ?? null
    }
  };
}
function encodeCursor(index) {
  return Buffer.from(`linear:${index}`, "utf-8").toString("base64url");
}
function decodeCursor(cursor) {
  try {
    const decoded = Buffer.from(cursor, "base64url").toString("utf-8");
    const [, index] = decoded.split(":");
    const parsed = Number(index);
    return Number.isFinite(parsed) ? parsed : -1;
  } catch {
    return -1;
  }
}
function currentUser(store, c) {
  const ls = getLinearStore(store);
  const authUser = c.get("authUser");
  if (authUser) {
    const byLogin = resolveUser(store, authUser.login);
    if (byLogin) return byLogin;
  }
  const token2 = c.get("authToken");
  if (token2) {
    const record = ls.tokens.findOneBy("token", token2);
    if (record?.user_id) {
      const user = ls.users.findOneBy("linear_id", record.user_id);
      if (user) return user;
    }
  }
  return ls.users.all().find((user) => user.admin && !user.app) ?? ls.users.all().find((user) => !user.app) ?? ls.users.all()[0];
}
function tokenScopes(store, c) {
  const token2 = c.get("authToken");
  if (token2) {
    const record = getLinearStore(store).tokens.findOneBy("token", token2);
    if (record && record.type !== "oauth_refresh" && !record.revoked) return record.scopes;
  }
  return c.get("authScopes") ?? [];
}
function requireLinearScopes(store, c, scopes) {
  const strict = store.getData("linear.strict_scopes") ?? false;
  if (!strict || scopes.length === 0) return;
  const provided = new Set(tokenScopes(store, c));
  if (provided.has("admin")) return;
  const missing = scopes.filter((scope) => !hasLinearScope(provided, scope));
  if (missing.length === 0) return;
  throw new Error(`Missing required Linear scope: ${missing.join(", ")}`);
}
function hasLinearScope(provided, scope) {
  if (provided.has(scope)) return true;
  if (scope === "issues:create" || scope === "comments:create") return provided.has("write");
  return false;
}
async function dispatchLinearWebhook(store, event) {
  const ls = getLinearStore(store);
  const organization = ls.organizations.all()[0];
  const webhooks = ls.webhooks.all().filter((webhook) => {
    if (!webhook.enabled) return false;
    if (!webhook.resource_types.includes(event.type) && !webhook.resource_types.includes("*")) return false;
    if (webhook.all_public_teams) {
      const team = event.teamId ? ls.teams.findOneBy("linear_id", event.teamId) : void 0;
      return !team?.private;
    }
    return webhook.team_id === event.teamId;
  });
  for (const webhook of webhooks) {
    const payload = {
      action: event.action,
      type: event.type,
      actor: event.actor ? {
        id: event.actor.linear_id,
        name: event.actor.name,
        displayName: event.actor.display_name,
        email: event.actor.email
      } : null,
      data: event.data,
      url: event.url ?? null,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      organizationId: organization?.linear_id ?? null,
      webhookTimestamp: Date.now(),
      webhookId: webhook.linear_id,
      ...event.updatedFrom ? { updatedFrom: event.updatedFrom } : {}
    };
    const body = JSON.stringify(payload);
    const headers = {
      "Accept-Charset": "utf-8",
      "Content-Type": "application/json; charset=utf-8",
      "Linear-Delivery": linearId(),
      "Linear-Event": event.type,
      "User-Agent": "Linear-Webhook"
    };
    if (webhook.secret) {
      headers["Linear-Signature"] = createHmac("sha256", webhook.secret).update(body).digest("hex");
    }
    let status = null;
    let error = null;
    try {
      const res = await fetch(webhook.url, {
        method: "POST",
        headers,
        body,
        signal: AbortSignal.timeout(1e4)
      });
      status = res.status;
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
    }
    ls.webhookDeliveries.insert({
      linear_id: linearId(),
      webhook_id: webhook.linear_id,
      event: event.type,
      action: event.action,
      url: webhook.url,
      status,
      error,
      payload,
      headers
    });
  }
}
var PRIORITY_LABELS = ["No priority", "Urgent", "High", "Medium", "Low"];
var schema = buildSchema(`
  scalar TeamFilter
  scalar PaginationOrderBy

  type Query {
    viewer: User!
    organization: Organization!
    users(first: Int, after: String, last: Int, before: String, filter: UserFilter): UserConnection!
    user(id: String!): User
    teams(
      first: Int
      after: String
      last: Int
      before: String
      filter: TeamFilter
      includeArchived: Boolean
      orderBy: PaginationOrderBy
    ): TeamConnection!
    team(id: String!): Team
    workflowStates(first: Int, after: String, last: Int, before: String): WorkflowStateConnection!
    workflowState(id: String!): WorkflowState
    issues(first: Int, after: String, last: Int, before: String, filter: IssueFilter, orderBy: String): IssueConnection!
    issue(id: String!): Issue
    comments(first: Int, after: String, last: Int, before: String): CommentConnection!
    comment(id: String!): Comment
    issueLabels(first: Int, after: String, last: Int, before: String): IssueLabelConnection!
    issueLabel(id: String!): IssueLabel
    projects(first: Int, after: String, last: Int, before: String): ProjectConnection!
    project(id: String!): Project
    cycles(first: Int, after: String, last: Int, before: String): CycleConnection!
    cycle(id: String!): Cycle
    webhooks(first: Int, after: String, last: Int, before: String): WebhookConnection!
    webhook(id: String!): Webhook
    agentSessions(first: Int, after: String, last: Int, before: String): AgentSessionConnection!
    agentSession(id: String!): AgentSession
  }

  type Mutation {
    issueCreate(input: IssueCreateInput!): IssuePayload!
    issueUpdate(id: String, input: IssueUpdateInput!): IssuePayload!
    issueDelete(id: String!, permanentlyDelete: Boolean): IssueArchivePayload!
    issueArchive(id: String!, trash: Boolean): IssueArchivePayload!
    issueUnarchive(id: String!): IssueArchivePayload!
    commentCreate(input: CommentCreateInput!): CommentPayload!
    commentUpdate(id: String, input: CommentUpdateInput!, skipEditedAt: Boolean): CommentPayload!
    commentDelete(id: String!): DeletePayload!
    issueLabelCreate(input: IssueLabelCreateInput!, replaceTeamLabels: Boolean): IssueLabelPayload!
    issueLabelUpdate(id: String, input: IssueLabelUpdateInput!, replaceTeamLabels: Boolean): IssueLabelPayload!
    issueLabelDelete(id: String!): DeletePayload!
    issueAddLabel(id: String!, labelId: String!): IssuePayload!
    issueRemoveLabel(id: String!, labelId: String!): IssuePayload!
    webhookCreate(input: WebhookCreateInput!): WebhookPayload!
    webhookDelete(id: String!): DeletePayload!
    agentSessionCreateOnIssue(input: AgentSessionCreateOnIssue!): AgentSessionPayload!
    agentSessionCreateOnComment(input: AgentSessionCreateOnComment!): AgentSessionPayload!
    agentSessionUpdate(id: String, input: AgentSessionUpdateInput!): AgentSessionPayload!
    agentActivityCreate(input: AgentActivityCreateInput!): AgentActivityPayload!
  }

  type Organization {
    id: String!
    name: String!
    urlKey: String!
    url: String!
    createdAt: String!
    updatedAt: String!
    users(first: Int, after: String, last: Int, before: String): UserConnection!
    teams(
      first: Int
      after: String
      last: Int
      before: String
      filter: TeamFilter
      includeArchived: Boolean
      orderBy: PaginationOrderBy
    ): TeamConnection!
  }

  type User {
    id: String!
    name: String!
    displayName: String!
    email: String!
    description: String
    avatarUrl: String
    createdIssueCount: Int!
    avatarBackgroundColor: String
    statusUntilAt: String
    statusEmoji: String
    initials: String!
    lastSeen: String
    timezone: String
    disableReason: String
    statusLabel: String
    archivedAt: String
    gitHubUserId: String
    title: String
    url: String!
    active: Boolean!
    isAssignable: Boolean!
    guest: Boolean!
    admin: Boolean!
    owner: Boolean!
    app: Boolean!
    isMentionable: Boolean!
    isMe: Boolean!
    supportsAgentSessions: Boolean!
    canAccessAnyPublicTeam: Boolean!
    calendarHash: String
    inviteHash: String
    createdAt: String!
    updatedAt: String!
    assignedIssues(first: Int, after: String, last: Int, before: String): IssueConnection!
    createdIssues(first: Int, after: String, last: Int, before: String): IssueConnection!
  }

  type Team {
    id: String!
    key: String!
    name: String!
    description: String
    private: Boolean!
    url: String!
    createdAt: String!
    updatedAt: String!
    cycleIssueAutoAssignCompleted: Boolean
    cycleLockToActive: Boolean
    cycleIssueAutoAssignStarted: Boolean
    cycleCalenderUrl: String
    upcomingCycleCount: Int
    autoArchivePeriod: Int
    autoClosePeriod: Int
    securitySettings: String
    integrationsSettings: NodeRef
    activeCycle: Cycle
    triageResponsibility: NodeRef
    scimGroupName: String
    autoCloseStateId: String
    cycleCooldownTime: Int
    cycleStartDay: Int
    defaultTemplateForMembers: NodeRef
    defaultTemplateForNonMembers: NodeRef
    defaultProjectTemplate: NodeRef
    defaultIssueState: WorkflowState
    cycleDuration: Int
    icon: String
    defaultTemplateForMembersId: String
    defaultTemplateForNonMembersId: String
    issueEstimationType: String
    displayName: String
    color: String
    parent: Team
    archivedAt: String
    retiredAt: String
    timezone: String
    issueCount: Int
    visibility: String
    mergeWorkflowState: WorkflowState
    draftWorkflowState: WorkflowState
    startWorkflowState: WorkflowState
    mergeableWorkflowState: WorkflowState
    reviewWorkflowState: WorkflowState
    markedAsDuplicateWorkflowState: WorkflowState
    triageIssueState: WorkflowState
    defaultIssueEstimate: Int
    setIssueSortOrderOnStateChange: Boolean
    allMembersCanJoin: Boolean
    requirePriorityToLeaveTriage: Boolean
    autoCloseChildIssues: Boolean
    autoCloseParentIssues: Boolean
    scimManaged: Boolean
    inheritIssueEstimation: Boolean
    inheritWorkflowStatuses: Boolean
    cyclesEnabled: Boolean
    issueEstimationExtended: Boolean
    issueEstimationAllowZero: Boolean
    aiDiscussionSummariesEnabled: Boolean
    aiThreadSummariesEnabled: Boolean
    groupIssueHistory: Boolean
    slackIssueComments: Boolean
    slackNewIssue: Boolean
    slackIssueStatuses: Boolean
    triageEnabled: Boolean
    inviteHash: String
    issueOrderingNoPriorityFirst: Boolean
    issueSortOrderDefaultToBottom: Boolean
    states(first: Int, after: String, last: Int, before: String): WorkflowStateConnection!
    issues(first: Int, after: String, last: Int, before: String, filter: IssueFilter): IssueConnection!
    labels(first: Int, after: String, last: Int, before: String): IssueLabelConnection!
    projects(first: Int, after: String, last: Int, before: String): ProjectConnection!
    cycles(first: Int, after: String, last: Int, before: String): CycleConnection!
    webhooks(first: Int, after: String, last: Int, before: String): WebhookConnection!
  }

  type WorkflowState {
    id: String!
    name: String!
    type: String!
    position: Int!
    createdAt: String!
    updatedAt: String!
    team: Team!
    issues(first: Int, after: String, last: Int, before: String): IssueConnection!
  }

  type Issue {
    id: String!
    identifier: String!
    number: Int!
    title: String!
    description: String
    priority: Int!
    priorityLabel: String!
    url: String!
    createdAt: String!
    updatedAt: String!
    archivedAt: String
    canceledAt: String
    completedAt: String
    startedAt: String
    dueDate: String
    createAsUser: String
    displayIconUrl: String
    team: Team!
    state: WorkflowState!
    assignee: User
    creator: User
    delegate: User
    labels(first: Int, after: String, last: Int, before: String): IssueLabelConnection!
    comments(first: Int, after: String, last: Int, before: String): CommentConnection!
    project: Project
    cycle: Cycle
  }

  type Comment {
    id: String!
    body: String!
    createdAt: String!
    updatedAt: String!
    createAsUser: String
    displayIconUrl: String
    issue: Issue!
    user: User
  }

  type IssueLabel {
    id: String!
    name: String!
    color: String!
    description: String
    createdAt: String!
    updatedAt: String!
    team: Team
    issues(first: Int, after: String, last: Int, before: String): IssueConnection!
  }

  type Project {
    id: String!
    name: String!
    description: String
    state: String!
    createdAt: String!
    updatedAt: String!
    team: Team
    issues(first: Int, after: String, last: Int, before: String): IssueConnection!
  }

  type Cycle {
    id: String!
    name: String!
    number: Int!
    startsAt: String
    endsAt: String
    createdAt: String!
    updatedAt: String!
    team: Team!
    issues(first: Int, after: String, last: Int, before: String): IssueConnection!
  }

  type Webhook {
    id: String!
    label: String!
    url: String!
    enabled: Boolean!
    resourceTypes: [String!]!
    allPublicTeams: Boolean!
    secret: String
    createdAt: String!
    updatedAt: String!
    team: Team
  }

  type AgentSession {
    id: String!
    state: String!
    plan: String
    externalUrl: String
    createdAt: String!
    updatedAt: String!
    issue: Issue
    comment: Comment
    agentUser: User!
    activities(first: Int, after: String, last: Int, before: String): AgentActivityConnection!
  }

  type AgentActivity {
    id: String!
    type: String!
    body: String!
    ephemeral: Boolean!
    createdAt: String!
    updatedAt: String!
    session: AgentSession!
    user: User
  }

  type NodeRef {
    id: String!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type UserEdge { node: User! cursor: String! }
  type TeamEdge { node: Team! cursor: String! }
  type WorkflowStateEdge { node: WorkflowState! cursor: String! }
  type IssueEdge { node: Issue! cursor: String! }
  type CommentEdge { node: Comment! cursor: String! }
  type IssueLabelEdge { node: IssueLabel! cursor: String! }
  type ProjectEdge { node: Project! cursor: String! }
  type CycleEdge { node: Cycle! cursor: String! }
  type WebhookEdge { node: Webhook! cursor: String! }
  type AgentSessionEdge { node: AgentSession! cursor: String! }
  type AgentActivityEdge { node: AgentActivity! cursor: String! }

  type UserConnection { nodes: [User!]! edges: [UserEdge!]! pageInfo: PageInfo! }
  type TeamConnection { nodes: [Team!]! edges: [TeamEdge!]! pageInfo: PageInfo! }
  type WorkflowStateConnection { nodes: [WorkflowState!]! edges: [WorkflowStateEdge!]! pageInfo: PageInfo! }
  type IssueConnection { nodes: [Issue!]! edges: [IssueEdge!]! pageInfo: PageInfo! }
  type CommentConnection { nodes: [Comment!]! edges: [CommentEdge!]! pageInfo: PageInfo! }
  type IssueLabelConnection { nodes: [IssueLabel!]! edges: [IssueLabelEdge!]! pageInfo: PageInfo! }
  type ProjectConnection { nodes: [Project!]! edges: [ProjectEdge!]! pageInfo: PageInfo! }
  type CycleConnection { nodes: [Cycle!]! edges: [CycleEdge!]! pageInfo: PageInfo! }
  type WebhookConnection { nodes: [Webhook!]! edges: [WebhookEdge!]! pageInfo: PageInfo! }
  type AgentSessionConnection { nodes: [AgentSession!]! edges: [AgentSessionEdge!]! pageInfo: PageInfo! }
  type AgentActivityConnection { nodes: [AgentActivity!]! edges: [AgentActivityEdge!]! pageInfo: PageInfo! }

  type IssuePayload { success: Boolean! lastSyncId: Float issue: Issue }
  type CommentPayload { success: Boolean! lastSyncId: Float comment: Comment }
  type IssueLabelPayload { success: Boolean! lastSyncId: Float issueLabel: IssueLabel }
  type WebhookPayload { success: Boolean! lastSyncId: Float webhook: Webhook }
  type AgentSessionPayload { success: Boolean! lastSyncId: Float agentSession: AgentSession }
  type AgentActivityPayload { success: Boolean! lastSyncId: Float agentActivity: AgentActivity }
  type IssueArchivePayload { success: Boolean! lastSyncId: Float entity: Issue }
  type DeletePayload { success: Boolean! lastSyncId: Float entityId: String }

  input StringComparator {
    eq: String
    neq: String
    in: [String!]
    nin: [String!]
    contains: String
    startsWith: String
    endsWith: String
    eqIgnoreCase: String
    neqIgnoreCase: String
    null: Boolean
  }

  input IssueFilter {
    id: StringComparator
    identifier: StringComparator
    title: StringComparator
    team: StringComparator
    state: StringComparator
    assignee: StringComparator
    creator: StringComparator
    project: StringComparator
    cycle: StringComparator
    labels: StringComparator
    or: [IssueFilter!]
  }

  input UserFilter {
    id: StringComparator
    email: StringComparator
    name: StringComparator
    active: Boolean
    admin: Boolean
  }

  input IssueCreateInput {
    teamId: String!
    title: String!
    description: String
    priority: Int
    stateId: String
    assigneeId: String
    delegateId: String
    labelIds: [String!]
    projectId: String
    cycleId: String
    createAsUser: String
    displayIconUrl: String
    dueDate: String
  }

  input IssueUpdateInput {
    id: String
    title: String
    description: String
    priority: Int
    stateId: String
    assigneeId: String
    delegateId: String
    labelIds: [String!]
    projectId: String
    cycleId: String
    archivedAt: String
    dueDate: String
  }

  input CommentCreateInput {
    issueId: String!
    body: String!
    createAsUser: String
    displayIconUrl: String
  }

  input CommentUpdateInput {
    id: String
    body: String!
  }

  input IssueLabelCreateInput {
    name: String!
    color: String
    description: String
    teamId: String
  }

  input IssueLabelUpdateInput {
    id: String
    name: String
    color: String
    description: String
  }

  input WebhookCreateInput {
    url: String!
    label: String
    resourceTypes: [String!]
    teamId: String
    allPublicTeams: Boolean
    secret: String
    enabled: Boolean
  }

  input AgentSessionCreateOnIssue {
    issueId: String!
    agentUserId: String
    plan: String
    externalUrl: String
  }

  input AgentSessionCreateOnComment {
    commentId: String!
    agentUserId: String
    plan: String
    externalUrl: String
  }

  input AgentSessionUpdateInput {
    id: String
    state: String
    plan: String
    externalUrl: String
  }

  input AgentActivityCreateInput {
    sessionId: String!
    type: String!
    body: String!
    ephemeral: Boolean
  }
`);
function graphqlRoutes(ctx) {
  const { app, store, baseUrl } = ctx;
  app.get("/graphql", async (c) => {
    const result = await runGraphQL(c.req.query("query") ?? "", {
      variables: parseVariables(c.req.query("variables")),
      operationName: c.req.query("operationName") ?? void 0,
      context: { store, c, baseUrl }
    });
    return c.json(result, result.errors ? 400 : 200);
  });
  app.post("/graphql", async (c) => {
    const body = await readGraphQLBody(c);
    const result = await runGraphQL(body.query, {
      variables: body.variables,
      operationName: body.operationName,
      context: { store, c, baseUrl }
    });
    return c.json(result, result.errors ? 400 : 200);
  });
}
async function runGraphQL(query, opts) {
  if (!query) {
    return { errors: [{ message: "GraphQL query is required" }] };
  }
  return graphql({
    schema,
    source: query,
    rootValue: createRoot(opts.context),
    contextValue: opts.context,
    variableValues: opts.variables,
    operationName: opts.operationName
  });
}
async function readGraphQLBody(c) {
  const contentType = c.req.header("content-type") ?? "";
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const body2 = await c.req.parseBody();
    return {
      query: bodyStr(body2.query),
      variables: parseVariables(bodyStr(body2.variables)),
      operationName: bodyStr(body2.operationName) || void 0
    };
  }
  const body = await c.req.json().catch(() => ({}));
  return {
    query: typeof body.query === "string" ? body.query : "",
    variables: isRecord(body.variables) ? body.variables : void 0,
    operationName: typeof body.operationName === "string" ? body.operationName : void 0
  };
}
function createRoot(context) {
  const { store, c, baseUrl } = context;
  const ls = () => getLinearStore(store);
  const requireRead = () => requireLinearScopes(store, c, ["read"]);
  return {
    viewer: () => {
      requireRead();
      return formatUser(context, requireCurrentUser(context));
    },
    organization: () => {
      requireRead();
      return formatOrganization(context);
    },
    users: (args) => {
      requireRead();
      return connectUsers(context, filterUsers(context, ls().users.all(), args.filter), args);
    },
    user: ({ id }) => {
      requireRead();
      const user = resolveUser(store, id);
      return user ? formatUser(context, user) : null;
    },
    teams: (args) => {
      requireRead();
      return connectTeams(context, filteredTeams(context, args.filter, args.includeArchived, args.orderBy), args);
    },
    team: ({ id }) => {
      requireRead();
      const team = resolveTeam(store, id);
      return team ? formatTeam(context, team) : null;
    },
    workflowStates: (args) => {
      requireRead();
      return connectStates(context, sortByPosition(ls().workflowStates.all()), args);
    },
    workflowState: ({ id }) => {
      requireRead();
      const state = resolveState(store, id);
      return state ? formatState(context, state) : null;
    },
    issues: (args) => {
      requireRead();
      return connectIssues(context, filteredIssues(context, args.filter, args.orderBy), args);
    },
    issue: ({ id }) => {
      requireRead();
      const issue = resolveIssue(store, id);
      return issue ? formatIssue(context, issue) : null;
    },
    comments: (args) => {
      requireRead();
      return connectComments(context, sortByCreated(ls().comments.all()), args);
    },
    comment: ({ id }) => {
      requireRead();
      const comment = ls().comments.findOneBy("linear_id", id);
      return comment ? formatComment(context, comment) : null;
    },
    issueLabels: (args) => {
      requireRead();
      return connectLabels(context, sortByCreated(ls().issueLabels.all()), args);
    },
    issueLabel: ({ id }) => {
      requireRead();
      const label = resolveLabel(store, id);
      return label ? formatLabel(context, label) : null;
    },
    projects: (args) => {
      requireRead();
      return connectProjects(context, sortByCreated(ls().projects.all()), args);
    },
    project: ({ id }) => {
      requireRead();
      const project = resolveProject(store, id);
      return project ? formatProject(context, project) : null;
    },
    cycles: (args) => {
      requireRead();
      return connectCycles(context, sortByCreated(ls().cycles.all()), args);
    },
    cycle: ({ id }) => {
      requireRead();
      const cycle = resolveCycle(store, id);
      return cycle ? formatCycle(context, cycle) : null;
    },
    webhooks: (args) => {
      requireLinearScopes(store, c, ["admin"]);
      return connectWebhooks(context, sortByCreated(ls().webhooks.all()), args);
    },
    webhook: ({ id }) => {
      requireLinearScopes(store, c, ["admin"]);
      const webhook = ls().webhooks.findOneBy("linear_id", id);
      return webhook ? formatWebhook(context, webhook) : null;
    },
    agentSessions: (args) => {
      requireRead();
      return connectAgentSessions(context, sortByCreated(ls().agentSessions.all()), args);
    },
    agentSession: ({ id }) => {
      requireRead();
      const session = ls().agentSessions.findOneBy("linear_id", id);
      return session ? formatAgentSession(context, session) : null;
    },
    issueCreate: async ({ input }) => {
      requireLinearScopes(store, c, ["issues:create"]);
      const actor = requireCurrentUser(context);
      const team = requireTeam(store, input.teamId);
      const requestedStateId = stringInput(input.stateId);
      const state = requestedStateId ? resolveState(store, requestedStateId, team.linear_id) : resolveState(store, "Todo", team.linear_id) ?? ls().workflowStates.findBy("team_id", team.linear_id)[0];
      if (requestedStateId && !state) throw new Error(`Workflow state not found: ${requestedStateId}`);
      if (!state) throw new Error("No workflow state exists for the selected team");
      const labelIds = resolveIssueLabelIds(store, input.labelIds, team.linear_id);
      const title = requiredString(input.title, "title");
      const description = nullableString(input.description);
      const priority = normalizePriority(input.priority);
      const assigneeId = resolveNullableUserId(store, input.assigneeId, "assigneeId");
      const delegateId = resolveNullableUserId(store, input.delegateId, "delegateId");
      const projectId = resolveNullableProjectId(store, input.projectId, team.linear_id);
      const cycleId = resolveNullableCycleId(store, input.cycleId, team.linear_id);
      const dueDate = nullableString(input.dueDate);
      const createAsUser = nullableString(input.createAsUser);
      const displayIconUrl = nullableString(input.displayIconUrl);
      const number = nextIssueNumber(store, team.linear_id);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const issue = ls().issues.insert({
        linear_id: linearId(),
        identifier: `${team.key}-${number}`,
        number,
        team_id: team.linear_id,
        title,
        description,
        priority,
        state_id: state.linear_id,
        assignee_id: assigneeId,
        creator_id: actor.linear_id,
        delegate_id: delegateId,
        project_id: projectId,
        cycle_id: cycleId,
        label_ids: labelIds,
        url: `${baseUrl}/issue/${team.key}-${number}`,
        archived_at: null,
        canceled_at: state.type === "canceled" ? now : null,
        completed_at: state.type === "completed" ? now : null,
        started_at: state.type === "started" ? now : null,
        due_date: dueDate,
        create_as_user: createAsUser,
        display_icon_url: displayIconUrl
      });
      await dispatchLinearWebhook(store, {
        type: "Issue",
        action: "create",
        data: issueWebhookPayload(context, issue),
        actor,
        teamId: issue.team_id,
        url: issue.url
      });
      if (issue.delegate_id) {
        await createAgentSessionForIssue(context, issue, issue.delegate_id, actor);
      }
      return mutationPayload({ success: true, issue: formatIssue(context, issue) });
    },
    issueUpdate: async ({ id, input }) => {
      requireLinearScopes(store, c, ["write"]);
      const actor = requireCurrentUser(context);
      const issue = requireIssue(store, id ?? input.id);
      const before = issueWebhookPayload(context, issue);
      const patch = {};
      if ("title" in input) patch.title = requiredString(input.title, "title");
      if ("description" in input) patch.description = nullableString(input.description);
      if ("priority" in input) patch.priority = normalizePriority(input.priority);
      if ("stateId" in input) {
        const state = resolveState(store, stringInput(input.stateId), issue.team_id);
        if (!state) throw new Error("Workflow state not found");
        const now = (/* @__PURE__ */ new Date()).toISOString();
        patch.state_id = state.linear_id;
        patch.started_at = state.type === "started" ? issue.started_at ?? now : state.type === "completed" ? issue.started_at : null;
        patch.completed_at = state.type === "completed" ? issue.completed_at ?? now : null;
        patch.canceled_at = state.type === "canceled" ? issue.canceled_at ?? now : null;
      }
      if ("assigneeId" in input) patch.assignee_id = resolveNullableUserId(store, input.assigneeId, "assigneeId");
      if ("delegateId" in input) patch.delegate_id = resolveNullableUserId(store, input.delegateId, "delegateId");
      if ("projectId" in input) patch.project_id = resolveNullableProjectId(store, input.projectId, issue.team_id);
      if ("cycleId" in input) patch.cycle_id = resolveNullableCycleId(store, input.cycleId, issue.team_id);
      if ("labelIds" in input) patch.label_ids = resolveIssueLabelIds(store, input.labelIds, issue.team_id);
      if ("archivedAt" in input) patch.archived_at = nullableString(input.archivedAt);
      if ("dueDate" in input) patch.due_date = nullableString(input.dueDate);
      const updated = ls().issues.update(issue.id, patch);
      if (!updated) throw new Error("Issue not found");
      await dispatchLinearWebhook(store, {
        type: "Issue",
        action: "update",
        data: issueWebhookPayload(context, updated),
        actor,
        teamId: updated.team_id,
        url: updated.url,
        updatedFrom: before
      });
      if (updated.delegate_id && updated.delegate_id !== issue.delegate_id) {
        await createAgentSessionForIssue(context, updated, updated.delegate_id, actor);
      }
      return mutationPayload({ success: true, issue: formatIssue(context, updated) });
    },
    issueDelete: async ({ id }) => {
      requireLinearScopes(store, c, ["write"]);
      const issue = requireIssue(store, id);
      const actor = requireCurrentUser(context);
      const issueComments = ls().comments.findBy("issue_id", issue.linear_id);
      const issueSessions = ls().agentSessions.findBy("issue_id", issue.linear_id);
      const issueSessionIds = new Set(issueSessions.map((session) => session.linear_id));
      for (const activity of ls().agentActivities.all()) {
        if (issueSessionIds.has(activity.session_id)) ls().agentActivities.delete(activity.id);
      }
      for (const comment of issueComments) ls().comments.delete(comment.id);
      for (const session of issueSessions) ls().agentSessions.delete(session.id);
      ls().issues.delete(issue.id);
      await dispatchLinearWebhook(store, {
        type: "Issue",
        action: "remove",
        data: issueWebhookPayload(context, issue),
        actor,
        teamId: issue.team_id,
        url: issue.url
      });
      return issueArchivePayload(context, issue);
    },
    issueArchive: async ({ id }) => {
      requireLinearScopes(store, c, ["write"]);
      const issue = requireIssue(store, id);
      const updated = ls().issues.update(issue.id, { archived_at: (/* @__PURE__ */ new Date()).toISOString() });
      await dispatchLinearWebhook(store, {
        type: "Issue",
        action: "archive",
        data: issueWebhookPayload(context, updated),
        actor: requireCurrentUser(context),
        teamId: updated.team_id,
        url: updated.url
      });
      return issueArchivePayload(context, updated);
    },
    issueUnarchive: async ({ id }) => {
      requireLinearScopes(store, c, ["write"]);
      const issue = requireIssue(store, id);
      const updated = ls().issues.update(issue.id, { archived_at: null });
      await dispatchLinearWebhook(store, {
        type: "Issue",
        action: "unarchive",
        data: issueWebhookPayload(context, updated),
        actor: requireCurrentUser(context),
        teamId: updated.team_id,
        url: updated.url
      });
      return issueArchivePayload(context, updated);
    },
    commentCreate: async ({ input }) => {
      requireLinearScopes(store, c, ["comments:create"]);
      const actor = requireCurrentUser(context);
      const issue = requireIssue(store, input.issueId);
      const comment = ls().comments.insert({
        linear_id: linearId(),
        issue_id: issue.linear_id,
        user_id: actor.linear_id,
        body: requiredString(input.body, "body"),
        create_as_user: nullableString(input.createAsUser),
        display_icon_url: nullableString(input.displayIconUrl)
      });
      await dispatchLinearWebhook(store, {
        type: "Comment",
        action: "create",
        data: commentWebhookPayload(context, comment),
        actor,
        teamId: issue.team_id,
        url: issue.url
      });
      if (mentionsAppUser(context, comment.body)) {
        const appUser = ls().users.all().find((user) => user.app && comment.body.includes(user.display_name));
        if (appUser) await createAgentSessionForComment(context, comment, appUser.linear_id, actor);
      }
      return mutationPayload({ success: true, comment: formatComment(context, comment) });
    },
    commentUpdate: async ({ id, input }) => {
      requireLinearScopes(store, c, ["write"]);
      const comment = requireComment(store, id ?? input.id);
      const before = commentWebhookPayload(context, comment);
      const updated = ls().comments.update(comment.id, { body: requiredString(input.body, "body") });
      const issue = requireIssue(store, updated.issue_id);
      await dispatchLinearWebhook(store, {
        type: "Comment",
        action: "update",
        data: commentWebhookPayload(context, updated),
        actor: requireCurrentUser(context),
        teamId: issue.team_id,
        url: issue.url,
        updatedFrom: before
      });
      return mutationPayload({ success: true, comment: formatComment(context, updated) });
    },
    commentDelete: async ({ id }) => {
      requireLinearScopes(store, c, ["write"]);
      const comment = requireComment(store, id);
      const issue = requireIssue(store, comment.issue_id);
      const commentSessions = ls().agentSessions.findBy("comment_id", comment.linear_id);
      const commentSessionIds = new Set(commentSessions.map((session) => session.linear_id));
      for (const activity of ls().agentActivities.all()) {
        if (commentSessionIds.has(activity.session_id)) ls().agentActivities.delete(activity.id);
      }
      for (const session of commentSessions) ls().agentSessions.delete(session.id);
      ls().comments.delete(comment.id);
      await dispatchLinearWebhook(store, {
        type: "Comment",
        action: "remove",
        data: commentWebhookPayload(context, comment),
        actor: requireCurrentUser(context),
        teamId: issue.team_id,
        url: issue.url
      });
      return deletePayload(comment.linear_id);
    },
    issueLabelCreate: async ({ input }) => {
      requireLinearScopes(store, c, ["write"]);
      const teamRef = stringInput(input.teamId);
      const team = teamRef ? resolveTeam(store, teamRef) : void 0;
      if (teamRef && !team) throw new Error(`Team not found: ${teamRef}`);
      const label = ls().issueLabels.insert({
        linear_id: linearId(),
        team_id: team?.linear_id ?? null,
        name: requiredString(input.name, "name"),
        color: stringInput(input.color) ?? "#64748b",
        description: nullableString(input.description)
      });
      await dispatchLinearWebhook(store, {
        type: "IssueLabel",
        action: "create",
        data: labelWebhookPayload(context, label),
        actor: requireCurrentUser(context),
        teamId: label.team_id
      });
      return mutationPayload({ success: true, issueLabel: formatLabel(context, label) });
    },
    issueLabelUpdate: async ({ id, input }) => {
      requireLinearScopes(store, c, ["write"]);
      const label = requireLabel(store, id ?? input.id);
      const before = labelWebhookPayload(context, label);
      const updated = ls().issueLabels.update(label.id, {
        name: stringInput(input.name) ?? label.name,
        color: stringInput(input.color) ?? label.color,
        description: "description" in input ? nullableString(input.description) : label.description
      });
      await dispatchLinearWebhook(store, {
        type: "IssueLabel",
        action: "update",
        data: labelWebhookPayload(context, updated),
        actor: requireCurrentUser(context),
        teamId: updated.team_id,
        updatedFrom: before
      });
      return mutationPayload({ success: true, issueLabel: formatLabel(context, updated) });
    },
    issueLabelDelete: async ({ id }) => {
      requireLinearScopes(store, c, ["write"]);
      const label = requireLabel(store, id);
      for (const issue of ls().issues.all()) {
        if (issue.label_ids.includes(label.linear_id)) {
          ls().issues.update(issue.id, { label_ids: issue.label_ids.filter((labelId) => labelId !== label.linear_id) });
        }
      }
      ls().issueLabels.delete(label.id);
      await dispatchLinearWebhook(store, {
        type: "IssueLabel",
        action: "remove",
        data: labelWebhookPayload(context, label),
        actor: requireCurrentUser(context),
        teamId: label.team_id
      });
      return deletePayload(label.linear_id);
    },
    issueAddLabel: async ({ id, labelId }) => {
      requireLinearScopes(store, c, ["write"]);
      const issue = requireIssue(store, id);
      const label = requireTeamLabel(store, labelId, issue.team_id);
      const before = issueWebhookPayload(context, issue);
      const actor = requireCurrentUser(context);
      const next = Array.from(/* @__PURE__ */ new Set([...issue.label_ids, label.linear_id]));
      const updated = ls().issues.update(issue.id, { label_ids: next });
      await dispatchLinearWebhook(store, {
        type: "Issue",
        action: "update",
        data: issueWebhookPayload(context, updated),
        actor,
        teamId: updated.team_id,
        url: updated.url,
        updatedFrom: before
      });
      return mutationPayload({ success: true, issue: formatIssue(context, updated) });
    },
    issueRemoveLabel: async ({ id, labelId }) => {
      requireLinearScopes(store, c, ["write"]);
      const issue = requireIssue(store, id);
      const label = requireTeamLabel(store, labelId, issue.team_id);
      const before = issueWebhookPayload(context, issue);
      const actor = requireCurrentUser(context);
      const updated = ls().issues.update(issue.id, {
        label_ids: issue.label_ids.filter((existing) => existing !== label.linear_id)
      });
      await dispatchLinearWebhook(store, {
        type: "Issue",
        action: "update",
        data: issueWebhookPayload(context, updated),
        actor,
        teamId: updated.team_id,
        url: updated.url,
        updatedFrom: before
      });
      return mutationPayload({ success: true, issue: formatIssue(context, updated) });
    },
    webhookCreate: ({ input }) => {
      requireLinearScopes(store, c, ["admin"]);
      const teamRef = stringInput(input.teamId);
      const team = teamRef ? resolveTeam(store, teamRef) : void 0;
      if (teamRef && !team) throw new Error(`Team not found: ${teamRef}`);
      const webhook = ls().webhooks.insert({
        linear_id: linearId(),
        label: stringInput(input.label) ?? "Local webhook",
        url: requiredString(input.url, "url"),
        enabled: typeof input.enabled === "boolean" ? input.enabled : true,
        resource_types: arrayInput(input.resourceTypes, ["Issue", "Comment"]),
        team_id: team?.linear_id ?? null,
        all_public_teams: typeof input.allPublicTeams === "boolean" ? input.allPublicTeams : !team,
        secret: nullableString(input.secret),
        creator_id: requireCurrentUser(context).linear_id
      });
      return mutationPayload({ success: true, webhook: formatWebhook(context, webhook) });
    },
    webhookDelete: ({ id }) => {
      requireLinearScopes(store, c, ["admin"]);
      const webhook = requireWebhook(store, id);
      ls().webhooks.delete(webhook.id);
      return deletePayload(webhook.linear_id);
    },
    agentSessionCreateOnIssue: async ({ input }) => {
      requireLinearScopes(store, c, ["write"]);
      const issue = requireIssue(store, input.issueId);
      const actor = requireCurrentUser(context);
      const agentUserRef = stringInput(input.agentUserId);
      const agentUser = (agentUserRef ? requireUser(store, agentUserRef) : void 0) ?? ls().users.all().find((user) => user.app) ?? actor;
      const session = await createAgentSessionForIssue(
        context,
        issue,
        agentUser.linear_id,
        actor,
        nullableString(input.plan),
        nullableString(input.externalUrl)
      );
      return mutationPayload({ success: true, agentSession: formatAgentSession(context, session) });
    },
    agentSessionCreateOnComment: async ({ input }) => {
      requireLinearScopes(store, c, ["write"]);
      const comment = requireComment(store, input.commentId);
      const actor = requireCurrentUser(context);
      const agentUserRef = stringInput(input.agentUserId);
      const agentUser = (agentUserRef ? requireUser(store, agentUserRef) : void 0) ?? ls().users.all().find((user) => user.app) ?? actor;
      const session = await createAgentSessionForComment(
        context,
        comment,
        agentUser.linear_id,
        actor,
        nullableString(input.plan),
        nullableString(input.externalUrl)
      );
      return mutationPayload({ success: true, agentSession: formatAgentSession(context, session) });
    },
    agentSessionUpdate: ({ id, input }) => {
      requireLinearScopes(store, c, ["write"]);
      const session = requireAgentSession(store, id ?? input.id);
      const updated = ls().agentSessions.update(session.id, {
        state: normalizeSessionState(stringInput(input.state)) ?? session.state,
        plan: "plan" in input ? nullableString(input.plan) : session.plan,
        external_url: "externalUrl" in input ? nullableString(input.externalUrl) : session.external_url
      });
      return mutationPayload({ success: true, agentSession: formatAgentSession(context, updated) });
    },
    agentActivityCreate: async ({ input }) => {
      requireLinearScopes(store, c, ["write"]);
      const session = requireAgentSession(store, input.sessionId);
      const type = normalizeActivityType(requiredString(input.type, "type"));
      const activity = ls().agentActivities.insert({
        linear_id: linearId(),
        session_id: session.linear_id,
        user_id: requireCurrentUser(context).linear_id,
        type,
        body: requiredString(input.body, "body"),
        ephemeral: typeof input.ephemeral === "boolean" ? input.ephemeral : type === "thought" || type === "action"
      });
      if (type === "prompt") {
        await dispatchLinearWebhook(store, {
          type: "AgentSessionEvent",
          action: "prompted",
          data: agentSessionWebhookPayload(context, session),
          actor: requireCurrentUser(context),
          teamId: session.issue_id ? requireIssue(store, session.issue_id).team_id : null
        });
      }
      return mutationPayload({ success: true, agentActivity: formatAgentActivity(context, activity) });
    }
  };
}
function mutationPayload(payload) {
  return { lastSyncId: Date.now(), ...payload };
}
function deletePayload(entityId) {
  return mutationPayload({ success: true, entityId });
}
function issueArchivePayload(context, issue) {
  return mutationPayload({ success: true, entity: formatIssue(context, issue) });
}
function formatOrganization(context) {
  const org = getLinearStore(context.store).organizations.all()[0];
  if (!org) throw new Error("Linear organization has not been seeded");
  return {
    id: org.linear_id,
    name: org.name,
    urlKey: org.url_key,
    url: org.url,
    createdAt: org.created_at,
    updatedAt: org.updated_at,
    users: (args) => connectUsers(context, sortByCreated(getLinearStore(context.store).users.all()), args),
    teams: (args) => connectTeams(context, filteredTeams(context, args.filter, args.includeArchived, args.orderBy), args)
  };
}
function formatUser(context, user) {
  return {
    id: user.linear_id,
    name: user.name,
    displayName: user.display_name,
    email: user.email,
    description: null,
    avatarUrl: user.avatar_url,
    createdIssueCount: getLinearStore(context.store).issues.count((issue) => issue.creator_id === user.linear_id),
    avatarBackgroundColor: null,
    statusUntilAt: null,
    statusEmoji: null,
    initials: initials(user.display_name || user.name),
    lastSeen: user.active ? user.updated_at : null,
    timezone: "UTC",
    disableReason: null,
    statusLabel: null,
    archivedAt: null,
    gitHubUserId: null,
    title: null,
    url: `https://linear.app/user/${encodeURIComponent(user.email)}`,
    active: user.active,
    isAssignable: user.active,
    guest: false,
    admin: user.admin,
    owner: user.admin,
    app: user.app,
    isMentionable: user.active,
    isMe: currentUser(context.store, context.c)?.linear_id === user.linear_id,
    supportsAgentSessions: user.app,
    canAccessAnyPublicTeam: true,
    calendarHash: null,
    inviteHash: null,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    assignedIssues: (args) => connectIssues(
      context,
      sortByCreated(getLinearStore(context.store).issues.findBy("assignee_id", user.linear_id)),
      args
    ),
    createdIssues: (args) => connectIssues(
      context,
      sortByCreated(getLinearStore(context.store).issues.findBy("creator_id", user.linear_id)),
      args
    )
  };
}
function formatTeam(context, team) {
  const ls = getLinearStore(context.store);
  const teamStates = () => ls.workflowStates.findBy("team_id", team.linear_id);
  const stateByType = (type) => teamStates().find((state) => state.type === type);
  const formatOptionalState = (state) => state ? formatState(context, state) : null;
  return {
    id: team.linear_id,
    key: team.key,
    name: team.name,
    description: team.description,
    private: team.private,
    url: team.url,
    createdAt: team.created_at,
    updatedAt: team.updated_at,
    cycleIssueAutoAssignCompleted: false,
    cycleLockToActive: false,
    cycleIssueAutoAssignStarted: false,
    cycleCalenderUrl: null,
    upcomingCycleCount: 0,
    autoArchivePeriod: null,
    autoClosePeriod: null,
    securitySettings: null,
    integrationsSettings: null,
    activeCycle: () => {
      const activeCycle = ls.cycles.findBy("team_id", team.linear_id)[0];
      return activeCycle ? formatCycle(context, activeCycle) : null;
    },
    triageResponsibility: null,
    scimGroupName: null,
    autoCloseStateId: null,
    cycleCooldownTime: 0,
    cycleStartDay: 1,
    defaultTemplateForMembers: null,
    defaultTemplateForNonMembers: null,
    defaultProjectTemplate: null,
    defaultIssueState: () => formatOptionalState(stateByType("unstarted") ?? teamStates()[0]),
    cycleDuration: 2,
    icon: null,
    defaultTemplateForMembersId: null,
    defaultTemplateForNonMembersId: null,
    issueEstimationType: "notUsed",
    displayName: team.name,
    color: "#5e6ad2",
    parent: null,
    archivedAt: null,
    retiredAt: null,
    timezone: "UTC",
    issueCount: () => ls.issues.count((issue) => issue.team_id === team.linear_id),
    visibility: team.private ? "private" : "public",
    mergeWorkflowState: () => formatOptionalState(stateByType("completed")),
    draftWorkflowState: () => formatOptionalState(stateByType("backlog")),
    startWorkflowState: () => formatOptionalState(stateByType("started")),
    mergeableWorkflowState: () => formatOptionalState(stateByType("started")),
    reviewWorkflowState: () => formatOptionalState(stateByType("started")),
    markedAsDuplicateWorkflowState: () => formatOptionalState(stateByType("canceled")),
    triageIssueState: () => formatOptionalState(stateByType("unstarted") ?? teamStates()[0]),
    defaultIssueEstimate: null,
    setIssueSortOrderOnStateChange: false,
    allMembersCanJoin: !team.private,
    requirePriorityToLeaveTriage: false,
    autoCloseChildIssues: false,
    autoCloseParentIssues: false,
    scimManaged: false,
    inheritIssueEstimation: false,
    inheritWorkflowStatuses: false,
    cyclesEnabled: true,
    issueEstimationExtended: false,
    issueEstimationAllowZero: true,
    aiDiscussionSummariesEnabled: false,
    aiThreadSummariesEnabled: false,
    groupIssueHistory: false,
    slackIssueComments: false,
    slackNewIssue: false,
    slackIssueStatuses: false,
    triageEnabled: false,
    inviteHash: null,
    issueOrderingNoPriorityFirst: false,
    issueSortOrderDefaultToBottom: false,
    states: (args) => connectStates(context, sortByPosition(ls.workflowStates.findBy("team_id", team.linear_id)), args),
    issues: (args) => connectIssues(
      context,
      filteredIssues(context, args.filter).filter((issue) => issue.team_id === team.linear_id),
      args
    ),
    labels: (args) => connectLabels(
      context,
      sortByCreated(
        ls.issueLabels.all().filter((label) => label.team_id === team.linear_id || label.team_id === null)
      ),
      args
    ),
    projects: (args) => connectProjects(
      context,
      sortByCreated(
        ls.projects.all().filter((project) => project.team_id === team.linear_id || project.team_id === null)
      ),
      args
    ),
    cycles: (args) => connectCycles(context, sortByCreated(ls.cycles.findBy("team_id", team.linear_id)), args),
    webhooks: (args) => {
      requireLinearScopes(context.store, context.c, ["admin"]);
      return connectWebhooks(
        context,
        sortByCreated(
          ls.webhooks.all().filter((webhook) => webhook.team_id === team.linear_id || webhook.all_public_teams)
        ),
        args
      );
    }
  };
}
function formatState(context, state) {
  return {
    id: state.linear_id,
    name: state.name,
    type: state.type,
    position: state.position,
    createdAt: state.created_at,
    updatedAt: state.updated_at,
    team: () => formatTeam(context, requireTeam(context.store, state.team_id)),
    issues: (args) => connectIssues(
      context,
      sortByCreated(getLinearStore(context.store).issues.findBy("state_id", state.linear_id)),
      args
    )
  };
}
function formatIssue(context, issue) {
  const ls = getLinearStore(context.store);
  return {
    id: issue.linear_id,
    identifier: issue.identifier,
    number: issue.number,
    title: issue.title,
    description: issue.description,
    priority: issue.priority,
    priorityLabel: priorityLabelFor(issue.priority),
    url: issue.url,
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    archivedAt: issue.archived_at,
    canceledAt: issue.canceled_at,
    completedAt: issue.completed_at,
    startedAt: issue.started_at,
    dueDate: issue.due_date,
    createAsUser: issue.create_as_user,
    displayIconUrl: issue.display_icon_url,
    team: () => formatTeam(context, requireTeam(context.store, issue.team_id)),
    state: () => formatState(context, requireState(context.store, issue.state_id)),
    assignee: () => issue.assignee_id ? formatUser(context, requireUser(context.store, issue.assignee_id)) : null,
    creator: () => issue.creator_id ? formatUser(context, requireUser(context.store, issue.creator_id)) : null,
    delegate: () => issue.delegate_id ? formatUser(context, requireUser(context.store, issue.delegate_id)) : null,
    labels: (args) => connectLabels(
      context,
      issue.label_ids.map((labelId) => ls.issueLabels.findOneBy("linear_id", labelId)).filter((label) => Boolean(label)),
      args
    ),
    comments: (args) => connectComments(context, sortByCreated(ls.comments.findBy("issue_id", issue.linear_id)), args),
    project: () => issue.project_id ? formatProject(context, requireProject(context.store, issue.project_id)) : null,
    cycle: () => issue.cycle_id ? formatCycle(context, requireCycle(context.store, issue.cycle_id)) : null
  };
}
function formatComment(context, comment) {
  return {
    id: comment.linear_id,
    body: comment.body,
    createdAt: comment.created_at,
    updatedAt: comment.updated_at,
    createAsUser: comment.create_as_user,
    displayIconUrl: comment.display_icon_url,
    issue: () => formatIssue(context, requireIssue(context.store, comment.issue_id)),
    user: () => comment.user_id ? formatUser(context, requireUser(context.store, comment.user_id)) : null
  };
}
function formatLabel(context, label) {
  return {
    id: label.linear_id,
    name: label.name,
    color: label.color,
    description: label.description,
    createdAt: label.created_at,
    updatedAt: label.updated_at,
    team: () => label.team_id ? formatTeam(context, requireTeam(context.store, label.team_id)) : null,
    issues: (args) => connectIssues(
      context,
      sortByCreated(
        getLinearStore(context.store).issues.all().filter((issue) => issue.label_ids.includes(label.linear_id))
      ),
      args
    )
  };
}
function formatProject(context, project) {
  return {
    id: project.linear_id,
    name: project.name,
    description: project.description,
    state: project.state,
    createdAt: project.created_at,
    updatedAt: project.updated_at,
    team: () => project.team_id ? formatTeam(context, requireTeam(context.store, project.team_id)) : null,
    issues: (args) => connectIssues(
      context,
      sortByCreated(getLinearStore(context.store).issues.findBy("project_id", project.linear_id)),
      args
    )
  };
}
function formatCycle(context, cycle) {
  return {
    id: cycle.linear_id,
    name: cycle.name,
    number: cycle.number,
    startsAt: cycle.starts_at,
    endsAt: cycle.ends_at,
    createdAt: cycle.created_at,
    updatedAt: cycle.updated_at,
    team: () => formatTeam(context, requireTeam(context.store, cycle.team_id)),
    issues: (args) => connectIssues(
      context,
      sortByCreated(getLinearStore(context.store).issues.findBy("cycle_id", cycle.linear_id)),
      args
    )
  };
}
function formatWebhook(context, webhook) {
  return {
    id: webhook.linear_id,
    label: webhook.label,
    url: webhook.url,
    enabled: webhook.enabled,
    resourceTypes: webhook.resource_types,
    allPublicTeams: webhook.all_public_teams,
    secret: webhook.secret,
    createdAt: webhook.created_at,
    updatedAt: webhook.updated_at,
    team: () => webhook.team_id ? formatTeam(context, requireTeam(context.store, webhook.team_id)) : null
  };
}
function formatAgentSession(context, session) {
  return {
    id: session.linear_id,
    state: session.state,
    plan: session.plan,
    externalUrl: session.external_url,
    createdAt: session.created_at,
    updatedAt: session.updated_at,
    issue: () => session.issue_id ? formatIssue(context, requireIssue(context.store, session.issue_id)) : null,
    comment: () => session.comment_id ? formatComment(context, requireComment(context.store, session.comment_id)) : null,
    agentUser: () => formatUser(context, requireUser(context.store, session.agent_user_id)),
    activities: (args) => connectAgentActivities(
      context,
      sortByCreated(getLinearStore(context.store).agentActivities.findBy("session_id", session.linear_id)),
      args
    )
  };
}
function formatAgentActivity(context, activity) {
  return {
    id: activity.linear_id,
    type: activity.type,
    body: activity.body,
    ephemeral: activity.ephemeral,
    createdAt: activity.created_at,
    updatedAt: activity.updated_at,
    session: () => formatAgentSession(context, requireAgentSession(context.store, activity.session_id)),
    user: () => activity.user_id ? formatUser(context, requireUser(context.store, activity.user_id)) : null
  };
}
function connectUsers(context, items, args) {
  return mapConnection(items, args, (item) => formatUser(context, item));
}
function connectTeams(context, items, args) {
  return mapConnection(items, args, (item) => formatTeam(context, item));
}
function connectStates(context, items, args) {
  return mapConnection(items, args, (item) => formatState(context, item));
}
function connectIssues(context, items, args) {
  return mapConnection(items, args, (item) => formatIssue(context, item));
}
function connectComments(context, items, args) {
  return mapConnection(items, args, (item) => formatComment(context, item));
}
function connectLabels(context, items, args) {
  return mapConnection(items, args, (item) => formatLabel(context, item));
}
function connectProjects(context, items, args) {
  return mapConnection(items, args, (item) => formatProject(context, item));
}
function connectCycles(context, items, args) {
  return mapConnection(items, args, (item) => formatCycle(context, item));
}
function connectWebhooks(context, items, args) {
  return mapConnection(items, args, (item) => formatWebhook(context, item));
}
function connectAgentSessions(context, items, args) {
  return mapConnection(items, args, (item) => formatAgentSession(context, item));
}
function connectAgentActivities(context, items, args) {
  return mapConnection(items, args, (item) => formatAgentActivity(context, item));
}
function mapConnection(items, args, mapper) {
  const mapped = connectionFromArray(items, args);
  return {
    nodes: mapped.nodes.map(mapper),
    edges: mapped.edges.map((edge) => ({ cursor: edge.cursor, node: mapper(edge.node) })),
    pageInfo: mapped.pageInfo
  };
}
var ISSUE_FILTER_FIELDS = [
  "id",
  "identifier",
  "title",
  "team",
  "state",
  "assignee",
  "creator",
  "project",
  "cycle",
  "labels"
];
function filteredIssues(context, filter, orderBy) {
  let issues = sortByCreated(getLinearStore(context.store).issues.all());
  if (orderBy === "updatedAt") {
    issues = [...issues].sort((a, b) => a.updated_at.localeCompare(b.updated_at));
  }
  if (!filter) return issues;
  return issues.filter((issue) => issueMatchesFilter(context, issue, filter));
}
function filteredTeams(context, filter, _includeArchived, orderBy) {
  let teams = sortByCreated(getLinearStore(context.store).teams.all());
  if (isRecord(orderBy)) {
    const field = typeof orderBy.field === "string" ? orderBy.field : Object.keys(orderBy)[0];
    const direction = typeof orderBy.direction === "string" ? orderBy.direction : field && typeof orderBy[field] === "string" ? orderBy[field] : void 0;
    const multiplier = direction?.toLowerCase().startsWith("desc") ? -1 : 1;
    if (field === "key" || field === "name" || field === "createdAt" || field === "updatedAt") {
      teams = [...teams].sort((a, b) => teamOrderValue(a, field).localeCompare(teamOrderValue(b, field)) * multiplier);
    }
  }
  if (!isRecord(filter)) return teams;
  return teams.filter((team) => teamMatchesFilter(team, filter));
}
function teamOrderValue(team, field) {
  if (field === "key") return team.key;
  if (field === "name") return team.name;
  if (field === "updatedAt") return team.updated_at;
  return team.created_at;
}
function teamMatchesFilter(team, filter) {
  const checks = [
    aliasComparatorMatches([team.linear_id, team.key, team.name], filter.id),
    comparatorMatches(team.key, filter.key),
    comparatorMatches(team.name, filter.name),
    comparatorMatches(team.name, filter.displayName),
    typeof filter.private !== "boolean" || team.private === filter.private
  ];
  const orFilters = Array.isArray(filter.or) ? filter.or.filter(isRecord) : [];
  const hasOwnPredicate = ["id", "key", "name", "displayName", "private"].some((field) => filter[field] != null);
  const ownMatch = hasOwnPredicate ? checks.every(Boolean) : orFilters.length === 0;
  return ownMatch || orFilters.some((orFilter) => teamMatchesFilter(team, orFilter));
}
function issueMatchesFilter(context, issue, filter) {
  const ls = getLinearStore(context.store);
  const team = ls.teams.findOneBy("linear_id", issue.team_id);
  const state = ls.workflowStates.findOneBy("linear_id", issue.state_id);
  const assignee = issue.assignee_id ? ls.users.findOneBy("linear_id", issue.assignee_id) : void 0;
  const creator = issue.creator_id ? ls.users.findOneBy("linear_id", issue.creator_id) : void 0;
  const project = issue.project_id ? ls.projects.findOneBy("linear_id", issue.project_id) : void 0;
  const cycle = issue.cycle_id ? ls.cycles.findOneBy("linear_id", issue.cycle_id) : void 0;
  const labels = issue.label_ids.map((labelId) => ls.issueLabels.findOneBy("linear_id", labelId)).filter((label) => Boolean(label));
  const checks = [
    comparatorMatches(issue.linear_id, filter.id),
    comparatorMatches(issue.identifier, filter.identifier),
    comparatorMatches(issue.title, filter.title),
    aliasComparatorMatches([team?.linear_id, team?.key, team?.name], filter.team),
    aliasComparatorMatches([state?.linear_id, state?.name, state?.type], filter.state),
    aliasComparatorMatches([assignee?.linear_id, assignee?.email, assignee?.name], filter.assignee),
    aliasComparatorMatches([creator?.linear_id, creator?.email, creator?.name], filter.creator),
    aliasComparatorMatches([project?.linear_id, project?.name], filter.project),
    aliasComparatorMatches([cycle?.linear_id, cycle?.name], filter.cycle),
    aliasComparatorMatches(
      labels.flatMap((label) => [label.linear_id, label.name]),
      filter.labels
    )
  ];
  const orFilters = Array.isArray(filter.or) ? filter.or.filter(isRecord) : [];
  const ownMatch = issueFilterHasOwnPredicates(filter) ? checks.every(Boolean) : orFilters.length === 0;
  return ownMatch || orFilters.some((orFilter) => issueMatchesFilter(context, issue, orFilter));
}
function issueFilterHasOwnPredicates(filter) {
  return ISSUE_FILTER_FIELDS.some((field) => filter[field] != null);
}
function filterUsers(context, users, filter) {
  if (!filter) return sortByCreated(users);
  return sortByCreated(users).filter(
    (user) => comparatorMatches(user.linear_id, filter.id) && comparatorMatches(user.email, filter.email) && comparatorMatches(user.name, filter.name) && (typeof filter.active !== "boolean" || user.active === filter.active) && (typeof filter.admin !== "boolean" || user.admin === filter.admin)
  );
}
function comparatorMatches(value, input) {
  if (!input || !isRecord(input)) return true;
  if ("null" in input && typeof input.null === "boolean") return input.null ? value == null : value != null;
  if (value == null) return false;
  const val = String(value);
  if (typeof input.eq === "string" && val !== input.eq) return false;
  if (typeof input.neq === "string" && val === input.neq) return false;
  if (Array.isArray(input.in) && !input.in.includes(val)) return false;
  if (Array.isArray(input.nin) && input.nin.includes(val)) return false;
  if (typeof input.contains === "string" && !val.includes(input.contains)) return false;
  if (typeof input.startsWith === "string" && !val.startsWith(input.startsWith)) return false;
  if (typeof input.endsWith === "string" && !val.endsWith(input.endsWith)) return false;
  if (typeof input.eqIgnoreCase === "string" && val.toLowerCase() !== input.eqIgnoreCase.toLowerCase()) return false;
  if (typeof input.neqIgnoreCase === "string" && val.toLowerCase() === input.neqIgnoreCase.toLowerCase()) return false;
  return true;
}
function aliasComparatorMatches(values, input) {
  if (!input || !isRecord(input)) return true;
  const candidates = values.filter((value) => value != null);
  if ("null" in input && typeof input.null === "boolean") {
    return input.null ? candidates.length === 0 : candidates.length > 0;
  }
  if (candidates.length === 0) return false;
  const neq = typeof input.neq === "string" ? input.neq : void 0;
  const nin = Array.isArray(input.nin) ? input.nin : void 0;
  const neqIgnoreCase = typeof input.neqIgnoreCase === "string" ? input.neqIgnoreCase : void 0;
  if (neq !== void 0 && candidates.some((value) => value === neq)) return false;
  if (nin && candidates.some((value) => nin.includes(value))) return false;
  if (neqIgnoreCase !== void 0 && candidates.some((value) => value.toLowerCase() === neqIgnoreCase.toLowerCase())) {
    return false;
  }
  if (!hasPositiveComparator(input)) return true;
  return candidates.some((value) => positiveComparatorMatches(value, input));
}
function hasPositiveComparator(input) {
  return typeof input.eq === "string" || Array.isArray(input.in) || typeof input.contains === "string" || typeof input.startsWith === "string" || typeof input.endsWith === "string" || typeof input.eqIgnoreCase === "string";
}
function positiveComparatorMatches(value, input) {
  if (typeof input.eq === "string" && value !== input.eq) return false;
  if (Array.isArray(input.in) && !input.in.includes(value)) return false;
  if (typeof input.contains === "string" && !value.includes(input.contains)) return false;
  if (typeof input.startsWith === "string" && !value.startsWith(input.startsWith)) return false;
  if (typeof input.endsWith === "string" && !value.endsWith(input.endsWith)) return false;
  if (typeof input.eqIgnoreCase === "string" && value.toLowerCase() !== input.eqIgnoreCase.toLowerCase()) return false;
  return true;
}
function sortByCreated(items) {
  return [...items].sort((a, b) => a.created_at.localeCompare(b.created_at));
}
function sortByPosition(items) {
  return [...items].sort((a, b) => a.position - b.position || a.created_at.localeCompare(b.created_at));
}
function requireCurrentUser(context) {
  const user = currentUser(context.store, context.c);
  if (!user) throw new Error("Linear user not found");
  return user;
}
function requireUser(store, id) {
  const user = resolveUser(store, id);
  if (!user) throw new Error(`User not found: ${id}`);
  return user;
}
function requireTeam(store, id) {
  const team = resolveTeam(store, requiredString(id, "teamId"));
  if (!team) throw new Error(`Team not found: ${String(id)}`);
  return team;
}
function requireState(store, id) {
  const state = resolveState(store, id);
  if (!state) throw new Error(`Workflow state not found: ${id}`);
  return state;
}
function requireIssue(store, id) {
  const issue = resolveIssue(store, requiredString(id, "id"));
  if (!issue) throw new Error(`Issue not found: ${String(id)}`);
  return issue;
}
function requireComment(store, id) {
  const ref = requiredString(id, "id");
  const comment = getLinearStore(store).comments.findOneBy("linear_id", ref);
  if (!comment) throw new Error(`Comment not found: ${ref}`);
  return comment;
}
function requireLabel(store, id) {
  const label = resolveLabel(store, requiredString(id, "id"));
  if (!label) throw new Error(`Issue label not found: ${String(id)}`);
  return label;
}
function requireTeamLabel(store, id, teamId) {
  const ref = requiredString(id, "labelId");
  const label = resolveLabel(store, ref, teamId);
  if (!label) throw new Error(`Issue label not found for team: ${ref}`);
  return label;
}
function requireProject(store, id) {
  const project = resolveProject(store, id);
  if (!project) throw new Error(`Project not found: ${id}`);
  return project;
}
function requireCycle(store, id) {
  const cycle = resolveCycle(store, id);
  if (!cycle) throw new Error(`Cycle not found: ${id}`);
  return cycle;
}
function requireWebhook(store, id) {
  const webhook = getLinearStore(store).webhooks.findOneBy("linear_id", id);
  if (!webhook) throw new Error(`Webhook not found: ${id}`);
  return webhook;
}
function requireAgentSession(store, id) {
  const ref = requiredString(id, "id");
  const session = getLinearStore(store).agentSessions.findOneBy("linear_id", ref);
  if (!session) throw new Error(`Agent session not found: ${ref}`);
  return session;
}
function resolveNullableUserId(store, value, field) {
  const ref = stringInput(value);
  if (!ref) return null;
  const user = resolveUser(store, ref);
  if (!user) throw new Error(`User not found for ${field}: ${ref}`);
  return user.linear_id;
}
function resolveNullableProjectId(store, value, teamId) {
  const ref = stringInput(value);
  if (!ref) return null;
  const project = resolveProject(store, ref);
  if (!project || project.team_id !== null && project.team_id !== teamId) {
    throw new Error(`Project not found for team: ${ref}`);
  }
  return project.linear_id;
}
function resolveNullableCycleId(store, value, teamId) {
  const ref = stringInput(value);
  if (!ref) return null;
  const cycle = resolveCycle(store, ref, teamId);
  if (!cycle) throw new Error(`Cycle not found for team: ${ref}`);
  return cycle.linear_id;
}
function resolveIssueLabelIds(store, value, teamId) {
  return arrayInput(value).map((labelId) => {
    const label = resolveLabel(store, labelId, teamId);
    if (!label) throw new Error(`Issue label not found for team: ${labelId}`);
    return label.linear_id;
  });
}
async function createAgentSessionForIssue(context, issue, agentUserId, actor, plan, externalUrl) {
  const ls = getLinearStore(context.store);
  const existing = ls.agentSessions.findBy("issue_id", issue.linear_id).find((session2) => session2.agent_user_id === agentUserId && session2.state !== "completed");
  if (existing) return existing;
  const session = ls.agentSessions.insert({
    linear_id: linearId(),
    issue_id: issue.linear_id,
    comment_id: null,
    agent_user_id: agentUserId,
    state: "pending",
    plan: plan ?? null,
    external_url: externalUrl ?? null
  });
  await dispatchLinearWebhook(context.store, {
    type: "AgentSessionEvent",
    action: "created",
    data: agentSessionWebhookPayload(context, session),
    actor,
    teamId: issue.team_id,
    url: issue.url
  });
  return session;
}
async function createAgentSessionForComment(context, comment, agentUserId, actor, plan, externalUrl) {
  const issue = requireIssue(context.store, comment.issue_id);
  const session = getLinearStore(context.store).agentSessions.insert({
    linear_id: linearId(),
    issue_id: issue.linear_id,
    comment_id: comment.linear_id,
    agent_user_id: agentUserId,
    state: "pending",
    plan: plan ?? null,
    external_url: externalUrl ?? null
  });
  await dispatchLinearWebhook(context.store, {
    type: "AgentSessionEvent",
    action: "created",
    data: agentSessionWebhookPayload(context, session),
    actor,
    teamId: issue.team_id,
    url: issue.url
  });
  return session;
}
function issueWebhookPayload(context, issue) {
  return {
    id: issue.linear_id,
    identifier: issue.identifier,
    title: issue.title,
    description: issue.description,
    priority: issue.priority,
    teamId: issue.team_id,
    stateId: issue.state_id,
    assigneeId: issue.assignee_id,
    delegateId: issue.delegate_id,
    url: issue.url,
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    archivedAt: issue.archived_at,
    labels: issue.label_ids.map((labelId) => getLinearStore(context.store).issueLabels.findOneBy("linear_id", labelId)).filter(Boolean).map((label) => ({ id: label.linear_id, name: label.name }))
  };
}
function commentWebhookPayload(context, comment) {
  return {
    id: comment.linear_id,
    body: comment.body,
    issueId: comment.issue_id,
    userId: comment.user_id,
    createdAt: comment.created_at,
    updatedAt: comment.updated_at
  };
}
function labelWebhookPayload(_context, label) {
  return {
    id: label.linear_id,
    name: label.name,
    color: label.color,
    description: label.description,
    teamId: label.team_id,
    createdAt: label.created_at,
    updatedAt: label.updated_at
  };
}
function agentSessionWebhookPayload(_context, session) {
  return {
    id: session.linear_id,
    issueId: session.issue_id,
    commentId: session.comment_id,
    agentUserId: session.agent_user_id,
    state: session.state,
    plan: session.plan,
    externalUrl: session.external_url,
    createdAt: session.created_at,
    updatedAt: session.updated_at
  };
}
function mentionsAppUser(context, body) {
  return getLinearStore(context.store).users.all().some((user) => user.app && body.includes(user.display_name));
}
function normalizePriority(value) {
  if (typeof value !== "number") return 0;
  if (value <= 0) return 0;
  if (value >= 4) return 4;
  return value;
}
function priorityLabelFor(priority) {
  return PRIORITY_LABELS[Math.round(priority)] ?? PRIORITY_LABELS[0];
}
function normalizeSessionState(value) {
  if (value === "pending" || value === "active" || value === "completed" || value === "failed" || value === "canceled") {
    return value;
  }
  return void 0;
}
function normalizeActivityType(value) {
  if (value === "thought" || value === "elicitation" || value === "action" || value === "response" || value === "error" || value === "prompt") {
    return value;
  }
  throw new Error(`Unsupported agent activity type: ${value}`);
}
function requiredString(value, field) {
  if (typeof value === "string" && value.trim()) return value;
  throw new Error(`${field} is required`);
}
function nullableString(value) {
  return typeof value === "string" && value.length > 0 ? value : null;
}
function stringInput(value) {
  return typeof value === "string" && value.length > 0 ? value : void 0;
}
function arrayInput(value, fallback = []) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string" && item.length > 0) : fallback;
}
function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function bodyStr(v) {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  return "";
}
function parseVariables(value) {
  if (isRecord(value)) return value;
  if (typeof value !== "string" || !value.trim()) return void 0;
  try {
    const parsed = JSON.parse(value);
    return isRecord(parsed) ? parsed : void 0;
  } catch {
    return void 0;
  }
}
function initials(value) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
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
  "geist-sans.woff2": readFileSync(join2(__dirname, "fonts", "geist-sans.woff2")),
  "GeistPixel-Square.woff2": readFileSync(join2(__dirname, "fonts", "GeistPixel-Square.woff2"))
};
var FAVICON = readFileSync(join2(__dirname, "fonts", "favicon.ico"));
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
function renderErrorPage(title, message, service) {
  return `${head(title)}
<body>
${emuBar(service)}
<div class="content">
  <div class="content-inner error-card">
    <div class="error-title">${escapeHtml(title)}</div>
    <div class="error-msg">${escapeHtml(message)}</div>
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
function normalizeUri(uri) {
  try {
    const u = new URL(uri);
    return `${u.origin}${u.pathname.replace(/\/+$/, "")}`;
  } catch {
    return uri.replace(/\/+$/, "").split("?")[0];
  }
}
function matchesRedirectUri(incoming, registered) {
  const normalized = normalizeUri(incoming);
  return registered.some((r) => normalizeUri(r) === normalized);
}
function constantTimeSecretEqual(a, b) {
  const bufA = Buffer.from(a, "utf-8");
  const bufB = Buffer.from(b, "utf-8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
function bodyStr2(v) {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  return "";
}
var SERVICE_LABEL = "Linear";
var CODE_TTL_MS = 10 * 60 * 1e3;
var ACCESS_TOKEN_TTL_SECONDS = 3600;
function pendingCodes(store) {
  let map = store.getData("linear.oauth.pending_codes");
  if (!map) {
    map = /* @__PURE__ */ new Map();
    store.setData("linear.oauth.pending_codes", map);
  }
  return map;
}
function oauthRoutes({ app, store, tokenMap }) {
  const ls = () => getLinearStore(store);
  app.get("/oauth/authorize", (c) => {
    const clientId = c.req.query("client_id") ?? "";
    const redirectUri = c.req.query("redirect_uri") ?? "";
    const responseType = c.req.query("response_type") ?? "code";
    const state = c.req.query("state") ?? "";
    const scope = c.req.query("scope") ?? "read";
    const requestedActor = normalizeActor(c.req.query("actor"));
    const codeChallenge = c.req.query("code_challenge") ?? "";
    const codeChallengeMethod = c.req.query("code_challenge_method") ?? "";
    if (responseType !== "code") {
      return c.html(
        renderErrorPage("Unsupported response_type", "Only response_type=code is supported.", SERVICE_LABEL),
        400
      );
    }
    if (!redirectUri) {
      return c.html(
        renderErrorPage("Missing redirect URI", "The redirect_uri parameter is required.", SERVICE_LABEL),
        400
      );
    }
    const oauthApp = resolveOAuthApp(clientId);
    if (ls().oauthApps.all().length > 0) {
      if (!oauthApp) {
        return c.html(
          renderErrorPage("Application not found", `The client_id '${clientId}' is not registered.`, SERVICE_LABEL),
          400
        );
      }
      if (!matchesRedirectUri(redirectUri, oauthApp.redirect_uris)) {
        return c.html(
          renderErrorPage("Redirect URI mismatch", "The redirect_uri is not registered for this app.", SERVICE_LABEL),
          400
        );
      }
    }
    const actor = requestedActor ?? oauthApp?.actor ?? "user";
    if (requestedActor && oauthApp && requestedActor !== oauthApp.actor) {
      return c.html(
        renderErrorPage("Invalid actor", `This app is configured for actor=${oauthApp.actor}.`, SERVICE_LABEL),
        400
      );
    }
    const requestedScopes = normalizeScopes(scope, oauthApp?.scopes ?? ["read"]);
    const invalidScopes = scopesOutsideApp(requestedScopes, oauthApp);
    if (invalidScopes.length > 0) {
      return c.html(
        renderErrorPage(
          "Invalid scope",
          `The app is not registered for scopes: ${invalidScopes.join(", ")}.`,
          SERVICE_LABEL
        ),
        400
      );
    }
    const title = actor === "app" ? "Install Linear App" : "Authorize Linear App";
    const appName = oauthApp?.name ?? "Linear App";
    const buttons = actor === "app" ? renderUserButton({
      letter: "L",
      login: appName,
      name: `Install ${appName}`,
      email: requestedScopes.join(", "),
      formAction: "/oauth/authorize/callback",
      hiddenFields: {
        user_ref: oauthApp?.app_user_id ?? "",
        actor,
        redirect_uri: redirectUri,
        scope: requestedScopes.join(" "),
        state,
        client_id: clientId,
        code_challenge: codeChallenge,
        code_challenge_method: codeChallengeMethod
      }
    }) : ls().users.all().filter((user) => !user.app && user.active).map(
      (user) => renderUserButton({
        letter: (user.display_name[0] ?? "U").toUpperCase(),
        login: user.email,
        name: user.display_name,
        email: user.email,
        formAction: "/oauth/authorize/callback",
        hiddenFields: {
          user_ref: user.linear_id,
          actor,
          redirect_uri: redirectUri,
          scope: requestedScopes.join(" "),
          state,
          client_id: clientId,
          code_challenge: codeChallenge,
          code_challenge_method: codeChallengeMethod
        }
      })
    ).join("\n");
    return c.html(
      renderCardPage(
        title,
        `Continue to <strong>${escapeHtml(appName)}</strong> with scopes <strong>${escapeHtml(requestedScopes.join(", "))}</strong>.`,
        buttons || '<p class="empty">No users in the Linear emulator store.</p>',
        SERVICE_LABEL
      )
    );
  });
  app.post("/oauth/authorize/callback", async (c) => {
    const body = await c.req.parseBody();
    const clientId = bodyStr2(body.client_id);
    const redirectUri = bodyStr2(body.redirect_uri);
    const state = bodyStr2(body.state);
    const scopes = normalizeScopes(bodyStr2(body.scope), ["read"]);
    const requestedActor = normalizeActor(bodyStr2(body.actor));
    const userRef = bodyStr2(body.user_ref);
    const codeChallenge = bodyStr2(body.code_challenge);
    const codeChallengeMethod = bodyStr2(body.code_challenge_method);
    const oauthApp = resolveOAuthApp(clientId);
    if (ls().oauthApps.all().length > 0) {
      if (!oauthApp) {
        return c.html(renderErrorPage("Application not found", "The OAuth app is not registered.", SERVICE_LABEL), 400);
      }
      if (!matchesRedirectUri(redirectUri, oauthApp.redirect_uris)) {
        return c.html(
          renderErrorPage("Redirect URI mismatch", "The redirect_uri is not registered for this app.", SERVICE_LABEL),
          400
        );
      }
    }
    const actor = requestedActor ?? oauthApp?.actor ?? "user";
    if (requestedActor && oauthApp && requestedActor !== oauthApp.actor) {
      return c.html(
        renderErrorPage("Invalid actor", `This app is configured for actor=${oauthApp.actor}.`, SERVICE_LABEL),
        400
      );
    }
    const invalidScopes = scopesOutsideApp(scopes, oauthApp);
    if (invalidScopes.length > 0) {
      return c.html(
        renderErrorPage(
          "Invalid scope",
          `The app is not registered for scopes: ${invalidScopes.join(", ")}.`,
          SERVICE_LABEL
        ),
        400
      );
    }
    const user = userRef && actor === "app" ? ls().users.findOneBy("linear_id", userRef) : ls().users.findOneBy("linear_id", userRef) ?? ls().users.all().find((u) => !u.app);
    const appUser = actor === "app" ? oauthApp?.app_user_id ? ls().users.findOneBy("linear_id", oauthApp.app_user_id) : user : user;
    if (!appUser) {
      return c.html(
        renderErrorPage("No Linear actor", "No matching user or app actor is available.", SERVICE_LABEL),
        400
      );
    }
    const code = token("lin_code");
    pendingCodes(store).set(code, {
      appId: oauthApp?.linear_id ?? null,
      clientId,
      redirectUri,
      scopes,
      userId: appUser.linear_id,
      actor,
      codeChallenge: codeChallenge || null,
      codeChallengeMethod: codeChallengeMethod || null,
      createdAt: Date.now()
    });
    const url = new URL(redirectUri);
    url.searchParams.set("code", code);
    if (state) url.searchParams.set("state", state);
    return c.redirect(url.toString());
  });
  app.post("/oauth/token", async (c) => {
    const body = await c.req.parseBody();
    const grantType = bodyStr2(body.grant_type);
    const clientAuth = clientCredentials(c.req.header("Authorization"), body);
    const oauthApp = resolveOAuthApp(clientAuth.clientId);
    if (ls().oauthApps.all().length > 0) {
      if (!oauthApp) return oauthError("invalid_client", "The OAuth app is not registered.");
      if (!constantTimeSecretEqual(clientAuth.clientSecret, oauthApp.client_secret)) {
        return oauthError("invalid_client", "Invalid client credentials.");
      }
    }
    if (grantType === "authorization_code") {
      const code = bodyStr2(body.code);
      const pending = pendingCodes(store).get(code);
      if (!pending) return oauthError("invalid_grant", "Authorization code is invalid.");
      if (Date.now() - pending.createdAt > CODE_TTL_MS) {
        pendingCodes(store).delete(code);
        return oauthError("invalid_grant", "Authorization code has expired.");
      }
      if (pending.redirectUri !== bodyStr2(body.redirect_uri)) {
        return oauthError("invalid_grant", "redirect_uri does not match the authorization request.");
      }
      if (pending.clientId !== clientAuth.clientId) {
        return oauthError("invalid_grant", "client_id does not match the authorization request.");
      }
      const invalidScopes = scopesOutsideApp(pending.scopes, oauthApp);
      if (invalidScopes.length > 0) {
        return oauthError("invalid_scope", `The app is not registered for scopes: ${invalidScopes.join(", ")}.`);
      }
      if (!verifyPkce(pending, bodyStr2(body.code_verifier))) {
        return oauthError("invalid_grant", "PKCE verification failed.");
      }
      pendingCodes(store).delete(code);
      return c.json(issueTokens(pending.userId, pending.appId, pending.actor, pending.scopes));
    }
    if (grantType === "refresh_token") {
      const refreshToken = bodyStr2(body.refresh_token);
      const existing = ls().tokens.findOneBy("token", refreshToken);
      if (!existing || existing.type !== "oauth_refresh" || existing.revoked) {
        return oauthError("invalid_grant", "Refresh token is invalid.");
      }
      if (existing.app_id !== (oauthApp?.linear_id ?? null)) {
        return oauthError("invalid_grant", "Refresh token was not issued to this OAuth app.");
      }
      ls().tokens.update(existing.id, { revoked: true });
      return c.json(issueTokens(existing.user_id, existing.app_id, existing.actor_type, existing.scopes));
    }
    if (grantType === "client_credentials") {
      if (oauthApp && oauthApp.actor !== "app") {
        return oauthError("unauthorized_client", "The OAuth app is not configured for app actor tokens.");
      }
      const scopes = normalizeScopes(bodyStr2(body.scope), oauthApp?.scopes ?? ["read"]);
      const invalidScopes = scopesOutsideApp(scopes, oauthApp);
      if (invalidScopes.length > 0) {
        return oauthError("invalid_scope", `The app is not registered for scopes: ${invalidScopes.join(", ")}.`);
      }
      const appUserId = oauthApp?.app_user_id ?? ls().users.all().find((user) => user.app)?.linear_id ?? null;
      return c.json(issueTokens(appUserId, oauthApp?.linear_id ?? null, "app", scopes, false));
    }
    return oauthError(
      "unsupported_grant_type",
      "Only authorization_code, refresh_token, and client_credentials are supported."
    );
  });
  app.post("/oauth/revoke", async (c) => {
    const body = await c.req.parseBody();
    const value = bodyStr2(body.token) || bodyStr2(body.access_token) || bodyStr2(body.refresh_token);
    if (value) {
      const record = ls().tokens.findOneBy("token", value);
      if (record) {
        ls().tokens.update(record.id, { revoked: true });
        tokenMap?.delete(value);
      }
    }
    return c.body(null, 200);
  });
  function issueTokens(userId, appId, actor, scopes, includeRefresh = true) {
    const accessToken = token("lin");
    const refreshToken = includeRefresh ? token("lin_refresh") : null;
    const expiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL_SECONDS * 1e3).toISOString();
    const access = ls().tokens.insert({
      token: accessToken,
      type: actor === "app" && !includeRefresh ? "client_credentials" : "oauth_access",
      actor_type: actor,
      user_id: userId,
      app_id: appId,
      scopes,
      expires_at: expiresAt,
      revoked: false,
      refresh_token: refreshToken
    });
    tokenMap?.set(accessToken, {
      login: userId ? ls().users.findOneBy("linear_id", userId)?.email ?? userId : appId ?? "linear-app",
      id: access.id,
      scopes
    });
    if (refreshToken) {
      ls().tokens.insert({
        token: refreshToken,
        type: "oauth_refresh",
        actor_type: actor,
        user_id: userId,
        app_id: appId,
        scopes,
        expires_at: null,
        revoked: false,
        refresh_token: null
      });
    }
    return {
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: ACCESS_TOKEN_TTL_SECONDS,
      scope: scopes.join(" "),
      ...refreshToken ? { refresh_token: refreshToken } : {}
    };
  }
  function resolveOAuthApp(clientId) {
    return ls().oauthApps.findOneBy("client_id", clientId);
  }
}
function oauthError(error, description) {
  return new Response(JSON.stringify({ error, error_description: description }), {
    status: 400,
    headers: { "Content-Type": "application/json" }
  });
}
function clientCredentials(authHeader, body) {
  if (authHeader?.startsWith("Basic ")) {
    try {
      const decoded = Buffer.from(authHeader.slice("Basic ".length), "base64").toString("utf-8");
      const separator = decoded.indexOf(":");
      if (separator < 0) return { clientId: "", clientSecret: "" };
      return {
        clientId: decodeURIComponent(decoded.slice(0, separator)),
        clientSecret: decodeURIComponent(decoded.slice(separator + 1))
      };
    } catch {
      return { clientId: "", clientSecret: "" };
    }
  }
  return {
    clientId: bodyStr2(body.client_id),
    clientSecret: bodyStr2(body.client_secret)
  };
}
function normalizeActor(value) {
  if (value === "app" || value === "user") return value;
  return void 0;
}
function scopesOutsideApp(scopes, oauthApp) {
  if (!oauthApp) return [];
  const allowed = new Set(oauthApp.scopes);
  return scopes.filter((scope) => !allowed.has(scope));
}
function verifyPkce(code, verifier) {
  if (!code.codeChallenge) return true;
  if (!verifier) return false;
  if (code.codeChallengeMethod === "S256") {
    const hashed = createHash("sha256").update(verifier).digest("base64url");
    return hashed === code.codeChallenge;
  }
  return verifier === code.codeChallenge;
}
var SERVICE_LABEL2 = "Linear";
var TABS = [
  { id: "issues", label: "Issues", href: "/?tab=issues" },
  { id: "teams", label: "Teams", href: "/?tab=teams" },
  { id: "users", label: "Users", href: "/?tab=users" },
  { id: "projects", label: "Projects", href: "/?tab=projects" },
  { id: "agents", label: "Agents", href: "/?tab=agents" },
  { id: "auth", label: "Auth", href: "/?tab=auth" },
  { id: "webhooks", label: "Webhooks", href: "/?tab=webhooks" }
];
function inspectorRoutes({ app, store }) {
  const ls = () => getLinearStore(store);
  app.get("/", (c) => {
    const requested = c.req.query("tab") ?? "issues";
    const active = TABS.some((tab) => tab.id === requested) ? requested : "issues";
    const body = active === "teams" ? teamsView() : active === "users" ? usersView() : active === "projects" ? projectsView() : active === "agents" ? agentsView() : active === "auth" ? authView() : active === "webhooks" ? webhooksView() : issuesView();
    return c.html(renderInspectorPage("Linear Inspector", TABS, active, body, SERVICE_LABEL2));
  });
  function issuesView() {
    const rows = ls().issues.all().sort((a, b) => a.identifier.localeCompare(b.identifier)).map((issue) => {
      const team = ls().teams.findOneBy("linear_id", issue.team_id);
      const state = ls().workflowStates.findOneBy("linear_id", issue.state_id);
      const assignee = issue.assignee_id ? ls().users.findOneBy("linear_id", issue.assignee_id) : void 0;
      const delegate = issue.delegate_id ? ls().users.findOneBy("linear_id", issue.delegate_id) : void 0;
      const labels = issue.label_ids.map((labelId) => ls().issueLabels.findOneBy("linear_id", labelId)?.name).filter((name) => Boolean(name)).join(", ");
      return [
        linkCell(`/?tab=issues&issue=${encodeURIComponent(issue.linear_id)}`, issue.identifier),
        escapeHtml(issue.title),
        escapeHtml(team?.key ?? issue.team_id),
        escapeHtml(state?.name ?? issue.state_id),
        escapeHtml(userLabel(assignee)),
        escapeHtml(userLabel(delegate)),
        escapeHtml(labels),
        escapeHtml(issue.updated_at)
      ];
    });
    return section(
      "Issues",
      table(["ID", "Title", "Team", "State", "Assignee", "Delegate", "Labels", "Updated"], rows, "No issues.")
    );
  }
  function teamsView() {
    const rows = ls().teams.all().sort((a, b) => a.key.localeCompare(b.key)).map((team) => {
      const stateNames = ls().workflowStates.findBy("team_id", team.linear_id).sort((a, b) => a.position - b.position).map((state) => state.name).join(", ");
      const issueCount = ls().issues.count((issue) => issue.team_id === team.linear_id);
      return [
        escapeHtml(team.key),
        escapeHtml(team.name),
        escapeHtml(String(issueCount)),
        escapeHtml(stateNames),
        escapeHtml(team.private ? "private" : "public")
      ];
    });
    return section("Teams", table(["Key", "Name", "Issues", "States", "Access"], rows, "No teams."));
  }
  function usersView() {
    const rows = ls().users.all().sort((a, b) => a.email.localeCompare(b.email)).map((user) => [
      escapeHtml(user.display_name),
      escapeHtml(user.email),
      escapeHtml(user.app ? "app" : "user"),
      escapeHtml(user.admin ? "admin" : "member"),
      escapeHtml(user.active ? "active" : "inactive"),
      escapeHtml(String(ls().issues.count((issue) => issue.assignee_id === user.linear_id)))
    ]);
    return section("Users", table(["Name", "Email", "Kind", "Role", "Status", "Assigned"], rows, "No users."));
  }
  function projectsView() {
    const projectRows = ls().projects.all().map((project) => [
      escapeHtml(project.name),
      escapeHtml(project.state),
      escapeHtml(
        project.team_id ? ls().teams.findOneBy("linear_id", project.team_id)?.key ?? project.team_id : "workspace"
      ),
      escapeHtml(String(ls().issues.count((issue) => issue.project_id === project.linear_id)))
    ]);
    const cycleRows = ls().cycles.all().map((cycle) => [
      escapeHtml(cycle.name),
      escapeHtml(String(cycle.number)),
      escapeHtml(ls().teams.findOneBy("linear_id", cycle.team_id)?.key ?? cycle.team_id),
      escapeHtml(String(ls().issues.count((issue) => issue.cycle_id === cycle.linear_id)))
    ]);
    return section("Projects", table(["Name", "State", "Team", "Issues"], projectRows, "No projects.")) + section("Cycles", table(["Name", "Number", "Team", "Issues"], cycleRows, "No cycles."));
  }
  function agentsView() {
    const rows = ls().agentSessions.all().map((session) => {
      const issue = session.issue_id ? ls().issues.findOneBy("linear_id", session.issue_id) : void 0;
      const agent = ls().users.findOneBy("linear_id", session.agent_user_id);
      return [
        escapeHtml(session.linear_id),
        escapeHtml(session.state),
        escapeHtml(issue?.identifier ?? ""),
        escapeHtml(userLabel(agent)),
        escapeHtml(String(ls().agentActivities.count((activity) => activity.session_id === session.linear_id))),
        escapeHtml(session.updated_at)
      ];
    });
    return section(
      "Agent Sessions",
      table(["ID", "State", "Issue", "Agent", "Activities", "Updated"], rows, "No agent sessions.")
    );
  }
  function authView() {
    const appRows = ls().oauthApps.all().map((oauthApp) => [
      escapeHtml(oauthApp.name),
      escapeHtml(oauthApp.client_id),
      escapeHtml(oauthApp.actor),
      escapeHtml(oauthApp.scopes.join(", ")),
      escapeHtml(oauthApp.app_user_id ? userLabel(ls().users.findOneBy("linear_id", oauthApp.app_user_id)) : "")
    ]);
    const tokenRows = ls().tokens.all().map((token2) => [
      escapeHtml(maskToken(token2.token)),
      escapeHtml(token2.type),
      escapeHtml(token2.actor_type),
      escapeHtml(token2.user_id ? userLabel(ls().users.findOneBy("linear_id", token2.user_id)) : token2.app_id ?? ""),
      escapeHtml(token2.scopes.join(", ")),
      escapeHtml(token2.revoked ? "revoked" : token2.expires_at ?? "active")
    ]);
    return section("OAuth Apps", table(["Name", "Client ID", "Actor", "Scopes", "App User"], appRows, "No OAuth apps.")) + section("Tokens", table(["Token", "Type", "Actor", "Subject", "Scopes", "Status"], tokenRows, "No tokens."));
  }
  function webhooksView() {
    const webhookRows = ls().webhooks.all().map((webhook) => [
      escapeHtml(webhook.label),
      escapeHtml(webhook.url),
      escapeHtml(webhook.enabled ? "enabled" : "disabled"),
      escapeHtml(webhook.resource_types.join(", ")),
      escapeHtml(
        webhook.team_id ? ls().teams.findOneBy("linear_id", webhook.team_id)?.key ?? webhook.team_id : "all public teams"
      )
    ]);
    const deliveryRows = ls().webhookDeliveries.all().slice(-30).reverse().map((delivery) => [
      escapeHtml(delivery.event),
      escapeHtml(delivery.action),
      escapeHtml(String(delivery.status ?? "")),
      escapeHtml(delivery.error ?? ""),
      escapeHtml(delivery.url),
      escapeHtml(delivery.created_at)
    ]);
    return section(
      "Webhook Subscriptions",
      table(["Label", "URL", "Status", "Resources", "Scope"], webhookRows, "No webhooks.")
    ) + section(
      "Webhook Deliveries",
      table(["Event", "Action", "Status", "Error", "URL", "Created"], deliveryRows, "No deliveries.")
    );
  }
}
function section(title, body) {
  return `<section class="inspector-section">
  <h2>${escapeHtml(title)}</h2>
  ${body}
</section>`;
}
function table(headers, rows, empty) {
  if (rows.length === 0) return `<p class="inspector-empty">${escapeHtml(empty)}</p>`;
  const headerHtml = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("");
  const rowHtml = rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("\n");
  return `<table class="inspector-table">
  <thead><tr>${headerHtml}</tr></thead>
  <tbody>
${rowHtml}
  </tbody>
</table>`;
}
function linkCell(href, label) {
  return `<a href="${escapeAttr(href)}">${escapeHtml(label)}</a>`;
}
function userLabel(user) {
  return user?.display_name ?? user?.email ?? "";
}
function maskToken(value) {
  if (value.length <= 12) return value;
  return `${value.slice(0, 8)}...${value.slice(-4)}`;
}
var DEFAULT_SCOPES = ["read", "write", "issues:create", "comments:create", "admin"];
function seedDefaults(store, baseUrl) {
  const ls = getLinearStore(store);
  if (!ls.organizations.all()[0]) {
    ls.organizations.insert({
      linear_id: linearId(),
      name: "Emulate",
      url_key: "emulate",
      url: "https://linear.app/emulate"
    });
  }
  let admin = ls.users.findOneBy("email", "admin@linear.local");
  if (!admin) {
    admin = ls.users.insert({
      linear_id: linearId(),
      email: "admin@linear.local",
      name: "Admin User",
      display_name: "Admin",
      avatar_url: null,
      active: true,
      admin: true,
      app: false
    });
  }
  let developer = ls.users.findOneBy("email", "dev@linear.local");
  if (!developer) {
    developer = ls.users.insert({
      linear_id: linearId(),
      email: "dev@linear.local",
      name: "Developer",
      display_name: "Developer",
      avatar_url: null,
      active: true,
      admin: false,
      app: false
    });
  }
  let team = ls.teams.findOneBy("key", "ENG");
  if (!team) {
    team = ls.teams.insert({
      linear_id: linearId(),
      key: "ENG",
      name: "Engineering",
      description: "Default engineering team",
      private: false,
      url: "https://linear.app/emulate/team/ENG",
      issue_sequence: 0
    });
  }
  ensureDefaultStates(store, team.linear_id);
  const todo = resolveState(store, "Todo", team.linear_id) ?? resolveState(store, "Todo");
  const bug = ensureLabel(store, { name: "Bug", color: "#d92d20", teamId: team.linear_id });
  ensureLabel(store, { name: "Feature", color: "#2563eb", teamId: team.linear_id });
  const project = ensureProject(store, { name: "Local Project", teamId: team.linear_id });
  const cycle = ensureCycle(store, { name: "Cycle 1", number: 1, teamId: team.linear_id });
  if (ls.issues.all().length === 0 && todo) {
    const number = nextIssueNumber(store, team.linear_id);
    const issue = ls.issues.insert({
      linear_id: linearId(),
      identifier: `${team.key}-${number}`,
      number,
      team_id: team.linear_id,
      title: "Ship Linear emulator",
      description: "Use local Linear state in tests without calling the real Linear API.",
      priority: 3,
      state_id: todo.linear_id,
      assignee_id: developer.linear_id,
      creator_id: admin.linear_id,
      delegate_id: null,
      project_id: project.linear_id,
      cycle_id: cycle.linear_id,
      label_ids: [bug.linear_id],
      url: `${baseUrl}/issue/${team.key}-${number}`,
      archived_at: null,
      canceled_at: null,
      completed_at: null,
      started_at: null,
      due_date: null,
      create_as_user: null,
      display_icon_url: null
    });
    ls.comments.insert({
      linear_id: linearId(),
      issue_id: issue.linear_id,
      user_id: admin.linear_id,
      body: "This issue was seeded by the Linear emulator.",
      create_as_user: null,
      display_icon_url: null
    });
  }
  if (!ls.oauthApps.findOneBy("client_id", "lin_example_client_id")) {
    ls.oauthApps.insert({
      linear_id: linearId(),
      client_id: "lin_example_client_id",
      client_secret: "example_client_secret",
      name: "My Linear App",
      redirect_uris: ["http://localhost:3000/api/auth/callback/linear"],
      scopes: DEFAULT_SCOPES,
      actor: "user",
      assignable: false,
      mentionable: false,
      app_user_id: null
    });
  }
  if (!ls.tokens.findOneBy("token", "lin_test_admin")) {
    ls.tokens.insert({
      token: "lin_test_admin",
      type: "personal",
      actor_type: "user",
      user_id: admin.linear_id,
      app_id: null,
      scopes: DEFAULT_SCOPES,
      expires_at: null,
      revoked: false,
      refresh_token: null
    });
  }
}
function seedFromConfig(store, baseUrl, config) {
  const ls = getLinearStore(store);
  if (config.organization) {
    const existing = ls.organizations.all()[0];
    const name = config.organization.name ?? existing?.name ?? "Emulate";
    const urlKey = config.organization.url_key ?? existing?.url_key ?? slugify(name);
    if (existing) {
      ls.organizations.update(existing.id, {
        name,
        url_key: urlKey,
        url: `https://linear.app/${urlKey}`
      });
    } else {
      ls.organizations.insert({
        linear_id: linearId(),
        name,
        url_key: urlKey,
        url: `https://linear.app/${urlKey}`
      });
    }
  }
  if (config.users) {
    for (const userCfg of config.users) {
      const existing = ls.users.findOneBy("email", userCfg.email);
      if (existing) continue;
      const name = userCfg.name ?? userCfg.display_name ?? userCfg.email.split("@")[0];
      ls.users.insert({
        linear_id: userCfg.id ?? linearId(),
        email: userCfg.email,
        name,
        display_name: userCfg.display_name ?? name,
        avatar_url: userCfg.avatar_url ?? null,
        active: userCfg.active ?? true,
        admin: userCfg.admin ?? false,
        app: false
      });
    }
  }
  if (config.teams) {
    for (const teamCfg of config.teams) {
      let team = ls.teams.findOneBy("key", teamCfg.key);
      if (!team) {
        team = ls.teams.insert({
          linear_id: teamCfg.id ?? linearId(),
          key: teamCfg.key,
          name: teamCfg.name,
          description: teamCfg.description ?? null,
          private: teamCfg.private ?? false,
          url: `https://linear.app/${ls.organizations.all()[0]?.url_key ?? "emulate"}/team/${teamCfg.key}`,
          issue_sequence: 0
        });
      }
      if (teamCfg.states) {
        for (let i = 0; i < teamCfg.states.length; i++) {
          const stateCfg = teamCfg.states[i];
          if (ls.workflowStates.findBy("team_id", team.linear_id).some((state) => state.name === stateCfg.name)) {
            continue;
          }
          ls.workflowStates.insert({
            linear_id: stateCfg.id ?? linearId(),
            team_id: team.linear_id,
            name: stateCfg.name,
            type: stateCfg.type ?? inferStateType(stateCfg.name),
            position: stateCfg.position ?? i + 1
          });
        }
      } else {
        ensureDefaultStates(store, team.linear_id);
      }
    }
  }
  if (config.labels) {
    for (const labelCfg of config.labels) {
      const teamId = labelCfg.team ? resolveTeam(store, labelCfg.team)?.linear_id ?? null : null;
      ensureLabel(store, {
        id: labelCfg.id,
        name: labelCfg.name,
        color: labelCfg.color ?? "#64748b",
        description: labelCfg.description,
        teamId
      });
    }
  }
  if (config.projects) {
    for (const projectCfg of config.projects) {
      const teamId = projectCfg.team ? resolveTeam(store, projectCfg.team)?.linear_id ?? null : null;
      ensureProject(store, {
        id: projectCfg.id,
        name: projectCfg.name,
        description: projectCfg.description,
        state: projectCfg.state,
        teamId
      });
    }
  }
  if (config.cycles) {
    for (const cycleCfg of config.cycles) {
      const team = resolveTeam(store, cycleCfg.team);
      if (!team) continue;
      ensureCycle(store, {
        id: cycleCfg.id,
        name: cycleCfg.name,
        number: cycleCfg.number,
        teamId: team.linear_id,
        startsAt: cycleCfg.starts_at,
        endsAt: cycleCfg.ends_at
      });
    }
  }
  if (config.oauth_apps) {
    for (const appCfg of config.oauth_apps) {
      const existing = ls.oauthApps.findOneBy("client_id", appCfg.client_id);
      const actor = appCfg.actor ?? existing?.actor ?? "user";
      const assignable = appCfg.assignable ?? existing?.assignable ?? false;
      const mentionable = appCfg.mentionable ?? existing?.mentionable ?? false;
      let appUserId = existing?.app_user_id ?? null;
      if (actor === "app" || assignable || mentionable) {
        appUserId = appUserId ?? ensureAppUser(store, appCfg.name).linear_id;
      } else {
        appUserId = null;
      }
      const oauthApp = {
        client_secret: appCfg.client_secret,
        name: appCfg.name,
        redirect_uris: appCfg.redirect_uris,
        scopes: normalizeScopes(appCfg.scopes, existing?.scopes ?? DEFAULT_SCOPES),
        actor,
        assignable,
        mentionable,
        app_user_id: appUserId
      };
      if (existing) {
        ls.oauthApps.update(existing.id, oauthApp);
        continue;
      }
      ls.oauthApps.insert({
        linear_id: appCfg.id ?? linearId(),
        client_id: appCfg.client_id,
        ...oauthApp
      });
    }
  }
  if (config.issues) {
    for (const issueCfg of config.issues) {
      const team = resolveTeam(store, issueCfg.team);
      if (!team) continue;
      const existing = ls.issues.all().find((issue) => issue.title === issueCfg.title && issue.team_id === team.linear_id);
      if (existing) continue;
      const state = (issueCfg.state ? resolveState(store, issueCfg.state, team.linear_id) : void 0) ?? resolveState(store, "Todo", team.linear_id) ?? ls.workflowStates.findBy("team_id", team.linear_id)[0];
      if (!state) continue;
      const number = nextIssueNumber(store, team.linear_id);
      const labelIds = (issueCfg.labels ?? []).map((label) => resolveLabel(store, label, team.linear_id)?.linear_id).filter((id) => Boolean(id));
      const now = (/* @__PURE__ */ new Date()).toISOString();
      ls.issues.insert({
        linear_id: issueCfg.id ?? linearId(),
        identifier: `${team.key}-${number}`,
        number,
        team_id: team.linear_id,
        title: issueCfg.title,
        description: issueCfg.description ?? null,
        priority: issueCfg.priority ?? 0,
        state_id: state.linear_id,
        assignee_id: issueCfg.assignee ? resolveUser(store, issueCfg.assignee)?.linear_id ?? null : null,
        creator_id: issueCfg.creator ? resolveUser(store, issueCfg.creator)?.linear_id ?? null : ls.users.all()[0]?.linear_id ?? null,
        delegate_id: issueCfg.delegate ? resolveUser(store, issueCfg.delegate)?.linear_id ?? null : null,
        project_id: issueCfg.project ? resolveProject(store, issueCfg.project)?.linear_id ?? null : null,
        cycle_id: issueCfg.cycle ? resolveCycle(store, issueCfg.cycle, team.linear_id)?.linear_id ?? null : null,
        label_ids: labelIds,
        url: `${baseUrl}/issue/${team.key}-${number}`,
        archived_at: null,
        canceled_at: state.type === "canceled" ? now : null,
        completed_at: state.type === "completed" ? now : null,
        started_at: state.type === "started" ? now : null,
        due_date: issueCfg.due_date ?? null,
        create_as_user: null,
        display_icon_url: null
      });
    }
  }
  if (config.comments) {
    for (const commentCfg of config.comments) {
      const issue = resolveIssue(store, commentCfg.issue);
      if (!issue) continue;
      ls.comments.insert({
        linear_id: commentCfg.id ?? linearId(),
        issue_id: issue.linear_id,
        user_id: commentCfg.user ? resolveUser(store, commentCfg.user)?.linear_id ?? null : ls.users.all()[0]?.linear_id ?? null,
        body: commentCfg.body,
        create_as_user: null,
        display_icon_url: null
      });
    }
  }
  if (config.tokens) {
    for (const tokenCfg of config.tokens) {
      const existing = ls.tokens.findOneBy("token", tokenCfg.token);
      const app = tokenCfg.app ? ls.oauthApps.findOneBy("client_id", tokenCfg.app) ?? ls.oauthApps.findOneBy("linear_id", tokenCfg.app) : void 0;
      const user = tokenCfg.user ? resolveUser(store, tokenCfg.user) : void 0;
      const tokenRecord = {
        type: tokenCfg.type ?? existing?.type ?? "personal",
        actor_type: tokenCfg.actor ?? (app ? "app" : existing?.actor_type ?? "user"),
        user_id: user?.linear_id ?? app?.app_user_id ?? existing?.user_id ?? ls.users.all()[0]?.linear_id ?? null,
        app_id: tokenCfg.app ? app?.linear_id ?? null : existing?.app_id ?? null,
        scopes: normalizeScopes(tokenCfg.scopes, existing?.scopes ?? DEFAULT_SCOPES),
        expires_at: null,
        revoked: false,
        refresh_token: null
      };
      if (existing) {
        ls.tokens.update(existing.id, tokenRecord);
        continue;
      }
      ls.tokens.insert({
        token: tokenCfg.token,
        ...tokenRecord
      });
    }
  }
  if (config.webhooks) {
    for (const whCfg of config.webhooks) {
      const team = whCfg.team ? resolveTeam(store, whCfg.team) : void 0;
      ls.webhooks.insert({
        linear_id: whCfg.id ?? linearId(),
        label: whCfg.label ?? "Local webhook",
        url: whCfg.url,
        enabled: whCfg.enabled ?? true,
        resource_types: normalizeScopes(whCfg.resource_types, ["Issue", "Comment"]),
        team_id: team?.linear_id ?? null,
        all_public_teams: whCfg.all_public_teams ?? !team,
        secret: whCfg.secret ?? null,
        creator_id: ls.users.all()[0]?.linear_id ?? null
      });
    }
  }
  if (config.strict_scopes !== void 0) {
    store.setData("linear.strict_scopes", config.strict_scopes);
  }
}
var linearPlugin = {
  name: "linear",
  register(app, store, webhooks, baseUrl, tokenMap) {
    app.use("*", async (c, next) => {
      const authError = applyLinearTokenAuth(c, store);
      if (authError) return authError;
      await next();
    });
    const ctx = { app, store, webhooks, baseUrl, tokenMap };
    graphqlRoutes(ctx);
    oauthRoutes(ctx);
    inspectorRoutes(ctx);
  },
  seed(store, baseUrl) {
    seedDefaults(store, baseUrl);
  }
};
var index_default = linearPlugin;
function normalizeScopes(value, fallback = []) {
  if (Array.isArray(value)) return value.map((scope) => scope.trim()).filter(Boolean);
  if (typeof value === "string") {
    return value.split(/[,\s]+/).map((scope) => scope.trim()).filter(Boolean);
  }
  return [...fallback];
}
function resolveUser(store, ref) {
  if (!ref) return void 0;
  const ls = getLinearStore(store);
  return ls.users.findOneBy("linear_id", ref) ?? ls.users.findOneBy("email", ref) ?? ls.users.all().find((user) => user.name === ref || user.display_name === ref);
}
function resolveTeam(store, ref) {
  if (!ref) return void 0;
  const ls = getLinearStore(store);
  return ls.teams.findOneBy("linear_id", ref) ?? ls.teams.findOneBy("key", ref) ?? ls.teams.findOneBy("name", ref);
}
function resolveState(store, ref, teamId) {
  if (!ref) return void 0;
  const ls = getLinearStore(store);
  const states = teamId ? ls.workflowStates.findBy("team_id", teamId) : ls.workflowStates.all();
  return states.find((state) => state.linear_id === ref || state.name === ref || state.type === ref);
}
function resolveIssue(store, ref) {
  if (!ref) return void 0;
  const ls = getLinearStore(store);
  return ls.issues.findOneBy("linear_id", ref) ?? ls.issues.findOneBy("identifier", ref);
}
function resolveLabel(store, ref, teamId) {
  if (!ref) return void 0;
  const ls = getLinearStore(store);
  const labels = teamId ? ls.issueLabels.all().filter((label) => label.team_id === teamId || label.team_id === null) : ls.issueLabels.all();
  return labels.find((label) => label.linear_id === ref || label.name === ref);
}
function resolveProject(store, ref) {
  if (!ref) return void 0;
  const ls = getLinearStore(store);
  return ls.projects.findOneBy("linear_id", ref) ?? ls.projects.findOneBy("name", ref);
}
function resolveCycle(store, ref, teamId) {
  if (!ref) return void 0;
  const ls = getLinearStore(store);
  const cycles = teamId ? ls.cycles.findBy("team_id", teamId) : ls.cycles.all();
  return cycles.find((cycle) => cycle.linear_id === ref || cycle.name === ref || String(cycle.number) === ref);
}
function nextIssueNumber(store, teamId) {
  const ls = getLinearStore(store);
  const team = ls.teams.findOneBy("linear_id", teamId);
  if (!team) return 1;
  const next = team.issue_sequence + 1;
  ls.teams.update(team.id, { issue_sequence: next });
  return next;
}
function applyLinearTokenAuth(c, store) {
  const requestToken = linearRequestToken(c);
  if (!requestToken) return;
  const record = getLinearStore(store).tokens.findOneBy("token", requestToken);
  if (!record) return;
  if (record.type === "oauth_refresh") {
    return linearAuthError(c, "OAuth refresh tokens cannot be used as Linear API access tokens.");
  }
  if (record.revoked) return linearAuthError(c, "Linear token has been revoked.");
  if (record.expires_at && new Date(record.expires_at).getTime() <= Date.now()) {
    return linearAuthError(c, "Linear token has expired.");
  }
  const user = record.user_id ? getLinearStore(store).users.findOneBy("linear_id", record.user_id) : void 0;
  c.set("authToken", record.token);
  c.set("authScopes", record.scopes);
  c.set("authUser", {
    login: user?.email ?? record.user_id ?? record.app_id ?? "linear-app",
    id: record.id,
    scopes: record.scopes
  });
}
function linearAuthError(c, message) {
  return c.json(
    {
      message,
      documentation_url: c.get("docsUrl") ?? "https://emulate.dev/linear"
    },
    401
  );
}
function linearRequestToken(c) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) return void 0;
  const token2 = authHeader.replace(/^(Bearer|token)\s+/i, "").trim();
  return token2 || void 0;
}
function ensureDefaultStates(store, teamId) {
  const defaults = [
    { name: "Backlog", type: "backlog", position: 1 },
    { name: "Todo", type: "unstarted", position: 2 },
    { name: "In Progress", type: "started", position: 3 },
    { name: "Done", type: "completed", position: 4 }
  ];
  const ls = getLinearStore(store);
  for (const state of defaults) {
    if (ls.workflowStates.findBy("team_id", teamId).some((existing) => existing.name === state.name)) continue;
    ls.workflowStates.insert({
      linear_id: linearId(),
      team_id: teamId,
      ...state
    });
  }
}
function inferStateType(name) {
  const lower = name.toLowerCase();
  if (lower.includes("backlog")) return "backlog";
  if (lower.includes("progress") || lower.includes("started")) return "started";
  if (lower.includes("done") || lower.includes("complete")) return "completed";
  if (lower.includes("cancel")) return "canceled";
  return "unstarted";
}
function ensureLabel(store, input) {
  const ls = getLinearStore(store);
  const existing = ls.issueLabels.all().find((label) => label.name === input.name && (label.team_id === input.teamId || label.team_id === null));
  if (existing) return existing;
  return ls.issueLabels.insert({
    linear_id: input.id ?? linearId(),
    team_id: input.teamId,
    name: input.name,
    color: input.color,
    description: input.description ?? null
  });
}
function ensureProject(store, input) {
  const ls = getLinearStore(store);
  const existing = ls.projects.all().find((project) => project.name === input.name && project.team_id === input.teamId);
  if (existing) return existing;
  return ls.projects.insert({
    linear_id: input.id ?? linearId(),
    team_id: input.teamId,
    name: input.name,
    description: input.description ?? null,
    state: input.state ?? "planned"
  });
}
function ensureCycle(store, input) {
  const ls = getLinearStore(store);
  const existing = ls.cycles.findBy("team_id", input.teamId).find((cycle) => cycle.name === input.name);
  if (existing) return existing;
  const number = input.number ?? ls.cycles.findBy("team_id", input.teamId).length + 1;
  return ls.cycles.insert({
    linear_id: input.id ?? linearId(),
    team_id: input.teamId,
    name: input.name,
    number,
    starts_at: input.startsAt ?? null,
    ends_at: input.endsAt ?? null
  });
}
function ensureAppUser(store, appName) {
  const ls = getLinearStore(store);
  const email = `${slugify(appName) || "linear-app"}@apps.linear.local`;
  const existing = ls.users.findOneBy("email", email);
  if (existing) return existing;
  return ls.users.insert({
    linear_id: linearId(),
    email,
    name: appName,
    display_name: appName,
    avatar_url: null,
    active: true,
    admin: false,
    app: true
  });
}
export {
  index_default as default,
  getLinearStore,
  linearPlugin,
  nextIssueNumber,
  normalizeScopes,
  resolveCycle,
  resolveIssue,
  resolveLabel,
  resolveProject,
  resolveState,
  resolveTeam,
  resolveUser,
  seedFromConfig
};
/*!
 * This HTTP compatibility layer builds on Hono's API and design.
 * https://github.com/honojs/hono
 * Copyright (c) 2021 - present, Yusuke Wada and Hono contributors
 * MIT license: see THIRD_PARTY_NOTICES.md in the repository and npm packages.
 */
//# sourceMappingURL=dist-HAUAPUZX.js.map