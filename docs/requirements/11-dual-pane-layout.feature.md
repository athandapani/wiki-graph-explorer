Feature: 11.0 Dual-Pane Graph View
    As a visitor on a wide-screen device
    I want to view the force-directed and swim-lane layouts side by side
    So that I can compare the same dataset through both presentation styles at once without losing selection state


# --------------------------------------------------------------------------------------------------
# Pane-Count Control
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-11-45utBRH] Above the wide-screen breakpoint, the /graph page shall display a pane-count control positioned beside the Options & help hamburger, independent of the layout-mode toggle
    Given a visitor loads /graph on a viewport at or above the wide-screen breakpoint
    When the page finishes rendering
    Then a pane-count control should be visible beside the Options & help hamburger
    And activating it should not change the state of the layout-mode toggle

Scenario: [TOR-11-6XjR1qm] Activating the pane-count control shall switch the board from 1-pane to 2-pane mode, rendering both the swim-lane and force-directed layouts side by side at approximately half width each
    Given a visitor is on /graph in 1-pane mode above the wide-screen breakpoint
    When the visitor activates the pane-count control
    Then the board should render both the swim-lane and force-directed layouts simultaneously
    And each layout should occupy approximately half the board's width

Scenario: [TOR-11-XOBsafW] In 2-pane mode, the swim-lane layout shall always render as the left pane and the force-directed layout as the right pane, regardless of which mode was active before switching
    #
    # Note: amended 2026-07-18 — change-control event, user-approved directly (not run through
    # /peak-workflow:capture-requirements as a separate docs/ branch pass, given the small,
    # immediate scope; documented here per the same amendment convention as TOR-06-AFMTHM6).
    #
    # This requirement originally read: "In 2-pane mode, whichever layout mode was active before
    # switching shall render as the primary pane, with the other mode filling the second pane."
    # Live use during wrapup-epic verification showed the "whichever was active" rule made pane
    # position unpredictable — the same visitor action (activating 2-pane mode) could land
    # swim-lane on either side depending on unrelated prior navigation. A fixed left/right
    # assignment is simpler to learn and remember. TOR-11-qzGSh7K's last-interacted-pane tracking
    # for the return-to-1-pane behavior is unaffected — it never depended on pane position.
    #
    Given a visitor is on /graph in 1-pane force-directed mode
    When the visitor activates the pane-count control
    Then the swim-lane layout should render as the left pane
    And the force-directed layout should render as the right pane


# --------------------------------------------------------------------------------------------------
# Synced Selection Across Panes
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-11-y75iqea] Clicking a node in one pane while in 2-pane mode shall focus that same node in the other pane and update the shared side panel with that node's detail
    Given a visitor is viewing /graph in 2-pane mode
    When the visitor clicks a node in the force-directed pane
    Then the same node should become focused in the swim-lane pane, with its connector lines or highlighting activated there
    And the shared side panel should display that node's detail

Scenario: [TOR-11-edqY3uP] Clicking a different node in the other pane shall update focus in both panes and the side panel together
    Given a visitor is viewing /graph in 2-pane mode with a node already focused
    When the visitor clicks a different node in the swim-lane pane
    Then focus should update to the newly clicked node in both the swim-lane and force-directed panes
    And the shared side panel should update to reflect the newly clicked node's detail


# --------------------------------------------------------------------------------------------------
# Returning to 1-Pane & Responsive Floor
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-11-qzGSh7K] Deactivating the pane-count control while in 2-pane mode shall return the board to 1-pane mode, showing whichever layout mode was last focused or interacted with
    Given a visitor is viewing /graph in 2-pane mode, having last interacted with the swim-lane pane
    When the visitor deactivates the pane-count control
    Then the board should return to 1-pane mode
    And the swim-lane layout should be the one displayed

Scenario: [TOR-11-TFakQZA] Below the wide-screen breakpoint, the pane-count control shall be hidden and the board shall render in 1-pane mode only
    Given a visitor loads /graph on a viewport below the wide-screen breakpoint
    When the page finishes rendering
    Then the pane-count control should not be visible
    And the board should render exactly one layout mode

Scenario: [TOR-11-Umq6yH6] If a visitor resizes the browser below the wide-screen breakpoint while in 2-pane mode, the board shall automatically fall back to 1-pane mode
    #
    # Note:
    #   1. This is the explicit auto-fallback precedent named in the discovery changelog,
    #      consistent with the existing 390px responsive floor rather than a new forceable mode.
    #
    Given a visitor is viewing /graph in 2-pane mode above the wide-screen breakpoint
    When the visitor resizes the viewport below the wide-screen breakpoint
    Then the board should automatically switch to 1-pane mode
    And the pane-count control should become hidden


# --------------------------------------------------------------------------------------------------
# No Data Refetch
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-11-73Scw5U] Switching between 1-pane and 2-pane mode shall not trigger a new network request for graph-data.json or vector-index.json
    Given the /graph page has already fetched graph-data.json and vector-index.json for the current session
    When a visitor activates or deactivates the pane-count control
    Then no new network request should be made for graph-data.json or vector-index.json
