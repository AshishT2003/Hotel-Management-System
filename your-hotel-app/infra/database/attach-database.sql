-- ==============================================================================
-- Grand Horizon Palace — Database Attachment, Indexing & Seeding Script
-- Target Engine: Microsoft SQL Server / SQL Server LocalDB ((LocalDB)\MSSQLLocalDB)
-- ==============================================================================

USE [master];
GO

-- 1. Attach frontend_reservation if not already attached
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'frontend_reservation')
BEGIN
    CREATE DATABASE [frontend_reservation]
    ON (FILENAME = N'c:\Users\ashut\Downloads\HotelManagement-master\your-hotel-app\infra\database\frontend_reservation.mdf'),
       (FILENAME = N'c:\Users\ashut\Downloads\HotelManagement-master\your-hotel-app\infra\database\frontend_reservation_log.ldf')
    FOR ATTACH;
    PRINT 'Database [frontend_reservation] attached successfully.';
END
ELSE
BEGIN
    PRINT 'Database [frontend_reservation] is already attached.';
END
GO

-- 2. Attach login_manager if not already attached
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'login_manager')
BEGIN
    CREATE DATABASE [login_manager]
    ON (FILENAME = N'c:\Users\ashut\Downloads\HotelManagement-master\your-hotel-app\infra\database\login_manager.mdf'),
       (FILENAME = N'c:\Users\ashut\Downloads\HotelManagement-master\your-hotel-app\infra\database\login_manager_log.ldf')
    FOR ATTACH;
    PRINT 'Database [login_manager] attached successfully.';
END
ELSE
BEGIN
    PRINT 'Database [login_manager] is already attached.';
END
GO

