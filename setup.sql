-- Create the CorporateManagement Database
CREATE DATABASE IF NOT EXISTS corporatemanagement;

-- Use the CorporateManagement Database
USE corporatemanagement;

-- Vendor Table
CREATE TABLE IF NOT EXISTS Vendor (
    VendorID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    ContactInfo VARCHAR(255) NOT NULL,
    CertificationStatus BOOLEAN DEFAULT FALSE
);

-- Contract Table
CREATE TABLE IF NOT EXISTS Contract (
    ContractID INT AUTO_INCREMENT PRIMARY KEY,
    VendorID INT NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    Terms TEXT,
    Status VARCHAR(50) NOT NULL, -- Active, Expired, Renewed
    FOREIGN KEY (VendorID) REFERENCES Vendor(VendorID) ON DELETE CASCADE
);

-- Contract Renewals Table
CREATE TABLE IF NOT EXISTS ContractRenewals (
    RenewalID INT AUTO_INCREMENT PRIMARY KEY,
    ContractID INT NOT NULL,
    RenewalDate DATE NOT NULL,
    RenewalStatus VARCHAR(50) NOT NULL,  -- Pending, Renewed, Expired
    FOREIGN KEY (ContractID) REFERENCES Contract(ContractID) ON DELETE CASCADE
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS Notifications (
    NotificationID INT AUTO_INCREMENT PRIMARY KEY,
    Message TEXT NOT NULL,
    VendorID INT NOT NULL,
    NotificationDate DATE NOT NULL,
    FOREIGN KEY (VendorID) REFERENCES Vendor(VendorID) ON DELETE CASCADE
);

-- Budget Table
CREATE TABLE IF NOT EXISTS Budget (
    BudgetID INT AUTO_INCREMENT PRIMARY KEY,
    DepartmentName VARCHAR(100) NOT NULL,
    AllocatedAmount DECIMAL(10, 2) NOT NULL,
    SpentAmount DECIMAL(10, 2) DEFAULT 0.00
);

-- Purchase Order Table
CREATE TABLE IF NOT EXISTS PurchaseOrder (
    POID INT AUTO_INCREMENT PRIMARY KEY,
    VendorID INT NOT NULL,
    ItemDetails TEXT NOT NULL,
    TotalCost DECIMAL(10, 2) NOT NULL,
    BudgetID INT NOT NULL,
    Status VARCHAR(50) NOT NULL, -- Pending, Approved, Completed
    FOREIGN KEY (VendorID) REFERENCES Vendor(VendorID) ON DELETE CASCADE,
    FOREIGN KEY (BudgetID) REFERENCES Budget(BudgetID) ON DELETE CASCADE
);

-- Vendor Certification Table
CREATE TABLE IF NOT EXISTS VendorCertification (
    CertificationID INT AUTO_INCREMENT PRIMARY KEY,
    VendorID INT NOT NULL,
    CertificationName VARCHAR(255) NOT NULL,
    CertificationDate DATE NOT NULL,
    ExpiryDate DATE NOT NULL,
    CertificationStatus VARCHAR(50) NOT NULL,  -- e.g., 'Active', 'Expired', 'Pending'
    CertifyingAuthority VARCHAR(255),          -- The organization that issued the certification
    CertificationType VARCHAR(100),            -- Type of certification (e.g., 'ISO 9001', 'CE')
    FOREIGN KEY (VendorID) REFERENCES Vendor(VendorID) ON DELETE CASCADE
);

-- Insert Sample Data for Vendors
INSERT INTO Vendor (Name, ContactInfo, CertificationStatus) 
VALUES 
('Vendor A', 'vendorA@gmail.com', TRUE), 
('Vendor B', 'vendorB@gmail.com', FALSE),
('Vendor C', 'vendorC@gmail.com', TRUE);

-- Insert Sample Data for Vendor Certifications
INSERT INTO VendorCertification (VendorID, CertificationName, CertificationDate, ExpiryDate, CertificationStatus, CertifyingAuthority, CertificationType)
VALUES 
(1, 'ISO 9001', '2022-06-01', '2024-06-01', 'Active', 'International Organization for Standardization', 'Quality Management'),
(2, 'ISO 14001', '2023-01-15', '2025-01-15', 'Active', 'International Organization for Standardization', 'Environmental Management'),
(3, 'ISO 27001', '2021-03-22', '2023-03-22', 'Expired', 'International Organization for Standardization', 'Information Security');

-- Insert Sample Budget Data
INSERT INTO Budget (DepartmentName, AllocatedAmount) 
VALUES 
('Procurement', 50000), 
('Operations', 75000);

-- Insert Sample Contracts
INSERT INTO Contract (VendorID, StartDate, EndDate, Terms, Status) 
VALUES 
(1, '2024-01-01', '2024-12-31', 'Annual Service Agreement', 'Active'), 
(2, '2024-03-01', '2025-02-28', 'Product Supply Agreement', 'Active');

-- Insert Sample Purchase Orders
INSERT INTO PurchaseOrder (VendorID, ItemDetails, TotalCost, BudgetID, Status)
VALUES
(1, '100 laptops', 20000.00, 1, 'Pending'),
(2, 'Office Furniture', 15000.00, 2, 'Pending');

-- Insert Sample Contract Renewals
INSERT INTO ContractRenewals (ContractID, RenewalDate, RenewalStatus)
VALUES
(1, '2024-12-31', 'Pending'),
(2, '2025-02-28', 'Pending');

-- Insert Sample Notifications
INSERT INTO Notifications (Message, VendorID, NotificationDate) 
VALUES 
('Contract with ID 1 is expiring soon', 1, '2024-11-28'),
('Contract with ID 2 is expiring soon', 2, '2024-11-28'),
('Procurement alert', 1, '2024-12-02');

-- Vendor Reviews Table
CREATE TABLE IF NOT EXISTS VendorReviews (
    ReviewID INT AUTO_INCREMENT PRIMARY KEY,
    VendorID INT NOT NULL,
    Rating INT CHECK (Rating BETWEEN 1 AND 5),
    ReviewText TEXT,
    ReviewDate DATE NOT NULL,
    FOREIGN KEY (VendorID) REFERENCES Vendor(VendorID) ON DELETE CASCADE
);

-- Insert Sample Vendor Review Data
INSERT INTO VendorReviews (VendorID, Rating, ReviewText, ReviewDate)
VALUES 
(1, 5, 'Excellent service', '2024-01-15'),
(2, 4, 'Good product quality', '2024-02-20'),
(3, 3, 'Average service', '2024-03-25');

-- Create Vendor Certification Database (vendor_certification)
CREATE DATABASE IF NOT EXISTS vendor_certification;

-- Use the vendor_certification Database
USE vendor_certification;

-- Additional actions can be added here as necessary.
