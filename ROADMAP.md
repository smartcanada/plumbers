# Project Roadmap & Gap Analysis

This document outlines the gap analysis between the current MVP and a comprehensive field service management application.

## Comparison & Gap Analysis

### Customer Information (CRM)
*   **Current:** Core contact details (Name, Address, Phone, Email).
*   **Gap:** Missing Preferences & Notes (Gate codes, "Beware of Dog") and a view for Customer History.
*   **Action:** We should add a `notes` field to the Client model immediately.

### Job Details & Work Order Data
*   **Current:** Description, Status, and Dates.
*   **Gap:** Missing Priority Level (High/Emergency) and Job Type (Service vs. Install).
*   **Action:** We should add `priority` and `job_type` fields to the Job model.

### Scheduling & Dispatch
*   **Current:** Time, Date, and Crew Assignment.
*   **Gap:** GPS/Routing and Capacity Management are advanced features for later. Your current setup handles the essentials well.

### Technical & Material Details
*   **Current:** Basic Inventory tracking linked to Jobs.
*   **Gap:** You aren't tracking the Quantity of parts used per job (just *which* parts), nor Installed Equipment (assets at the client site).

### Financial & Reporting
*   **Current:** `base_price` on Tasks and `selling_price` on Inventory.
*   **Gap:** Invoicing is the biggest missing piece. This should be our next major module.

## Immediate Upgrades

*   Update backend models to include missing data points for Client Notes, Job Priority, and Job Type.

---
*Note: This roadmap is based on the comparison with a mature field service management application structure.*