-- ==============================================================================
-- 3. Configure Indexes & Optimization on frontend_reservation
-- ==============================================================================
USE [frontend_reservation];
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_reservation_guest_search' AND object_id = OBJECT_ID('reservation'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_reservation_guest_search
    ON [reservation] (last_name, first_name, room_number)
    INCLUDE (phone_number, email_address, check_in, total_bill);
    PRINT 'Index IX_reservation_guest_search created.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_reservation_status' AND object_id = OBJECT_ID('reservation'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_reservation_status
    ON [reservation] (check_in, arrival_time, leaving_time)
    INCLUDE (room_number, room_type);
    PRINT 'Index IX_reservation_status created.';
END
GO

-- ==============================================================================
-- 4. Seed 10 Realistic Reservations
-- ==============================================================================
IF NOT EXISTS (SELECT 1 FROM [reservation] WHERE Id = 1011)
BEGIN
    INSERT INTO [reservation] (
        [first_name], [last_name], [birth_day], [gender], [phone_number], [email_address],
        [number_guest], [street_address], [apt_suite], [city], [state], [zip_code],
        [room_type], [room_floor], [room_number], [total_bill], [payment_type], [card_type],
        [card_number], [card_exp], [card_cvc], [arrival_time], [leaving_time], [check_in],
        [break_fast], [lunch], [dinner], [cleaning], [towel], [s_surprise], [supply_status], [food_bill]
    ) VALUES 
    ('Nazim', 'Amin', '1990-05-15', 'Male', '(999) 999-9999', 'nazim@hotel.com', 2, '100 Ocean Drive', 'Apt 4B', 'Miami', 'FL', '33139', 'Double', '2', '205', 378.93, 'Credit Card', 'Visa', '4111222233334444', '12/28', '888', '2026-09-28', '2026-10-02', 1, 2, 1, 2, 1, 1, 1, 0, 59),
    ('Ceaser', 'Krit', '1985-08-22', 'Male', '(555) 234-5678', 'ceaser.krit@example.com', 1, '742 Evergreen Terrace', '', 'Springfield', 'IL', '62704', 'Single', '1', '101', 173.43, 'Debit Card', 'MasterCard', '5500000012345678', '08/27', '123', '2026-09-29', '2026-10-01', 0, 2, 0, 0, 0, 1, 0, 0, 14),
    ('George', 'Zhang', '1992-11-03', 'Male', '(415) 888-9999', 'george.z@siliconvalley.io', 1, '500 Market St', 'Suite 12', 'San Francisco', 'CA', '94105', 'Single', '1', '103', 169.43, 'Credit Card', 'Amex', '378282246310005', '11/29', '2020', '2026-09-27', '2026-09-30', 1, 0, 0, 0, 1, 0, 0, 1, 0),
    ('Sophia', 'Loren', '1988-03-20', 'Female', '(212) 555-0199', 'sophia.loren@luxury.com', 3, '789 5th Avenue', 'Penthouse 3', 'New York', 'NY', '10022', 'Duplex', '4', '402', 456.93, 'Credit Card', 'Visa', '4242424242424242', '04/28', '456', '2026-09-29', '2026-10-04', 1, 2, 0, 0, 1, 1, 1, 0, 14),
    ('Alexander', 'Vance', '1979-12-14', 'Male', '(312) 555-8821', 'avance@globalholdings.com', 2, '110 N Michigan Ave', '', 'Chicago', 'IL', '60601', 'Suite', '5', '501', 563.93, 'Credit Card', 'Visa', '4000123456789010', '09/27', '999', '2026-09-30', '2026-10-05', 0, 2, 1, 0, 0, 1, 1, 0, 29),
    ('Elena', 'Rostova', '1994-07-09', 'Female', '(617) 555-4321', 'elena.rostova@cambridge.edu', 2, '45 Brattle St', 'Apt 2', 'Cambridge', 'MA', '02138', 'Twin', '3', '302', 400.43, 'Credit Card', 'MasterCard', '5105105105105100', '06/28', '777', '2026-09-29', '2026-10-03', 1, 1, 1, 1, 1, 1, 0, 0, 34),
    ('David', 'Beckham', '1975-05-02', 'Male', '(305) 555-9000', 'd.beckham@intermiami.com', 4, '1200 Brickell Bay Dr', '', 'Miami', 'FL', '33131', 'Suite', '5', '505', 624.93, 'Credit Card', 'Amex', '378282246300001', '01/29', '1001', '2026-10-01', '2026-10-06', 0, 4, 0, 0, 1, 1, 1, 0, 28),
    ('Marcus', 'Aurelius', '1982-04-26', 'Male', '(202) 555-7890', 'm.aurelius@stoicworks.org', 1, '1600 Pennsylvania Ave', '', 'Washington', 'DC', '20500', 'Single', '1', '105', 159.43, 'Cash', 'None', 'CASH-PAYMENT', 'N/A', 'N/A', '2026-09-28', '2026-09-29', 1, 0, 0, 0, 0, 1, 0, 1, 0),
    ('Clara', 'Oswald', '1991-11-23', 'Female', '(503) 555-6543', 'clara.oswald@timetravel.uk', 2, '221B Baker St', '', 'Portland', 'OR', '97201', 'Double', '2', '208', 348.93, 'Credit Card', 'Visa', '4532015099887766', '10/27', '345', '2026-09-29', '2026-10-02', 1, 2, 0, 1, 1, 1, 0, 0, 29),
    ('Arthur', 'Dent', '1980-03-11', 'Male', '(206) 555-4242', 'arthur.dent@galaxyguide.com', 1, '42 Hitchhiker Way', '', 'Seattle', 'WA', '98101', 'Twin', '3', '305', 387.43, 'Debit Card', 'Visa', '4111111111111111', '05/28', '420', '2026-09-30', '2026-10-03', 0, 1, 1, 0, 0, 1, 0, 0, 19);
    PRINT 'Seeded 10 realistic reservation records successfully.';
END
GO

-- ==============================================================================
-- 5. Seed 3 Role-Based Users in login_manager
-- ==============================================================================
USE [login_manager];
GO

-- Ensure frontend table has admin
IF NOT EXISTS (SELECT 1 FROM [frontend] WHERE user_name = 'admin')
BEGIN
    INSERT INTO [frontend] (user_name, pass_word) VALUES ('admin', 'adminPassword123');
    PRINT 'Front Desk admin user seeded.';
END

-- Ensure manager exists in frontend table
IF NOT EXISTS (SELECT 1 FROM [frontend] WHERE user_name = 'manager')
BEGIN
    INSERT INTO [frontend] (user_name, pass_word) VALUES ('manager', 'managerPassword123');
    PRINT 'General Manager user seeded.';
END

-- Ensure kitchen table has kitchen user
IF NOT EXISTS (SELECT 1 FROM [kitchen] WHERE user_name = 'kitchen')
BEGIN
    INSERT INTO [kitchen] (user_name, pass_word) VALUES ('kitchen', 'kitchenPassword123');
    PRINT 'Kitchen user seeded.';
END
GO
