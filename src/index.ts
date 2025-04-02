import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const API_BASE = process.env.API_BASE;
const USER_AGENT = process.env.USER_AGENT;
const TOKEN = process.env.TOKEN;

const server = new McpServer({
  name: process.env.SERVER_NAME || "Archi track MCP Server",
  version: process.env.SERVER_VERSION || "1.0.0",
});

type ApplicationResponse = {
  data?: {
    description_full?: string;
  };
};

async function makeRequest<T>(url: string): Promise<T | null> {
  const headers = {
    "User-Agent": USER_AGENT || "Archi track MCP Server",
    Accept: "application/json",
    Authorization: TOKEN  || "",
  };

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error making request:", error);
    return null;
  }
}

server.tool(
  "get-info-application",
  "Get information about application.",
  {
    application: z.string().trim(),
  },
  async ({ application }) => {

    const applicationUrl = `${API_BASE}/api/application:get?filter=%7B%22name%22%3A%20%22${application}%22%7D`;
    const applicationData = await makeRequest<ApplicationResponse>(
      applicationUrl
    );

    if (!applicationData) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve application data",
          },
        ],
      };
    }

    const applicationText = `A aplicação ${application} é ${applicationData.data?.description_full}.`;

    return {
      content: [
        {
          type: "text",
          text: applicationText,
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Archi track MCP Server running on stdio");
}

main().catch((error) => {
  console.log(`Received parameters: URL: ${API_BASE} -  AGENT: ${USER_AGENT} - TOKEN: ${TOKEN}`);
  console.error("Fatal error in main():", error);
  process.exit(1);
});
