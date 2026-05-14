-- =============================================================================
-- UBUNTU CAMPUS CLINIC — APPOINTMENT SYSTEM
-- Group 19 | CMPG 311 | DBMS Module | Physical Design
-- File: 00_RUN_ALL.sql
-- Purpose: Master script — runs all SQL files in the correct order
-- HOW TO RUN: Open this file in Oracle SQL Developer → press F5 (Run Script)
-- =============================================================================
-- IMPORTANT: Run this script from the PROJECT ROOT directory in SQL Developer.
-- The @sql/... paths below are relative to the directory SQL Developer is
-- opened from.  If you opened SQL Developer from inside the sql/ folder the
-- paths will fail with "File not found".  Always open SQL Developer (or set
-- its working directory) to the folder that CONTAINS the sql/ subfolder.
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
