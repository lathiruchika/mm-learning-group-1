@EPMCDMETST-70466 @ux-states
Feature: Loading, empty and error states
  As a user of the Todo app
  I want clear feedback while data loads, when there is nothing to show and when something fails
  So that I always know what is happening and can recover

  Failure simulation: setting localStorage "dummy-api:simulate-error" to "1" makes every
  dummy API call fail with SIMULATED_ERROR; removing it (or "0") restores normal behaviour.

  Background:
    Given the browser has a clean localStorage
    And the login page is open

  Scenario: A loading indicator is visible while todos are loading
    Given I am logged in as "darshan"
    When I open my todo list
    Then the loading indicator is visible
    And the loading indicator disappears once the todos are shown

  Scenario: An empty list shows an empty state with an add call to action
    Given localStorage key "todo:darshan" is "[]"
    And I am logged in as "darshan" and viewing my todo list
    Then the empty state is shown
    And exactly one add-todo call to action is shown
    When I click the add-todo call to action
    Then I am on the create todo form

  Scenario: Deleting the last remaining todo shows the empty state
    Given localStorage holds a single todo "Only remaining todo" for "darshan"
    And I am logged in as "darshan" and viewing my todo list
    When I delete the todo with id 1
    Then the empty state is shown

  Scenario: A list failure shows an error banner and Retry recovers
    Given failure simulation is on
    And I am logged in as "darshan" and I open my todo list
    Then the list error banner is shown
    And no todos are listed
    When failure simulation is turned off
    And I click Retry on the list error banner
    Then the list error banner is gone
    And I see 3 todos

  Scenario: Retry keeps the error banner while the failure persists
    Given failure simulation is on
    And I am logged in as "darshan" and I open my todo list
    When I click Retry on the list error banner
    Then the list error banner is shown

  Scenario: A delete failure shows a banner and its Retry repeats the delete
    Given I am logged in as "darshan" and viewing my todo list
    And failure simulation is on
    When I delete the todo with id 1
    Then the delete error banner is shown
    And the todo with id 1 is still listed
    When failure simulation is turned off
    And I click Retry on the delete error banner
    Then the delete error banner is gone
    And no todo with id 1 exists

  Scenario: A missing todo shows a not found panel with a way back
    Given I am logged in as "darshan" and viewing my todo list
    When I open the edit page for todo 9999
    Then the not found panel is shown
    When I click "Back to todos"
    Then I am back on the todo list

  Scenario: A failure while loading a todo for editing shows a banner and Retry recovers
    Given I am logged in as "darshan" and viewing my todo list
    And failure simulation is on
    When I click Update on the todo with id 1
    Then the form error banner is shown
    When failure simulation is turned off
    And I click Retry on the form error banner
    Then the todo form is shown with description "Learn React fundamentals"

  Scenario: A failure while saving shows a banner and saving again succeeds
    Given I am logged in as "darshan" and viewing my todo list
    And I am on the create todo form with a valid description and date
    And failure simulation is on
    When I click Save
    Then the form error banner is shown
    And I am still on the create todo form
    When failure simulation is turned off
    And I click Save
    Then I am back on the todo list
    And the new todo is listed
