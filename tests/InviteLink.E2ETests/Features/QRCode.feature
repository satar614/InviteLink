Feature: QR Code Scanning
    As an event staff member
    I want to scan QR codes
    So that I can quickly check in guests

Scenario: Scan a valid QR code
    Given the InviteLink application is running
    When I scan a QR code with invite ID "INV-12345"
    Then the invite information should be retrieved
    And the guest name should be displayed
    And the allowed guest count should be shown

Scenario: Scan an invalid QR code
    Given the InviteLink application is running
    When I scan a QR code with invalid invite ID "INVALID-001"
    Then I should receive an error message
    And the error should indicate the QR code is invalid

Scenario: Check in a guest using QR code
    Given the InviteLink application is running
    And I have scanned a valid QR code with invite ID "INV-12345"
    When I check in the guest
    Then the guest should be marked as present
    And a check-in timestamp should be recorded
