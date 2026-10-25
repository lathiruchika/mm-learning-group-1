import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  MIN_DESCRIPTION_LENGTH,
  hasErrors,
  toIsoDate,
  validateDescription,
  validateTargetDate,
  validateTodo,
} from '../../src/components/validation.js'

// EPMCDMETST-66717: pure validation rules. "Today" is fixed so the date tests
// never depend on when they run. Month is 0-based: (2026, 9, 25) is 2026-10-25.
const TODAY = new Date(2026, 9, 25)

test('the minimum description length is 8', () => {
  assert.equal(MIN_DESCRIPTION_LENGTH, 8)
})

test('toIsoDate formats the local calendar date with zero padding', () => {
  assert.equal(toIsoDate(new Date(2026, 0, 5)), '2026-01-05')
  assert.equal(toIsoDate(TODAY), '2026-10-25')
})

test('a description is required', () => {
  assert.equal(validateDescription(''), 'Description is required')
  assert.equal(validateDescription('        '), 'Description is required')
  assert.equal(validateDescription(undefined), 'Description is required')
  assert.equal(validateDescription(null), 'Description is required')
})

test('a description needs at least 8 characters after trimming', () => {
  assert.match(validateDescription('short'), /at least 8 characters/)
  assert.match(validateDescription('  1234567  '), /at least 8 characters/) // 7 trimmed
  assert.equal(validateDescription('12345678'), null)
  assert.equal(validateDescription('  12345678  '), null)
})

test('the target date is optional', () => {
  assert.equal(validateTargetDate('', TODAY), null)
  assert.equal(validateTargetDate('   ', TODAY), null)
  assert.equal(validateTargetDate(undefined, TODAY), null)
})

test('today and future dates are accepted', () => {
  assert.equal(validateTargetDate('2026-10-25', TODAY), null)
  assert.equal(validateTargetDate('2026-10-26', TODAY), null)
  assert.equal(validateTargetDate('2099-01-01', TODAY), null)
})

test('a date in the past is rejected, including yesterday', () => {
  assert.equal(validateTargetDate('2026-10-24', TODAY), 'Target date cannot be in the past')
  assert.equal(validateTargetDate('2020-01-01', TODAY), 'Target date cannot be in the past')
})

test('dates that are not real calendar dates are rejected', () => {
  const message = 'Target date must be a valid date'
  assert.equal(validateTargetDate('2026-02-31', TODAY), message) // would roll over to March
  assert.equal(validateTargetDate('2026-13-01', TODAY), message)
  assert.equal(validateTargetDate('2026-00-10', TODAY), message)
  assert.equal(validateTargetDate('2027-02-29', TODAY), message) // not a leap year
})

test('a leap day is accepted in a leap year', () => {
  assert.equal(validateTargetDate('2028-02-29', TODAY), null)
})

test('malformed date strings are rejected', () => {
  const message = 'Target date must be a valid date'
  assert.equal(validateTargetDate('25/10/2026', TODAY), message)
  assert.equal(validateTargetDate('2026-1-5', TODAY), message)
  assert.equal(validateTargetDate('not-a-date', TODAY), message)
})

test('validateTodo reports each field independently', () => {
  const errors = validateTodo({ description: 'short', targetDate: '2020-01-01' }, TODAY)
  assert.match(errors.description, /at least 8/)
  assert.equal(errors.targetDate, 'Target date cannot be in the past')
  assert.equal(hasErrors(errors), true)
})

test('validateTodo passes a valid todo, with or without a date', () => {
  assert.equal(
    hasErrors(validateTodo({ description: 'Write the report', targetDate: '2026-11-01' }, TODAY)),
    false,
  )
  assert.equal(
    hasErrors(validateTodo({ description: 'Write the report', targetDate: '' }, TODAY)),
    false,
  )
})

test('hasErrors is false only when every field is clean', () => {
  assert.equal(hasErrors({ description: null, targetDate: null }), false)
  assert.equal(hasErrors({ description: 'x', targetDate: null }), true)
  assert.equal(hasErrors({ description: null, targetDate: 'x' }), true)
})
