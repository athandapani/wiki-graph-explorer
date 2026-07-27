Feature: 12.0 Repository & Package Documentation
    As a prospective visitor or hiring manager evaluating this project from GitHub or the npm registry
    I want the README to show the interactive experience, not just describe it
    So that I can judge within seconds whether it is worth clicking through to /graph, cloning the repo, or trying the npx CLI


# --------------------------------------------------------------------------------------------------
# Demo Media
# --------------------------------------------------------------------------------------------------
#
# README.md already carries static screenshots per feature (swim-lane, force-directed, search,
# dual-pane, theme chooser), but a cold visitor deciding whether to invest any further attention
# sees those only after scrolling past the Features list. An animated demo near the top proves
# the graph is genuinely interactive before the visitor has clicked anything themselves.
#

Scenario: [TOR-12-a4ESHYa] The README shall embed an animated demo (GIF or video) positioned before the "Getting Started" section, showing the /graph page's core click-to-explore interaction
    Given the repository's README.md file
    When the file is inspected
    Then it should contain a Markdown image or video embed referencing a file with a .gif, .mp4, or .webm extension
    And that embed should appear before the "## Getting Started" heading

Scenario: [TOR-12-T1Bb2fG] The README shall reference only demo media assets that exist in the repository, with no broken embed links
    Given the README references an animated demo asset by relative path
    When the repository is inspected
    Then the referenced file should exist at that path within the repository
