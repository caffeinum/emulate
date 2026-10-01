import "./chunk-PZ5AY32C.js";

// ../@emulators/mongoatlas/dist/index.js
import { randomBytes } from "crypto";
function getMongoAtlasStore(store) {
  return {
    clusters: store.collection("mongoatlas.clusters", ["cluster_id", "name"]),
    databases: store.collection("mongoatlas.databases", ["cluster_id", "name"]),
    collections: store.collection("mongoatlas.collections", ["cluster_id", "database", "name"]),
    documents: store.collection("mongoatlas.documents", ["cluster_id", "doc_id"]),
    projects: store.collection("mongoatlas.projects", ["group_id"]),
    users: store.collection("mongoatlas.users", ["user_id", "username"])
  };
}
function generateObjectId() {
  const timestamp = Math.floor(Date.now() / 1e3).toString(16).padStart(8, "0");
  const random = randomBytes(8).toString("hex").slice(0, 16);
  return (timestamp + random).slice(0, 24);
}
function generateClusterId() {
  return randomBytes(12).toString("hex");
}
function generateGroupId() {
  return randomBytes(12).toString("hex");
}
function generateUserId() {
  return randomBytes(12).toString("hex");
}
function mongoOk(c, data, status = 200) {
  return c.json(data, status);
}
function mongoError(c, errorCode, detail, status = 400) {
  return c.json({ error: status, errorCode, detail }, status);
}
function dataApiRoutes(ctx) {
  const { app, store } = ctx;
  const ms = () => getMongoAtlasStore(store);
  app.post("/app/data-api/v1/action/findOne", async (c) => {
    const body = await c.req.json();
    if (!body.dataSource || !body.database || !body.collection) {
      return mongoError(c, "InvalidParameter", "dataSource, database, and collection are required");
    }
    const cluster = ms().clusters.findOneBy("name", body.dataSource);
    if (!cluster) {
      return mongoError(c, "ClusterNotFound", `Cluster '${body.dataSource}' not found`, 404);
    }
    const docs = ms().documents.all().filter(
      (d) => d.cluster_id === cluster.cluster_id && d.database === body.database && d.collection === body.collection
    );
    const matched = matchFilter(docs, body.filter) ?? docs;
    const doc = matched[0] ?? null;
    const projected = doc ? applyProjection(doc.data, body.projection) : null;
    return mongoOk(c, { document: projected });
  });
  app.post("/app/data-api/v1/action/find", async (c) => {
    const body = await c.req.json();
    if (!body.dataSource || !body.database || !body.collection) {
      return mongoError(c, "InvalidParameter", "dataSource, database, and collection are required");
    }
    const cluster = ms().clusters.findOneBy("name", body.dataSource);
    if (!cluster) {
      return mongoError(c, "ClusterNotFound", `Cluster '${body.dataSource}' not found`, 404);
    }
    let docs = ms().documents.all().filter(
      (d) => d.cluster_id === cluster.cluster_id && d.database === body.database && d.collection === body.collection
    );
    docs = matchFilter(docs, body.filter) ?? docs;
    if (body.sort) {
      docs = sortBySpec(docs, body.sort, (d) => d.data);
    }
    if (body.skip) {
      docs = docs.slice(body.skip);
    }
    if (body.limit) {
      docs = docs.slice(0, body.limit);
    }
    const documents = docs.map((d) => applyProjection(d.data, body.projection));
    return mongoOk(c, { documents });
  });
  app.post("/app/data-api/v1/action/insertOne", async (c) => {
    const body = await c.req.json();
    if (!body.dataSource || !body.database || !body.collection || !body.document) {
      return mongoError(c, "InvalidParameter", "dataSource, database, collection, and document are required");
    }
    const cluster = ms().clusters.findOneBy("name", body.dataSource);
    if (!cluster) {
      return mongoError(c, "ClusterNotFound", `Cluster '${body.dataSource}' not found`, 404);
    }
    ensureCollectionExists(ms, cluster.cluster_id, body.database, body.collection);
    const docId = body.document._id ?? generateObjectId();
    const data = { ...body.document, _id: docId };
    ms().documents.insert({
      cluster_id: cluster.cluster_id,
      database: body.database,
      collection: body.collection,
      doc_id: docId,
      data
    });
    return mongoOk(c, { insertedId: docId }, 201);
  });
  app.post("/app/data-api/v1/action/insertMany", async (c) => {
    const body = await c.req.json();
    if (!body.dataSource || !body.database || !body.collection || !body.documents) {
      return mongoError(c, "InvalidParameter", "dataSource, database, collection, and documents are required");
    }
    const cluster = ms().clusters.findOneBy("name", body.dataSource);
    if (!cluster) {
      return mongoError(c, "ClusterNotFound", `Cluster '${body.dataSource}' not found`, 404);
    }
    ensureCollectionExists(ms, cluster.cluster_id, body.database, body.collection);
    const insertedIds = [];
    for (const doc of body.documents) {
      const docId = doc._id ?? generateObjectId();
      const data = { ...doc, _id: docId };
      ms().documents.insert({
        cluster_id: cluster.cluster_id,
        database: body.database,
        collection: body.collection,
        doc_id: docId,
        data
      });
      insertedIds.push(docId);
    }
    return mongoOk(c, { insertedIds }, 201);
  });
  app.post("/app/data-api/v1/action/updateOne", async (c) => {
    const body = await c.req.json();
    if (!body.dataSource || !body.database || !body.collection || !body.update) {
      return mongoError(c, "InvalidParameter", "dataSource, database, collection, and update are required");
    }
    const cluster = ms().clusters.findOneBy("name", body.dataSource);
    if (!cluster) {
      return mongoError(c, "ClusterNotFound", `Cluster '${body.dataSource}' not found`, 404);
    }
    const docs = ms().documents.all().filter(
      (d) => d.cluster_id === cluster.cluster_id && d.database === body.database && d.collection === body.collection
    );
    const matched = matchFilter(docs, body.filter) ?? docs;
    const doc = matched[0];
    if (doc) {
      const updatedData = applyUpdate(doc.data, body.update);
      ms().documents.update(doc.id, { data: updatedData });
      return mongoOk(c, { matchedCount: 1, modifiedCount: 1 });
    }
    if (body.upsert) {
      ensureCollectionExists(ms, cluster.cluster_id, body.database, body.collection);
      const docId = generateObjectId();
      const baseDoc = extractEqualityFields(body.filter ?? {});
      const data = applyUpdate({ _id: docId, ...baseDoc }, body.update);
      ms().documents.insert({
        cluster_id: cluster.cluster_id,
        database: body.database,
        collection: body.collection,
        doc_id: docId,
        data
      });
      return mongoOk(c, { matchedCount: 0, modifiedCount: 0, upsertedId: docId });
    }
    return mongoOk(c, { matchedCount: 0, modifiedCount: 0 });
  });
  app.post("/app/data-api/v1/action/updateMany", async (c) => {
    const body = await c.req.json();
    if (!body.dataSource || !body.database || !body.collection || !body.update) {
      return mongoError(c, "InvalidParameter", "dataSource, database, collection, and update are required");
    }
    const cluster = ms().clusters.findOneBy("name", body.dataSource);
    if (!cluster) {
      return mongoError(c, "ClusterNotFound", `Cluster '${body.dataSource}' not found`, 404);
    }
    const docs = ms().documents.all().filter(
      (d) => d.cluster_id === cluster.cluster_id && d.database === body.database && d.collection === body.collection
    );
    const matched = matchFilter(docs, body.filter) ?? docs;
    let modifiedCount = 0;
    for (const doc of matched) {
      const updatedData = applyUpdate(doc.data, body.update);
      ms().documents.update(doc.id, { data: updatedData });
      modifiedCount++;
    }
    if (matched.length === 0 && body.upsert) {
      ensureCollectionExists(ms, cluster.cluster_id, body.database, body.collection);
      const docId = generateObjectId();
      const baseDoc = extractEqualityFields(body.filter ?? {});
      const data = applyUpdate({ _id: docId, ...baseDoc }, body.update);
      ms().documents.insert({
        cluster_id: cluster.cluster_id,
        database: body.database,
        collection: body.collection,
        doc_id: docId,
        data
      });
      return mongoOk(c, { matchedCount: 0, modifiedCount: 0, upsertedId: docId });
    }
    return mongoOk(c, { matchedCount: matched.length, modifiedCount });
  });
  app.post("/app/data-api/v1/action/deleteOne", async (c) => {
    const body = await c.req.json();
    if (!body.dataSource || !body.database || !body.collection) {
      return mongoError(c, "InvalidParameter", "dataSource, database, and collection are required");
    }
    const cluster = ms().clusters.findOneBy("name", body.dataSource);
    if (!cluster) {
      return mongoError(c, "ClusterNotFound", `Cluster '${body.dataSource}' not found`, 404);
    }
    const docs = ms().documents.all().filter(
      (d) => d.cluster_id === cluster.cluster_id && d.database === body.database && d.collection === body.collection
    );
    const matched = matchFilter(docs, body.filter) ?? docs;
    const doc = matched[0];
    if (doc) {
      ms().documents.delete(doc.id);
      return mongoOk(c, { deletedCount: 1 });
    }
    return mongoOk(c, { deletedCount: 0 });
  });
  app.post("/app/data-api/v1/action/deleteMany", async (c) => {
    const body = await c.req.json();
    if (!body.dataSource || !body.database || !body.collection) {
      return mongoError(c, "InvalidParameter", "dataSource, database, and collection are required");
    }
    const cluster = ms().clusters.findOneBy("name", body.dataSource);
    if (!cluster) {
      return mongoError(c, "ClusterNotFound", `Cluster '${body.dataSource}' not found`, 404);
    }
    const docs = ms().documents.all().filter(
      (d) => d.cluster_id === cluster.cluster_id && d.database === body.database && d.collection === body.collection
    );
    const matched = matchFilter(docs, body.filter) ?? docs;
    let deletedCount = 0;
    for (const doc of matched) {
      ms().documents.delete(doc.id);
      deletedCount++;
    }
    return mongoOk(c, { deletedCount });
  });
  app.post("/app/data-api/v1/action/aggregate", async (c) => {
    const body = await c.req.json();
    if (!body.dataSource || !body.database || !body.collection) {
      return mongoError(c, "InvalidParameter", "dataSource, database, and collection are required");
    }
    const cluster = ms().clusters.findOneBy("name", body.dataSource);
    if (!cluster) {
      return mongoError(c, "ClusterNotFound", `Cluster '${body.dataSource}' not found`, 404);
    }
    const docs = ms().documents.all().filter(
      (d) => d.cluster_id === cluster.cluster_id && d.database === body.database && d.collection === body.collection
    );
    const pipeline = body.pipeline ?? [];
    let results = docs.map((d) => d.data);
    for (const stage of pipeline) {
      if ("$match" in stage) {
        const filter = stage.$match;
        results = results.filter((d) => matchesFilter(d, filter));
      } else if ("$limit" in stage) {
        results = results.slice(0, stage.$limit);
      } else if ("$skip" in stage) {
        results = results.slice(stage.$skip);
      } else if ("$sort" in stage) {
        const sortSpec = stage.$sort;
        results = sortBySpec(results, sortSpec, (d) => d);
      } else if ("$project" in stage) {
        const projection = stage.$project;
        results = results.map((d) => applyProjection(d, projection));
      } else if ("$count" in stage) {
        const fieldName = stage.$count;
        results = [{ [fieldName]: results.length }];
      }
    }
    return mongoOk(c, { documents: results });
  });
}
function ensureCollectionExists(ms, clusterId, database, collection) {
  const existing = ms().collections.all().find((col) => col.cluster_id === clusterId && col.database === database && col.name === collection);
  if (!existing) {
    const dbExists = ms().databases.all().find((db) => db.cluster_id === clusterId && db.name === database);
    if (!dbExists) {
      ms().databases.insert({ cluster_id: clusterId, name: database });
    }
    ms().collections.insert({ cluster_id: clusterId, database, name: collection });
  }
}
function matchesFilter(data, filter) {
  for (const [key, value] of Object.entries(filter)) {
    if (key === "$and") {
      const conditions = value;
      if (!conditions.every((cond) => matchesFilter(data, cond))) return false;
      continue;
    }
    if (key === "$or") {
      const conditions = value;
      if (!conditions.some((cond) => matchesFilter(data, cond))) return false;
      continue;
    }
    if (key === "$nor") {
      const conditions = value;
      if (conditions.some((cond) => matchesFilter(data, cond))) return false;
      continue;
    }
    const docValue = getNestedValue(data, key);
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      const ops = value;
      for (const [op, opVal] of Object.entries(ops)) {
        switch (op) {
          case "$eq":
            if (docValue !== opVal) return false;
            break;
          case "$ne":
            if (docValue === opVal) return false;
            break;
          case "$gt":
            if (typeof docValue !== "number" || typeof opVal !== "number" || docValue <= opVal) return false;
            break;
          case "$gte":
            if (typeof docValue !== "number" || typeof opVal !== "number" || docValue < opVal) return false;
            break;
          case "$lt":
            if (typeof docValue !== "number" || typeof opVal !== "number" || docValue >= opVal) return false;
            break;
          case "$lte":
            if (typeof docValue !== "number" || typeof opVal !== "number" || docValue > opVal) return false;
            break;
          case "$in":
            if (!Array.isArray(opVal) || !opVal.includes(docValue)) return false;
            break;
          case "$nin":
            if (!Array.isArray(opVal) || opVal.includes(docValue)) return false;
            break;
          case "$exists":
            if (opVal && docValue === void 0) return false;
            if (!opVal && docValue !== void 0) return false;
            break;
          case "$regex": {
            const pattern = opVal;
            const flags = ops.$options ?? "";
            try {
              if (pattern.length > 1e3) return false;
              const re = new RegExp(pattern, flags);
              if (typeof docValue !== "string" || !re.test(docValue)) return false;
            } catch {
              return false;
            }
            break;
          }
        }
      }
    } else {
      if (docValue !== value) return false;
    }
  }
  return true;
}
function getNestedValue(obj, path) {
  const parts = path.split(".");
  if (hasDangerousKey(parts)) return void 0;
  let current = obj;
  for (const part of parts) {
    if (current === null || current === void 0 || typeof current !== "object") return void 0;
    current = current[part];
  }
  return current;
}
function matchFilter(docs, filter) {
  if (!filter || Object.keys(filter).length === 0) return null;
  return docs.filter((d) => matchesFilter(d.data, filter));
}
function applyProjection(data, projection) {
  if (!projection || Object.keys(projection).length === 0) return data;
  const hasInclusions = Object.values(projection).some((v) => v === 1 || v === true);
  if (hasInclusions) {
    const result2 = {};
    if (projection._id !== 0 && projection._id !== false) {
      result2._id = data._id;
    }
    for (const [key, val] of Object.entries(projection)) {
      if (key === "_id") continue;
      if (val === 1 || val === true) {
        result2[key] = data[key];
      }
    }
    return result2;
  }
  const result = { ...data };
  for (const [key, val] of Object.entries(projection)) {
    if (val === 0 || val === false) {
      delete result[key];
    }
  }
  return result;
}
function applyUpdate(data, update) {
  const result = { ...data };
  if ("$set" in update) {
    const setFields = update.$set;
    for (const [key, value] of Object.entries(setFields)) {
      setNestedValue(result, key, value);
    }
  }
  if ("$unset" in update) {
    const unsetFields = update.$unset;
    for (const key of Object.keys(unsetFields)) {
      const parts = key.split(".");
      if (hasDangerousKey(parts)) continue;
      if (parts.length === 1) {
        delete result[key];
      } else {
        let current = result;
        for (let i = 0; i < parts.length - 1; i++) {
          if (current[parts[i]] === null || current[parts[i]] === void 0 || typeof current[parts[i]] !== "object")
            break;
          current = current[parts[i]];
        }
        delete current[parts[parts.length - 1]];
      }
    }
  }
  if ("$inc" in update) {
    const incFields = update.$inc;
    for (const [key, value] of Object.entries(incFields)) {
      const current = getNestedValue(result, key) ?? 0;
      setNestedValue(result, key, current + value);
    }
  }
  if ("$push" in update) {
    const pushFields = update.$push;
    for (const [key, value] of Object.entries(pushFields)) {
      const current = getNestedValue(result, key);
      if (!Array.isArray(current)) {
        setNestedValue(result, key, [value]);
      } else {
        setNestedValue(result, key, [...current, value]);
      }
    }
  }
  if ("$pull" in update) {
    const pullFields = update.$pull;
    for (const [key, value] of Object.entries(pullFields)) {
      const current = getNestedValue(result, key);
      if (Array.isArray(current)) {
        setNestedValue(
          result,
          key,
          current.filter((item) => item !== value)
        );
      }
    }
  }
  if ("$rename" in update) {
    const renameFields = update.$rename;
    for (const [oldKey, newKey] of Object.entries(renameFields)) {
      const oldParts = oldKey.split(".");
      const newParts = newKey.split(".");
      if (hasDangerousKey(oldParts) || hasDangerousKey(newParts)) continue;
      const value = getNestedValue(result, oldKey);
      if (value !== void 0) {
        setNestedValue(result, newKey, value);
        if (oldParts.length === 1) {
          delete result[oldKey];
        } else {
          let current = result;
          for (let i = 0; i < oldParts.length - 1; i++) {
            if (typeof current[oldParts[i]] !== "object" || current[oldParts[i]] === null) break;
            current = current[oldParts[i]];
          }
          delete current[oldParts[oldParts.length - 1]];
        }
      }
    }
  }
  const hasOperators = Object.keys(update).some((k) => k.startsWith("$"));
  if (!hasOperators) {
    const id = result._id;
    for (const key of Object.keys(result)) {
      delete result[key];
    }
    result._id = id;
    Object.assign(result, update);
  }
  return result;
}
var DANGEROUS_KEYS = /* @__PURE__ */ new Set(["__proto__", "constructor", "prototype"]);
function hasDangerousKey(parts) {
  return parts.some((p) => DANGEROUS_KEYS.has(p));
}
function setNestedValue(obj, path, value) {
  const parts = path.split(".");
  if (hasDangerousKey(parts)) return;
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!(parts[i] in current) || typeof current[parts[i]] !== "object") {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
}
function sortBySpec(docs, sortSpec, accessor) {
  return [...docs].sort((a, b) => {
    for (const [key, direction] of Object.entries(sortSpec)) {
      const aVal = getNestedValue(accessor(a), key);
      const bVal = getNestedValue(accessor(b), key);
      if (aVal === bVal) continue;
      if (aVal === void 0) return direction;
      if (bVal === void 0) return -direction;
      if (aVal < bVal) return -direction;
      if (aVal > bVal) return direction;
    }
    return 0;
  });
}
function extractEqualityFields(filter) {
  const result = {};
  for (const [key, value] of Object.entries(filter)) {
    if (key.startsWith("$")) continue;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      const ops = value;
      if (Object.keys(ops).some((k) => k.startsWith("$"))) continue;
    }
    result[key] = value;
  }
  return result;
}
function adminRoutes(ctx) {
  const { app, store } = ctx;
  const ms = () => getMongoAtlasStore(store);
  app.get("/api/atlas/v2/groups", (c) => {
    const projects = ms().projects.all();
    return mongoOk(c, {
      results: projects.map(formatProject),
      totalCount: projects.length
    });
  });
  app.get("/api/atlas/v2/groups/:groupId", (c) => {
    const groupId = c.req.param("groupId");
    const project = ms().projects.findOneBy("group_id", groupId);
    if (!project) {
      return mongoError(c, "GROUP_NOT_FOUND", `Group '${groupId}' not found.`, 404);
    }
    return mongoOk(c, formatProject(project));
  });
  app.post("/api/atlas/v2/groups", async (c) => {
    const body = await c.req.json();
    if (!body.name?.trim()) {
      return mongoError(c, "INVALID_PARAMETER", "name is required");
    }
    const existing = ms().projects.all().find((p) => p.name === body.name);
    if (existing) {
      return mongoError(c, "DUPLICATE_GROUP_NAME", `Group name '${body.name}' already exists.`, 409);
    }
    const groupId = generateGroupId();
    const project = ms().projects.insert({
      group_id: groupId,
      name: body.name,
      org_id: body.orgId ?? "default_org",
      cluster_count: 0
    });
    return mongoOk(c, formatProject(project), 201);
  });
  app.delete("/api/atlas/v2/groups/:groupId", (c) => {
    const groupId = c.req.param("groupId");
    const project = ms().projects.findOneBy("group_id", groupId);
    if (!project) {
      return mongoError(c, "GROUP_NOT_FOUND", `Group '${groupId}' not found.`, 404);
    }
    const clusters = ms().clusters.all().filter((cl) => cl.group_id === groupId);
    for (const cluster of clusters) {
      deleteClusterData(ms, cluster.cluster_id);
      ms().clusters.delete(cluster.id);
    }
    ms().projects.delete(project.id);
    return c.body(null, 204);
  });
  app.get("/api/atlas/v2/groups/:groupId/clusters", (c) => {
    const groupId = c.req.param("groupId");
    const project = ms().projects.findOneBy("group_id", groupId);
    if (!project) {
      return mongoError(c, "GROUP_NOT_FOUND", `Group '${groupId}' not found.`, 404);
    }
    const clusters = ms().clusters.all().filter((cl) => cl.group_id === groupId);
    return mongoOk(c, {
      results: clusters.map(formatCluster),
      totalCount: clusters.length
    });
  });
  app.get("/api/atlas/v2/groups/:groupId/clusters/:clusterName", (c) => {
    const groupId = c.req.param("groupId");
    const clusterName = c.req.param("clusterName");
    const cluster = ms().clusters.all().find((cl) => cl.group_id === groupId && cl.name === clusterName);
    if (!cluster) {
      return mongoError(c, "CLUSTER_NOT_FOUND", `Cluster '${clusterName}' not found.`, 404);
    }
    return mongoOk(c, formatCluster(cluster));
  });
  app.post("/api/atlas/v2/groups/:groupId/clusters", async (c) => {
    const groupId = c.req.param("groupId");
    const project = ms().projects.findOneBy("group_id", groupId);
    if (!project) {
      return mongoError(c, "GROUP_NOT_FOUND", `Group '${groupId}' not found.`, 404);
    }
    const body = await c.req.json();
    if (!body.name?.trim()) {
      return mongoError(c, "INVALID_PARAMETER", "name is required");
    }
    const existing = ms().clusters.all().find((cl) => cl.group_id === groupId && cl.name === body.name);
    if (existing) {
      return mongoError(c, "DUPLICATE_CLUSTER_NAME", `Cluster '${body.name}' already exists.`, 409);
    }
    const clusterId = generateClusterId();
    const cluster = ms().clusters.insert({
      cluster_id: clusterId,
      name: body.name,
      group_id: groupId,
      state: "IDLE",
      mongo_uri: `mongodb+srv://${body.name}.emulate.mongodb.net`,
      connection_strings: {
        standard: `mongodb://${body.name}.emulate.mongodb.net:27017`,
        standard_srv: `mongodb+srv://${body.name}.emulate.mongodb.net`
      },
      provider_settings: {
        provider_name: body.providerSettings?.providerName ?? "AWS",
        instance_size_name: body.providerSettings?.instanceSizeName ?? "M10",
        region_name: body.providerSettings?.regionName ?? "US_EAST_1"
      },
      cluster_type: body.clusterType ?? "REPLICASET",
      disk_size_gb: body.diskSizeGB ?? 10,
      mongodb_version: body.mongoDBMajorVersion ?? "8.0"
    });
    ms().projects.update(project.id, { cluster_count: project.cluster_count + 1 });
    return mongoOk(c, formatCluster(cluster), 201);
  });
  app.patch("/api/atlas/v2/groups/:groupId/clusters/:clusterName", async (c) => {
    const groupId = c.req.param("groupId");
    const clusterName = c.req.param("clusterName");
    const cluster = ms().clusters.all().find((cl) => cl.group_id === groupId && cl.name === clusterName);
    if (!cluster) {
      return mongoError(c, "CLUSTER_NOT_FOUND", `Cluster '${clusterName}' not found.`, 404);
    }
    const body = await c.req.json();
    const updates = {};
    if (body.providerSettings) {
      updates.provider_settings = {
        provider_name: cluster.provider_settings.provider_name,
        instance_size_name: body.providerSettings.instanceSizeName ?? cluster.provider_settings.instance_size_name,
        region_name: body.providerSettings.regionName ?? cluster.provider_settings.region_name
      };
    }
    if (body.diskSizeGB !== void 0) {
      updates.disk_size_gb = body.diskSizeGB;
    }
    const updated = ms().clusters.update(cluster.id, updates);
    return mongoOk(c, formatCluster(updated));
  });
  app.delete("/api/atlas/v2/groups/:groupId/clusters/:clusterName", (c) => {
    const groupId = c.req.param("groupId");
    const clusterName = c.req.param("clusterName");
    const cluster = ms().clusters.all().find((cl) => cl.group_id === groupId && cl.name === clusterName);
    if (!cluster) {
      return mongoError(c, "CLUSTER_NOT_FOUND", `Cluster '${clusterName}' not found.`, 404);
    }
    deleteClusterData(ms, cluster.cluster_id);
    ms().clusters.delete(cluster.id);
    const project = ms().projects.findOneBy("group_id", groupId);
    if (project) {
      ms().projects.update(project.id, { cluster_count: Math.max(0, project.cluster_count - 1) });
    }
    return c.body(null, 204);
  });
  app.get("/api/atlas/v2/groups/:groupId/databaseUsers", (c) => {
    const groupId = c.req.param("groupId");
    const users = ms().users.all().filter((u) => u.group_id === groupId);
    return mongoOk(c, {
      results: users.map(formatUser),
      totalCount: users.length
    });
  });
  app.get("/api/atlas/v2/groups/:groupId/databaseUsers/admin/:username", (c) => {
    const groupId = c.req.param("groupId");
    const username = c.req.param("username");
    const user = ms().users.all().find((u) => u.group_id === groupId && u.username === username);
    if (!user) {
      return mongoError(c, "USER_NOT_FOUND", `Database user '${username}' not found.`, 404);
    }
    return mongoOk(c, formatUser(user));
  });
  app.post("/api/atlas/v2/groups/:groupId/databaseUsers", async (c) => {
    const groupId = c.req.param("groupId");
    const body = await c.req.json();
    if (!body.username?.trim()) {
      return mongoError(c, "INVALID_PARAMETER", "username is required");
    }
    const existing = ms().users.all().find((u) => u.group_id === groupId && u.username === body.username);
    if (existing) {
      return mongoError(c, "DUPLICATE_USER", `User '${body.username}' already exists.`, 409);
    }
    const userId = generateUserId();
    const user = ms().users.insert({
      user_id: userId,
      username: body.username,
      group_id: groupId,
      roles: (body.roles ?? []).map((r) => ({ database_name: r.databaseName, role_name: r.roleName }))
    });
    return mongoOk(c, formatUser(user), 201);
  });
  app.delete("/api/atlas/v2/groups/:groupId/databaseUsers/admin/:username", (c) => {
    const groupId = c.req.param("groupId");
    const username = c.req.param("username");
    const user = ms().users.all().find((u) => u.group_id === groupId && u.username === username);
    if (!user) {
      return mongoError(c, "USER_NOT_FOUND", `Database user '${username}' not found.`, 404);
    }
    ms().users.delete(user.id);
    return c.body(null, 204);
  });
  app.get("/api/atlas/v2/groups/:groupId/clusters/:clusterName/databases", (c) => {
    const groupId = c.req.param("groupId");
    const clusterName = c.req.param("clusterName");
    const cluster = ms().clusters.all().find((cl) => cl.group_id === groupId && cl.name === clusterName);
    if (!cluster) {
      return mongoError(c, "CLUSTER_NOT_FOUND", `Cluster '${clusterName}' not found.`, 404);
    }
    const databases = ms().databases.all().filter((db) => db.cluster_id === cluster.cluster_id);
    return mongoOk(c, {
      results: databases.map((db) => ({ databaseName: db.name })),
      totalCount: databases.length
    });
  });
  app.get("/api/atlas/v2/groups/:groupId/clusters/:clusterName/databases/:databaseName/collections", (c) => {
    const groupId = c.req.param("groupId");
    const clusterName = c.req.param("clusterName");
    const databaseName = c.req.param("databaseName");
    const cluster = ms().clusters.all().find((cl) => cl.group_id === groupId && cl.name === clusterName);
    if (!cluster) {
      return mongoError(c, "CLUSTER_NOT_FOUND", `Cluster '${clusterName}' not found.`, 404);
    }
    const collections = ms().collections.all().filter((col) => col.cluster_id === cluster.cluster_id && col.database === databaseName);
    return mongoOk(c, {
      results: collections.map((col) => ({ collectionName: col.name, databaseName })),
      totalCount: collections.length
    });
  });
}
function deleteClusterData(ms, clusterId) {
  const docs = ms().documents.all().filter((d) => d.cluster_id === clusterId);
  for (const doc of docs) ms().documents.delete(doc.id);
  const cols = ms().collections.all().filter((col) => col.cluster_id === clusterId);
  for (const col of cols) ms().collections.delete(col.id);
  const dbs = ms().databases.all().filter((db) => db.cluster_id === clusterId);
  for (const db of dbs) ms().databases.delete(db.id);
}
function formatProject(p) {
  return {
    id: p.group_id,
    name: p.name,
    orgId: p.org_id,
    clusterCount: p.cluster_count,
    created: p.created_at
  };
}
function formatCluster(cl) {
  return {
    id: cl.cluster_id,
    name: cl.name,
    groupId: cl.group_id,
    stateName: cl.state,
    mongoURI: cl.mongo_uri,
    connectionStrings: {
      standard: cl.connection_strings.standard,
      standardSrv: cl.connection_strings.standard_srv
    },
    providerSettings: {
      providerName: cl.provider_settings.provider_name,
      instanceSizeName: cl.provider_settings.instance_size_name,
      regionName: cl.provider_settings.region_name
    },
    clusterType: cl.cluster_type,
    diskSizeGB: cl.disk_size_gb,
    mongoDBVersion: cl.mongodb_version,
    created: cl.created_at
  };
}
function formatUser(u) {
  return {
    username: u.username,
    groupId: u.group_id,
    databaseName: "admin",
    roles: u.roles.map((r) => ({ databaseName: r.database_name, roleName: r.role_name }))
  };
}
function seedDefaults(store, _baseUrl) {
  const ms = getMongoAtlasStore(store);
  const groupId = generateGroupId();
  ms.projects.insert({
    group_id: groupId,
    name: "Project0",
    org_id: "default_org",
    cluster_count: 1
  });
  const clusterId = generateClusterId();
  ms.clusters.insert({
    cluster_id: clusterId,
    name: "Cluster0",
    group_id: groupId,
    state: "IDLE",
    mongo_uri: "mongodb+srv://Cluster0.emulate.mongodb.net",
    connection_strings: {
      standard: "mongodb://Cluster0.emulate.mongodb.net:27017",
      standard_srv: "mongodb+srv://Cluster0.emulate.mongodb.net"
    },
    provider_settings: {
      provider_name: "AWS",
      instance_size_name: "M10",
      region_name: "US_EAST_1"
    },
    cluster_type: "REPLICASET",
    disk_size_gb: 10,
    mongodb_version: "8.0"
  });
  ms.users.insert({
    user_id: generateUserId(),
    username: "admin",
    group_id: groupId,
    roles: [{ database_name: "admin", role_name: "atlasAdmin" }]
  });
  ms.databases.insert({ cluster_id: clusterId, name: "test" });
  ms.collections.insert({ cluster_id: clusterId, database: "test", name: "items" });
}
function seedFromConfig(store, _baseUrl, config) {
  const ms = getMongoAtlasStore(store);
  const projectIdMap = /* @__PURE__ */ new Map();
  if (config.projects) {
    for (const p of config.projects) {
      const existing = ms.projects.all().find((ep) => ep.name === p.name);
      if (existing) {
        projectIdMap.set(p.name, existing.group_id);
        continue;
      }
      const groupId = generateGroupId();
      ms.projects.insert({
        group_id: groupId,
        name: p.name,
        org_id: p.org_id ?? "default_org",
        cluster_count: 0
      });
      projectIdMap.set(p.name, groupId);
    }
  }
  const defaultProject = ms.projects.all()[0];
  if (defaultProject) {
    projectIdMap.set(defaultProject.name, defaultProject.group_id);
  }
  const clusterIdMap = /* @__PURE__ */ new Map();
  if (config.clusters) {
    for (const cl of config.clusters) {
      const groupId = projectIdMap.get(cl.project);
      if (!groupId) continue;
      const existing = ms.clusters.all().find((ec) => ec.group_id === groupId && ec.name === cl.name);
      if (existing) {
        clusterIdMap.set(cl.name, existing.cluster_id);
        continue;
      }
      const clusterId = generateClusterId();
      ms.clusters.insert({
        cluster_id: clusterId,
        name: cl.name,
        group_id: groupId,
        state: "IDLE",
        mongo_uri: `mongodb+srv://${cl.name}.emulate.mongodb.net`,
        connection_strings: {
          standard: `mongodb://${cl.name}.emulate.mongodb.net:27017`,
          standard_srv: `mongodb+srv://${cl.name}.emulate.mongodb.net`
        },
        provider_settings: {
          provider_name: cl.provider ?? "AWS",
          instance_size_name: cl.instance_size ?? "M10",
          region_name: cl.region ?? "US_EAST_1"
        },
        cluster_type: "REPLICASET",
        disk_size_gb: cl.disk_size_gb ?? 10,
        mongodb_version: cl.mongodb_version ?? "8.0"
      });
      clusterIdMap.set(cl.name, clusterId);
      const project = ms.projects.findOneBy("group_id", groupId);
      if (project) {
        ms.projects.update(project.id, { cluster_count: project.cluster_count + 1 });
      }
    }
  }
  const defaultCluster = ms.clusters.all()[0];
  if (defaultCluster) {
    clusterIdMap.set(defaultCluster.name, defaultCluster.cluster_id);
  }
  if (config.database_users) {
    for (const u of config.database_users) {
      const groupId = projectIdMap.get(u.project);
      if (!groupId) continue;
      const existing = ms.users.all().find((eu) => eu.group_id === groupId && eu.username === u.username);
      if (existing) continue;
      ms.users.insert({
        user_id: generateUserId(),
        username: u.username,
        group_id: groupId,
        roles: u.roles ?? [{ database_name: "admin", role_name: "readWriteAnyDatabase" }]
      });
    }
  }
  if (config.databases) {
    for (const db of config.databases) {
      const clusterId = clusterIdMap.get(db.cluster);
      if (!clusterId) continue;
      const existingDb = ms.databases.all().find((edb) => edb.cluster_id === clusterId && edb.name === db.name);
      if (!existingDb) {
        ms.databases.insert({ cluster_id: clusterId, name: db.name });
      }
      if (db.collections) {
        for (const colName of db.collections) {
          const existingCol = ms.collections.all().find((ec) => ec.cluster_id === clusterId && ec.database === db.name && ec.name === colName);
          if (!existingCol) {
            ms.collections.insert({ cluster_id: clusterId, database: db.name, name: colName });
          }
        }
      }
    }
  }
}
var mongoatlasPlugin = {
  name: "mongoatlas",
  register(app, store, webhooks, baseUrl, tokenMap) {
    const ctx = { app, store, webhooks, baseUrl, tokenMap };
    adminRoutes(ctx);
    dataApiRoutes(ctx);
  },
  seed(store, baseUrl) {
    seedDefaults(store, baseUrl);
  }
};
var index_default = mongoatlasPlugin;
export {
  index_default as default,
  getMongoAtlasStore,
  mongoatlasPlugin,
  seedFromConfig
};
//# sourceMappingURL=dist-NDJDEDCT.js.map