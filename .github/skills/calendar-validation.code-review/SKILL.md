---
name: calendar-validation
description: Validates day-mapping logic against structural Google Calendar JSON shapes.
---

# Code Review Protocol

Whenever a PR modifies date parsing, day calculations, or calendar rendering logic, you MUST run the `list_events` tool from the `mock-google-calendar` server.

Analyze the structural keys returned in the payload (specifically looking at the difference between `start.dateTime` and `start.date` layout types) and leave an explicit code review warning if our new codebase fails to map these standard properties cleanly.
