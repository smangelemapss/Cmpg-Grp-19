-- =============================================================================
-- UBUNTU CAMPUS CLINIC — APPOINTMENT SYSTEM
-- Group 19 | CMPG 311 | DBMS Module | Physical Design
-- File: 00_RUN_ALL.sql
-- Purpose: Master script — runs all SQL files in the correct order
-- =============================================================================
--
-- !! READ THIS BEFORE RUNNING !!
--
-- HOW TO RUN FROM SQL DEVELOPER:
--   1. Open SQL Developer
--   2. File → Open → navigate to THIS file (sql/00_RUN_ALL.sql)
--   3. The working directory MUST be the repo root (the folder that
--      CONTAINS the sql/ subfolder, not inside it)
--   4. Press F5 (Run Script) — NOT the green play button
--
-- HOW TO RUN FROM SQL*PLUS INSIDE DOCKER:
--   docker cp sql/ oracle-xe:/opt/oracle/sql/
--   docker exec -it oracle-xe sqlplus system/Clinic@123@localhost:1521/XE
--   @/opt/oracle/sql/00_RUN_ALL.sql
--   (use the full /opt/oracle/sql/... path — NOT @sql/...)
--
-- WHY: The @sql/... paths below are relative to SQL Developer's working
-- directory. If you opened SQL Developer from inside the sql/ folder,
-- these paths WILL fail with "File not found". Always run from repo root.
--
-- =============================================================================

-- Step 1: Create all 12 tables (DDL)
@sql/01_DDL/01_create_tables.sql

-- Step 2: Create all 12 indexes
@sql/01_DDL/02_create_indexes.sql

-- Step 3: Create all 4 views
@sql/01_DDL/03_create_views.sql

-- Step 4: Insert seed data into all 12 tables
@sql/02_DML/04_insert_data.sql

PROMPT ============================================================
PROMPT  Ubuntu Campus Clinic database setup complete.
PROMPT  Run sql/04_queries/05_queries.sql for rubric queries.
PROMPT ============================================================
