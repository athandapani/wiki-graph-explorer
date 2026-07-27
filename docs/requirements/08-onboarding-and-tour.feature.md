Feature: 8.0 Onboarding & Guided Tour
    As a first-time visitor arriving with no context about this project or its author
    I want the page to tell me what I am looking at, show me how to read it, and offer to walk me
    through it
    So that I start exploring within seconds instead of facing an unexplained canvas and leaving


# --------------------------------------------------------------------------------------------------
# Note
# --------------------------------------------------------------------------------------------------
#
# This feature file was created 2026-07-15 (Cycle 2) from the issue #4 critical review of the
# shipped /graph page against the "AI Stack, Connected" reference demo. It covers ConOps
# Scenarios 8 (cold-visitor onboarding) and 9 (guided tour).
#
# The emotional contract behind this whole file: a recruiter gives an unfamiliar page a few
# seconds before deciding it is a toy. Every requirement here buys part of that window back.
# A graph that renders perfectly but explains nothing fails the visitor exactly as badly as a
# graph that does not render.
#


# --------------------------------------------------------------------------------------------------
# Hero Row
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-08-qBVi9Aa] The /graph page shall display a hero row above the board stating the page's identity and a one-line promise inviting interaction
    #
    # Note:
    #   1. Issue #4 finding B1: the page opened straight into the canvas with no framing.
    #   2. "One-line promise" means a sentence naming what the map contains and what clicking does —
    #      e.g. "Every page of the research vault in one map. Click anything to see what it is and
    #      how it connects."
    #
    Given a visitor loads the /graph page
    When the page finishes rendering
    Then a hero row should be visible above the graph board without scrolling
    And the hero row should display the page's identity and a one-line statement of what the map is and how to interact with it


# --------------------------------------------------------------------------------------------------
# Start-Anywhere Onboarding Card
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-08-LuQzsEi] The side panel shall display a "Start anywhere" onboarding card, naming what the map is built from, whenever no node is selected
    #
    # Note:
    #   1. Issue #4 finding B2: the panel's empty state was a single gray sentence, wasting the
    #      largest uncommitted area on the page at the exact moment the visitor needs orientation.
    #   2. This replaces the placeholder state referenced by TOR-04-GOmpoij and TOR-04-tgCQzbT; the
    #      panel remains permanently mounted as an always-visible column, and this card IS its
    #      placeholder content.
    #
    Given a visitor loads the /graph page and has not selected a node
    When the side panel renders its empty state
    Then the panel should display a "Start anywhere" onboarding card
    And the card should display a line describing what the map's content is built from

Scenario: [TOR-08-xZxrwfj] The start-anywhere card shall display a folder legend mapping each folder/taxonomy color rendered in the graph to that folder's name
    #
    # Note:
    #   1. Issue #4 finding B3: nodes were color-coded with no key anywhere on the page, so the
    #      encoding carried no meaning for anyone who had not built it.
    #
    Given graph-data.json contains nodes spanning 4 distinct folder/taxonomy values
    When the start-anywhere card renders
    Then the card should display a legend entry for each of the 4 folder/taxonomy values
    And each legend entry should show that folder's name alongside the same color used for its nodes in the graph

Scenario: [TOR-08-hTq5dSY] The start-anywhere card shall display a status legend mapping each status dot style to its meaning for the values active, revisiting, and dormant
    Given a visitor views the start-anywhere card
    When the card renders
    Then the card should display a legend entry for each of the status values 'active', 'revisiting', and 'dormant'
    And each entry should show the status dot styling used in the graph alongside that status's name

Scenario: [TOR-08-Z2By5L0] The start-anywhere card shall suggest at least one concrete starting point for a visitor who does not know where to begin
    Given a visitor views the start-anywhere card
    When the card renders
    Then the card should display a suggestion naming a concrete first action, such as clicking a well-connected hub node or searching for a topic

Scenario: [TOR-08-zwMqZzr] The side panel shall replace the start-anywhere card with the selected node's detail when a visitor selects a node
    Given the side panel is displaying the start-anywhere onboarding card
    When the visitor clicks a node
    Then the start-anywhere card should no longer be displayed
    And the panel should display that node's detail

Scenario: [TOR-08-r0Nam2Q] The side panel shall restore the start-anywhere card when the visitor clears the current node selection
    Given the side panel is displaying a selected node's detail
    When the visitor clears the selection
    Then the panel should display the start-anywhere onboarding card again


