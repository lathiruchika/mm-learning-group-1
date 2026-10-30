@EPMCDMETST-70470 @accessibility
Feature: Basic accessibility of forms and messages
  As a keyboard or screen reader user
  I want invalid fields and status messages to be exposed to assistive technology
  So that I can tell what is wrong and when the app is busy or has failed

  Background:
    Given the browser has a clean localStorage
    And the login page is open

  Scenario: Form fields are reachable by their labels and start out valid
    Given I am logged in as "darshan" and viewing my todo list
    When I open the create todo form
    Then the fields "Description", "Target Date" and "Done" are found by their labels
    And no field is marked invalid
    And no alert is shown

  Scenario: An invalid description is marked invalid and announced
    Given I am logged in as "darshan" and viewing my todo list
    And I open the create todo form
    When I enter the description "abc" and leave the field
    Then the description field has aria-invalid "true"
    And exactly one alert is shown and it says "at least 8 characters"
    When I enter the description "Long enough text" and leave the field
    Then the description field has aria-invalid "false"
    And no alert is shown

  Scenario: A missing target date is marked invalid and announced
    Given I am logged in as "darshan" and viewing my todo list
    And I open the create todo form
    When I focus the target date field and leave it empty
    Then the target date field has aria-invalid "true"
    And exactly one alert is shown and it says "Target date is required"
    When I enter the target date "2030-01-15"
    Then the target date field has aria-invalid "false"
    And no alert is shown

  Scenario: Save stays disabled until the whole form is valid
    Given I am logged in as "darshan" and viewing my todo list
    And I open the create todo form
    Then the Save button is disabled
    When I enter the description "Long enough text"
    Then the Save button is disabled
    When I enter the target date "2030-01-15"
    Then the Save button is enabled
    When I clear the description
    Then the Save button is disabled

  Scenario: The edit form marks an existing invalid todo immediately
    Given localStorage holds a todo "short" dated "2030-01-01" for "darshan"
    And I am logged in as "darshan" and viewing my todo list
    When I click Update on the todo with id 1
    Then the description field has aria-invalid "true"
    And exactly one alert is shown and it says "at least 8 characters"
    And the Save button is disabled
    When I enter the description "Now long enough to save"
    Then the description field has aria-invalid "false"
    And the Save button is enabled

  Scenario: Loading and error messages use live-region roles
    Given failure simulation is on
    And I am logged in as "darshan"
    When I open my todo list
    Then the loading indicator has role "status"
    And the list error banner has role "alert"

  Scenario: The login failure message is announced to assistive technology
    When I log in as "darshan" with password "wrong"
    Then an alert containing "Authentication Failed" is exposed
    # Known defects: Login.jsx:27 prevents the message from rendering at all and Login.jsx:38 has no role="alert" (test is fixme).
