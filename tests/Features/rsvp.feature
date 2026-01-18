Feature: Guest RSVP Flow
  As a guest
  I want to RSVP to an event using InviteLink
  So that the organizers know if I'm attending

  Scenario: Guest RSVPs to event
    Given I am on the InviteLink home page
    When I scan a valid QR code
    Then I should see the RSVP form
    And the form should pre-fill my guest name
    And I should be able to select attendance status
    And I should be able to add plus-ones
    And I should be able to select parking preference

  Scenario: Guest submits RSVP
    Given I have the RSVP form open
    When I fill in the guest name as "John Doe"
    And I select attendance status as "Attending"
    And I add 2 plus-ones
    And I select parking preference as "Valet"
    And I click the submit button
    Then I should see a confirmation message
    And the confirmation should display "John Doe"
    And the confirmation should show the guest count

  Scenario: Guest views confirmation
    Given I have successfully submitted my RSVP
    When I view the confirmation page
    Then I should see my guest information
    And I should see the event details
    And I should see a QR code for check-in
    And I should have an option to modify my RSVP

  Scenario: Invalid RSVP submission
    Given I have the RSVP form open
    When I submit the form without filling in required fields
    Then I should see validation error messages
    And the error messages should be clear
    And the form should remain open
    And I should be able to correct the errors

  Scenario: Mobile responsiveness
    Given I am viewing the app on a mobile device
    When I navigate to the RSVP page
    Then the form should be mobile-friendly
    And the buttons should be easily clickable
    And the text should be readable
    And all fields should be accessible
