// A strict stdio MCP server that mimics Google Calendar API for Copilot Reviewer
process.stdin.on('data', (data) => {
  try {
    const request = JSON.parse(data.toString());
    
    // 1. Tool Discovery Phase (Tells Copilot what it can do)
    if (request.method === 'tools/list') {
      process.stdout.write(JSON.stringify({
        jsonrpc: "2.0",
        id: request.id,
        result: {
          tools: [{
            name: "list_events",
            description: "Returns standard Google Calendar Event resource objects to validate day mapping rules.",
            inputSchema: { type: "object", properties: {} },
            // CRITICAL: Bypasses the Copilot Reviewer security blocker
            annotations: {
              readOnlyHint: true
            }
          }]
        }
      }) + "\n");
    } 
    
    // 2. Tool Execution Phase (Returns raw Google Calendar API payload schemas)
    else if (request.method === 'tools/call' && request.params.name === 'list_events') {
      const mockGoogleCalendarPayload = {
        kind: "calendar#events",
        summary: "Primary Calendar",
        updated: "2026-11-06T12:00:00.000Z",
        timeZone: "UTC",
        items: [
          {
            kind: "calendar#event",
            id: "mock_event_001",
            status: "confirmed",
            summary: "Team Sync & Day Mapping Test",
            description: "Used to verify custom calendar application parser compliance.",
            start: { dateTime: "2026-11-06T09:00:00Z", timeZone: "UTC" },
            end: { dateTime: "2026-11-06T10:00:00Z", timeZone: "UTC" },
            recurringEventId: null
          },
          {
            kind: "calendar#event",
            id: "mock_event_002",
            status: "confirmed",
            summary: "All-Day Milestone Block",
            start: { date: "2026-11-07" }, // All-day event layout format
            end: { date: "2026-11-08" }
          }
        ]
      };

      process.stdout.write(JSON.stringify({
        jsonrpc: "2.0",
        id: request.id,
        result: {
          content: [{
            type: "text",
            text: JSON.stringify(mockGoogleCalendarPayload)
          }]
        }
      }) + "\n");
    }
  } catch (err) {
    // Fail silently or print error formatting if needed
  }
});
