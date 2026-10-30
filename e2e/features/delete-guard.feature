@EPMCDMETST-70470 @delete-guard
Feature: Deleting todos safely
  As a user of the Todo app
  I want a delete to run exactly once and its row to be locked meanwhile
  So that a double click cannot delete twice or show a bogus error

  The dummy API takes 300 ms per call in the suite, which makes the in-flight state observable.
  Dummy API calls are counted by e2e/support/app.js (installApiCallCounter).

  Background:
    Given the browser has a clean localStorage
    And the login page is open

  Scenario: While a delete is in flight only that row has its Delete button disabled
    Given I am logged in as "darshan" and viewing my todo list
    When I click Delete on the todo with id 1
    Then the Delete button of todo 1 is disabled
    And the Delete button of todo 2 is enabled
    And the message "Todo with id: 1 is deleted." is shown
    And the todo with id 1 is no longer listed

  Scenario: A double click on Delete sends only one delete request
    Given I am logged in as "darshan" and viewing my todo list
    And the API call counter is reset
    When I double click Delete on the todo with id 1
    Then the todo with id 1 is no longer listed and the list has reloaded
    And exactly 2 API calls were made (one delete and one list reload)
    And no delete error banner is shown
    And localStorage key "todo:darshan" holds the todos with ids 2 and 3

  Scenario: Two different rows can be deleted back to back
    Given I am logged in as "darshan" and viewing my todo list
    When I click Delete on the todo with id 1
    And I click Delete on the todo with id 2 before the first delete has finished
    Then only the todo with id 3 is listed
    And no delete error banner is shown

  Scenario: A failed delete enables the Delete button again
    Given I am logged in as "darshan" and viewing my todo list
    And failure simulation is on
    When I click Delete on the todo with id 1
    Then the Delete button of todo 1 is disabled
    And the delete error banner is shown
    And the Delete button of todo 1 is enabled
    And the todo with id 1 is still listed

  Scenario: Deleting every todo shows the empty state
    Given I am logged in as "darshan" and viewing my todo list
    When I delete the todos with ids 1, 2 and 3 one after another
    Then the empty state is shown
    And exactly one add-todo call to action is shown
    And localStorage key "todo:darshan" is "[]"
