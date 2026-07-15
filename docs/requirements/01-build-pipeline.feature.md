Feature: 1.0 Build Pipeline & CLI
    As a tool author
    I want to run a build-time CLI tool that walks a Markdown-wiki vault and emits static graph and search assets
    So that I can safely iterate locally against rich private data and confidently publish only public-vault content


# --------------------------------------------------------------------------------------------------
# Version and Log Startup Stamping
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-01-Oequ51V] The build tool shall report its name and semantic version to standard output when invoked with --version, exiting with code 0
    Given the user passes the commandline args '--version'
    When the Tool is Run
    Then the standard output should contain a line matching /^wiki-graph-explorer v\d+\.\d+\.\d+$/
    And the exit code should be 0

Scenario: [TOR-01-pWeHInR] The build tool shall emit a log line at startup containing its name and semantic version at INFO level
    Given the tool is invoked with a valid --vault argument
    When the Tool is Run
    Then the standard error log should contain an INFO record matching /^\[INFO\] wiki-graph-explorer v\d+\.\d+\.\d+ /
    And that log record should be the first record emitted


# --------------------------------------------------------------------------------------------------
# Logging Convention
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-01-ZkmB8Qn] The build tool shall emit log records at the levels DEBUG, INFO, WARN, and ERROR in human-readable prefixed plain-text format written to standard error
    Given the tool is invoked with a valid --vault argument
    When the Tool is Run
    Then each log line written to standard error should match /^\[(DEBUG|INFO|WARN|ERROR)\] /
    And no log line should be written to standard output


# --------------------------------------------------------------------------------------------------
# Exit Codes and Invocation Validation
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-01-LplbdUv] The build tool shall exit with code 0 on success, code 1 on operational failure, and code 2 on invalid invocation
    Given the user passes the commandline args '--bogus-flag'
    When the Tool is Run
    Then the exit code should be 2

Scenario: [TOR-01-Z0d0o1e] The build tool shall reject invocation without a --vault argument with exit code 2 and a usage hint
    Given the user passes no commandline args
    When the Tool is Run
    Then the standard error should contain the string "--vault is required"
    And the exit code should be 2


# --------------------------------------------------------------------------------------------------
# stdout / stderr Discipline
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-01-847tYDS] The build tool shall write primary build output confirmation to standard output and shall write diagnostics, progress, and log output to standard error
    Given the user passes the commandline args '--vault <valid-path>'
    When the Tool is Run
    Then the standard output should contain exactly one line matching /^Wrote graph-data\.json \(\d+ nodes, \d+ edges\)$/
    And all diagnostic and log lines should be written to standard error


# --------------------------------------------------------------------------------------------------
# Error Messaging
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-01-FPff1RV] The build tool shall emit user-facing error messages to standard error that name the problem and name the next user action
    Given the user passes the commandline args '--vault /nonexistent/path'
    When the Tool is Run
    Then the standard error should contain the string "vault path not found"
    And the standard error should contain the string "Check --vault points to a valid wiki directory"
    And the exit code should be 1


# --------------------------------------------------------------------------------------------------
# Vault Walking & Frontmatter Parsing
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-01-NTPrx23] The build tool shall walk every Markdown file under the vault path and parse its YAML frontmatter (title, tags, status, Related, Referenced By) into a node record
    Given a vault directory containing at least one Markdown file with valid frontmatter for 'title', 'tags', 'status', 'Related', and 'Referenced By'
    When the Tool is Run with '--vault <path>'
    Then graph-data.json should contain a node entry whose id corresponds to that file
    And that node entry's title, tags, and status fields should match the file's frontmatter values

Scenario: [TOR-01-IBry2Oi] The build tool shall collapse directional Related and Referenced By frontmatter links between two pages into a single undirected edge in graph-data.json
    Given two vault pages where page A lists page B under 'Related' and page B lists page A under 'Referenced By'
    When the Tool is Run with '--vault <path>'
    Then graph-data.json should contain exactly one edge connecting the node for page A and the node for page B

Scenario: [TOR-01-aqsjUxj] The build tool shall assign each node a folder/taxonomy value derived from the page's directory path within the vault
    Given a vault page located at 'wiki/change-management/example.md'
    When the Tool is Run with '--vault <path>'
    Then that page's node entry in graph-data.json should have a folder/taxonomy value of 'change-management'

Scenario: [TOR-01-dEUM3Pp] The build tool shall skip a Markdown file with missing or malformed frontmatter, emit a WARN log identifying the file, and continue processing the remaining vault
    Given a vault directory containing one Markdown file with syntactically invalid YAML frontmatter and two Markdown files with valid frontmatter
    When the Tool is Run with '--vault <path>'
    Then the standard error should contain a WARN record naming the invalid file's path
    And graph-data.json should contain node entries for the two valid files
    And the exit code should be 0

