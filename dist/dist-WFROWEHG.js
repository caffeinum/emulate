import "./chunk-PZ5AY32C.js";

// ../@emulators/aws/dist/index.js
import { randomBytes, createHash } from "crypto";
import { randomBytes as randomBytes2 } from "crypto";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
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
function decodeS3ObjectBody(object) {
  if (typeof object.body_base64 === "string") {
    return Buffer.from(object.body_base64, "base64");
  }
  return Buffer.from(object.body ?? "", "utf8");
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
function awsErrorXml(c, code, message, status = 400) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ErrorResponse>
  <Error>
    <Code>${escapeXml(code)}</Code>
    <Message>${escapeXml(message)}</Message>
  </Error>
  <RequestId>${generateMessageId()}</RequestId>
</ErrorResponse>`;
  return c.text(xml, status, { "Content-Type": "application/xml" });
}
function escapeXml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
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
function sqsRoutes(ctx) {
  const { app, store, baseUrl } = ctx;
  const aws = () => getAwsStore(store);
  const accountId = getAccountId();
  app.post("/sqs/", async (c) => {
    const body = await c.req.text();
    const params = parseQueryString(body);
    const action = params["Action"] ?? c.req.query("Action") ?? "";
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
        return awsErrorXml(c, "InvalidAction", `The action ${action} is not valid for this endpoint.`, 400);
    }
  });
  function createQueue(c, params) {
    const queueName = params["QueueName"] ?? "";
    if (!queueName) {
      return awsErrorXml(c, "MissingParameter", "The request must contain the parameter QueueName.", 400);
    }
    const existing = aws().sqsQueues.findOneBy("queue_name", queueName);
    if (existing) {
      const xml2 = `<?xml version="1.0" encoding="UTF-8"?>
<CreateQueueResponse>
  <CreateQueueResult>
    <QueueUrl>${escapeXml(existing.queue_url)}</QueueUrl>
  </CreateQueueResult>
  <ResponseMetadata><RequestId>${generateMessageId()}</RequestId></ResponseMetadata>
</CreateQueueResponse>`;
      return awsXmlResponse(c, xml2);
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
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<CreateQueueResponse>
  <CreateQueueResult>
    <QueueUrl>${escapeXml(queueUrl)}</QueueUrl>
  </CreateQueueResult>
  <ResponseMetadata><RequestId>${generateMessageId()}</RequestId></ResponseMetadata>
</CreateQueueResponse>`;
    return awsXmlResponse(c, xml);
  }
  function deleteQueue(c, params) {
    const queueUrl = params["QueueUrl"] ?? "";
    const queue = aws().sqsQueues.findOneBy("queue_url", queueUrl);
    if (!queue) {
      return awsErrorXml(c, "AWS.SimpleQueueService.NonExistentQueue", "The specified queue does not exist.", 400);
    }
    const messages = aws().sqsMessages.findBy("queue_name", queue.queue_name);
    for (const msg of messages) {
      aws().sqsMessages.delete(msg.id);
    }
    aws().sqsQueues.delete(queue.id);
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<DeleteQueueResponse>
  <ResponseMetadata><RequestId>${generateMessageId()}</RequestId></ResponseMetadata>
</DeleteQueueResponse>`;
    return awsXmlResponse(c, xml);
  }
  function listQueues(c, params) {
    const prefix = params["QueueNamePrefix"] ?? "";
    let queues = aws().sqsQueues.all();
    if (prefix) {
      queues = queues.filter((q) => q.queue_name.startsWith(prefix));
    }
    const queueUrlsXml = queues.map((q) => `    <QueueUrl>${escapeXml(q.queue_url)}</QueueUrl>`).join("\n");
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ListQueuesResponse>
  <ListQueuesResult>
${queueUrlsXml}
  </ListQueuesResult>
  <ResponseMetadata><RequestId>${generateMessageId()}</RequestId></ResponseMetadata>
</ListQueuesResponse>`;
    return awsXmlResponse(c, xml);
  }
  function getQueueUrl(c, params) {
    const queueName = params["QueueName"] ?? "";
    const queue = aws().sqsQueues.findOneBy("queue_name", queueName);
    if (!queue) {
      return awsErrorXml(c, "AWS.SimpleQueueService.NonExistentQueue", "The specified queue does not exist.", 400);
    }
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<GetQueueUrlResponse>
  <GetQueueUrlResult>
    <QueueUrl>${escapeXml(queue.queue_url)}</QueueUrl>
  </GetQueueUrlResult>
  <ResponseMetadata><RequestId>${generateMessageId()}</RequestId></ResponseMetadata>
</GetQueueUrlResponse>`;
    return awsXmlResponse(c, xml);
  }
  function getQueueAttributes(c, params) {
    const queueUrl = params["QueueUrl"] ?? "";
    const queue = aws().sqsQueues.findOneBy("queue_url", queueUrl);
    if (!queue) {
      return awsErrorXml(c, "AWS.SimpleQueueService.NonExistentQueue", "The specified queue does not exist.", 400);
    }
    const messages = aws().sqsMessages.findBy("queue_name", queue.queue_name);
    const now = Date.now();
    const visibleCount = messages.filter((m) => m.visible_after <= now).length;
    const inFlightCount = messages.filter((m) => m.visible_after > now).length;
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<GetQueueAttributesResponse>
  <GetQueueAttributesResult>
    <Attribute><Name>QueueArn</Name><Value>${queue.arn}</Value></Attribute>
    <Attribute><Name>ApproximateNumberOfMessages</Name><Value>${visibleCount}</Value></Attribute>
    <Attribute><Name>ApproximateNumberOfMessagesNotVisible</Name><Value>${inFlightCount}</Value></Attribute>
    <Attribute><Name>VisibilityTimeout</Name><Value>${queue.visibility_timeout}</Value></Attribute>
    <Attribute><Name>MaximumMessageSize</Name><Value>${queue.max_message_size}</Value></Attribute>
    <Attribute><Name>MessageRetentionPeriod</Name><Value>${queue.message_retention_period}</Value></Attribute>
    <Attribute><Name>DelaySeconds</Name><Value>${queue.delay_seconds}</Value></Attribute>
    <Attribute><Name>ReceiveMessageWaitTimeSeconds</Name><Value>${queue.receive_message_wait_time}</Value></Attribute>
    <Attribute><Name>FifoQueue</Name><Value>${queue.fifo}</Value></Attribute>
  </GetQueueAttributesResult>
  <ResponseMetadata><RequestId>${generateMessageId()}</RequestId></ResponseMetadata>
</GetQueueAttributesResponse>`;
    return awsXmlResponse(c, xml);
  }
  function sendMessage(c, params) {
    const queueUrl = params["QueueUrl"] ?? "";
    const messageBody = params["MessageBody"] ?? "";
    const queue = aws().sqsQueues.findOneBy("queue_url", queueUrl);
    if (!queue) {
      return awsErrorXml(c, "AWS.SimpleQueueService.NonExistentQueue", "The specified queue does not exist.", 400);
    }
    if (!messageBody) {
      return awsErrorXml(c, "MissingParameter", "The request must contain the parameter MessageBody.", 400);
    }
    const bodyBytes = new TextEncoder().encode(messageBody).byteLength;
    if (bodyBytes > queue.max_message_size) {
      return awsErrorXml(
        c,
        "InvalidParameterValue",
        `One or more parameters are invalid. Reason: Message must be shorter than ${queue.max_message_size} bytes.`,
        400
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
      messageAttributes[name] = { DataType: dataType, StringValue: stringValue };
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
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<SendMessageResponse>
  <SendMessageResult>
    <MessageId>${messageId}</MessageId>
    <MD5OfMessageBody>${bodyMd5}</MD5OfMessageBody>
  </SendMessageResult>
  <ResponseMetadata><RequestId>${generateMessageId()}</RequestId></ResponseMetadata>
</SendMessageResponse>`;
    return awsXmlResponse(c, xml);
  }
  function receiveMessage(c, params) {
    const queueUrl = params["QueueUrl"] ?? "";
    const maxMessages = Math.min(parseInt(params["MaxNumberOfMessages"] ?? "1", 10), 10);
    const visibilityTimeout = parseInt(params["VisibilityTimeout"] ?? "", 10);
    const queue = aws().sqsQueues.findOneBy("queue_url", queueUrl);
    if (!queue) {
      return awsErrorXml(c, "AWS.SimpleQueueService.NonExistentQueue", "The specified queue does not exist.", 400);
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
    const messagesXml = batch.map(
      (m) => `    <Message>
      <MessageId>${m.message_id}</MessageId>
      <ReceiptHandle>${m.receipt_handle}</ReceiptHandle>
      <MD5OfBody>${m.md5_of_body}</MD5OfBody>
      <Body>${escapeXml(m.body)}</Body>
      <Attribute><Name>SentTimestamp</Name><Value>${m.sent_timestamp}</Value></Attribute>
      <Attribute><Name>ApproximateReceiveCount</Name><Value>${m.receive_count}</Value></Attribute>
      <Attribute><Name>ApproximateFirstReceiveTimestamp</Name><Value>${m.sent_timestamp}</Value></Attribute>
    </Message>`
    ).join("\n");
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ReceiveMessageResponse>
  <ReceiveMessageResult>
${messagesXml}
  </ReceiveMessageResult>
  <ResponseMetadata><RequestId>${generateMessageId()}</RequestId></ResponseMetadata>
</ReceiveMessageResponse>`;
    return awsXmlResponse(c, xml);
  }
  function deleteMessage(c, params) {
    const queueUrl = params["QueueUrl"] ?? "";
    const receiptHandle = params["ReceiptHandle"] ?? "";
    const queue = aws().sqsQueues.findOneBy("queue_url", queueUrl);
    if (!queue) {
      return awsErrorXml(c, "AWS.SimpleQueueService.NonExistentQueue", "The specified queue does not exist.", 400);
    }
    const messages = aws().sqsMessages.findBy("queue_name", queue.queue_name);
    const msg = messages.find((m) => m.receipt_handle === receiptHandle);
    if (msg) {
      aws().sqsMessages.delete(msg.id);
    }
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<DeleteMessageResponse>
  <ResponseMetadata><RequestId>${generateMessageId()}</RequestId></ResponseMetadata>
</DeleteMessageResponse>`;
    return awsXmlResponse(c, xml);
  }
  function purgeQueue(c, params) {
    const queueUrl = params["QueueUrl"] ?? "";
    const queue = aws().sqsQueues.findOneBy("queue_url", queueUrl);
    if (!queue) {
      return awsErrorXml(c, "AWS.SimpleQueueService.NonExistentQueue", "The specified queue does not exist.", 400);
    }
    const messages = aws().sqsMessages.findBy("queue_name", queue.queue_name);
    for (const msg of messages) {
      aws().sqsMessages.delete(msg.id);
    }
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<PurgeQueueResponse>
  <ResponseMetadata><RequestId>${generateMessageId()}</RequestId></ResponseMetadata>
</PurgeQueueResponse>`;
    return awsXmlResponse(c, xml);
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
        return getUser(c, params);
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
  function getUser(c, params) {
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
var SERVICE_LABEL = "AWS";
var TABS = [
  { id: "s3", label: "S3", href: "/_inspector?tab=s3" },
  { id: "sqs", label: "SQS", href: "/_inspector?tab=sqs" },
  { id: "iam", label: "IAM", href: "/_inspector?tab=iam" }
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
    return c.html(renderInspectorPage("Inspector", TABS, tab, contentHtml, SERVICE_LABEL));
  });
}
function seedDefaults(store, baseUrl) {
  const aws = getAwsStore(store);
  const accountId = getAccountId();
  const region = getDefaultRegion();
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
  seedFromConfig
};
/*!
 * This HTTP compatibility layer builds on Hono's API and design.
 * https://github.com/honojs/hono
 * Copyright (c) 2021 - present, Yusuke Wada and Hono contributors
 * MIT license: see THIRD_PARTY_NOTICES.md in the repository and npm packages.
 */
//# sourceMappingURL=dist-WFROWEHG.js.map