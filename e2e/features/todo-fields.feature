@EPMCDMETST-70470 @todo-fields
Feature: Todo fields and ids
  As a user of the Todo app
  I want every field of a todo to be saved correctly
  So that the list always shows what I entered, even after a refresh

  Background:
    Given the browser has a clean localStorage
    And the login page is open
    And localStorage holds the three default todos for "darshan"
    And I am logged in as "darshan" and viewing my todo list

  Scenario Outline: Toggling Done on an existing todo is saved and shown in the list
    Given the todo with id <id> shows Is Done? "<before>"
    When I update the todo with id <id> and set Done to <done>
    Then the todo with id <id> shows Is Done? "<after>"
    When I refresh the page
    And I log in as "darshan" with password "dummy"
    And I open my todo list
    Then the todo with id <id> shows Is Done? "<after>"
    And its description and target date are unchanged

    Examples:
      | id | before | done      | after |
      | 1  | false  | checked   | true  |
      | 3  | true   | unchecked | false |

  Scenario: Editing the description and date persists after a refresh
    When I update the todo with id 2 to description "Build the todo frontend v2" and date "2031-02-03"
    Then the todo with id 2 shows "Build the todo frontend v2" and "2031-02-03"
    And there are still 3 todos in the original order
    When I refresh the page
    And I log in as "darshan" with password "dummy"
    And I open my todo list
    Then the todo with id 2 shows "Build the todo frontend v2" and "2031-02-03"
    And localStorage key "todo:darshan" holds that todo with id 2

  Scenario: A todo created with Done checked is listed as done and stays done
    When I create a todo "Already finished chore" due "2030-10-10" with Done checked
    Then that todo shows Is Done? "true"
    When I refresh the page
    And I log in as "darshan" with password "dummy"
    And I open my todo list
    Then that todo shows Is Done? "true"
    And its stored done value is true

  Scenario: A todo created without touching Done is listed as not done
    When I create a todo "Not finished yet" due "2030-10-11"
    Then that todo shows Is Done? "false"

  Scenario: Ids keep increasing across create, delete, create and a reload
    When I create a todo "First added todo" due "2030-11-01"
    Then it has id 4
    When I delete that todo
    And I create a todo "Second added todo" due "2030-11-02"
    Then it has id 5
    When I refresh the page
    And I log in as "darshan" with password "dummy"
    And I open my todo list
    And I delete the todo with id 5
    And I create a todo "Third added todo" due "2030-11-03"
    Then it has id 6
    And the stored ids are 1, 2, 3 and 6
