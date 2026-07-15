Feature: 2.0 Graph Rendering
    As a visitor
    I want to see the wiki content rendered as an interactive, force-directed graph
    So that I can explore and verify real engineering depth by directly interacting with a live artifact


# --------------------------------------------------------------------------------------------------
# Version Exposure and Error Messaging
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-02-k4HmFPL] The /graph page footer shall display the application name and current semantic version matching the value declared in package.json
    Given a visitor loads the /graph page
    When the page finishes rendering
    Then the page footer should contain a string matching /wiki-graph-explorer v\d+\.\d+\.\d+/

Scenario: [TOR-02-rG2HTvc] The /graph page shall display a user-facing error message naming the problem and the next user action when graph-data.json or vector-index.json fails to load
    Given graph-data.json is unreachable or returns an invalid response
    When a visitor loads the /graph page
    Then the page should display a visible message identifying that the graph data failed to load
    And the message should suggest a next action, such as reloading the page


# --------------------------------------------------------------------------------------------------
# Force-Directed Layout & Rendering
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-02-TW7XEms] The /graph page shall fetch graph-data.json and vector-index.json client-side on load and render all nodes and edges via react-force-graph without requiring any backend call after page load
    Given a visitor navigates to /graph
    When the page loads
    Then a force-directed graph should render containing a node for every entry in graph-data.json's nodes array
    And no network request should be made to any endpoint other than the static graph-data.json/vector-index.json assets

Scenario: [TOR-02-Hja6xEo] The /graph page shall render each edge from graph-data.json as a visible connecting line between the corresponding node pair
    Given graph-data.json contains an edge connecting node A and node B
    When the graph renders
    Then a visible connecting line should exist between node A and node B in the rendered graph


# --------------------------------------------------------------------------------------------------
# Node Coloring & Status Dots
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-02-AyzgOJs] The /graph page shall color each node according to its folder/taxonomy value, using a visually distinct color per distinct taxonomy cluster
    Given graph-data.json contains nodes spanning at least two distinct folder/taxonomy values
    When the graph renders
    Then nodes sharing the same folder/taxonomy value should render in the same color
    And nodes with different folder/taxonomy values should render in visually distinct colors

Scenario: [TOR-02-VIOZzEK] The /graph page shall render a small distinct status dot per node reflecting its status value (active, revisiting, or dormant), styled separately from the node's taxonomy color
    Given a node's status field is 'dormant'
    When the graph renders that node
    Then the node should display a status dot styled distinctly from its taxonomy-colored body, indicating 'dormant'


# --------------------------------------------------------------------------------------------------
# Hover and Click Interaction
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-02-6fwdtOM] The /graph page shall display a title tooltip when a visitor hovers over a node
    Given a visitor hovers the pointer over a rendered node
    When the hover begins
    Then a tooltip containing that node's title should become visible
    And the tooltip should disappear when the pointer moves away from the node

Scenario: [TOR-02-VLOPcgD] The /graph page shall center and zoom the view on a clicked node with an animated transition lasting approximately 900 milliseconds
    Given a visitor clicks a rendered node
    When the click is registered
    Then the graph view should animate to center on and zoom toward that node
    And the animation duration should be approximately 900ms, within an 800-1000ms tolerance


# --------------------------------------------------------------------------------------------------
# Empty and Large-Vault Edge Cases
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-02-mqgZkBc] The /graph page shall render correctly with an empty graph (zero nodes) without a visible error, displaying an empty-state message instead
    Given graph-data.json contains zero nodes and zero edges
    When a visitor loads the /graph page
    Then the page should display an empty-state message instead of a blank/broken canvas
    And no unhandled error should appear in the browser console

Scenario: [TOR-02-pRzSHQL] The /graph page shall remain interactive (pannable, zoomable, clickable) when rendering a graph of at least 40 nodes matching the seed public vault's target scale
    Given graph-data.json contains at least 40 nodes as produced by the seed public vault content
    When a visitor loads the /graph page and interacts with the graph
    Then panning, zooming, and node clicking should all remain responsive


