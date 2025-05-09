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

type TicketProtocolResponse = {
  data?: {
    protocol?: string;
  };
};

type PaymentResponse = {
  data?: {
    document_id?: string;
    code_bar?: string;
    code_pix?: string;
    product?: string;
    pay_date?: string;
    value_invoice?: string;
    phone?: string;
  };
};

/**
 * 
 * @param url 
 * @param method 
 * @param body 
 * @returns 
 */
async function makeRequest<T>(
  url: string,
  method: string,
  body?: any
): Promise<T | null> {
  const headers = {
    "User-Agent": USER_AGENT || "Archi track MCP Server",
    Accept: "application/json",
    Authorization: `Bearer ${TOKEN}` || "",
    "Content-Type": "application/json",
  };

  const options: RequestInit = {
    method: method,
    headers: headers,
  };

  if (body && ["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error(
      `Received parameters: URL: ${API_BASE} -  AGENT: ${USER_AGENT} - TOKEN: ${TOKEN}`
    );
    console.error("Error making request:", error);
    return null;
  }
}

server.tool(
  "solicita-codigo-pix",
  "Solicitar o codigo do PIX para pagamento da fatura. Informações que o usuário deve enviar: CPF ou CNPJ e Numero do telefone",
  {
    document_id: z.string().trim(),
    phone: z.string().trim()
  },
  async ({ document_id, phone }) => {
    const paymentUrl = `${API_BASE}/api/payment:get?filter=%7B%22document_id%22%3A%22${document_id}%22%2C%20%22phone%22%3A%22${phone}%22%7D`;
    const paymentData = await makeRequest<PaymentResponse>(
      paymentUrl,
      "GET"
    );

    if (!document_id || !phone) {
      return {
        content: [
          {
            type: "text",
            text: "Precisamos do CPF ou CNPJ e o telefone para gerar o código do PIX.",
          },
        ],
      };
    }

    if (!paymentData) {
      return {
        content: [
          {
            type: "text",
            text: "Não conseguimos encontrar o pagamento com os dados informados.",
          },
        ],
      };
    }

    const paymentText = `Os dados do pagamento são: Código de barras: ${paymentData.data?.code_bar} - Código do PIX: ${paymentData.data?.code_pix} - Produto: ${paymentData.data?.product} - Data de vencimento: ${paymentData.data?.pay_date} - Valor da fatura: ${paymentData.data?.value_invoice} - Telefone: ${paymentData.data?.phone}`;

    return {
      content: [
        {
          type: "text",
          text: paymentText,
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
  console.error("Fatal error in main():", error);
  process.exit(1);
});
