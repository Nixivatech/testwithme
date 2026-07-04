-- TestWithMe — PostgreSQL schema (Supabase)
-- Run this against the Supabase Postgres database. EF Core migrations (backend/TestWithMe.Api/Migrations)
-- are the source of truth going forward; this file documents the MVP schema for reference / manual setup.

create extension if not exists pgcrypto; -- gen_random_uuid()

-- ============================================================
-- users
-- ============================================================
create table users (
    id              uuid primary key default gen_random_uuid(),
    google_id       text not null unique,
    email           text not null unique,
    name            text not null,
    avatar_url      text,
    role            text not null default 'Student' check (role in ('Student', 'Admin')),
    is_pro_member   boolean not null default false,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

-- ============================================================
-- modules  (e.g. "Selenium", "API Testing")
-- ============================================================
create table modules (
    id              uuid primary key default gen_random_uuid(),
    slug            text not null unique,
    title           text not null,
    description     text,
    order_index     integer not null default 0,
    is_pro          boolean not null default false,   -- requires Pro plan to access
    is_published    boolean not null default false,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

-- ============================================================
-- topics  (belong to a module; hold the actual notes content)
-- ============================================================
create table topics (
    id              uuid primary key default gen_random_uuid(),
    module_id       uuid not null references modules(id) on delete cascade,
    slug            text not null,
    title           text not null,
    content         text not null default '',          -- markdown
    order_index     integer not null default 0,
    is_published    boolean not null default false,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now(),
    unique (module_id, slug)
);

create index ix_topics_module_id on topics(module_id);

-- ============================================================
-- progress  (a user completing a topic)
-- ============================================================
create table progress (
    id              uuid primary key default gen_random_uuid(),
    user_id         uuid not null references users(id) on delete cascade,
    topic_id        uuid not null references topics(id) on delete cascade,
    completed_at    timestamptz not null default now(),
    unique (user_id, topic_id)
);

create index ix_progress_user_id on progress(user_id);

-- ============================================================
-- certificates  (issued once a user completes every topic in a module)
-- ============================================================
create table certificates (
    id                      uuid primary key default gen_random_uuid(),
    certificate_code        text not null unique,        -- short public id used in /verify/{certificate-id}
    user_id                 uuid not null references users(id) on delete cascade,
    module_id               uuid not null references modules(id) on delete cascade,
    student_name_snapshot   text not null,                -- frozen at issue time, survives later name changes
    module_title_snapshot   text not null,
    issued_at               timestamptz not null default now(),
    unique (user_id, module_id)
);

create index ix_certificates_certificate_code on certificates(certificate_code);
