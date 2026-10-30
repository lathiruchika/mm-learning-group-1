@EPMCDMETST-70465 @persistence
Feature: Dummy API persistence in localStorage (no backend)
  As a user of the Todo app
  I want my todos stored in the browser
  So that the app works and keeps my data without any backend

  Background:
    Given the browser has a clean localStorage
    And the login page is open

  Scenario: First load seeds three default todos
    When I log in as "darshan" with password "dummy"
    And I open my todo list
    Then I see 3 todos
    And "Learn React fundamentals", "Build the todo frontend" and "Write project documentation" are listed
    And "Write project documentation" is marked done

  Scenario: Creating, editing and deleting a todo makes no request to localhost:8080
    Given I am logged in as "darshan" and viewing my todo list
    When I create a todo "Buy groceries today" due "2030-05-01"
    And I change the description of that todo to "Buy groceries and fruit"
    And I delete that todo
    Then the todo is no longer listed
    And no request was made to localhost:8080

  Scenario: Todos survive a page refresh
    Given I am logged in as "darshan" and viewing my todo list
    And I create a todo "Persist me across reloads" due "2030-06-15"
    When I refresh the page
    And I log in as "darshan" with password "dummy"
    And I open my todo list
    Then "Persist me across reloads" is listed
    And localStorage key "todo:darshan" contains that todo

  Scenario: Each user keeps a separate set of todos
    Given localStorage already holds a todo "Alice private todo" under "todo:alice"
    And I am logged in as "darshan" and viewing my todo list
    When I create a todo "Darshan only todo" due "2030-07-01"
    Then "Alice private todo" is not listed
    And localStorage key "todo:alice" is unchanged
    And localStorage key "todo:darshan" contains "Darshan only todo"

  Scenario: An explicitly empty list stays empty after reload
    Given localStorage key "todo:darshan" is "[]"
    And I am logged in as "darshan" and viewing my todo list
    Then the empty state is shown
    When I refresh the page
    And I log in as "darshan" with password "dummy"
    And I open my todo list
    Then the empty state is shown
    And localStorage key "todo:darshan" is still "[]"

  Scenario: The id of a deleted todo is not reused
    Given I am logged in as "darshan" and viewing my todo list
    When I delete the todo with id 3
    And I create a todo "Brand new todo item" due "2030-08-01"
    Then the new todo has id 4
    And no todo with id 3 exists

  Scenario: Corrupt storage is backed up and re-seeded
    Given localStorage key "todo:darshan" is the corrupt text "{not valid json"
    When I log in as "darshan" with password "dummy"
    And I open my todo list
    Then I see 3 todos
    And localStorage key "todo-backup:darshan" holds the corrupt text "{not valid json"
    And localStorage key "todo:darshan" holds 3 valid todos
