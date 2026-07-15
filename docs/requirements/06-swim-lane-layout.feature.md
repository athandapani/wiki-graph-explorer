Feature: 6.0 Layout Mode Toggle & Swim-Lane Rendering
    As a visitor
    I want to switch between the open-ended force-directed graph view and a tiered, presentation-style swim-lane view
    So that I can explore the wiki content the way the original Nate Herk "AI Stack, Connected" reference demo presented it, in addition to free-form force-directed exploration


# --------------------------------------------------------------------------------------------------
# Layout Mode Toggle
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-06-DRtjcOk] The /graph page shall provide a persistent control for switching between force-directed and swim-lane rendering modes
    #
    # Note: amended 2026-07-15 during epic scQi8pt. Originally specified as a directly-visible
    # toggle; the shipped design instead uses a persistent "Options & help" button (always
    # visible on the page) that opens a panel containing the layout-mode toggle. This was an
    # explicit, live product decision, not a silent implementation drift — see epic scQi8pt's
    # session handoff for the reconciliation record.
    #
    Given a visitor loads the /graph page
    When the page finishes rendering
    Then a visible, persistent control for opening layout-mode options should be present on the page
    And opening that control and activating the layout-mode toggle within it should switch the rendered graph between force-directed and swim-lane modes

Scenario: [TOR-06-mvJp8Oa] The /graph page shall switch between layout modes without making a new network request for graph-data.json or vector-index.json
    Given the /graph page has already fetched graph-data.json and vector-index.json for the current session
    When a visitor activates the layout-mode toggle
    Then no new network request should be made for graph-data.json or vector-index.json
    And the mode switch should complete without a full page reload

Scenario: [TOR-06-AFMTHM6] The /graph page shall restore the force-directed view's prior pan/zoom state when a visitor toggles from swim-lane mode back to force-directed mode
    Given a visitor has panned or zoomed the force-directed view to a non-default position
    And the visitor toggles to swim-lane mode
    When the visitor toggles back to force-directed mode
    Then the force-directed view should render at the same pan/zoom position it held immediately before switching to swim-lane mode


# --------------------------------------------------------------------------------------------------
# Swim-Lane Board Layout
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-06-6dbr9Jn] The /graph page shall render nodes in swim-lane mode grouped into horizontal lanes by folder/taxonomy value, with at most 4 lanes visible
    Given graph-data.json contains nodes spanning at least two distinct folder/taxonomy values
    When a visitor switches to swim-lane mode
    Then nodes sharing the same folder/taxonomy value should render within the same horizontal lane
    And no more than 4 horizontal lanes should be rendered

Scenario: [TOR-06-a3pVfbc] The /graph page shall collapse folder/taxonomy values beyond the 4 largest into a single shared "Other" lane in swim-lane mode
    #
    # Note:
    #   1. "Largest" is measured by node count per folder/taxonomy value at build time.
    #   2. Ties are broken deterministically (e.g., alphabetical by folder name) so lane
    #      assignment is stable across renders of the same graph-data.json.
    #
    Given graph-data.json contains more than 4 distinct folder/taxonomy values
    When a visitor switches to swim-lane mode
    Then the 4 largest folder/taxonomy values should each render in their own lane
    And nodes belonging to all remaining folder/taxonomy values should render together in a single lane labeled "Other"

Scenario: [TOR-06-hCQUwZW] The /graph page shall render each node in swim-lane mode as a labeled pill shape displaying the node's title
    Given a visitor is viewing swim-lane mode
    When a node renders within its lane
    Then the node should render as a rounded pill shape
    And the pill should display the node's title as inline text

Scenario: [TOR-06-0ZRtILL] The /graph page shall display all swim-lane mode lanes within the viewport without a vertical scrollbar at default viewport size
    Given graph-data.json contains nodes spanning more than 1 folder/taxonomy value
    And a visitor is viewing swim-lane mode at the default viewport size
    When the swim-lane board renders
    Then all rendered lanes should be visible without requiring vertical scrolling

