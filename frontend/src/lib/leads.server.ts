import type { LeadSubmission } from "./leads";

type LeadRecord = LeadSubmission & {
  id: string;
  submittedAt: string;
  userAgent: string | null;
};

const MAX_RUNTIME_LEADS = 100;
const runtimeLeads: LeadRecord[] = [];

function createLeadId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `lead_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export async function saveLeadSubmission(data: LeadSubmission, request: Request) {
  const record: LeadRecord = {
    ...data,
    id: createLeadId(),
    submittedAt: new Date().toISOString(),
    userAgent: request.headers.get("user-agent"),
  };

  runtimeLeads.unshift(record);
  runtimeLeads.splice(MAX_RUNTIME_LEADS);

  console.info("New HasuMane lead submission", {
    id: record.id,
    name: record.name,
    phone: record.phone,
    area: record.area,
    submittedAt: record.submittedAt,
  });

  return {
    id: record.id,
    submittedAt: record.submittedAt,
  };
}
