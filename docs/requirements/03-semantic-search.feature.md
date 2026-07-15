Feature: 3.0 Semantic Search
    As a visitor
    I want to type a natural-language query and see the graph re-rank by real semantic relevance
    So that I can confirm the search is genuine semantic matching, not a keyword filter in disguise


# --------------------------------------------------------------------------------------------------
# Search Input & Query Embedding
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-03-TOtRRhr] The /graph page shall provide a visible search input above the graph canvas
    Given a visitor loads the /graph page
    When the page renders
    Then a text input for search should be visible above the graph canvas

Scenario: [TOR-03-C1lczJo] The /graph page shall embed a visitor's typed query client-side and compute cosine similarity against each page's precomputed embedding from vector-index.json
    #
    # Note:
    #   1. The client-side query embedding mechanism is an open risk not yet resolved (see
    #      docs/design-notes.md §4) — this requirement is stated independent of that mechanism.
    #
    Given a visitor types a query into the search input
    When the query text changes
    Then a client-side embedding shall be computed for the query
    And a cosine similarity score shall be computed between the query embedding and every entry in vector-index.json


# --------------------------------------------------------------------------------------------------
# Live Re-Ranking & Filtering
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-03-6MpPbQh] The /graph page shall re-rank and visually highlight graph nodes by similarity score in real time as the visitor types, without a page reload or backend call
    Given a visitor is typing a query into the search input
    When each keystroke updates the query
    Then the graph's node highlighting shall update to reflect the current similarity ranking
    And no network request shall be made to a backend search endpoint

Scenario: [TOR-03-UH4yx26] The /graph page shall dim or fade nodes below a relevance threshold out of the active view when a search query is active
    Given a visitor has typed a query that matches only a subset of pages above a relevance threshold
    When the ranking updates
    Then nodes scoring below the relevance threshold should visually dim or fade relative to nodes above it

Scenario: [TOR-03-82mnBKb] The /graph page shall surface a page as a top-ranked search result when the query is conceptually related to that page's content even if the query's exact words do not appear in the page text
    #
    # Note:
    #   1. This is the core "not a keyword filter" requirement (Product Vision §2, ConOps Scenario 2) —
    #      verified using a fixture vector-index where a known page's embedding is conceptually close
    #      to the query embedding despite zero literal word overlap.
    #
    Given vector-index.json contains a page whose embedding is conceptually similar to a test query embedding but whose page text contains none of the query's literal words
    When the visitor types that query
    Then that page's node should rank among the top results by cosine similarity

Scenario: [TOR-03-e3TJKQb] The /graph page shall restore the full unfiltered graph view when the visitor clears the search input
    Given a visitor has an active search query filtering/dimming the graph
    When the visitor clears the search input
    Then all nodes should return to their unfiltered, undimmed appearance

Scenario: [TOR-03-HjJLHTr] The /graph page shall display a no-results indication when a query's highest similarity score falls below the relevance threshold for every page
    Given a visitor types a query with no conceptually related page in the vault
    When the ranking computes
    Then the page shall display an indication that no closely matching results were found


# --------------------------------------------------------------------------------------------------
# Search in Both Layout Modes (added 2026-07-15, Cycle 2 — issue #4 finding A1)
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-03-Z3ApPfB] The /graph page shall apply the active search query's similarity ranking to the swim-lane board, highlighting and dimming pill nodes exactly as it does force-directed nodes
    #
    # Note:
    #   1. Issue #4 finding A1 — the headline feature was dead in the default view. Search was wired
    #      only to the force-directed canvas, so a visitor landing on the swim-lane board and typing
    #      a query saw nothing happen. This is the highest-priority fix of the cycle.
    #   2. This requirement is about the swim-lane board specifically; TOR-03-6MpPbQh and
    #      TOR-03-UH4yx26 already bind the equivalent force-directed behavior.
    #
    Given a visitor is viewing swim-lane mode
    And graph-data.json contains pages both above and below the relevance threshold for a test query
    When the visitor types that query into the search input
    Then pill nodes scoring above the relevance threshold should render visually highlighted
    And pill nodes scoring below the relevance threshold should render visually dimmed
    And clearing the query should return every pill node to its unfiltered appearance

Scenario: [TOR-03-PzdJnrT] The /graph page shall preserve the active search query and its resulting filtering when the visitor switches layout modes
    Given a visitor has typed a query that is actively filtering the force-directed view
    When the visitor switches to swim-lane mode
    Then the search input should still contain that query
    And the swim-lane board should render with the same set of nodes highlighted as matched the query in force-directed mode


# --------------------------------------------------------------------------------------------------
# Header Placement & Result Count (added 2026-07-15, Cycle 2)
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-03-LgIpadO] The /graph page shall display the search input in a persistently visible header position that remains reachable without scrolling in both layout modes
    #
    # Note:
    #   1. This refines TOR-03-TOtRRhr (search input visible above the graph canvas) by binding the
    #      input to an always-visible header slot. Both requirements hold; a header placement above
    #      the canvas satisfies each of them.
    #
    Given a visitor loads the /graph page
    When the visitor scrolls the page and switches between force-directed and swim-lane modes
    Then the search input should remain visible in the page header throughout
    And the search input should be reachable without scrolling in either layout mode

Scenario: [TOR-03-1LlqKF1] The /graph page shall display a count of how many pages match the active search query, updating live as the query changes
    Given a visitor types a query matching exactly 7 pages above the relevance threshold
    When the ranking updates
    Then the page should display a visible result count reporting 7 matching pages
    And the count should update as the visitor edits the query
    And the count should disappear or reset when the visitor clears the search input
