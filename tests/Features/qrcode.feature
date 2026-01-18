Feature: QR Code Scanning
  As an event staff member or guest
  I want to scan QR codes
  So that I can quickly access invite information and check in guests

  Scenario: Scan valid QR code
    Given I have the QR scanner ready
    When I scan a valid InviteLink QR code
    Then the invite information should be decoded
    And the guest name should be displayed
    And the allowed guest count should be shown
    And the event date should be visible

  Scenario: Handle invalid QR code
    Given I have the QR scanner ready
    When I scan an invalid QR code
    Then I should see an error message
    And the error should indicate "Invalid QR Code"
    And I should be prompted to try scanning again

  Scenario: Check-in with QR code
    Given I have scanned a valid QR code
    When I click the check-in button
    Then the guest should be marked as present
    And a timestamp should be recorded
    And I should see a success confirmation
    And the guest should receive a confirmation message

  Scenario: Multiple guest check-in
    Given the invite allows 3 guests total
    When I check in the primary guest
    And I check in the first plus-one
    And I check in the second plus-one
    Then all three guests should be marked as present
    And the attendance count should be updated
    And the organizer dashboard should reflect the changes

  Scenario: Duplicate check-in prevention
    Given a guest has already checked in
    When I scan their QR code again
    Then I should see a message indicating they're already checked in
    And the system should not create a duplicate entry
    And I should have an option to mark as re-entry if allowed
