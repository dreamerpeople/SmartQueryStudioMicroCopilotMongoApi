import { Request, Response } from "express";
import axios from "axios";
import { CopilotClient } from "../config/copilotClient";
import { SYSTEM_PROMPT, RESPONSE_HELPER_PROMPT } from "../config/prompts";
import { executeMongoQuery } from "../services/mongodbService";
import mongoose from "mongoose";
import { getDynamicSchemaContext } from "../services/schemaService";
import MailService from "../services/mailService";

const queryCache = {
  fixed: { data: null as any, timestamp: 0 },
  analytics: { data: null as any, timestamp: 0 },
};

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache
const MAIL_STRATEGY = process.env.MAIL_STRATEGY || "DESKTOP";

async function getWeather(city: string) {
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`;
  const geoRes = await axios.get(geoUrl);
  if (!geoRes.data.results || geoRes.data.results.length === 0) {
    throw new Error("City not found");
  }

  const { latitude, longitude, name } = geoRes.data.results[0];
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
  const weatherRes = await axios.get(weatherUrl);
  const cw = weatherRes.data.current_weather;

  return {
    city: name,
    temperature: cw.temperature,
    windspeed: cw.windspeed,
    winddirection: cw.winddirection,
    is_day: cw.is_day === 1,
    weathercode: cw.weathercode,
  };
}

async function getNews(query?: string, category?: string, location?: string) {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    throw new Error("NEWS_API_KEY is missing in configuration.");
  }

  let fullQuery = query || "";
  if (location) {
    fullQuery = fullQuery ? `${fullQuery} in ${location}` : location;
  }

  let url: string;
  if (fullQuery) {
    url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(fullQuery)}&sortBy=publishedAt&apiKey=${apiKey}`;
  } else {
    url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;
    if (category) url += `&category=${category}`;
  }

  const response = await axios.get(url);
  if (response.data.status !== "ok") {
    throw new Error(response.data.message || "Failed to fetch news.");
  }

  return response.data.articles.slice(0, 5).map((article: any) => ({
    title: article.title,
    source: article.source.name,
    description: article.description,
    url: article.url,
  }));
}

