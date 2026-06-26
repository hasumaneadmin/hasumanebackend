import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { LeadSubmission } from "./leads";

function maskPhone(value: string) {
  return value.replace(/\d(?=\d{4})/g, "*");
}

function createLocalLeadRecord(data: LeadSubmission, request: Request) {
  return {
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
    ...data,
    userAgent: request.headers.get("user-agent"),
    referrer: request.headers.get("referer"),
    backendForwarded: false,
  };
}

async function saveLeadLocally(record: ReturnType<typeof createLocalLeadRecord>) {
  const dataDir = path.resolve(process.cwd(), ".data");
  const filePath = path.join(dataDir, "public-leads.ndjson");

  await mkdir(dataDir, { recursive: true });
  await appendFile(filePath, `${JSON.stringify(record)}\n`, "utf8");

  return record;
}

export async function saveLeadSubmission(data: LeadSubmission, request: Request) {
  const logPayload = {
    name: data.name,
    phone: maskPhone(data.phone),
    area: data.area,
  };

  console.info("New HasuMane lead submission", logPayload);

  const backendUrl = (process.env.BACKEND_API_URL || "http://localhost:5000").replace(/\/$/, "");
  try {
    const response = await fetch(`${backendUrl}/api/v1/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.name,
        phone: data.phone,
        area: data.area,
        product: data.product,
        requestType: data.requestType,
        quantity: data.quantity,
        plan: data.plan,
        notes: data.notes,
        source: data.source || `website-${data.requestType}`,
        userAgent: request.headers.get("user-agent"),
        referrer: request.headers.get("referer"),
      }),
    });

    if (!response.ok) {
      const message = await response.text().catch(() => "");
      throw new Error(message || `Backend returned status ${response.status}.`);
    }

    const result = (await response.json().catch(() => null)) as {
      id?: string;
      submittedAt?: string;
      data?: { id?: string; submittedAt?: string };
    } | null;

    const lead = result?.data ?? result ?? {};

    return {
      id: lead.id ?? "",
      submittedAt: lead.submittedAt ?? new Date().toISOString(),
      backendForwarded: true,
    };
  } catch (error) {
    console.warn("Backend unavailable, storing lead locally:", error);
    const localLead = await saveLeadLocally(createLocalLeadRecord(data, request));

    return localLead;
  }
}
