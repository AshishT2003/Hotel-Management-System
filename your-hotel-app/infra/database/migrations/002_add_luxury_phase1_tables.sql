-- ==============================================================================
-- Migration: 002_add_luxury_phase1_tables.sql
-- Description: Phase 1 Luxury Services - Housekeeping Workflow & Guest 360° Profiles
-- ==============================================================================

-- 1. Create guest_profiles table for 360° preferences and VIP loyalty tiering
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'guest_profiles')
BEGIN
    CREATE TABLE guest_profiles (
        guest_id INT PRIMARY KEY IDENTITY(1,1),
        email NVARCHAR(150) UNIQUE NOT NULL,
        first_name NVARCHAR(100) NOT NULL,
        last_name NVARCHAR(100) NOT NULL,
        phone NVARCHAR(30) NULL,
        tier_status NVARCHAR(20) DEFAULT 'Silver', -- Silver, Gold, Platinum
        loyalty_points INT DEFAULT 0,
        total_nights INT DEFAULT 0,
        preferences_json NVARCHAR(MAX) NULL, -- {"pillow": "firm", "dietary": "vegan", "floorPreference": "high", "roomView": "ocean"}
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );

    CREATE INDEX IX_guest_profiles_email ON guest_profiles(email);
    CREATE INDEX IX_guest_profiles_tier ON guest_profiles(tier_status);
END;

-- 2. Create housekeeping_tasks table for room state machine workflow
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'housekeeping_tasks')
BEGIN
    CREATE TABLE housekeeping_tasks (
        task_id INT PRIMARY KEY IDENTITY(1,1),
        room_number NVARCHAR(10) NOT NULL,
        status NVARCHAR(30) DEFAULT 'Ready', -- 'Ready', 'Dirty', 'Cleaning', 'Inspection'
        priority NVARCHAR(20) DEFAULT 'Normal', -- 'Normal', 'High', 'VIP'
        attendant_name NVARCHAR(100) NULL,
        inspected_by NVARCHAR(100) NULL,
        notes NVARCHAR(500) NULL,
        last_cleaned_at DATETIME2 NULL,
        updated_at DATETIME2 DEFAULT GETDATE()
    );

    CREATE INDEX IX_housekeeping_room_number ON housekeeping_tasks(room_number);
    CREATE INDEX IX_housekeeping_status ON housekeeping_tasks(status);
END;

-- 3. Populate default housekeeping state for all 50 rooms if not already populated
IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'housekeeping_tasks')
BEGIN
    -- Only insert if empty
    IF NOT EXISTS (SELECT 1 FROM housekeeping_tasks)
    BEGIN
        DECLARE @floor INT = 1;
        DECLARE @roomIndex INT = 1;
        DECLARE @roomNum NVARCHAR(10);

        WHILE @floor <= 5
        BEGIN
            SET @roomIndex = 1;
            WHILE @roomIndex <= 10
            BEGIN
                IF @roomIndex < 10
                    SET @roomNum = CAST(@floor AS NVARCHAR(1)) + '0' + CAST(@roomIndex AS NVARCHAR(1));
                ELSE
                    SET @roomNum = CAST(@floor AS NVARCHAR(1)) + CAST(@roomIndex AS NVARCHAR(2));

                INSERT INTO housekeeping_tasks (room_number, status, priority, attendant_name, notes, updated_at)
                VALUES (@roomNum, 'Ready', 'Normal', NULL, 'Initial ready state', GETDATE());

                SET @roomIndex = @roomIndex + 1;
            END;
            SET @floor = @floor + 1;
        END;
    END;
END;