Scenario: [TOR-01-6H0EK6c] The build tool shall produce zero nodes and zero edges in graph-data.json, without error, when run against a vault directory containing no Markdown files
    Given an empty vault directory
    When the Tool is Run with '--vault <path>'
    Then graph-data.json should contain an empty nodes array and an empty edges array
    And the exit code should be 0


# --------------------------------------------------------------------------------------------------
# graph-data.json and vector-index.json Generation
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-01-cqloSLI] The build tool shall write graph-data.json as a single valid JSON document containing top-level nodes and edges arrays
    Given a vault directory containing at least one valid Markdown page
    When the Tool is Run with '--vault <path>'
    Then graph-data.json should be valid JSON
    And it should contain top-level keys 'nodes' and 'edges', each an array

Scenario: [TOR-01-EsImTv8] The build tool shall compute a precomputed embedding for each vault page's title, body, and tags and write it to vector-index.json alongside the page id
    #
    # Note:
    #   1. The specific embedding mechanism is an open risk not yet resolved (see docs/design-notes.md
    #      §4) — this requirement is stated independent of that mechanism.
    #
    Given a vault directory containing at least one valid Markdown page
    When the Tool is Run with '--vault <path>'
    Then vector-index.json should contain an entry whose id matches that page's node id in graph-data.json
    And that entry should include a numeric embedding vector field

Scenario: [TOR-01-FFu6OJ3] The build tool shall regenerate graph-data.json and vector-index.json fully on every run, with no incremental/partial update
    Given a previous graph-data.json exists from an earlier run against a vault with 3 pages
    And the vault has since had 1 page removed and 1 page added
    When the Tool is Run again with '--vault <path>'
    Then graph-data.json should reflect exactly the current vault contents
    And graph-data.json should not contain a node for the removed page


# --------------------------------------------------------------------------------------------------
# Content Isolation & Safety Boundary
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-01-p7AxyYn] The build tool shall write its output assets only to the local path specified by the user and shall never transmit vault content to any network destination
    #
    # Note:
    #   1. This directly implements the "safe-by-construction boundary" goal (Product Vision §5) —
    #      the risk this tool exists to avoid is private second-brain content ever leaving the local
    #      machine.
    #
    Given the user passes '--vault <path>' pointing at any local vault
    When the Tool is Run
    Then no network connection should be initiated by the build tool during execution
    And graph-data.json and vector-index.json should be written only to the local output directory

Scenario: [TOR-01-igqi4aJ] The build tool shall require an explicit --vault path argument for every invocation and shall never fall back to a default or previously used vault path
    Given the user passes the commandline args with no '--vault' flag
    When the Tool is Run
    Then the tool shall not read from any vault path
    And the exit code should be 2

Scenario: [TOR-01-5d0lrAs] The deployed production build configuration shall reference a single hardcoded --vault path pointing at the dedicated public vault, with no build-time flag or environment variable able to override it
    Given the CI/CD deployment build configuration file
    When that configuration file is inspected
    Then the --vault path used for the production build should be the dedicated public vault path
    And the configuration should not define an environment variable or flag capable of overriding that path at deploy time

Scenario: [TOR-01-lgzWfrv] The repository shall never contain a committed file referencing the second-brain private vault's filesystem path
    Given the repository's committed source code and CI/CD configuration
    When the repository is inspected
    Then no committed file should contain a literal filesystem path referencing 'second-brain'


# --------------------------------------------------------------------------------------------------
# Rebuild-on-Publish
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-01-uY4K5t1] The build tool shall include newly added vault pages in graph-data.json and vector-index.json on the next run without any tool-code changes
    Given the tool author adds one new Markdown page with valid frontmatter to the public vault
    When the Tool is Run again with '--vault <public-vault-path>'
    Then graph-data.json should contain a new node entry for the newly added page
    And vector-index.json should contain a corresponding embedding entry for that page

Scenario: [TOR-01-ly1VpL1] The build pipeline shall support producing a full Next.js static export that embeds the current graph-data.json and vector-index.json, deployable with no server runtime
    Given graph-data.json and vector-index.json have been generated for the public vault
    When the Next.js static export build is run
    Then the export output directory should contain a self-contained /graph page bundle with graph-data.json and vector-index.json accessible via client-side fetch
    And no server-side API route should be present in the export output


