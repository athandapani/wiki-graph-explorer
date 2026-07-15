Feature: 10.0 Demo Vault Ingestion & Public Release
    As the tool author preparing the deployed artifact
    I want the public vault populated at demo scale from real sourced research, and the repository
    made public only after its history is proven clean
    So that a visitor sees a dense, credible graph with working source links, and no private
    content is ever exposed in the process


# --------------------------------------------------------------------------------------------------
# Note
# --------------------------------------------------------------------------------------------------
#
# This feature file was created 2026-07-15 (Cycle 2). It covers ConOps Scenario 12 (demo-vault
# research ingestion) and the repo-visibility constraint in ConOps §8, addressing issue #4
# findings B11 (the committed vault holds 2 pages, so the deployed board would be nearly empty)
# and A3 (source links cannot resolve while the repo is private).
#
# These requirements are verified against content and repository state rather than application
# code. They are the ones that decide whether the shipped page is impressive or embarrassing —
# every other requirement in this baseline renders whatever this file produces.
#
# The repo-visibility requirements here are the highest-consequence items in the entire baseline.
# Flipping a repository to public is irreversible in practice: anything exposed can be cloned or
# indexed within seconds, and deleting it afterward does not retract it. TOR-10-VQAEhzb gates
# TOR-10-vaZLdHp for that reason, and the ordering is not negotiable.
#


# --------------------------------------------------------------------------------------------------
# Research Ingestion
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-10-RJsxsqn] The demo-vault ingestion shall produce one raw entry in the public vault's raw directory for each source link in the author-provided deep-research Markdown file
    #
    # Note:
    #   1. Per ConOps §8, the deep-research pass is manual and author-provided (e.g. a Perplexity
    #      export). Neither the build tool nor the ingestion performs automated research or fetches
    #      remote content — this requirement governs the resulting vault content, not a tool
    #      behavior.
    #   2. One raw entry per source is what makes meta.sourceCount (TOR-01-vhBOpOz) meaningful.
    #
    Given an author-provided deep-research Markdown file containing 40 distinct source links on AI adoption in medium-sized enterprises
    When the Karpathy-pattern ingestion pass is complete
    Then the public vault's 'raw' directory should contain 40 Markdown entries
    And each entry should correspond to exactly one of the source links in the deep-research file

Scenario: [TOR-10-WYqcBSs] The demo-vault ingestion shall produce interlinked wiki pages carrying title, tags, status, and description frontmatter with Related and Referenced By wikilink sections
    Given the ingestion pass has produced raw entries for the deep-research sources
    When the wiki pages are authored from those raw entries
    Then every page under the public vault's 'wiki' directory should declare 'title', 'tags', 'status', and 'description' in its frontmatter
    And every such page should contain a '## Related' or '## Referenced By' section containing at least one wikilink

Scenario: [TOR-10-sFT4xQU] The public vault shall build into a graph whose node and edge counts demonstrate demo-scale density rather than the placeholder vault's near-empty board
    #
    # Note:
    #   1. Issue #4 finding B11: the committed public vault held 2 pages. Every visual requirement
    #      in this baseline is untestable and every visitor unimpressed until this changes.
    #   2. The thresholds below are the floor that makes the board read as a real knowledge graph,
    #      not the target — ConOps S12.3 anticipates fanning out to a few hundred pages.
    #
    Given the public vault populated by the completed ingestion pass
    When the Tool is Run with '--vault public-vault/wiki'
    Then graph-data.json should contain at least 40 nodes
    And graph-data.json should contain at least 60 edges
    And every node in graph-data.json should have a non-empty 'description' field

Scenario: [TOR-10-pNUhGW1] The public vault shall contain only original research content, with no confidential organizational, family, or health material from the private second-brain vault
    #
    # Note:
    #   1. This is the content-side half of the safe-by-construction boundary; TOR-01-5d0lrAs and
    #      TOR-01-lgzWfrv bind the build-configuration side. The tool being incapable of publishing
    #      private content does not help if private content is authored into the public vault by
    #      hand.
    #   2. Verified by author review of every page before commit (ConOps S12.5).
    #
    Given the public vault populated by the completed ingestion pass
    When every page in the vault is reviewed prior to commit
    Then every page's content should trace to a source in the author-provided deep-research file or to the author's own synthesis of those sources
    And no page should contain content originating from the private second-brain vault


# --------------------------------------------------------------------------------------------------
# Repository Visibility
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-10-VQAEhzb] The repository's full git history shall be audited and confirmed free of private content before the repository's visibility is changed to public
    #
    # Note:
    #   1. ConOps §8 declares this audit an explicit precondition, not a recommendation. The audit
    #      covers all commits, all branches, and all blobs reachable from history — not merely the
    #      current working tree. Content deleted in a later commit remains readable in history.
    #   2. Scope of "private content": second-brain vault material, organizational data, and
    #      family/health material — the exact categories that motivated this tool's existence
    #      (Product Vision §2).
    #   3. This requirement gates TOR-10-vaZLdHp. Publishing is irreversible in practice, so the
    #      audit must complete and pass BEFORE the visibility flip, never alongside or after it.
    #
    Given the repository prior to any change in visibility
    When the full git history is audited across all commits, branches, and reachable blobs
    Then the audit should report zero occurrences of private second-brain, organizational, or family/health content
    And the repository visibility should remain private until that audit reports zero occurrences

Scenario: [TOR-10-vaZLdHp] The repository shall be publicly readable by an anonymous, unauthenticated client once its history audit has passed
    Given the history audit of TOR-10-VQAEhzb has completed and reported zero occurrences of private content
    When an anonymous unauthenticated client requests the repository's raw content URLs
    Then those requests should return an HTTP 200 response rather than an authentication challenge or HTTP 404


# --------------------------------------------------------------------------------------------------
# Deployed Result
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-10-7O3vg4B] The deployed /graph page's stats footer shall render its full provenance clause, reporting a source count equal to the number of sources ingested into the public vault
    #
    # Note:
    #   1. This closes the loop from ingestion (TOR-10-RJsxsqn) through the build's meta.sourceCount
    #      (TOR-01-vhBOpOz) to the rendered footer (TOR-08-LQAbYTw). The provenance claim is
    #      precisely the one a skeptical evaluator will spot-check against the source links, so K
    #      must be true rather than aspirational.
    #   2. The public vault is required to HAVE a populated 'raw/' directory, so the deployed page
    #      must never fall back to the no-provenance rendering of TOR-08-dkecfj5. A deployed footer
    #      that silently omits "Built from ..." is a signal that the ingestion or the build broke,
    #      and this requirement is what catches that.
    #
    Given the public vault ingested from a deep-research file with 40 source links, deployed via the static export build
    When a visitor loads the deployed /graph page
    Then the stats footer should display the text "Built from 40 raw sources → " followed by the page and connection counts
    And that source count should equal the number of raw entries in the deployed public vault
    And the footer should not fall back to the page-and-connection-count-only rendering