Scenario: [TOR-06-RlMt9hc] The /graph page shall NOT pan or zoom the camera view when a visitor clicks a node in swim-lane mode
    Given a visitor is viewing swim-lane mode
    When the visitor clicks a pill node
    Then the swim-lane board's pan and zoom position should remain unchanged after the click


# --------------------------------------------------------------------------------------------------
# Click Interaction & Animated Connections
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-06-tq70ta7] The /graph page shall hide edges by default in swim-lane mode until a node is clicked
    Given a visitor switches to swim-lane mode
    And no node has yet been clicked
    When the swim-lane board renders
    Then no connector lines should be visible between nodes

Scenario: [TOR-06-pbVYver] The /graph page shall animate a curved connector line from a clicked node to each of its related nodes, drawing smoothly from source to destination over approximately 950 milliseconds
    Given a visitor is viewing swim-lane mode
    And graph-data.json contains an edge connecting node A and node B
    When the visitor clicks node A
    Then a curved connector line should animate drawing from node A to node B
    And the draw animation duration should be approximately 950ms, within a 900-1000ms tolerance
    And the line should render fully drawn from node A to node B once the animation completes

Scenario: [TOR-06-baMJL3X] The /graph page shall clear previously animated connector lines and draw new ones when a different node is clicked in swim-lane mode
    Given a visitor has clicked node A in swim-lane mode and its connector lines are fully drawn
    When the visitor clicks a different node, node C
    Then the connector lines previously drawn from node A should no longer be visible
    And new connector lines should animate drawing from node C to its related nodes

Scenario: [TOR-06-n4fJkbK] The /graph page shall open a side panel displaying the clicked node's page detail and a "View source on GitHub" link when a node is clicked in swim-lane mode
    Given a visitor is viewing swim-lane mode
    When the visitor clicks a pill node
    Then a side panel should open showing that node's title, tags, and status dot
    And the side panel should display a "View source on GitHub" link for that node


# --------------------------------------------------------------------------------------------------
# Empty and Large-Vault Edge Cases
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-06-NJmtnhV] The /graph page shall remain interactive (clickable) in swim-lane mode when rendering a graph of at least 40 nodes
    Given graph-data.json contains at least 40 nodes as produced by the seed public vault content
    When a visitor switches to swim-lane mode and clicks a pill node
    Then the click should register and its connector-line animation and side panel should open as expected

Scenario: [TOR-06-M0SNN90] The /graph page shall render swim-lane mode correctly with an empty graph (zero nodes), displaying an empty-state message instead of a blank canvas
    Given graph-data.json contains zero nodes and zero edges
    When a visitor switches to swim-lane mode
    Then the page should display an empty-state message instead of a blank/broken board
    And no unhandled error should appear in the browser console


# --------------------------------------------------------------------------------------------------
# Low-Connectivity Node Visibility
# --------------------------------------------------------------------------------------------------
#
# Added 2026-07-15 during epic scQi8pt. This section was captured retroactively: the
# behavior was implemented and live-tested against the real second-brain vault during the
# epic's UX redesign, before it had formal TOR coverage.
#

Scenario: [TOR-06-nQ4vXsD] The /graph page shall hide zero-degree nodes from the swim-lane board by default
    Given graph-data.json contains a node with zero edges
    When a visitor views swim-lane mode
    Then that node should not render on the board

Scenario: [TOR-06-Zk8pLwR] The /graph page shall reveal low-connectivity nodes in swim-lane mode when a connected node is clicked, rendered with a dashed style
    #
    # Note: "low-connectivity" means exactly one edge. Such nodes are hidden from the board by
    # default (same as zero-degree nodes) but, unlike zero-degree nodes, can be reached by a
    # click since something does link to them.
    #
    Given a node has exactly one edge and is hidden from the board by default
    When the visitor clicks the node it is connected to
    Then the low-connectivity node should appear within its lane, rendered with a dashed pill border
    And a dashed connector line should connect the clicked node to it
