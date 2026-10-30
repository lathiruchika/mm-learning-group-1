@EPMCDMETST-70470 @resilience
Feature: Simulated errors and browser storage problems
  As a user of the Todo app
  I want clear feedback when the API fails or browser storage is unusable
  So that I never lose data silently and can still use the app

  Failure simulation: setting localStorage "dummy-api:simulate-error" to "1" makes every
  dummy API call fail; "0" or no value means normal behaviour.

  Background:
    Given the browser has a clean localStorage
    And the login page is open

  Rule: Simulated API errors

  Scenario: The list error banner disappears as soon as Retry is clicked
    Given failure simulation is on
    And I am logged in as "darshan" and I open my todo list
    And the list error banner is shown
    When I click Retry on the list error banner
    Then the loading indicator is visible
    And the list error banner is gone
    When the loading has finished
    Then the list error banner is shown again

  Scenario: Failure simulation set to "0" behaves like no failure
    Given localStorage key "dummy-api:simulate-error" is "0"
    And I am logged in as "darshan" and viewing my todo list
    Then I see 3 todos
    And the list error banner is not shown

  Scenario: A failed save leaves the stored todos untouched
    Given I am logged in as "darshan" and viewing my todo list
    And I am on the create todo form with a valid description and date
    And failure simulation is on
    When I click Save
    Then the form error banner is shown
    And localStorage key "todo:darshan" is unchanged

  Rule: Unreadable browser storage

  Scenario: No storage warning is shown when browser storage works
    Given I am logged in as "darshan" and viewing my todo list
    Then the storage warning is not shown

  Scenario: An unreadable localStorage shows a storage warning and the default todos
    Given window.localStorage throws when it is accessed
    And I am logged in as "darshan"
    When I open my todo list
    Then the storage warning "Browser storage is unavailable" is shown
    And I see 3 todos

  Scenario: The app stays usable in memory when localStorage is unreadable
    Given window.localStorage throws when it is accessed
    And I am logged in as "darshan" and viewing my todo list
    When I create a todo "Kept in memory only" due "2030-12-01"
    Then "Kept in memory only" is listed
    And the storage warning is still shown
    When I delete the todo with id 1
    Then the todo with id 1 is no longer listed

  Scenario: Todos kept in memory are lost on a refresh as the warning says
    Given window.localStorage throws when it is accessed
    And I am logged in as "darshan" and viewing my todo list
    And I create a todo "Kept in memory only" due "2030-12-01"
    When I refresh the page
    And I log in as "darshan" with password "dummy"
    And I open my todo list
    Then I see 3 todos
    And "Kept in memory only" is not listed

  Rule: Full browser storage (QuotaExceededError on write)

  Scenario: A save fails with an error when storage is full and the stored todos still display
    Given I am logged in as "darshan" and viewing my todo list
    And I am on the create todo form with a valid description and date
    And browser storage is full
    When I click Save
    Then the form error banner mentions that browser storage could not be written
    And I am still on the create todo form
    When I click Cancel
    Then I see 3 todos
    And localStorage key "todo:darshan" is unchanged

  Scenario: Saving works again once storage has room
    Given I am logged in as "darshan" and viewing my todo list
    And I am on the create todo form with a valid description and date
    And browser storage is full
    And I clicked Save and the form error banner is shown
    When browser storage has room again
    And I click Save
    Then I am back on the todo list
    And the new todo is listed

  Scenario: A delete fails with an error when storage is full and the todo stays
    Given I am logged in as "darshan" and viewing my todo list
    And browser storage is full
    When I delete the todo with id 1
    Then the delete error banner mentions that browser storage could not be written
    And the todo with id 1 is still listed
    And localStorage key "todo:darshan" is unchanged
