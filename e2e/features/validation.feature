@EPMCDMETST-70467 @validation
Feature: Todo form validation and inline feedback
  As a user of the Todo app
  I want immediate, specific feedback on invalid input
  So that I cannot save a bad todo and know how to fix it

  Rules:
  - Description is trimmed, required and needs at least 8 characters (counted as code points)
  - Target date is required and must be a real YYYY-MM-DD date
  - Save is disabled while the form is invalid
  - Errors show once a field has been touched (on an existing invalid todo they show immediately)

  Background:
    Given the browser has a clean localStorage
    And the login page is open

  Rule: Create form

  Background:
    Given I am logged in as "darshan" and viewing my todo list
    And I open the create todo form

  Scenario: A pristine create form has Save disabled and shows no errors yet
    Then the Save button is disabled
    And no inline error is shown

  Scenario Outline: An invalid description blocks saving with an inline message
    Given the target date is "2030-01-15"
    When I enter the description "<description>" and leave the field
    Then the description error contains "<message>"
    And the Save button is disabled

    # Placeholders: {8 spaces} = eight space characters, {padded abc} = "   abc   ", {7 emoji} = seven emoji
    Examples:
      | case                            | description   | message                 |
      | whitespace only                 | {8 spaces}    | Description is required |
      | fewer than 8 characters         | abcdefg       | at least 8 characters   |
      | too short once padding trimmed  | {padded abc}  | at least 8 characters   |
      | 7 emoji                         | {7 emoji}     | at least 8 characters   |

  Scenario: A missing target date blocks saving with an inline message
    Given the description is "A valid description"
    When I focus the target date field and leave it empty
    Then the target date error contains "Target date is required"
    And the Save button is disabled

  Scenario: A partially entered target date is not accepted
    Given the description is "A valid description"
    When I type only a month into the target date field and leave it
    Then a target date error is shown
    And the Save button is disabled

  Scenario: An impossible calendar date is rejected
    Given the description is "A valid description"
    When the target date field contains the text "2025-02-30"
    Then the target date error contains "valid date"
    And the Save button is disabled

  Scenario: Valid input saves and returns to the list
    When I enter the description "Water the garden plants" and the target date "2030-04-20"
    Then the Save button is enabled
    When I click Save
    Then I am back on the todo list
    And "Water the garden plants" is listed

  Scenario: Surrounding whitespace is trimmed when saving
    When I enter the description "   Trim these spaces   " and the target date "2030-04-21"
    And I click Save
    Then the stored description is "Trim these spaces"

  Scenario: Errors clear after the description is corrected
    Given the target date is "2030-01-15"
    And I entered the description "abc" and left the field
    And the description error is shown
    When I enter the description "Now it is long enough" and leave the field
    Then no description error is shown
    And the Save button is enabled

  Scenario: Errors clear after the target date is corrected
    Given the description is "A valid description"
    And I focused the target date field and left it empty
    And the target date error is shown
    When I enter the target date "2030-01-15"
    Then no target date error is shown
    And the Save button is enabled

  Scenario: A description of exactly 8 emoji is accepted
    When I enter the description of 8 emoji and the target date "2030-02-02"
    Then no description error is shown
    And the Save button is enabled
    When I click Save
    Then the todo with 8 emoji is listed

  Scenario: Cancel leaves the form without saving
    When I enter the description "Never to be saved" and the target date "2030-03-03"
    And I click Cancel
    Then I am back on the todo list
    And "Never to be saved" is not listed

  Rule: Editing an existing todo

  Background:
    Given localStorage holds a todo "short" dated "2030-01-01" for "darshan"
    And I am logged in as "darshan"

  Scenario: An existing todo that breaks the rules shows its errors immediately
    When I open that todo for editing
    Then the description error is shown without touching the field
    And the Save button is disabled

  Scenario: Fixing an invalid existing todo allows saving
    Given I open that todo for editing
    When I enter the description "Now long enough to save" and leave the field
    And I click Save
    Then "Now long enough to save" is listed
