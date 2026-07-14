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
