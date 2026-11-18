import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** JSON response that can serialise BigInt (MySQL BIGINT ids). */
export function json(data: unknown, status = 200) {
  return new NextResponse(
    JSON.stringify(data, (_k, v) => (typeof v === "bigint" ? v.toString() : v)),
    { status, headers: { "Content-Type": "application/json" } }
  );
}

/** Wraps a route handler with consistent error handling. */
export function handle<C = unknown>(fn: (req: Request, ctx: C) => Promise<Response>) {
  return async (req: Request, ctx: C) => {
    try {
      return await fn(req, ctx);
    } catch (e) {
      if (e instanceof ApiError) return json({ error: e.message }, e.status);
      if (e instanceof ZodError) {
        return json({ error: "Validation failed", details: e.flatten().fieldErrors }, 422);
      }
      console.error(e);
      return json({ error: "Internal server error" }, 500);
    }
  };
}

export function parseId(value: string): bigint {
  try {
    return BigInt(value);
  } catch {
    throw new ApiError(400, "Invalid id");
  }
}

export async function readJson(req: Request) {
  try {
    return await req.json();
  } catch {
    throw new ApiError(400, "Request body must be valid JSON");
  }
}
