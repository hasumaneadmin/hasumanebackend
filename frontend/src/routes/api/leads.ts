import { createFileRoute } from "@tanstack/react-router";

import { leadSubmissionSchema } from "@/lib/leads";
import { saveLeadSubmission } from "@/lib/leads.server";

function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...init?.headers,
    },
  });
}

async function readPayload(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return request.json();
  }

  const formData = await request.formData();
  return Object.fromEntries(formData);
}

export const Route = createFileRoute("/api/leads")({
  server: {
    handlers: {
      GET: async () =>
        json({
          ok: true,
          service: "hasumane-leads",
        }),
      POST: async ({ request }) => {
        try {
          const payload = await readPayload(request);
          const parsed = leadSubmissionSchema.safeParse(payload);

          if (!parsed.success) {
            return json(
              {
                success: false,
                message: "Please check the form and try again.",
                errors: parsed.error.flatten().fieldErrors,
              },
              { status: 400 },
            );
          }

          const lead = await saveLeadSubmission(parsed.data, request);

          return json(
            {
              success: true,
              message: "Thanks. We received your request and will contact you shortly.",
              lead,
            },
            { status: 201 },
          );
        } catch (error) {
          console.error(error);

          return json(
            {
              success: false,
              message: "We could not submit your request right now. Please try again.",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
