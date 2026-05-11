-- Verify critical tables
\d "APPOINTMENT"
\d "USER_ACCOUNT"
\d "NOTIFICATION"

-- Verify QUEUE_ENTRY table
\d "QUEUE_ENTRY"

-- Verify AUDIT_LOG table
\d "AUDIT_LOG"

-- Verify all 12 tables documented in SYSTEM_DESIGN.md exist
WITH expected(table_name) AS (
    VALUES
        ('APPOINTMENT'),
        ('AUDIT_LOG'),
        ('DEPARTMENT'),
        ('DOCTOR'),
        ('MEDICAL_RECORD'),
        ('NOTIFICATION'),
        ('PATIENT'),
        ('PATIENT_CONTACT'),
        ('QUEUE_ENTRY'),
        ('STAFF'),
        ('TIMESLOT'),
        ('USER_ACCOUNT')
)
SELECT
    expected.table_name,
    CASE
        WHEN tables.table_name IS NULL THEN 'MISSING'
        ELSE 'EXISTS'
    END AS status
FROM expected
LEFT JOIN information_schema.tables AS tables
    ON tables.table_schema = 'public'
    AND tables.table_name = expected.table_name
ORDER BY expected.table_name;

-- Check all indexes
SELECT indexname, indexdef FROM pg_indexes 
WHERE tablename IN ('APPOINTMENT', 'TIMESLOT', 'AUDIT_LOG', 'QUEUE_ENTRY', 'NOTIFICATION')
ORDER BY tablename, indexname;

-- Check all constraints
SELECT constraint_name, table_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name IN ('APPOINTMENT', 'PATIENT', 'USER_ACCOUNT', 'NOTIFICATION', 'AUDIT_LOG', 'QUEUE_ENTRY')
ORDER BY table_name, constraint_name;

-- Verify critical constraints by behavior required in SYSTEM_DESIGN.md
SELECT
    'APPOINTMENT.slot_id unique' AS design_requirement,
    CASE WHEN EXISTS (
        SELECT 1
        FROM pg_constraint AS c
        JOIN pg_class AS cl ON cl.oid = c.conrelid
        JOIN pg_namespace AS n ON n.oid = cl.relnamespace
        WHERE n.nspname = 'public'
            AND cl.relname = 'APPOINTMENT'
            AND c.contype = 'u'
            AND pg_get_constraintdef(c.oid) = 'UNIQUE (slot_id)'
    ) THEN 'PASS' ELSE 'FAIL' END AS status
UNION ALL
SELECT
    'USER_ACCOUNT patient OR staff check' AS design_requirement,
    CASE WHEN EXISTS (
        SELECT 1
        FROM pg_constraint AS c
        JOIN pg_class AS cl ON cl.oid = c.conrelid
        JOIN pg_namespace AS n ON n.oid = cl.relnamespace
        WHERE n.nspname = 'public'
            AND cl.relname = 'USER_ACCOUNT'
            AND c.contype = 'c'
            AND pg_get_constraintdef(c.oid) = 'CHECK (((patient_id IS NOT NULL) OR (staff_id IS NOT NULL)))'
    ) THEN 'PASS' ELSE 'FAIL' END AS status
UNION ALL
SELECT
    'NOTIFICATION patient OR staff check' AS design_requirement,
    CASE WHEN EXISTS (
        SELECT 1
        FROM pg_constraint AS c
        JOIN pg_class AS cl ON cl.oid = c.conrelid
        JOIN pg_namespace AS n ON n.oid = cl.relnamespace
        WHERE n.nspname = 'public'
            AND cl.relname = 'NOTIFICATION'
            AND c.contype = 'c'
            AND pg_get_constraintdef(c.oid) = 'CHECK (((patient_id IS NOT NULL) OR (staff_id IS NOT NULL)))'
    ) THEN 'PASS' ELSE 'FAIL' END AS status;
