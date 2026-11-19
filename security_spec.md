# Firestore Security Specification — Toro Studio

## 1. Data Invariants
1. **Unlisted Game Policies (`/gamePolicies/{slug}`)**: Public visitors may fetch a single policy by exact `slug` (`get`), but CANNOT list or enumerate the collection (`list` is strictly `isAdmin()`). Only verified admins may create, update, or delete policies.
2. **Site Content (`/siteContent/{sectionId}`)**: Publicly readable (`get`, `list`), strictly writable only by verified admins (`isAdmin()`), restricted to valid `sectionId` enum keys.
3. **Contact Messages (`/contactMessages/{messageId}`)**: Publicly creatable ONLY with valid schema, `status == 'unread'`, and `createdAt == request.time`. Public users can NEVER read, list, update, or delete contact messages (prevents PII leakage of visitor names/emails). Only verified admins may read, update (`status`), or delete messages.
4. **Admin Registry (`/admins/{uid}`)**: Users may read only their own document; client writes are completely blocked (`allow write: if false`).

## 2. Adversarial Payloads Blocked
- Unauthenticated `list` on `/gamePolicies` -> `PERMISSION_DENIED`
- Unauthenticated `get` or `list` on `/contactMessages` -> `PERMISSION_DENIED`
- Public `create` on `/contactMessages` with `status: 'archived'` or forged `createdAt` or `isAdmin: true` shadow field -> `PERMISSION_DENIED`
- Unverified email claiming admin email (`email_verified == false`) -> `PERMISSION_DENIED`
- Oversized string (>3000 chars message, >128 char ID, >20 items array) -> `PERMISSION_DENIED`
- Non-admin write on `/siteContent` or `/admins/{uid}` -> `PERMISSION_DENIED`