# --------------------------------------------------------------------------------------------------
# Stats Footer
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-08-LQAbYTw] The /graph page shall display a stats footer presenting the vault's ingested source count, wiki page count, and connection count as a single derivation reading "Built from K raw sources → Y wiki pages and Z connections"
    #
    # Note:
    #   1. Issue #4 finding B7. Page and connection counts derive from graph-data.json's nodes and
    #      edges arrays; K derives from meta.sourceCount (TOR-01-vhBOpOz).
    #   2. The three figures are presented as ONE provenance sentence rather than three loose
    #      counts, because the raw→wiki derivation IS the technique this artifact exists to prove.
    #      "40 sources became 142 interlinked pages" is a checkable claim; "142 nodes" is trivia.
    #      A visitor can spot-check K against the source links themselves (TOR-04-Pc0DlQe).
    #   3. K and Y are deliberately different figures — one ingested source fans out into several
    #      wiki pages. A build where K equals Y would indicate the ingestion did no synthesis.
    #   4. Y counts pages present in graph-data.json, which is the count of wiki files that parsed
    #      successfully. A vault with malformed frontmatter has more files on disk than the footer
    #      reports, since those are skipped with a WARN per TOR-01-dEUM3Pp.
    #   5. Wording is deliberately plain: "ingest" and "raw source file" are this project's internal
    #      vocabulary, and the footer's job is orienting a cold visitor in seconds (ConOps S8).
    #   6. The footer also carries the "Esc to reset" hint (TOR-08-AzJ7BQu) and the version string
    #      (TOR-02-k4HmFPL). The null/zero-provenance case is bound by TOR-08-dkecfj5.
    #
    Given graph-data.json contains 142 nodes, 389 edges, and meta.sourceCount of 40
    When a visitor loads the /graph page
    Then a stats footer should display the text "Built from 40 raw sources → 142 wiki pages and 389 connections"
    And the source count, page count, and connection count should read in that order as a single sentence

Scenario: [TOR-08-dkecfj5] The /graph page's stats footer shall omit the provenance clause entirely, displaying only the page and connection counts, when the vault declares no ingested sources
    #
    # Note:
    #   1. This is what keeps the footer honest when the tool is pointed at a vault with no 'raw/'
    #      sibling — test fixtures, and any third-party vault (Product Vision §11). The tool's
    #      headline claim is that it renders ANY Karpathy-pattern wiki with zero per-vault code
    #      changes (Product Vision §5); a footer that only reads correctly against this project's
    #      own vault layout would quietly break that claim.
    #   2. Rendering "Built from 0 raw sources → 142 wiki pages" would read as broken software at
    #      the exact moment the footer is meant to establish credibility. Omission is not a
    #      degraded state here — a vault that ingested nothing simply has no provenance to claim,
    #      and saying nothing is the truthful rendering.
    #   3. Covers both meta.sourceCount null (no 'raw/' directory — TOR-01-gi1qoBS) and 0 ('raw/'
    #      present but empty — TOR-01-gYbfrvE). The two differ in the data, but neither supports a
    #      provenance claim, so both render identically.
    #
    Given graph-data.json contains 142 nodes, 389 edges, and meta.sourceCount of null
    When a visitor loads the /graph page
    Then the stats footer should display the text "142 wiki pages · 389 connections"
    And the footer should not display the words "Built from"
    And the footer should not display the numeral 0 or the word "null" as a source count
    And a graph-data.json with meta.sourceCount of 0 should render the same footer text

Scenario: [TOR-08-AzJ7BQu] The stats footer shall display an "Esc to reset" hint describing the Esc key's behavior on the page
    #
    # Note:
    #   1. The hinted behavior is bound by the Esc de-escalation chain in
    #      docs/requirements/09-keyboard-and-responsive.feature.md. A hint that advertises an
    #      affordance the page does not honor is worse than no hint (issue #4 finding A4).
    #
    Given a visitor loads the /graph page
    When the stats footer renders
    Then the footer should display a visible hint indicating that Esc resets the current view state


# --------------------------------------------------------------------------------------------------
# Guided Tour
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-08-NtvwEKk] The /graph page shall display a persistent "Take a tour" control that starts the guided tour when activated
    Given a visitor loads the /graph page
    When the page finishes rendering
    Then a visible control labeled to start a tour should be present on the page
    And activating that control should start the guided tour at its first step

