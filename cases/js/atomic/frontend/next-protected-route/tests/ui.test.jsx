/** @vitest-environment node */

import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";

import { middleware } from "../middleware";

describe("Protected Route Middleware", () => {
  it("redirects unauthenticated users to login", () => {
    const request = new NextRequest("http://localhost:3000/");

    const response = middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login",
    );
  });

  it("allows authenticated users to access the protected route", () => {
    const request = new NextRequest("http://localhost:3000/", {
      headers: {
        cookie: "auth=1",
      },
    });

    const response = middleware(request);

    expect(response.headers.get("location")).toBeNull();
  });
});
