-- ==============================================================================
-- Migration: 001_add_guest_booking_fields.sql
-- Description: Adds guest self-service booking tracking columns, indexes, and guest loyalty table
-- ==============================================================================

-- 1. Add guest booking tracking columns to reservations table
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('reservation') AND name = 'booking_source')
BEGIN
    ALTER TABLE reservation ADD booking_source NVARCHAR(50) DEFAULT 'Staff';
END;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('reservation') AND name = 'payment_status')
BEGIN
    ALTER TABLE reservation ADD payment_status NVARCHAR(20) DEFAULT 'Pending';
END;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('reservation') AND name = 'confirmation_email_sent')
BEGIN
    ALTER TABLE reservation ADD confirmation_email_sent BIT DEFAULT 0;
END;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('reservation') AND name = 'confirmation_code')
BEGIN
    ALTER TABLE reservation ADD confirmation_code NVARCHAR(50) NULL;
END;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('reservation') AND name = 'special_requests')
BEGIN
    ALTER TABLE reservation ADD special_requests NVARCHAR(500) NULL;
END;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('reservation') AND name = 'status')
BEGIN
    ALTER TABLE reservation ADD status NVARCHAR(30) DEFAULT 'Reserved';
END;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('reservation') AND name = 'cancellation_policy')
BEGIN
    ALTER TABLE reservation ADD cancellation_policy NVARCHAR(100) DEFAULT 'Free cancellation up to 48 hours before check-in';
END;

-- 2. Create index on email for quick guest booking lookups
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_reservation_email' AND object_id = OBJECT_ID('reservation'))
BEGIN
    CREATE INDEX IX_reservation_email ON reservation(email_address);
END;

-- 3. Create index on confirmation code
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_reservation_confirmation_code' AND object_id = OBJECT_ID('reservation'))
BEGIN
    CREATE INDEX IX_reservation_confirmation_code ON reservation(confirmation_code);
END;

-- 4. Create index on booking source for analytics
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_reservation_booking_source' AND object_id = OBJECT_ID('reservation'))
BEGIN
    CREATE INDEX IX_reservation_booking_source ON reservation(booking_source);
END;

-- 5. Optional guest_users table for repeat guest history & loyalty tracking
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'guest_users')
BEGIN
    CREATE TABLE guest_users (
        guest_id INT PRIMARY KEY IDENTITY(1,1),
        email NVARCHAR(255) UNIQUE NOT NULL,
        phone NVARCHAR(30),
        first_name NVARCHAR(100),
        last_name NVARCHAR(100),
        created_at DATETIME2 DEFAULT GETDATE(),
        last_login DATETIME2,
        total_bookings INT DEFAULT 0,
        loyalty_points INT DEFAULT 0
    );
END;
