@EPMCDMETST-101 @smoke
Feature: Authentication and protected routes
  As a user
  I want to log in to the Todo App
  So that I can access protected pages and manage my todos

  Background:
    Given the Todo App is running

  @EPMCDMETST-101_happy
  Scenario: Successful login navigates to Welcome page
    When I log in with username "darshan" and password "dummy"
    Then I should see the welcome message for "darshan"
    And the navigation should show "Yours Todo Lists" and "LogOut"

  @EPMCDMETST-101_negative
  Scenario: Invalid login shows Authentication Failed
    When I log in with username "darshan" and password "wrong"
    Then I should see an "Authentication Failed" error
    And I should remain on the login page

  @EPMCDMETST-101_route_guard
  Scenario: Unauthenticated access to List Todos redirects to Login
    When I navigate directly to "/list-todos"
    Then I should see the "Login" heading


@EPMCDMETST-102
Feature: View and navigate Todos
  As an authenticated user
  I want to view my todo list
  So that I can manage my tasks

  Background:
    Given the Todo App is running
    And I am logged in as "darshan" with password "dummy"

  @EPMCDMETST-102_happy
  Scenario: Navigate to list todos from welcome page
    When I open the welcome page
    And I click the "here" link to view todos
    Then I should see the "List of Todos" heading


@EPMCDMETST-103
Feature: Add Todo validation
  As an authenticated user
  I want validations when adding a todo
  So that I cannot save invalid todo data

  Background:
    Given the Todo App is running
    And I am logged in as "darshan" with password "dummy"

  @EPMCDMETST-103_negative_description
  Scenario: Cannot save a todo with too short description
    When I open the add todo page
    And I set the description to "short"
    And I set the target date to "2030-12-31"
    And I save the todo
    Then I should see the validation message "Enter atlease 8 characters for description"

  @EPMCDMETST-103_negative_date
  Scenario: Cannot save a todo with missing target date
    When I open the add todo page
    And I set the description to "A valid description"
    And I set the target date to ""
    And I save the todo
    Then I should see the validation message "Please enter a date"