async function callResponseHelper(
  aiClient: CopilotClient,
  userQuery: string,
  systemResponse: any,
) {
  try {
    const helperResponse = await aiClient.createChatCompletion({
      messages: [
        { role: "system", content: RESPONSE_HELPER_PROMPT },
        {
          role: "user",
          content: `USER_QUERY: ${userQuery}\n\nSYSTEM_RESPONSE: ${JSON.stringify(systemResponse)}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    });

    const raw = helperResponse.choices?.[0]?.message?.content;
    return JSON.parse(raw);
  } catch (err: any) {
    console.error("[Response Helper Error]", err?.message || err);
    return systemResponse;
  }
}

export const handleQuery = async (req: Request, res: Response) => {
  const { prompt } = req.body as { prompt?: string };

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({
      type: "error",
      message: "Prompt is required and must be a non-empty string.",
    });
  }

  try {
    const aiClient = new CopilotClient();
    const dynamicSchema = await getDynamicSchemaContext();
    const finalSystemPrompt = SYSTEM_PROMPT.replace(
      "{{DYNAMIC_SCHEMA}}",
      dynamicSchema,
    );

    const response = await aiClient.createChatCompletion({
      messages: [
        { role: "system", content: finalSystemPrompt },
        { role: "user", content: prompt.trim() },
      ],
      temperature: 0.3,
      max_tokens: 1024,
      response_format: { type: "json_object" },
    });

    const raw = response.choices?.[0]?.message?.content;
    let systemResult: any;
    try {
      systemResult = JSON.parse(raw);
    } catch {
      systemResult = { type: "conversational", result: raw };
    }

    if (systemResult.type === "tool_request") {
      if (systemResult.tool === "weather") {
        const city = systemResult?.params?.city;
        if (city) {
          try {
            const weather = await getWeather(city);
            systemResult = { type: "weather", tool: "weather", data: weather };
          } catch (err) {
            systemResult = {
              type: "error",
              message: "Unable to fetch weather data.",
            };
          }
        }
      } else if (systemResult.tool === "mongodb") {
        const { collection, filter, projection, sort, limit, pipeline } =
          systemResult?.params || {};
        if (collection) {
          try {
            // If user requested table/chart/excel and no projection provided,
            // build projection to include all schema fields from registered Mongoose model
            let effectiveProjection = projection;
            const wantsAllColumns =
              /\b(table|chart|charting|graph|pie|bar|line|excel|export|download|csv|attach|attached)\b/i.test(
                (req.body.prompt || "") as string,
              );

            if (
              (!projection || Object.keys(projection).length === 0) &&
              wantsAllColumns
            ) {
              try {
                const mdl =
                  (mongoose.models as any)[collection] ||
                  (mongoose.modelNames().includes(collection)
                    ? mongoose.model(collection)
                    : undefined);
                if (mdl && mdl.schema && mdl.schema.paths) {
                  const paths = Object.keys(mdl.schema.paths).filter(
                    (p) => p !== "__v",
                  );
                  effectiveProjection = {} as any;
                  for (const p of paths) effectiveProjection[p] = 1;
                }
              } catch (err) {
                // fallback: leave projection undefined
              }
            }

            const dataResult = await executeMongoQuery({
              collection,
              filter,
              projection: effectiveProjection || projection,
              sort,
              limit,
              pipeline,
            });

            systemResult = {
              type: "data_result",
              tool: "mongodb",
              data: dataResult.rows,
              query: dataResult.query,
            };
          } catch (err) {
            systemResult = {
              type: "error",
              message: "Unable to query database.",
              query: JSON.stringify(systemResult.params),
            };
          }
        }
      } else if (systemResult.tool === "news") {
        const { query, category, location } = systemResult?.params || {};
        try {
          const news = await getNews(query, category, location);
          systemResult = { type: "news", tool: "news", data: news };
        } catch (err) {
          systemResult = {
            type: "error",
            message: "Unable to fetch news data.",
          };
        }
      } else {
        systemResult = {
          type: "error",
          message: `Unsupported tool: ${systemResult.tool}`,
        };
      }
    }

    const finalResponse = await callResponseHelper(
      aiClient,
      prompt,
      systemResult,
    );

    if (finalResponse.IsMail && finalResponse.recipientEmail) {
      finalResponse.mailStrategy = MAIL_STRATEGY;
      let attachmentPath: string | undefined;
      if (MAIL_STRATEGY === "DESKTOP") {
        try {
          attachmentPath = await MailService.createExcelAttachment(
            finalResponse.data || [],
            "query-report",
          );
        } catch (err: any) {
          console.error("[Mail Attachment Error]", err?.message || err);
        }
      }

      MailService.sendMail({
        to: finalResponse.recipientEmail,
        subject: `Report: ${prompt.slice(0, 50)}...`,
        template: "query-result",
        data: {
          query: prompt,
          data: finalResponse.data || [],
          customMessage: finalResponse.result || finalResponse.message || "",
        },
        attachmentPath,
      }).catch((err: any) =>
        console.error("[Controller Mail Background Error]", err.message),
      );
    }

    return res.json(finalResponse);
  } catch (err: any) {
    console.error("[Copilot Client Error]", err?.message || err);
    return res.status(500).json({
      type: "error",
      message: "The Copilot AI Agent encountered an unexpected error.",
    });
  }
};

export const handleTestAggregate = async (req: Request, res: Response) => {
  const { collection, pipeline } = req.body as {
    collection?: string;
    pipeline?: any[];
  };

  if (!collection || typeof collection !== "string") {
    return res.status(400).json({
      type: "error",
      message: "Collection name is required and must be a string.",
    });
  }

  if (!Array.isArray(pipeline)) {
    return res.status(400).json({
      type: "error",
      message: "Pipeline is required and must be an array.",
    });
  }

  try {
    const dataResult = await executeMongoQuery({
      collection,
      pipeline,
    });

    return res.json({
      type: "data_result",
      data: dataResult.rows,
      message: "Aggregate query executed successfully.",
      query: dataResult.query,
      IsShowChart: false,
      chartType: null,
      chart_data: null,
      IsReportGenerate: false,
      IsMail: false,
      IsAskMail: false,
      recipientEmail: null,
    });
  } catch (err: any) {
    console.error("[Test Aggregate Error]", err?.message || err);
    return res.status(500).json({
      type: "error",
      message: "Failed to execute aggregate query.",
      details: err?.message || String(err),
    });
  }
};

export const handleRawAggregateQuery = async (req: Request, res: Response) => {
  const rawBody = req.body;
  let queryString: string | undefined;

  if (typeof rawBody === "string") {
    const trimmed = rawBody.trim();
    if (trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed.query === "string")
          queryString = parsed.query;
      } catch (e) {
        // not a JSON wrapper, treat as raw string below
      }
    }

    if (!queryString) queryString = rawBody;
  } else if (rawBody && typeof rawBody.query === "string") {
    queryString = rawBody.query;
  }

  if (!queryString || typeof queryString !== "string") {
    return res.status(400).json({
      type: "error",
      message: "A raw MongoDB aggregate query string is required.",
    });
  }

  const normalized = queryString.trim();
  const match = normalized.match(
    /^db\.collection\(\s*['"]([^'"]+)['"]\s*\)\.aggregate\(\s*([\s\S]*)\s*\)\s*;?\s*$/i,
  );

  if (!match) {
    return res.status(400).json({
      type: "error",
      message:
        "Query must be in the form db.collection('collectionName').aggregate([...]).",
    });
  }

  const collection = match[1];
  const pipelineString = match[2];

  let pipeline: any;
  try {
    pipeline = JSON.parse(pipelineString);
    console.log(pipeline);
  } catch (err: any) {
    console.error("[Raw Aggregate Parse Error]", err?.message || err);
    return res.status(400).json({
      type: "error",
      message:
        "Unable to parse the aggregate pipeline. Ensure the pipeline is valid JSON.",
      details: err?.message || String(err),
    });
  }

  if (!Array.isArray(pipeline)) {
    return res.status(400).json({
      type: "error",
      message: "The aggregate pipeline must be a JSON array.",
    });
  }

  try {
    const dataResult = await executeMongoQuery({
      collection,
      pipeline,
    });

    return res.json({
      type: "data_result",
      data: dataResult.rows,
      message: "Raw aggregate query executed successfully.",
      query: dataResult.query,
      IsShowChart: false,
      chartType: null,
      chart_data: null,
      IsReportGenerate: false,
      IsMail: false,
      IsAskMail: false,
      recipientEmail: null,
    });
  } catch (err: any) {
    console.error("[Raw Aggregate Execution Error]", err?.message || err);
    return res.status(500).json({
      type: "error",
      message: "Failed to execute raw aggregate query.",
      details: err?.message || String(err),
    });
  }
};

export const handleFixedQuery = async (req: Request, res: Response) => {
  if (
    queryCache.fixed.data &&
    Date.now() - queryCache.fixed.timestamp < CACHE_TTL_MS
  ) {
    return res.json(queryCache.fixed.data);
  }

  const prompt = `Generate a comprehensive summary report including total revenue, Total Orders, Average Order value, Active customers, top products, recent orders, and sales by category.
You MUST format the result so that the 'data' field in your response matches this EXACT JSON structure:
{
    "totalRevenue": number,
    "totalOrders": number,
    "averageOrderValue": number,
    "activeCustomers": number,
    "recentOrders": [{ "orderId": string, "totalAmount": number, "orderDate": string, "customerName": string }],
    "salesByCategory": [{ "category": string, "totalSales": number }],
    "topProducts": [{ "product": string, "quantitySold": number, "revenue": number }]
}
DO NOT ask for clarification or more information. Make reasonable assumptions to calculate these metrics based on available schema. If you cannot calculate them perfectly, synthesize realistic proxy data based on the current context so that the structure is always strictly followed.`;

  try {
    const aiClient = new CopilotClient();
    const dynamicSchema = await getDynamicSchemaContext();
    const finalSystemPrompt = SYSTEM_PROMPT.replace(
      "{{DYNAMIC_SCHEMA}}",
      dynamicSchema,
    );

    const response = await aiClient.createChatCompletion({
      messages: [
        { role: "system", content: finalSystemPrompt },
        { role: "user", content: prompt.trim() },
      ],
      temperature: 0.3,
      max_tokens: 1024,
      response_format: { type: "json_object" },
    });

    const raw = response.choices?.[0]?.message?.content;
    let systemResult: any;
    try {
      systemResult = JSON.parse(raw);
    } catch {
      systemResult = { type: "conversational", result: raw };
    }

    if (systemResult.type === "tool_request") {
      if (systemResult.tool === "mongodb") {
        const { collection, filter, projection, sort, limit, pipeline } =
          systemResult?.params || {};
        if (collection) {
          try {
            let effectiveProjection = projection;
            const wantsAllColumns =
              /\b(table|chart|charting|graph|pie|bar|line|excel|export|download|csv|attach|attached)\b/i.test(
                (prompt || "") as string,
              );

            if (
              (!projection || Object.keys(projection).length === 0) &&
              wantsAllColumns
            ) {
              try {
                const mdl =
                  (mongoose.models as any)[collection] ||
                  (mongoose.modelNames().includes(collection)
                    ? mongoose.model(collection)
                    : undefined);
                if (mdl && mdl.schema && mdl.schema.paths) {
                  const paths = Object.keys(mdl.schema.paths).filter(
                    (p) => p !== "__v",
                  );
                  effectiveProjection = {} as any;
                  for (const p of paths) effectiveProjection[p] = 1;
                }
              } catch (err) {
                // ignore and fallback
              }
            }

            const dataResult = await executeMongoQuery({
              collection,
              filter,
              projection: effectiveProjection || projection,
              sort,
              limit,
              pipeline,
            });
            systemResult = {
              type: "data_result",
              tool: "mongodb",
              data: dataResult.rows,
              query: dataResult.query,
            };
          } catch (err) {
            systemResult = {
              type: "error",
              message: "Unable to query database.",
              query: JSON.stringify(systemResult.params),
            };
          }
        }
      } else {
        systemResult = {
          type: "error",
          message: `Unsupported tool for dashboard summary: ${systemResult.tool}`,
        };
      }
    }

    const finalResponse = await callResponseHelper(
      aiClient,
      prompt,
      systemResult,
    );

    if (finalResponse.IsMail && finalResponse.recipientEmail) {
      finalResponse.mailStrategy = MAIL_STRATEGY;
      let attachmentPath: string | undefined;
      if (MAIL_STRATEGY === "DESKTOP") {
        try {
          attachmentPath = await MailService.createExcelAttachment(
            finalResponse.data || [],
            "dashboard-report",
          );
        } catch (err: any) {
          console.error("[Mail Attachment Error]", err?.message || err);
        }
      }

      MailService.sendMail({
        to: finalResponse.recipientEmail,
        subject: `Report: Dashboard Summary...`,
        template: "query-result",
        data: {
          query: prompt,
          data: finalResponse.data || [],
          customMessage: finalResponse.result || finalResponse.message || "",
        },
        attachmentPath,
      }).catch((err: any) =>
        console.error("[Controller Mail Background Error]", err.message),
      );
    }

    queryCache.fixed.data = finalResponse;
    queryCache.fixed.timestamp = Date.now();

    return res.json(finalResponse);
  } catch (err: any) {
    console.error("[Copilot Client Error]", err?.message || err);
    return res.status(500).json({
      type: "error",
      message: "The Copilot AI Agent encountered an unexpected error.",
    });
  }
};

export const handleAnalyticsQuery = async (req: Request, res: Response) => {
  if (
    queryCache.analytics.data &&
    Date.now() - queryCache.analytics.timestamp < CACHE_TTL_MS
  ) {
    return res.json(queryCache.analytics.data);
  }

  const prompt = `Generate an advanced analytics report including 7-day sales forecast predictions (actual vs forecasted), conversion rate, retention rate, churn rate, top 3 growth opportunities, and top 3 risk assessments.
IMPORTANT: You MUST ensure the final output strictly follows this structure (do NOT ask for clarification):
- A 'data' array containing raw database aggregation results (e.g., recent orders or customer data).
- 'IsShowChart' must be true.
- 'chartType' must be 'stacked_bar_vertical' or 'line'.
- 'chart_data' MUST contain labels (dates) and datasets (e.g., "Actual Sales" and "Forecasted Sales").
Make reasonable assumptions to calculate metrics based on available schema. If you cannot calculate them perfectly, synthesize realistic proxy data based on general e-commerce trends so that the structure is always strictly followed. NEVER return needsInfo true.`;

  try {
    const aiClient = new CopilotClient();
    const dynamicSchema = await getDynamicSchemaContext();
    const finalSystemPrompt = SYSTEM_PROMPT.replace(
      "{{DYNAMIC_SCHEMA}}",
      dynamicSchema,
    );

    const response = await aiClient.createChatCompletion({
      messages: [
        { role: "system", content: finalSystemPrompt },
        { role: "user", content: prompt.trim() },
      ],
      temperature: 0.3,
      max_tokens: 1024,
      response_format: { type: "json_object" },
    });

    const raw = response.choices?.[0]?.message?.content;
    let systemResult: any;
    try {
      systemResult = JSON.parse(raw);
    } catch {
      systemResult = { type: "conversational", result: raw };
    }

    if (systemResult.type === "tool_request") {
      if (systemResult.tool === "mongodb") {
        const { collection, filter, projection, sort, limit, pipeline } =
          systemResult?.params || {};
        if (collection) {
          try {
            let effectiveProjection = projection;
            const wantsAllColumns =
              /\b(table|chart|charting|graph|pie|bar|line|excel|export|download|csv|attach|attached)\b/i.test(
                (prompt || "") as string,
              );

            if (
              (!projection || Object.keys(projection).length === 0) &&
              wantsAllColumns
            ) {
              try {
                const mdl =
                  (mongoose.models as any)[collection] ||
                  (mongoose.modelNames().includes(collection)
                    ? mongoose.model(collection)
                    : undefined);
                if (mdl && mdl.schema && mdl.schema.paths) {
                  const paths = Object.keys(mdl.schema.paths).filter(
                    (p) => p !== "__v",
                  );
                  effectiveProjection = {} as any;
                  for (const p of paths) effectiveProjection[p] = 1;
                }
              } catch (err) {
                // ignore and fallback
              }
            }

            const dataResult = await executeMongoQuery({
              collection,
              filter,
              projection: effectiveProjection || projection,
              sort,
              limit,
              pipeline,
            });
            systemResult = {
              type: "data_result",
              tool: "mongodb",
              data: dataResult.rows,
              query: dataResult.query,
            };
          } catch (err) {
            systemResult = {
              type: "error",
              message: "Unable to query database.",
              query: JSON.stringify(systemResult.params),
            };
          }
        }
      } else {
        systemResult = {
          type: "error",
          message: `Unsupported tool for analytics summary: ${systemResult.tool}`,
        };
      }
    }

    const finalResponse = await callResponseHelper(
      aiClient,
      prompt,
      systemResult,
    );

    if (finalResponse.IsMail && finalResponse.recipientEmail) {
      finalResponse.mailStrategy = MAIL_STRATEGY;
      let attachmentPath: string | undefined;
      if (MAIL_STRATEGY === "DESKTOP") {
        try {
          attachmentPath = await MailService.createExcelAttachment(
            finalResponse.data || [],
            "analytics-report",
          );
        } catch (err: any) {
          console.error("[Mail Attachment Error]", err?.message || err);
        }
      }

      MailService.sendMail({
        to: finalResponse.recipientEmail,
        subject: `Report: Analytics Summary...`,
        template: "query-result",
        data: {
          query: prompt,
          data: finalResponse.data || [],
          customMessage: finalResponse.result || finalResponse.message || "",
        },
        attachmentPath,
      }).catch((err: any) =>
        console.error("[Controller Mail Background Error]", err.message),
      );
    }

    queryCache.analytics.data = finalResponse;
    queryCache.analytics.timestamp = Date.now();

    return res.json(finalResponse);
  } catch (err: any) {
    console.error("[Copilot Client Error]", err?.message || err);
    return res.status(500).json({
      type: "error",
      message: "The Copilot AI Agent encountered an unexpected error.",
    });
  }
};