# --------------------------------------------------------------------------------------------------
# Per-Page Description Emission (added 2026-07-15, Cycle 2)
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-01-FQuBqe1] The build tool shall emit a description field on each node in graph-data.json sourced from that page's frontmatter description field when present
    Given a vault page whose frontmatter contains 'description: A short summary of this page.'
    When the Tool is Run with '--vault <path>'
    Then that page's node entry in graph-data.json should contain a 'description' field
    And that field's value should be the string "A short summary of this page."

Scenario: [TOR-01-r0LGd50] The build tool shall fall back to a page's first body paragraph as the node description when the page's frontmatter declares no description field
    #
    # Note:
    #   1. "First body paragraph" means the first contiguous block of non-empty prose after the
    #      closing frontmatter delimiter, excluding Markdown headings.
    #   2. The fallback is emitted as plain text — inline Markdown markup (links, emphasis) is
    #      stripped so the side panel renders a clean 1-3 sentence summary (ConOps S3.3).
    #
    Given a vault page with no 'description' key in its frontmatter and body content:
        """
        # Change Management

        Adoption stalls when process change outpaces training. This page collects
        evidence on sequencing the two.

        ## Related
        - [[training-programs]]
        """
    When the Tool is Run with '--vault <path>'
    Then that page's node entry in graph-data.json should contain a 'description' field
    And that field's value should be the string "Adoption stalls when process change outpaces training. This page collects evidence on sequencing the two."

Scenario: [TOR-01-l3K1BGM] The build tool shall emit an empty description for a page that has neither a frontmatter description nor any body paragraph, without error and without omitting the node
    Given a vault page with valid frontmatter, no 'description' key, and a body containing only headings and wikilinks
    When the Tool is Run with '--vault <path>'
    Then that page's node entry in graph-data.json should still be present
    And that node's 'description' field should be an empty string
    And the exit code should be 0


# --------------------------------------------------------------------------------------------------
# Source Count Metadata (added 2026-07-15, Cycle 2)
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-01-vhBOpOz] The build tool shall emit a top-level meta.sourceCount field in graph-data.json reporting the number of raw source entries ingested into the vault
    #
    # Note:
    #   1. This field feeds the stats footer's provenance clause (ConOps S8.4, S12.7).
    #   2. Per the Karpathy-pattern ingestion workflow, one 'raw/' entry is created per ingested
    #      source (ConOps S12.2), so sourceCount is the count of Markdown files under the 'raw/'
    #      directory that is a sibling of the '--vault' wiki directory.
    #   3. sourceCount counts ingested SOURCES, not wiki pages. Node count and source count are
    #      deliberately different figures in the footer — one source fans out into several pages.
    #   4. A 'raw/' sibling is a convention of this project's vaults, NOT a requirement this tool
    #      places on the vaults it renders. The tool is generic by design (Product Vision §5 —
    #      zero tool-code changes per vault), so the absence of 'raw/' is an ordinary case, not an
    #      error: see TOR-01-gi1qoBS (no directory) and TOR-01-gYbfrvE (empty directory).
    #
    Given a vault whose wiki directory is 'public-vault/wiki' and whose sibling 'public-vault/raw' directory contains 40 Markdown files
    When the Tool is Run with '--vault public-vault/wiki'
    Then graph-data.json should contain a top-level 'meta' object
    And 'meta.sourceCount' should equal 40

Scenario: [TOR-01-gi1qoBS] The build tool shall emit meta.sourceCount as null and continue the build when no sibling raw directory exists for the given vault path
    #
    # Note:
    #   1. null means "this vault declares no provenance", which is materially different from 0,
    #      meaning "this vault ingested zero sources" (TOR-01-gYbfrvE). Emitting 0 for both would
    #      assert a fact the tool cannot know, and the footer would have to render a claim about a
    #      pipeline that may not exist for this vault.
    #   2. Consumed by TOR-08-dkecfj5, which omits the footer's provenance clause entirely rather
    #      than rendering "Built from 0 raw sources".
    #
    Given a vault wiki directory with no sibling 'raw' directory
    When the Tool is Run with '--vault <path>'
    Then graph-data.json should contain a top-level 'meta' object
    And 'meta.sourceCount' should be null
    And the exit code should be 0

Scenario: [TOR-01-gYbfrvE] The build tool shall emit meta.sourceCount as 0 when a sibling raw directory exists for the given vault path but contains no Markdown files
    #
    # Note:
    #   1. Distinct from TOR-01-gi1qoBS: here the vault does declare a 'raw/' provenance directory,
    #      and the honest count of what it holds is zero.
    #
    Given a vault wiki directory whose sibling 'raw' directory exists and contains no Markdown files
    When the Tool is Run with '--vault <path>'
    Then graph-data.json should contain 'meta.sourceCount' with the value 0
    And the exit code should be 0
