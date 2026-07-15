Feature: 9.0 Keyboard Interaction & Responsive Layout
    As a visitor driving the page from a keyboard, or opening it on a phone
    I want Esc to reliably undo whatever I just did, a shortcut that jumps me to search, and a board
    that stays usable at phone width
    So that the page works in the situation I actually arrived in, rather than only on a desktop
    with a mouse


# --------------------------------------------------------------------------------------------------
# Note
# --------------------------------------------------------------------------------------------------
#
# This feature file was created 2026-07-15 (Cycle 2) from the issue #4 critical review. It covers
# ConOps Scenarios 10 (mobile visit) and 11 (keyboard interaction), and issue #4 findings A4
# (dead Esc / popover backdrop swallowing clicks) and A5 (390px viewport crushing the board).
#
# Both halves of this file exist for the same reason: a recruiter opening the link from a phone,
# or a keyboard-driven evaluator, is a real and likely visitor. For them these are not polish
# requirements — they are whether the artifact works at all.
#


# --------------------------------------------------------------------------------------------------
# Search Focus Shortcut
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-09-O0Wu0vg] The /graph page shall move keyboard focus to the header search input when the visitor presses Ctrl+K or the forward-slash key
    #
    # Note:
    #   1. Two triggers, one behavior — Ctrl+K is the convention a technical evaluator will reach
    #      for by reflex, "/" the one a keyboard-first user will.
    #   2. "/" must not steal focus while the visitor is already typing in a text field, or the
    #      character could never be typed into a query.
    #
    Given a visitor is viewing /graph with focus outside any text input
    When the visitor presses Ctrl+K
    Then the header search input should receive keyboard focus
    And pressing the forward-slash key from the same starting state should also move focus to the header search input
    And pressing the forward-slash key while focus is already inside a text input should insert the character rather than move focus


# --------------------------------------------------------------------------------------------------
# Esc De-escalation Chain
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-09-gEPQ6wm] The /graph page shall clear the search query and remove focus from the search input when the visitor presses Esc while the search input is focused
    Given a visitor has typed a query into the focused header search input
    When the visitor presses Esc
    Then the search input should be empty
    And the search input should no longer hold keyboard focus
    And the graph should return to its unfiltered appearance

Scenario: [TOR-09-a6cppkl] The /graph page shall clear the current node selection when the visitor presses Esc while a node is selected, returning the side panel to the start-anywhere card
    Given a visitor has clicked a node, and the side panel shows its detail with connector lines or connection dimming active
    When the visitor presses Esc
    Then the node selection should clear
    And the side panel should display the start-anywhere onboarding card
    And any connector lines, selection ring, and connection dimming should be removed from the graph

Scenario: [TOR-09-4BewmC1] The /graph page shall close the Options popover when the visitor presses Esc, leaving the underlying page immediately clickable
    #
    # Note:
    #   1. Issue #4 finding A4: the popover's backdrop remained mounted and swallowed the next
    #      click, so the visitor's first click after dismissing did nothing. A control that eats
    #      the click after it reads as a broken page, not a quirk.
    #
    Given a visitor has opened the Options popover on /graph
    When the visitor presses Esc
    Then the Options popover should close
    And the visitor's next click on the graph board should register on the board, selecting the clicked node

Scenario: [TOR-09-L9qGFOu] The /graph page shall exit the guided tour when the visitor presses Esc during a tour step
    Given a visitor is on a step of the guided tour
    When the visitor presses Esc
    Then the tour should exit, with its captions and step indicator no longer displayed
    And the step's node should remain selected per TOR-08-RCP0xbr

Scenario: [TOR-09-YrywFkB] The /graph page shall de-escalate exactly one UI state per Esc press, in the order tour, then Options popover, then search, then node selection
    #
    # Note:
    #   1. This binds the precedence between the individual Esc requirements above when more than
    #      one state is active at once. Esc must peel one layer per press — never clear several
    #      states at once, and never skip the innermost one.
    #   2. The advertised behavior in the stats footer hint (TOR-08-AzJ7BQu) is this chain.
    #
    Given a visitor has a node selected, a query typed in the search input, and the Options popover open
    When the visitor presses Esc once
    Then the Options popover should close
    And the search input should still contain the query
    And the node should still be selected
    And a second Esc press should clear the search query while leaving the node selected
    And a third Esc press should clear the node selection


# --------------------------------------------------------------------------------------------------
# Responsive Layout at the 390px Floor
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-09-ULogLhW] The /graph page shall render the graph board at a usable width occupying the majority of the viewport at a 390px viewport width
    #
    # Note:
    #   1. Issue #4 finding A5: a fixed w-80 side panel alongside non-responsive columns left the
    #      board a ~50px sliver at phone width — a broken page for the single most likely way a
    #      recruiter opens a link.
    #   2. 390px is the declared design floor (ConOps §8).
    #
    Given a visitor loads /graph at a viewport width of 390px
    When the page renders
    Then the graph board should occupy at least 80 percent of the viewport width
    And the side panel should not render as a fixed-width column alongside the board

Scenario: [TOR-09-Gx908bc] The /graph page shall present the side panel as a bottom sheet overlay, rather than a side column, when a node is selected at a 390px viewport width
    Given a visitor is viewing /graph at a viewport width of 390px with no node selected
    When the visitor taps a node
    Then the side panel should appear as a bottom sheet overlaying the lower portion of the viewport
    And the sheet should display that node's detail

Scenario: [TOR-09-FSqHlRx] The bottom sheet shall select the target node when a visitor taps a connected-page chip within it at a 390px viewport width
    Given the bottom sheet is displaying node A's detail at a viewport width of 390px
    When the visitor taps the connected-page chip for node B
    Then the bottom sheet should display node B's detail
    And node B should become the selected node in the graph

Scenario: [TOR-09-rOB5DZW] The /graph page shall leave the board interactive after the visitor dismisses the bottom sheet at a 390px viewport width
    Given the bottom sheet is open showing a node's detail at a viewport width of 390px
    When the visitor dismisses the sheet via its close control
    Then the bottom sheet should no longer overlay the board
    And tapping a node on the board should reopen the sheet with that node's detail

Scenario: [TOR-09-kMjRcRb] The /graph page shall render the header, search input, and hero row legibly and within the viewport at a 390px viewport width
    Given a visitor loads /graph at a viewport width of 390px
    When the page renders
    Then the header, the search input, and the hero row should each render fully within the viewport width
    And no horizontal scrollbar should be required to reach the search input
    And the search input should be large enough to accept a tap without zooming
