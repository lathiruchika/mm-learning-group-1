@EPMCDMETST-70470 @auth-navigation
Feature: Login, logout and navigation
  As a user of the Todo app
  I want to sign in, move between pages and sign out
  So that only a signed-in user can reach the todo pages

  Login is held in React state only: a full page load always starts logged out, and the
  only valid credentials are "darshan" / "dummy" (case sensitive).

  Background:
    Given the browser has a clean localStorage
    And the login page is open

  Scenario Outline: Wrong credentials keep the user on the login page
    When I log in as "<username>" with password "<password>"
    Then I am still on the login page
    And the header offers no LogOut or todo list links

    Examples:
      | case                         | username | password |
      | wrong password               | darshan  | wrong    |
      | unknown user                 | someone  | dummy    |
      | user name is case sensitive  | Darshan  | dummy    |
      | empty credentials            |          |          |

  # Known app bug (Login.jsx:27, see the spec): the error message never appears, so the test is fixme.
  Scenario: Wrong credentials show an Authentication Failed message
    When I log in as "darshan" with password "wrong"
    Then the message "Authentication Failed" is shown
    And I am still on the login page

  Scenario: A correct login after a failed attempt lands on the welcome page
    Given I logged in as "darshan" with password "wrong"
    And I am still on the login page
    When I log in as "darshan" with password "dummy"
    Then I am on "/welcome/darshan"

  Scenario: A correct login lands on the welcome page for darshan
    When I log in as "darshan" with password "dummy"
    Then I am on "/welcome/darshan"
    And the page greets me with "Hi, darshan"
    And the header offers Home, Yours Todo Lists and LogOut but not LogIn

  Scenario: Logging out returns to the login page and protected pages are closed again
    Given I am logged in as "darshan" and viewing my todo list
    When I click LogOut in the header
    Then I am on the login page
    And the header offers LogIn but not LogOut
    When I navigate in the app to "/list-todos"
    Then I am on the login page
    And no todos are listed

  Scenario Outline: A protected page redirects to the login page when logged out
    When I open "<path>" directly
    Then I am redirected to the login page

    Examples:
      | path             |
      | /welcome/darshan |
      | /list-todos      |
      | /list-todos/-1   |
      | /list-todos/1    |
      | /logout          |

  Scenario: Reloading a protected page logs the user out
    Given I am logged in as "darshan" and viewing my todo list
    When I refresh the page
    Then I am redirected to the login page
    And no todos are listed

  Scenario: Header and welcome links move between the pages
    Given I am logged in as "darshan"
    When I click "Yours Todo Lists" in the header
    Then I am on the todo list
    When I click "Home" in the header
    Then I am on "/welcome/darshan"
    When I click "here" on the welcome page
    Then I am on the todo list

  Scenario: The Add New Todo button opens an empty create form
    Given I am logged in as "darshan" and viewing my todo list
    When I click the add-todo call to action
    Then I am on "/list-todos/-1"
    And the description and target date are empty and Done is unchecked
    And the Save button is disabled

  Scenario Outline: Update opens the edit form with the values of the todo prefilled
    Given localStorage holds the three default todos for "darshan"
    And I am logged in as "darshan" and viewing my todo list
    When I click Update on the todo with id <id>
    Then I am on "/list-todos/<id>"
    And the description is "<description>", the target date is "<date>" and Done is <done>

    Examples:
      | id | description                 | date       | done      |
      | 1  | Learn React fundamentals    | 2030-01-10 | unchecked |
      | 3  | Write project documentation | 2029-12-01 | checked   |

  Scenario: An unknown address shows the 404 page
    When I open "/no-such-page" directly
    Then the page shows "404 NOT FOUND"
