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
