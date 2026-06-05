import mongoose from "mongoose";

let cachedSchema: string | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function getDynamicSchemaContext(): Promise<string> {
  const now = Date.now();
  if (cachedSchema && now - lastFetchTime < CACHE_TTL) {
    return cachedSchema;
  }

  try {
    const db = mongoose.connection.db;
    if (!db) return "• Error: Database connection not ready.";

    const collections = await db.listCollections().toArray();
    const schemaParts: string[] = [];

    for (const colInfo of collections) {
      const collectionName = colInfo.name;
      if (collectionName === "system.indexes") continue;

      const sampleDoc = await db.collection(collectionName).findOne({});
      const fields = sampleDoc
        ? Object.keys(sampleDoc).filter((k) => k !== "__v")
        : ["(empty)"];

      schemaParts.push(`• ${collectionName} (${fields.join(", ")})`);
    }

    cachedSchema =
      schemaParts.length > 0
        ? schemaParts.join("\n")
        : "• No collections found in the database.";
    lastFetchTime = now;
    console.log("[SchemaService] Successfully refreshed MongoDB schema cache.");

    return cachedSchema;
  } catch (err: any) {
    console.error(
      "[SchemaService] Failed to load dynamic schema:",
      err.message,
    );
    if (cachedSchema) {
      console.log(
        "[SchemaService] Warning: Using stale schema due to fetch error.",
      );
      return cachedSchema;
    }
    return "• Error fetching collections. Please use general naming conventions.";
  }
}
