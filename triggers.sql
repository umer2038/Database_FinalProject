-- Set the correct database (corporatemanagement)
USE corporatemanagement;

-- Notify Contract Renewal Trigger (notifies when a contract renewal is pending within 30 days)
DELIMITER $$

CREATE TRIGGER NotifyContractRenewal
AFTER INSERT ON ContractRenewals
FOR EACH ROW
BEGIN
    DECLARE vendorID INT;

    -- Fetch the VendorID from the Contract table based on the ContractID
    SELECT VendorID INTO vendorID
    FROM Contract
    WHERE ContractID = NEW.ContractID;

    -- Check if the renewal is within 30 days and if the renewal status is 'Pending'
    IF DATEDIFF(NEW.RenewalDate, CURDATE()) <= 30 AND NEW.RenewalStatus = 'Pending' THEN
        -- Insert notification for the expiring contract renewal
        INSERT INTO Notifications (Message, VendorID, NotificationDate)
        VALUES (
            CONCAT('Contract with ID ', NEW.ContractID, ' is expiring soon'), 
            vendorID, 
            CURDATE()
        );
    END IF;
END $$

DELIMITER ;

-- Budget Check Trigger (checks if purchase order exceeds allocated budget)
DELIMITER $$

CREATE TRIGGER BudgetCheck
BEFORE INSERT ON PurchaseOrder
FOR EACH ROW
BEGIN
    DECLARE TotalSpent DECIMAL(10, 2);
    
    -- Get total spent so far for the same budget (excluding pending purchases)
    SELECT SUM(TotalCost) INTO TotalSpent 
    FROM PurchaseOrder 
    WHERE BudgetID = NEW.BudgetID AND Status IN ('Approved', 'Completed'); -- Only consider approved or completed orders

    -- Check if the new purchase order exceeds the budget
    IF (TotalSpent + NEW.TotalCost) > (SELECT AllocatedAmount FROM Budget WHERE BudgetID = NEW.BudgetID) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Purchase exceeds allocated budget!';
    END IF;
END $$

DELIMITER ;
