# Security Policy

## Scope

FakeSite Hunter is a research and educational project. The following apply:

- The `/api/scan` endpoint processes arbitrary URLs submitted by users. URLs are passed to headless Chrome and ML models but are not executed on the host system.
- Scan records (URL + verdict) are stored in a local SQLite database.
- There are no user accounts or authentication systems.

## Reporting a Vulnerability

Please do **not** open a public GitHub issue for security vulnerabilities.

Send a private report to: **fakesitehunter@gmail.com**

Include:
- Description of the issue
- Steps to reproduce
- Potential impact
- Suggested fix if you have one

We will respond within 7 days.

## Known Limitations

- The system is designed as a detection aid, not a guarantee. It can produce false positives and false negatives — do not rely on it as the sole security control.
- The `/api/scan` endpoint has no rate limiting in the default configuration. In production, rate limiting should be applied at the reverse proxy level (e.g., Nginx).
- Selenium loads the target URL in a real browser. Use a sandboxed or isolated environment for production deployments scanning untrusted URLs.
