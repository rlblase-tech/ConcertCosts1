/**
 * Session refresh used to run in Edge middleware and crashed on Vercel
 * (MIDDLEWARE_INVOCATION_FAILED). Auth is enforced in each page instead.
 * Cookie refresh happens when server components / actions call createClient().
 */
export {};