Scenario: [TOR-08-8EHbtf3] The guided tour shall be driven by a static hand-curated tour definition of between 4 and 5 node ids with a caption for each step
    #
    # Note:
    #   1. ConOps §8 constraint: the tour path and captions are hand-curated against the demo vault
    #      and shipped as a static asset. The tour is never auto-generated, so a build against a
    #      different vault does not silently produce a nonsense tour.
    #
    Given the static tour-definition asset shipped with the application
    When that asset is inspected
    Then it should define an ordered list of between 4 and 5 node ids
    And each entry should carry a caption string

Scenario: [TOR-08-5Vj2zkG] The guided tour shall focus each step's node in the active layout mode and display that node's detail alongside the step's tour caption
    #
    # Note:
    #   1. "Focus in the active layout mode" means the force-directed center/zoom treatment in
    #      force-directed mode, and the connector-line animation in swim-lane mode — the tour rides
    #      the existing per-mode selection behavior rather than defining a third one.
    #
    Given a visitor starts the guided tour
    When the tour advances to a step
    Then the graph should focus that step's node using the active layout mode's node-selection behavior
    And the side panel should display that node's detail together with that step's tour caption

Scenario: [TOR-08-CE4svkF] The guided tour shall advance to the next node in the curated path when the visitor activates the "Next" control, with each consecutive pair of steps connected by a real edge in the graph
    #
    # Note:
    #   1. The consecutive-edge property is what makes the tour demonstrate the graph rather than
    #      merely slideshow through it — the visitor watches connections carry them forward.
    #      Verified against the shipped tour definition and graph-data.json together.
    #
    Given a visitor is on a non-final step of the guided tour
    When the visitor activates the "Next" control
    Then the tour should advance to the next node in the curated path
    And graph-data.json should contain an edge connecting the previous step's node and the newly focused node

Scenario: [TOR-08-XeNIfIf] The guided tour shall display a step indicator reporting the current step number and the total number of steps
    Given a guided tour with 5 curated steps
    When the visitor is on the second step
    Then the page should display a step indicator reporting step 2 of 5

Scenario: [TOR-08-GvZKcLR] The guided tour shall offer an "Explore on your own" control at its final step that exits the tour when activated
    Given a visitor has advanced the guided tour to its final step
    When the final step renders
    Then a control inviting the visitor to explore on their own should be visible
    And activating that control should exit the tour

Scenario: [TOR-08-RCP0xbr] The guided tour shall leave the current step's node selected in the graph and side panel when the tour is exited
    #
    # Note:
    #   1. Exiting a tour should hand the visitor the thread they were already holding, not dump
    #      them back to an empty board and make them find their place again.
    #   2. Esc as an exit trigger is bound by the de-escalation chain in
    #      docs/requirements/09-keyboard-and-responsive.feature.md; this requirement binds the
    #      resulting state regardless of which exit control was used.
    #
    Given a visitor is on a guided tour step focused on node A
    When the visitor exits the tour via its close control
    Then the tour's captions and step indicator should no longer be displayed
    And node A should remain the selected node, with the side panel still showing node A's detail


# --------------------------------------------------------------------------------------------------
# Tour Adaptation for Non-Demo Vaults (added 2026-07-27)
# --------------------------------------------------------------------------------------------------
#
# TOR-08-8EHbtf3 binds the tour to a static, hand-curated set of node ids specific to the demo
# vault. The npm-distributed CLI's `--serve` mode (and any local build) can point graph-data.json
# at a completely different vault, in which case none of the tour's curated node ids exist in
# the loaded data. Starting the tour anyway would advance through steps that can never resolve to
# a real node — a broken feature masquerading as a working one, the same failure class the
# Hidden-Node Transparency section of docs/requirements/06-swim-lane-layout.feature.md exists to
# avoid.
#

Scenario: [TOR-08-6uTWvws] The /graph page shall omit its "Take a tour" control when one or more node ids in the static tour definition are absent from the loaded graph-data.json
    Given graph-data.json does not contain a node id referenced by the static tour definition
    When the /graph page finishes rendering
    Then the "Take a tour" control described in TOR-08-NtvwEKk should not be displayed

Scenario: [TOR-08-rfVJZHR] The /graph page shall display its "Take a tour" control normally when every node id in the static tour definition is present in the loaded graph-data.json
    Given graph-data.json contains every node id referenced by the static tour definition
    When the /graph page finishes rendering
    Then the "Take a tour" control described in TOR-08-NtvwEKk should be displayed and function as specified
