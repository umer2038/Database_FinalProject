-- Vendor Registration Procedure (with contact details and email)
DELIMITER $$

CREATE PROCEDURE RegisterVendor(
    IN vendor_name VARCHAR(100), 
    IN email VARCHAR(100), 
    IN phone VARCHAR(20), 
    IN address VARCHAR(255)
)
BEGIN
    INSERT INTO Vendor (Name, ContactInfo, CertificationStatus) 
    VALUES (vendor_name, CONCAT(phone, ' - ', address), FALSE);
END $$

DELIMITER ;

-- Contract Renewal Procedure
DELIMITER $$

CREATE PROCEDURE RenewContract(
    IN cID INT,
    IN newEndDate DATE
)
BEGIN
    UPDATE Contract 
    SET EndDate = newEndDate, Status = 'Renewed' 
    WHERE ContractID = cID;

    -- Add record to contract renewals table
    INSERT INTO ContractRenewals (ContractID, RenewalDate, RenewalStatus)
    VALUES (cID, CURDATE(), 'Renewed');
END $$

DELIMITER ;

-- Update Contract Renewal Procedure
DELIMITER $$

CREATE PROCEDURE UpdateContractRenewal(
    IN contract_id INT, 
    IN renewal_date DATE, 
    IN renewal_status VARCHAR(50)
)
BEGIN
    UPDATE ContractRenewals
    SET RenewalDate = renewal_date, RenewalStatus = renewal_status
    WHERE ContractID = contract_id;
END $$

DELIMITER ;
