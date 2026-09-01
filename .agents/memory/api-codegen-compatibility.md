---
name: API codegen compatibility
description: OpenAPI-to-Zod generation must match the workspace's installed Zod runtime.
---

The installed Zod runtime is version 3-compatible, while the generator can emit newer top-level helpers for some OpenAPI formats. Keep generated schemas compatible with the runtime, or update the generator/runtime together.

**Why:** A valid OpenAPI spec can still make the shared library typecheck fail when Orval emits helpers unavailable in the installed Zod package.

**How to apply:** After changing the API contract, run codegen and the shared library typecheck before implementing server consumers.