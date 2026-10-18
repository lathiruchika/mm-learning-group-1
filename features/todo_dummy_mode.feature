@capstone @todos
Feature: Todos CRUD in dummy API mode
  The app must be demoable without any backend dependency.

  @EPMCDMETST-69689 @smoke
  Scenario: Navigate to list todos in dummy mode without backend
    Given the app is running
    And demo user is logged in
    When the user navigates to the todos list page
    Then the todos list is displayed

  @EPMCDMETST-69646 @EPMCDMETST-69649
  Scenario: Create a new todo
    Given the app is running
    And demo user is logged in
    And the user is on the todos list page
    When the user adds a new todo with description "Buy groceries" and target date "2030-01-01"
    Then the new todo appears in the todos list

  @EPMCDMETST-69655
  Scenario: Delete an existing todo
    Given the app is running
    And demo user is logged in
    And the user is on the todos list page
    When the user deletes the first todo in the list
    Then the todo is removed from the todos list

  @EPMCDMETST-69660 @negative
  Scenario: Validation errors are shown when creating a todo with short description
    Given the app is running
    And demo user is logged in
    And the user is on the add todo page
    When the user attempts to save a todo with description "short" and target date "2030-01-01"
    Then the description validation error is displayed

  @EPMCDMETST-69689 @negative
  Scenario: Unauthenticated user is redirected from todos list
    Given the app is running
    When the user navigates to the todos list page
    Then the user is redirected to the login page
