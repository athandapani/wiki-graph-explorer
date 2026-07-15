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
