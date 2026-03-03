# API Auditor Agent

Audits API routes under `app/api/` for error handling, cache headers, rate limiting, and security.

## When to Use

Run this agent when adding or modifying API routes, before security reviews, or as part of pre-deployment checks.

## Tasks

1. **Error handling**: Every API route must:
   - Wrap database calls in try/catch
   - Return appropriate HTTP status codes (400 for bad input, 404 for not found, 500 for server errors)
   - Never leak internal error details (stack traces, SQL errors) in responses
   - Return consistent JSON error format: `{ error: "message" }`

2. **Cache headers**: Check that API responses set appropriate cache headers:
   - Static/slow-changing data: `Cache-Control: public, s-maxage=N, stale-while-revalidate=M`
   - Dynamic/user-specific data: `Cache-Control: private, no-cache`
   - Cron endpoints: No caching needed
   - Report any routes missing cache headers entirely

3. **Rate limiting**: Verify that:
   - Cron routes check for the `Authorization: Bearer <CRON_SECRET>` header
   - StatBank API calls respect the 1 req/s rate limit (look for delays/throttling in sync code)
   - Public API routes are not vulnerable to abuse (check for pagination limits, query constraints)

4. **Security review**:
   - API routes must use `lib/supabase-server.js` (server client), never the browser client
   - No secrets or API keys hardcoded in route files (should come from `process.env`)
   - Input parameters must be validated/sanitized before use in queries
   - Check for SQL injection risks in any raw query usage
   - CORS headers should not be overly permissive

5. **Route inventory**: List all API routes with their HTTP methods, authentication requirements, and caching strategy.

## Output

Produce a route-by-route audit:

| Route | Error Handling | Cache Headers | Auth/Rate Limit | Security | Status |
|-------|---------------|---------------|-----------------|----------|--------|
| /api/... | PASS/FAIL | PASS/WARN/FAIL | PASS/FAIL | PASS/WARN/FAIL | Overall |

Flag critical issues (security vulnerabilities, missing auth) separately at the top.

## Tools

Use Glob to find API route files (`app/api/**/route.js`), Read to inspect them, and Grep to search for patterns like `process.env`, `supabase`, `Cache-Control`, and `Authorization`.
