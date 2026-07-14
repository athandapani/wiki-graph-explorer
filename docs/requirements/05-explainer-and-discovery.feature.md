Feature: 5.0 Explainer & Missing-Link Discovery
    As a visitor
    I want to read why this graph tool exists and be able to filter/sort nodes by status or folder
    So that I can understand how a connected knowledge base surfaces missing links and content gaps


# --------------------------------------------------------------------------------------------------
# Explainer Content
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-05-G72S3H4] The /graph page shall display a static "why build this" explainer section describing second-brain/dynamic-context benefits and how graph visualization surfaces missing links
    Given a visitor loads the /graph page
    When the visitor scrolls to the explainer section
    Then the explainer section should be visible and contain descriptive text about second-brain/dynamic-context benefits and how graph visualization reveals content gaps


# --------------------------------------------------------------------------------------------------
# Status and Folder Filtering
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-05-dfhLAbM] The /graph page shall allow a visitor to filter the visible nodes by status value (active, revisiting, dormant)
    Given a visitor selects the 'dormant' status filter
    When the filter is applied
    Then only nodes with status 'dormant' should remain visible/undimmed in the graph

Scenario: [TOR-05-UPr1Am6] The /graph page shall allow a visitor to filter or sort the visible nodes by folder/taxonomy cluster
    Given a visitor selects a specific folder/taxonomy cluster filter
    When the filter is applied
    Then only nodes belonging to that folder/taxonomy cluster should remain visible/undimmed in the graph


# --------------------------------------------------------------------------------------------------
# Under-Connected Node Discovery
# --------------------------------------------------------------------------------------------------

Scenario: [TOR-05-02VIaa3] The /graph page shall visually indicate a node's edge count so a visitor can identify under-connected nodes relative to their cluster peers
    Given the graph contains nodes with varying edge counts within the same folder/taxonomy cluster
    When a visitor inspects nodes in that cluster
    Then a node with markedly fewer edges than its cluster peers should be visually distinguishable, such as by size or connector count, so it stands out as under-connected

Scenario: [TOR-05-EmhMDFS] The side panel shall display a node's full related-node list so a visitor can recognize when a concept that logically should connect to other nodes currently does not
    Given a visitor clicks an under-connected node
    When the side panel opens
    Then the panel should display that node's complete related-node list, allowing the visitor to observe its sparse connections directly
