# EPMCDMETST-70446 — Dummy API CRUD (localStorage persist, seed dataset, correct shape)
# EPMCDMETST-70451 — Form load/save/validation states

Feature: Todo CRUD via dummy API

  Background:
    Given localStorage is cleared
    And the app is running with VITE_API_MODE=dummy

  # ── Seeding ────────────────────────────────────────────────────────────────

  @EPMCDMETST-70446
  Scenario: First run seeds 3 default todos
    When I open the app
    Then I see the todos table
    And I see todo rows for ids "1", "2", and "3"

  @EPMCDMETST-70446
  Scenario: Seeded todos persist after page reload
    When I open the app
    And I reload the page
    Then I still see the todos table
    And I still see a row for todo "1"

  # ── Create ─────────────────────────────────────────────────────────────────

  @EPMCDMETST-70446 @EPMCDMETST-70451
  Scenario: Create a valid todo
    When I open the app
    And I fill the description with "Write Playwright tests now"
    And I fill the target date with "2026-11-20"
    And I click the Add Todo button
    Then I see "Write Playwright tests now" in the todos table

  @EPMCDMETST-70446 @EPMCDMETST-70451
  Scenario: New todo persists after page reload
    When I open the app
    And I fill the description with "Persistent new todo item"
    And I fill the target date with "2026-12-01"
    And I click the Add Todo button
    And I reload the page
    Then I see "Persistent new todo item" in the todos table

  @EPMCDMETST-70451
  Scenario: Form resets after successful create
    When I open the app
    And I fill the description with "Another brand new task"
    And I fill the target date with "2026-11-25"
    And I click the Add Todo button
    Then the description field is empty
    And the target date field is empty

  # ── Validation ─────────────────────────────────────────────────────────────

  @EPMCDMETST-70451
  Scenario: Validation error for short description
    When I open the app
    And I fill the description with "short"
    And I fill the target date with "2026-11-15"
    And I click the Add Todo button
    Then I see a description error "Description must be at least 8 characters"

  @EPMCDMETST-70451
  Scenario: Validation error for missing target date
    When I open the app
    And I fill the description with "A valid description here"
    And I click the Add Todo button
    Then I see a target date error "Target date is required"

  @EPMCDMETST-70451
  Scenario: Both validation errors shown for empty form
    When I open the app
    And I click the Add Todo button
    Then I see a description error
    And I see a target date error

  # ── Edit ───────────────────────────────────────────────────────────────────

  @EPMCDMETST-70446 @EPMCDMETST-70451
  Scenario: Edit pre-fills form with existing todo data
    When I open the app
    And I click Edit on todo "1"
    Then the description field has a value
    And the target date field has a value
    And I see the Done checkbox
    And I see the Cancel button

  @EPMCDMETST-70446 @EPMCDMETST-70451
  Scenario: Update todo description persists after reload
    When I open the app
    And I click Edit on todo "1"
    And I fill the description with "Buy groceries for next two weeks"
    And I click the Update button
    And I reload the page
    Then I see "Buy groceries for next two weeks" in the todos table

  @EPMCDMETST-70451
  Scenario: Cancel returns to add mode
    When I open the app
    And I click Edit on todo "1"
    And I click Cancel
    Then I do not see the Done checkbox
    And I do not see the Cancel button
    And the submit button shows "Add Todo"

  # ── Delete ─────────────────────────────────────────────────────────────────

  @EPMCDMETST-70446 @EPMCDMETST-70450
  Scenario: Delete removes todo from list
    When I open the app
    And I click Delete on todo "2"
    Then I do not see a row for todo "2"

  @EPMCDMETST-70446 @EPMCDMETST-70450
  Scenario: Deleted todo does not reappear after reload
    When I open the app
    And I click Delete on todo "2"
    And I reload the page
    Then I do not see a row for todo "2"
