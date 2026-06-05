import mongoose from "mongoose";

interface ExecuteMongoQueryParams {
  collection: string;
  filter?: any;
  projection?: any;
  sort?: any;
  limit?: number;
  pipeline?: any[];
}

interface MongoQueryResult {
  rows: any[];
  query: string;
}

export async function executeMongoQuery({
  collection,
  filter,
  projection,
  sort,
  limit,
  pipeline,
}: ExecuteMongoQueryParams): Promise<MongoQueryResult> {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection not established.");
    }

    let results: any[] = [];
    let queryDesc = "";

    // Prefer using a registered Mongoose model when available for faster queries
    const model =
      (mongoose.models && (mongoose.models as any)[collection]) ||
      (mongoose.modelNames().includes(collection)
        ? mongoose.model(collection)
        : undefined);

    if (pipeline) {
      if (model && typeof model.aggregate === "function") {
        results = await model.aggregate(pipeline).exec();
        queryDesc = `${collection}.aggregate(${JSON.stringify(pipeline)}) via Mongoose model`;
      } else {
        const coll = db.collection(collection);
        results = await coll.aggregate(pipeline).toArray();
        queryDesc = `db.collection('${collection}').aggregate(${JSON.stringify(pipeline)})`;
      }
    } else {
      if (model && typeof model.find === "function") {
        const q = model.find(filter || {}, projection || undefined);
        if (sort) q.sort(sort);
        if (limit) q.limit(limit);
        // use lean() to return plain objects and improve performance
        results = await q.lean().exec();
        queryDesc = `${collection}.find(${JSON.stringify(filter || {})}) via Mongoose model`;
      } else {
        const coll = db.collection(collection);
        let cursor = coll.find(filter || {});
        if (projection) cursor = cursor.project(projection);
        if (sort) cursor = cursor.sort(sort);
        if (limit) cursor = cursor.limit(limit);
        results = await cursor.toArray();
        queryDesc = `db.collection('${collection}').find(${JSON.stringify(filter || {})})`;
      }
    }

    return {
      rows: results,
      query: queryDesc,
    };
  } catch (error: any) {
    console.error("[MongoDB Service Error]", error.message);
    throw error;
  }
}
