import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  DEFAULT_VIEW,
  applySearchFilterSort,
  isViewActive,
} from '../../src/components/listUtils.js'

// EPMCDMETST-58998: pure list logic, no browser or DOM needed.

const TODOS = [
  { id: 1, description: 'Buy Milk', targetDate: '2026-11-03', done: false },
  { id: 2, description: 'write report', targetDate: '2026-10-30', done: true },
  { id: 3, description: 'Call mom', targetDate: '', done: false },
  { id: 4, description: 'milk the cow', targetDate: '2026-12-01', done: true },
]

const ids = (list) => list.map((t) => t.id)
const view = (patch) => ({ ...DEFAULT_VIEW, ...patch })

test('the default view returns every todo in original order', () => {
  assert.deepEqual(ids(applySearchFilterSort(TODOS)), [1, 2, 3, 4])
  assert.deepEqual(ids(applySearchFilterSort(TODOS, DEFAULT_VIEW)), [1, 2, 3, 4])
})

test('search is case-insensitive and matches a substring', () => {
  assert.deepEqual(ids(applySearchFilterSort(TODOS, view({ search: 'MILK' }))), [1, 4])
  assert.deepEqual(ids(applySearchFilterSort(TODOS, view({ search: 'ilk' }))), [1, 4])
})

test('search trims whitespace, and a blank search matches everything', () => {
  assert.deepEqual(ids(applySearchFilterSort(TODOS, view({ search: '  mom  ' }))), [3])
  assert.deepEqual(ids(applySearchFilterSort(TODOS, view({ search: '   ' }))), [1, 2, 3, 4])
})

test('search tolerates a todo with a missing description', () => {
  const todos = [{ id: 9, targetDate: '', done: false }, ...TODOS]
  assert.deepEqual(ids(applySearchFilterSort(todos, view({ search: 'mom' }))), [3])
})

test('status filter: done and not-done', () => {
  assert.deepEqual(ids(applySearchFilterSort(TODOS, view({ status: 'done' }))), [2, 4])
  assert.deepEqual(ids(applySearchFilterSort(TODOS, view({ status: 'not-done' }))), [1, 3])
  assert.deepEqual(ids(applySearchFilterSort(TODOS, view({ status: 'all' }))), [1, 2, 3, 4])
})

test('sort by date ascending puts undated todos last', () => {
  assert.deepEqual(ids(applySearchFilterSort(TODOS, view({ sort: 'date-asc' }))), [2, 1, 4, 3])
})

test('sort by date descending still puts undated todos last', () => {
  assert.deepEqual(ids(applySearchFilterSort(TODOS, view({ sort: 'date-desc' }))), [4, 1, 2, 3])
})

test('equal dates keep their original relative order (stable sort)', () => {
  const todos = [
    { id: 1, description: 'a', targetDate: '2026-11-01', done: false },
    { id: 2, description: 'b', targetDate: '2026-11-01', done: false },
    { id: 3, description: 'c', targetDate: '2026-11-01', done: false },
  ]
  assert.deepEqual(ids(applySearchFilterSort(todos, view({ sort: 'date-asc' }))), [1, 2, 3])
  assert.deepEqual(ids(applySearchFilterSort(todos, view({ sort: 'date-desc' }))), [1, 2, 3])
})

test('search, status and sort combine', () => {
  const result = applySearchFilterSort(
    TODOS,
    { search: 'milk', status: 'done', sort: 'date-desc' },
  )
  assert.deepEqual(ids(result), [4])
})

test('a search with no matches returns an empty list', () => {
  assert.deepEqual(applySearchFilterSort(TODOS, view({ search: 'zzz' })), [])
})

test('the input list is never mutated', () => {
  const copy = JSON.parse(JSON.stringify(TODOS))
  applySearchFilterSort(TODOS, { search: 'milk', status: 'done', sort: 'date-desc' })
  assert.deepEqual(TODOS, copy)
})

test('isViewActive reports whether any control is set', () => {
  assert.equal(isViewActive(DEFAULT_VIEW), false)
  assert.equal(isViewActive(view({ search: '   ' })), false)
  assert.equal(isViewActive(view({ search: 'a' })), true)
  assert.equal(isViewActive(view({ status: 'done' })), true)
  assert.equal(isViewActive(view({ sort: 'date-asc' })), true)
})
