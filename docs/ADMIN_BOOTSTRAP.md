# Admin Bootstrap — First Reviewer / Admin Account

The admin UI at `/admin` is gated by **two** checks:

1. **Authenticated Supabase session** (email + password).
2. **Role membership** in `public.user_roles` — must be `reviewer` or `admin`.

Out of the box, no user has any role. You must grant the first one manually
via the Supabase SQL editor — that's the bootstrap step. After that, an
`admin` user can grant `reviewer` to other users from within the app (UI
TBD; for now, also via SQL).

---

## Step 1 — Create your account

1. Open the app and visit **`/admin/login`**.
2. Switch to the **Registrácia** tab.
3. Enter your email + a password (min. 6 characters) and submit.
4. Confirm the email if confirmation is enabled in Supabase Auth settings.
   - For faster local dev: Supabase Dashboard → **Authentication → Providers
     → Email → "Confirm email"** = OFF.
5. Sign in. You'll see the "Prístup zamietnutý" screen — expected, you have
   no role yet.

## Step 2 — Find your user UUID

Supabase Dashboard → **Authentication → Users** → click your row → copy
the `id` (UUID like `8d6f…`).

Or via SQL:

```sql
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;
```

## Step 3 — Grant yourself the admin role

Supabase Dashboard → **SQL Editor** → run:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('<YOUR-UUID-HERE>', 'admin');
```

Refresh `/admin` — you're in.

## Step 4 — Grant other reviewers (later)

Once you have an `admin` account, grant `reviewer` to teammates the same
way:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('<TEAMMATE-UUID>', 'reviewer');
```

## Roles cheat sheet

| Role | Can | Cannot |
|---|---|---|
| `admin` | Everything reviewers can + manage `user_roles` + edit `scoring_config` | — |
| `reviewer` | Read all candidates (any state), insert/update candidates, scores, evidence, audit log | Manage roles, edit scoring config |
| `user` / no role | Public read only (published + approved data) | Anything in `/admin` |

## Removing a role

```sql
DELETE FROM public.user_roles
WHERE user_id = '<UUID>' AND role = 'reviewer';
```

The user keeps their auth account but loses admin UI access on next page
load.
