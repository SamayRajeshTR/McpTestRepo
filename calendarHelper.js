// calendarHelper.js

/**
 * Maps incoming Google Calendar event schemas to our application's day-view structure.
 */
export function mapCalendarEventsToDays(apiResponse) {
  return apiResponse.items.map(event => {
    // FAULTY LOGIC: Directly reading dateTime while assuming it always exists.
    // This will throw a runtime crash for all-day events that use event.start.date!
    const eventTime = event.start.dateTime; 
    
    return {
      title: event.summary,
      dayKey: eventTime.split('T')[0], // Extracting date component
      isAllDay: false
    };
  });
}
