Feature: Guest RSVP Flow
    As a guest
    I want to RSVP to an event using InviteLink
    So that the organizers know if I'm attending

Scenario: Guest submits a valid RSVP
    Given the InviteLink application is running
    When I submit an RSVP with the following details
        | Field           | Value            |
        | GuestName       | John Doe         |
        | Email           | john@example.com |
        | AttendanceStatus| Attending        |
        | NumberOfGuests  | 2                |
    Then the RSVP should be accepted
    And I should receive a confirmation

Scenario: Guest submits RSVP without required fields
    Given the InviteLink application is running
    When I submit an RSVP with missing required fields
    Then the RSVP should be rejected
    And I should see a validation error message

Scenario: Guest views RSVP confirmation
    Given I have successfully submitted my RSVP
    When I request my RSVP confirmation
    Then I should see my guest information
    And I should see the event details
