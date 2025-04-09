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
async function makeRequest(url, method, body) {
    const headers = {
        "User-Agent": USER_AGENT || "Archi track MCP Server",
        "Accept": "application/json",
        "Authorization": `Bearer ${TOKEN}` || "",
        "Content-Type": "application/json"
    };
    const options = {
        method: method,
        headers: headers,
    };
    // Add body for POST, PUT, PATCH requests
    if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        options.body = JSON.stringify(body);
    }
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return (await response.json());
    }
    catch (error) {
        console.error(`Received parameters: URL: ${API_BASE} -  AGENT: ${USER_AGENT} - TOKEN: ${TOKEN}`);
        console.error("Error making request:", error);
        return null;
    }
}
server.tool("get-info-application", "Get information about application.", {
    application: z.string().trim(),
}, async ({ application }) => {
    const applicationUrl = `${API_BASE}/api/application:get?filter=%7B%22name%22%3A%20%22${application}%22%7D`;
    const applicationData = await makeRequest(applicationUrl, 'GET');
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
});
server.tool("post-new-ticket", "Post new ticket in application.", {
    title: z.string().trim(),
    description: z.string().trim(),
}, async ({ title, description }) => {
    const body = {
        "title": title,
        "description": description,
        "status": "Aberto",
        "priority": "Normal"
    };
    const ticketUrl = `${API_BASE}/api/ticket:create`;
    const ticketData = await makeRequest(ticketUrl, 'POST');
    if (!ticketData) {
        return {
            content: [
                {
                    type: "text",
                    text: "Failed to open the ticket",
                },
            ],
        };
    }
    const responseText = `O ticket foi aberto com sucesso. Segue o numero XXX`;
    return {
        content: [
            {
                type: "text",
                text: responseText,
            },
        ],
    };
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Archi track MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
