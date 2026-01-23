# Jobs & Workflow Roadmap

## Core Philosophy: "Work Order-First"
We are shifting from a "Calendar-First" workflow to a "Work Order-First" workflow.

1.  **Jobs List (Backlog)**: The primary place to create work. Jobs can be created as "Unscheduled" and sit in the backlog.
2.  **Scheduler (Visualization)**: Purely for viewing and assigning dates to existing jobs. Clicking the calendar no longer creates new jobs to prevent duplication.

## Multi-Building Property Logic ("Define Once, Assign Many")

Handling complex clients (e.g., Muskoka cottages with multiple buildings) requires a relational approach to equipment and inventory.

### 1. Inventory (The Parts)
- Lists individual items only.
- Example: *Sediment Filter*, *UV Lamp*, *O-Ring*.

### 2. Tasks (The System Definition)
- Acts as the "System Template".
- You create a Task named **"Service Viqua VH410 System"**.
- This Task links to the specific Inventory items required (1x Lamp, 1x Filter).
- **Benefit**: Update the Task once, and it updates requirements for every client using that system.

### 3. Client Database (The Association)
- Clients have boolean flags for properties: `Cottage`, `Boathouse`, `Cabin 1`, `Cabin 2`.
- **New Logic**: Each property flag is paired with a `system_id` (linking to a Task).
- Example:
    - Cottage: Checked -> Linked to "Service Viqua VH410" (Task)
    - Boathouse: Checked -> Linked to "Service Big Blue" (Task)

### 4. Job Creation (The Automation)
- When creating a Job for a Client:
    1.  System checks which properties the client has.
    2.  System looks up the "System" (Task) associated with each property.
    3.  System automatically pulls the Inventory items from those Tasks.
    4.  Job is populated with the correct filters for *that specific* client's buildings.

## Implementation Status
- [x] Roadmap Created
- [ ] Client Model Updated (Backend)
- [ ] Client Form Updated (Frontend)
- [ ] Job Creation Logic Updated (Frontend/Backend)