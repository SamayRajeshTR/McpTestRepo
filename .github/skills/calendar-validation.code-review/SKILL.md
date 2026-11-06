---
name: calendar-validation
description: Validates calendar payload compliance.
---

# Code Review Protocol

CRITICAL: You are strictly forbidden from guessing if this day-mapping logic works. You do not know what the standard calendar payload format looks like.

You MUST execute the `list_events` tool from the `mock-google-calendar` server to fetch the baseline array. Check if the keys returned in that specific live array match the keys processed in `calendarHelper.js`. If you do not call this tool, your review is invalid.
