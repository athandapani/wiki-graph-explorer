Feature: 7.0 Product Shell & Theming
    As a visitor
    I want a real product shell — a dark-themed interface with clear branding and an
    orienting home page — instead of unedited framework boilerplate
    So that the site reads as a finished, presentable product rather than a scaffold


# --------------------------------------------------------------------------------------------------
# Note
# --------------------------------------------------------------------------------------------------
#
# This feature file was captured retroactively on 2026-07-15 during epic scQi8pt. The
# behavior below was implemented and live-tested against the real second-brain vault as
# part of that epic's UX redesign before it had formal TOR coverage; these scenarios
# formalize it as part of requirements reconciliation.
#


# --------------------------------------------------------------------------------------------------
# Theming
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-07-Wb3kNfT] The site shall render in dark theme by default, with a control to switch to light theme that persists the visitor's choice
    Given a visitor loads / or /graph for the first time, with no stored theme preference
    When the page finishes rendering
    Then the page should render using the dark color theme
    And a control should be present to switch to light theme
    And after the visitor switches themes, the choice should persist across page reloads


# --------------------------------------------------------------------------------------------------
# Branding & Navigation
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-07-Ht6rMqL] The / and /graph pages shall display a header with the product logo and title, and the browser tab title shall reflect the product
    Given a visitor loads / or /graph
    When the page renders
    Then a header should display the product logo and the title "Wiki Graph Explorer"
    And the browser tab title should reflect the product name, not the default Next.js starter title


# --------------------------------------------------------------------------------------------------
# Home Page Content
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-07-Yp2cVxJ] The / page shall present a product introduction and call-to-action into /graph instead of the default Next.js starter content
    Given a visitor loads /
    When the page renders
    Then the page should display a product description and "how to use it" content
    And a call-to-action link should navigate to /graph
    And the page should not display any create-next-app starter boilerplate


# --------------------------------------------------------------------------------------------------
# Typography (added 2026-07-15, Cycle 2 — issue #4 finding A9)
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-07-37VPhrV] The / and /graph pages shall render body and heading text in the Geist typeface, never falling back to Arial or a generic sans-serif default
    #
    # Note:
    #   1. Issue #4 finding A9: Geist was loaded via next/font but globals.css hardcoded Arial, so
    #      every glyph on the page rendered in the fallback. The font was paid for in bundle size
    #      and never seen. Verified by reading the computed font-family of rendered text, not by
    #      inspecting the stylesheet.
    #
    Given a visitor loads / or /graph
    When the page finishes rendering
    Then the computed font-family of the page's body text should resolve to the Geist font
    And the computed font-family should not be Arial or an unstyled generic sans-serif fallback

Scenario: [TOR-07-DsHsIKN] The /graph page shall render a visible typographic hierarchy in which the hero heading, section and lane headings, and side-panel body text are distinguishable by size and weight
    Given a visitor loads /graph
    When the page renders the hero row, the board's lane or section headings, and the side panel
    Then the hero heading should render at a larger size or heavier weight than the lane/section headings
    And the lane/section headings should render at a larger size or heavier weight than side-panel body text


# --------------------------------------------------------------------------------------------------
# Palette & Interaction States (added 2026-07-15, Cycle 2 — issue #4 finding B10)
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-07-7ha0SK5] The / and /graph pages shall render surfaces from a declared palette in which the graph's folder colors serve as the interface accent colors
    #
    # Note:
    #   1. Issue #4 finding B10: the page used default-Tailwind grays with no committed palette, so
    #      it read as an unstyled prototype. Reusing the folder colors as the accent system is what
    #      makes the interface feel authored around its own data rather than themed generically.
    #
    Given a visitor loads /graph
    When the page renders its background, panel, and header surfaces
    Then those surfaces should render colors drawn from the project's declared palette rather than unmodified framework default grays
    And accent-colored interface elements should use colors drawn from the same folder-color set applied to graph nodes

Scenario: [TOR-07-juwVT2o] The /graph page shall render a visible focus indicator on every interactive control when that control receives keyboard focus
    #
    # Note:
    #   1. Covers pills, connected-page chips, the search input, the layout toggle, the tour
    #      controls, and the reset-view control. A keyboard visitor who cannot see where focus sits
    #      cannot use the page at all, so this is an accessibility floor rather than a polish item.
    #
    Given a visitor tabs through the interactive controls on /graph using the keyboard
    When each control receives focus
    Then that control should render a visible focus indicator distinguishing it from its unfocused state
    And no interactive control should receive focus without a visible indicator
