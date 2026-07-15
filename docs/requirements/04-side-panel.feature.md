Feature: 4.0 Side Panel & Source Transparency
    As a visitor
    I want to click a node and see its page detail with a link to the real source
    So that I can verify the content is genuine and sourced, not placeholder text


# --------------------------------------------------------------------------------------------------
# Panel Open and Layout
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-04-I0T4GDu] The /graph page shall open a side panel showing page detail when a visitor clicks a node
    Given a visitor clicks a rendered node
    When the click is registered
    Then a side panel shall open displaying that node's page title

Scenario: [TOR-04-GOmpoij] The side panel shall populate with page detail without triggering a full page navigation, keeping the graph visible and in its current center/zoom state
    #
    # Note: amended 2026-07-15 during epic scQi8pt. Originally specified as a slide-in overlay
    # panel; the shipped design instead renders the side panel as an always-visible flex column
    # (placeholder text when no node is selected) that populates with content on node click,
    # rather than sliding in as an overlay. This was an explicit, live product decision made
    # during epic scQi8pt (cross-epic amendment to this epic's, V3PlLFL's, requirement) — see
    # epic scQi8pt's session handoff for the reconciliation record.
    #
    Given a visitor clicks a node
    When the side panel populates with that node's detail
    Then the browser URL should not perform a full page navigation/reload
    And the graph canvas should remain visible showing the same centered/zoomed node

Scenario: [TOR-04-tgCQzbT] The side panel shall return to its placeholder state when the visitor explicitly dismisses the selected node, returning full focus to the graph canvas
    #
    # Note: amended 2026-07-15 during epic scQi8pt. Originally specified as a slide-in overlay
    # that closes/unmounts; the shipped design keeps the side panel permanently mounted as an
    # always-visible column, so "dismissing" reverts it to its placeholder ("Select a node...")
    # text rather than closing/hiding the panel itself.
    #
    Given the side panel is showing a node's detail
    When the visitor clicks the close control on the panel
    Then the side panel should revert to its placeholder state
    And the graph canvas should remain in its current view state


# --------------------------------------------------------------------------------------------------
# Page Detail Content
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-04-OSiZDmK] The side panel shall display the node's title, tags, and status dot
    Given a visitor clicks a node whose frontmatter includes tags and a status
    When the side panel opens
    Then the panel should display that node's title, its tags, and a status dot matching its status value

Scenario: [TOR-04-p0sfy0j] The side panel shall display a list of the node's related nodes derived from its graph edges
    Given a visitor clicks a node connected to at least one other node by an edge
    When the side panel opens
    Then the panel should list each directly connected related node


# --------------------------------------------------------------------------------------------------
# Source Transparency
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-04-JCORp98] The side panel shall display a "View source on GitHub" link that opens the raw Markdown file for that page in a new tab
    Given a visitor clicks a node corresponding to a vault page at a known repository path
    When the side panel opens
    Then the panel should display a link labeled to view the source on GitHub
    And that link's href should point to the raw .md file for that page in the vault's GitHub repository

Scenario: [TOR-04-ldlbRRl] The side panel shall preserve its open state and displayed content when a visitor returns to the /graph browser tab after visiting the GitHub source link in a separate tab
    Given a visitor has the side panel open for a node and clicks the GitHub source link, which opens in a new tab
    When the visitor switches back to the original /graph tab
    Then the side panel should still be open showing the same node's detail as before


# --------------------------------------------------------------------------------------------------
# Rich Page Detail (added 2026-07-15, Cycle 2 — issue #4 finding B4)
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-04-iI9aJNn] The side panel shall display a folder badge for the selected node, colored to match that folder's color in the graph
    Given a visitor clicks a node whose folder/taxonomy value is 'change-management' and which renders in the graph in that folder's assigned color
    When the side panel populates with that node's detail
    Then the panel should display a badge labeled with that node's folder/taxonomy value
    And that badge's color should match the color used for the node in the graph

Scenario: [TOR-04-0igGafN] The side panel shall display the selected node's description from graph-data.json
    #
    # Note:
    #   1. The description is emitted by the build tool per TOR-01-FQuBqe1 (frontmatter) and
    #      TOR-01-r0LGd50 (first-body-paragraph fallback).
    #
    Given a visitor clicks a node whose graph-data.json entry has a non-empty 'description' field
    When the side panel populates with that node's detail
    Then the panel should display that node's description text

Scenario: [TOR-04-olJvPNV] The side panel shall omit the description area entirely, without rendering an empty gap or placeholder, when the selected node's description is empty
    Given a visitor clicks a node whose graph-data.json entry has an empty 'description' field
    When the side panel populates with that node's detail
    Then no description text or empty description placeholder should render in the panel
    And the panel's remaining detail (title, folder badge, status dot, tags, connected pages) should render normally


# --------------------------------------------------------------------------------------------------
# Connected-Page Navigation (added 2026-07-15, Cycle 2 — issue #4 finding B4)
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-04-xeqtJpo] The side panel shall render the selected node's connected pages as clickable chips grouped under their folder/taxonomy headings
    #
    # Note:
    #   1. This strengthens TOR-04-p0sfy0j (which requires only that related nodes be listed) into a
    #      navigable surface. Both requirements hold — a grouped chip list is also a list.
    #   2. Issue #4 finding B4: the shipped panel rendered related pages as plain text, making the
    #      panel a navigation dead end.
    #
    Given a visitor clicks a node connected to 2 pages in folder 'concepts' and 1 page in folder 'sources'
    When the side panel populates with that node's detail
    Then the panel should display a "Connected pages" section
    And that section should group the 2 'concepts' chips under a 'concepts' heading and the 1 'sources' chip under a 'sources' heading
    And each connected page should render as a distinct clickable chip labeled with that page's title

Scenario: [TOR-04-1iMsnYq] The side panel shall select the target node, updating both the graph focus and the panel content, when a visitor clicks a connected-page chip
    Given the side panel is showing node A's detail with a connected-page chip for node B
    When the visitor clicks node B's chip
    Then the side panel should populate with node B's detail
    And node B should become the selected node in the graph, receiving the same focus treatment as a directly clicked node


# --------------------------------------------------------------------------------------------------
# Source Link Resolution (added 2026-07-15, Cycle 2 — issue #4 finding A3)
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-04-Pc0DlQe] The side panel's "View source on GitHub" link shall resolve to an existing file for every node in the deployed public vault build
    #
    # Note:
    #   1. Issue #4 finding A3: the shipped link joined 'public-vault/wiki' with a path that was
    #      already vault-root-relative, producing a doubled segment, so every source link 404'd.
    #      TOR-04-JCORp98 already requires the href to point at the page's raw .md file; this
    #      requirement binds the stronger, end-to-end observable — that the URL actually resolves.
    #   2. Depends on the repository being public (TOR-10-vaZLdHp) for anonymous resolution.
    #
    Given the deployed /graph page built from the public vault
    When each node's "View source on GitHub" link href is requested
    Then every such request should return an HTTP 200 response
    And no such href should contain a duplicated path segment such as 'wiki/wiki'