# --------------------------------------------------------------------------------------------------
# Camera Framing & Reset (added 2026-07-15, Cycle 2 — issue #4 finding A2)
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-02-lcYAVDz] The /graph page shall fit the force-directed graph to the viewport on initial render so that every node is visible without the visitor panning or zooming
    #
    # Note:
    #   1. Issue #4 finding A2: the shipped page called zoomToFit only on the engine's stop event,
    #      so a first-time visitor was met with a tiny unreadable clump. The observable contract is
    #      the framing a visitor actually sees, not the API call that produces it.
    #
    Given graph-data.json contains at least 2 nodes
    When a visitor loads the /graph page and the force-directed layout settles
    Then every node should be positioned within the visible bounds of the graph canvas
    And the rendered graph should occupy a substantial portion of the canvas rather than a small clump at its center

Scenario: [TOR-02-3eqveD9] The /graph page shall render the force-directed graph at a zoom level where node labels are legible on initial load
    Given a visitor loads the /graph page with a graph of at least 40 nodes
    When the force-directed layout settles
    Then node labels should render at a legible size without the visitor zooming in

Scenario: [TOR-02-IrF7v8x] The /graph page shall provide a visible reset-view control that re-fits the force-directed camera so every node is visible when activated
    Given a visitor has panned and zoomed the force-directed view so that some nodes are outside the visible canvas bounds
    When the visitor activates the reset-view control
    Then the force-directed view should re-fit so that every node is visible within the canvas bounds


# --------------------------------------------------------------------------------------------------
# Selection Focus & Connection Emphasis (added 2026-07-15, Cycle 2 — issue #4 finding A6)
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-02-XgckKbI] The /graph page shall land a clicked node at the visual center of the graph canvas when its click-to-zoom animation completes
    #
    # Note:
    #   1. Issue #4 finding A6: the shipped page combined centerAt with a fixed zoom(6), landing the
    #      clicked node off-center. This requirement constrains the resting position, while
    #      TOR-02-VLOPcgD constrains the ~900ms animation that reaches it.
    #
    Given a visitor clicks a rendered node positioned away from the canvas center
    When the click-to-center-zoom animation completes
    Then that node's rendered position should be at the center of the graph canvas, within a tolerance of 5 percent of the canvas dimensions

Scenario: [TOR-02-dO7evaS] The /graph page shall render a selection ring or halo around the currently selected node, distinguishing it from every unselected node
    Given a visitor clicks a rendered node
    When the side panel opens for that node
    Then that node should render with a visible selection ring or halo not present on any other node
    And the selection ring should disappear when the selection is cleared

Scenario: [TOR-02-D3bxP8j] The /graph page shall highlight a selected node's directly connected nodes and edges while dimming nodes unrelated to the selection
    Given graph-data.json contains node A connected to node B, and node C with no edge to node A
    When a visitor clicks node A
    Then node B and the edge connecting A to B should render in a visually emphasized state
    And node C should render visually dimmed relative to node A and node B


# --------------------------------------------------------------------------------------------------
# Theme-Aware Rendering & Label Legibility (added 2026-07-15, Cycle 2 — issue #4 finding A6)
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-02-q6cZSCD] The /graph page shall render force-directed edge and link colors that remain visible against the active theme's canvas background in both dark and light themes
    Given a visitor is viewing the force-directed graph in dark theme
    When the visitor switches to light theme
    Then the rendered edge/link color should change to a color that remains visibly distinct from the light theme's canvas background
    And no edge should render in a color matching the canvas background in either theme

Scenario: [TOR-02-NyPLTRl] The /graph page shall hide force-directed node labels below a zoom threshold so that a zoomed-out view renders as readable nodes rather than overlapping text
    #
    # Note:
    #   1. Issue #4 finding A6: at low zoom every label rendered simultaneously, producing an
    #      unreadable wall of overlapping text. Labels return as the visitor zooms in.
    #
    Given a visitor is viewing a graph of at least 40 nodes zoomed out far enough that node labels would overlap
    When the graph renders at that zoom level
    Then node labels should not render
    And when the visitor zooms in past the threshold, node labels should render again
