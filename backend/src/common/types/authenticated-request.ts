import type { Request } from "express";
import type { Role } from "../constants/roles.js";

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: Role;
  sessionId: string;
};

export type RequestContext = {
  requestId: string;
  ipAddress?: string;
  userAgent?: string;
};

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
  context?: RequestContext;
  cookies?: Record<string, string>;
};
