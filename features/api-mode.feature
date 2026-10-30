# EPMCDMETST-70447 — API mode badge (dummy / real indicator in header)
# EPMCDMETST-70448 — Badge hints for active latency and fail-rate values

Feature: API mode badge

  Background:
    Given the app is open

  # ── Badge visibility — EPMCDMETST-70447 ─────────────────────────────────────

  @EPMCDMETST-70447
  Scenario: API mode badge is always visible in the navbar
    Then I see the app navbar
    And I see the api-mode-badge element

  @EPMCDMETST-70447
  Scenario: Badge shows "DUMMY API" when VITE_API_MODE=dummy (default)
    Given VITE_API_MODE is "dummy"
    Then the badge text contains "DUMMY API"

  @EPMCDMETST-70447
  Scenario: Badge shows "REAL API" when VITE_API_MODE=real
    Given VITE_API_MODE is "real"
    Then the badge text contains "REAL API"

  @EPMCDMETST-70447
  Scenario: Badge has accessible aria-label describing the active mode
    Given VITE_API_MODE is "dummy"
    Then the badge aria-label matches "API mode: dummy"

  @EPMCDMETST-70447
  Scenario: Badge title includes the VITE_API_MODE variable name and value
    Given VITE_API_MODE is "dummy"
    Then the badge title contains "VITE_API_MODE=dummy"

  # ── Badge hints — EPMCDMETST-70448 ──────────────────────────────────────────

  @EPMCDMETST-70448
  Scenario: Badge shows latency hint when VITE_DUMMY_API_LATENCY_MS > 0
    Given VITE_API_MODE is "dummy"
    And VITE_DUMMY_API_LATENCY_MS is 1500
    Then the badge text contains "1500ms latency"

  @EPMCDMETST-70448
  Scenario: Badge shows fail-rate hint when VITE_DUMMY_FAIL_RATE > 0
    Given VITE_API_MODE is "dummy"
    And VITE_DUMMY_FAIL_RATE is 0.3
    Then the badge text contains "30% fail"

  @EPMCDMETST-70448
  Scenario: Badge shows no hints in default safe mode
    Given VITE_API_MODE is "dummy"
    And VITE_DUMMY_API_LATENCY_MS is 0
    And VITE_DUMMY_FAIL_RATE is 0
    Then the badge text does not contain "latency"
    And the badge text does not contain "fail"
