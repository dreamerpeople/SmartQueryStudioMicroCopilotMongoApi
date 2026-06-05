import { AzureOpenAI, OpenAI } from "openai";

type ChatMessage = {
  role: string;
  content: string;
};

type ChatCompletionOptions = {
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  response_format?: any;
};

class CopilotClient {
  private apiKey?: string;
  private endpoint?: string;
  private deploymentName: string;
  private apiVersion: string;
  private client: any;

  constructor() {
    this.apiKey =
      process.env.COPILOT_API_KEY || process.env.AZURE_OPENAI_API_KEY;
    this.endpoint =
      process.env.COPILOT_ENDPOINT || process.env.AZURE_OPENAI_ENDPOINT;
    this.deploymentName =
      process.env.COPILOT_MODEL ||
      process.env.AZURE_OPENAI_DEPLOYMENT ||
      "gpt-4o";
    this.apiVersion =
      process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview";

    if (!this.apiKey) {
      console.warn(
        "[CopilotClient] Warning: COPILOT_API_KEY or AZURE_OPENAI_API_KEY is not set in .env",
      );
    }

    if (this.endpoint) {
      this.client = new AzureOpenAI({
        apiKey: this.apiKey,
        endpoint: this.endpoint,
        apiVersion: this.apiVersion,
        deployment: this.deploymentName,
      });
    } else {
      this.client = new OpenAI({
        apiKey: this.apiKey,
      });
    }
  }

  async createChatCompletion({
    messages,
    temperature = 0.3,
    max_tokens = 4096,
    response_format = null,
  }: ChatCompletionOptions): Promise<any> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.deploymentName,
        messages,
        temperature,
        max_tokens,
        response_format,
      });

      return response;
    } catch (error: any) {
      console.error("[Copilot API Error]:", error.message);
      throw error;
    }
  }
}

export { CopilotClient };
