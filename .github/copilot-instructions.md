# Repository Instructions for GitHub Copilot

## Code Review Protocol
Whenever a Pull Request modifies date parsing, day calculations, or calendar rendering logic, you are strictly forbidden from guessing if the day-mapping logic works.

You MUST execute the `list_events` tool from the `mock-google-calendar` server to fetch the baseline array. Check if the keys returned in that specific live array match the keys processed in `calendarHelper.js`. If you do not call this tool, your review is invalid.
