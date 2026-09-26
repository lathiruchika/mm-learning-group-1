@EPMCDMETST-66718
Feature: Environment-based API base URL configuration
  As a developer/demo user
  I want the frontend to use an environment-configured API base URL
  So that the app can run across environments without code changes

  Background:
    Given the Todo app is running

  @smoke
  Scenario: App loads the login page
    When I open the application root URL
    Then I see the "Login" heading

  Scenario: Protected route redirects to login when not authenticated
    When I navigate directly to "/list-todos"
    Then I am redirected to the login page

  Scenario: Login succeeds with valid demo credentials
    When I log in with username "darshan" and password "dummy"
    Then I see the welcome page for username "darshan"

  Scenario: Login fails with invalid credentials
    When I log in with username "wrong" and password "creds"
    Then I see an authentication failed message

  # NOTE (EPMCDMETST-66718): Once apiClient reads VITE_API_BASE_URL and shows a user-facing error,
  # we will add a UI-level scenario to verify a misconfigured base URL produces a visible error banner.
