import { z } from "zod";

const NWS_API_BASE = "http://archi-track.lmlabs.com.br";
const USER_AGENT = "archi-track-app/1.0";
const TOKEN =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGVOYW1lIjoibWVtYmVyIiwiaWF0IjoxNzQyNTE5NDM1LCJleHAiOjE3NDUxMTE0MzV9.8EI70DvVAV3EVjslx2UQENGEtfDbs6_ezbCI6cCNpqc";

type ApplicationResponse = {
    data: {
      description_full: string;
    };
};

async function makeRequest<T>(url: string): Promise<T | null> {
  const headers = {
    "User-Agent": USER_AGENT,
    Accept: "application/json",
    Authorization: TOKEN,
  };

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json() as T;
  } catch (error) {
    console.error("Error making request:", error);
    return null;
  }
}

async function test(application: string) {

  async (application: string) => {
    
    const applicationUrl = `${NWS_API_BASE}/api/application:get?filter=%7B%22name%22%3A%20%22${application}%22%7D`;
    console.log(applicationUrl);

    const applicationData = await makeRequest<ApplicationResponse>(
      applicationUrl
    );
    console.log(applicationData);

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
      
    const applicationText = `A aplicação ${application} é ${applicationData?.data?.description_full}.`;
    console.log(applicationText); 
    
    return {
      content: [
        {
          type: "text",
          text: applicationText,
        },
      ],
    };
    
  }

}

test("Gcob");
