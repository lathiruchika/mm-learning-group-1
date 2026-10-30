# EPMCDMETST-70449 — Loading state, empty state with CTA
# EPMCDMETST-70450 — Per-row delete progress, success message, inline error + dismiss
# EPMCDMETST-70451 — Form save error retains values

Feature: UX resilience states

  Background:
    Given the app is running with VITE_API_MODE=dummy

  # ── Loading state — EPMCDMETST-70449 ───────────────────────────────────────

  @EPMCDMETST-70449
  Scenario: Loading spinner shown while todos are fetching
    Given VITE_DUMMY_API_LATENCY_MS is set to 1500
    When I open the app
    Then I see the todos-loading spinner
    And I eventually see the todos table

  # ── Empty state — EPMCDMETST-70449 ─────────────────────────────────────────

  @EPMCDMETST-70449
  Scenario: Empty state shown when user has no todos
    Given localStorage "mm.todos.v1" contains an empty array
    And localStorage "mm.todos.meta.v1" has schemaVersion 1
    When I open the app
    Then I see the empty state message
    And I see the "Add your first todo" CTA button

  @EPMCDMETST-70449
  Scenario: Clicking the Add CTA shows the form
    Given localStorage "mm.todos.v1" contains an empty array
    And localStorage "mm.todos.meta.v1" has schemaVersion 1
    When I open the app
    And I click the "Add your first todo" CTA
    Then the todo form is visible

  # ── Error state — EPMCDMETST-70449/70448 ───────────────────────────────────

  @EPMCDMETST-70448 @EPMCDMETST-70449
  Scenario: Error banner shown when todos fetch fails
    Given VITE_DUMMY_FAIL_RATE is set to 1
    When I open the app
    Then I see the todos error banner
    And the table is not visible

  @EPMCDMETST-70448 @EPMCDMETST-70449
  Scenario: Error banner contains a Retry button
    Given VITE_DUMMY_FAIL_RATE is set to 1
    When I open the app
    Then I see the todos error banner
    And the error banner has a Retry button

  @EPMCDMETST-70448 @EPMCDMETST-70449
  Scenario: Retry button re-attempts the fetch
    Given VITE_DUMMY_FAIL_RATE is set to 1
    When I open the app
    And I see the todos error banner
    And I click the Retry button
    Then I still see the todos error banner

  # ── Per-row delete progress — EPMCDMETST-70450 ─────────────────────────────

  @EPMCDMETST-70450
  Scenario: Delete button shows in-progress state during deletion
    Given I have seeded 3 default todos
    And VITE_DUMMY_API_LATENCY_MS is set to 1500
    When I open the app
    And I click Delete on todo "2"
    Then I see the deleting indicator for todo "2"
    And the Edit button for todo "2" is disabled

  @EPMCDMETST-70450
  Scenario: Row is removed after successful delete
    Given I have seeded 3 default todos
    When I open the app
    And I click Delete on todo "2"
    Then I do not see a row for todo "2"
    And the other rows are still visible

  @EPMCDMETST-70450
  Scenario: Success message shown briefly after delete
    Given I have seeded 3 default todos
    When I open the app
    And I click Delete on todo "1"
    Then I briefly see a "Deleted" success message

  @EPMCDMETST-70450
  Scenario: Inline delete error shown when delete fails
    Given I have seeded 3 default todos
    And localStorage writes are stubbed to fail
    When I open the app
    And I click Delete on todo "2"
    Then I see an inline delete error for todo "2"
    And the row for todo "2" is still visible

  @EPMCDMETST-70450
  Scenario: Inline delete error can be dismissed
    Given I have seeded 3 default todos
    And localStorage writes are stubbed to fail
    When I open the app
    And I click Delete on todo "2"
    And I see an inline delete error for todo "2"
    And I click "dismiss" inside the error
    Then I do not see the delete error for todo "2"

  # ── Form save error — EPMCDMETST-70451 ─────────────────────────────────────

  @EPMCDMETST-70448 @EPMCDMETST-70451
  Scenario: Save failure shows error banner and retains input values
    Given I have seeded 3 default todos
    And VITE_DUMMY_FAIL_RATE is set to 1
    When I open the app
    And I fill the description with "A perfectly valid todo description"
    And I fill the target date with "2026-11-30"
    And I click the Add Todo button
    Then I see the form error banner
    And the description field still shows "A perfectly valid todo description"
    And the target date field still shows "2026-11-30"

  @EPMCDMETST-70451
  Scenario: Submit button is disabled while save is in progress
    Given I have seeded 3 default todos
    And VITE_DUMMY_API_LATENCY_MS is set to 1500
    When I open the app
    And I fill the description with "Task being saved right now"
    And I fill the target date with "2026-12-15"
    And I click the Add Todo button
    Then the submit button shows "Saving…"
    And the submit button is disabled
