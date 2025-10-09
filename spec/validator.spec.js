const { check_event_validity } = require("../validator");

describe("iCalendar VEVENT Validator", () => {

  // Test 1. missing required fields
  it("should flag missing required fields", () => {
    const event = { UID: "123" }; // missing other required properties
    const result = check_event_validity(event, 5);
    
    expect(result.valid).toBeFalse();
    expect(result.event_errors.some(e => e.includes("Missing required property"))).toBeTrue();
  });

  // Test 2. fully valid event
  it("should accept a fully valid event", () => {
    const event = {
      UID: "uid@example.com",
      DTSTAMP: "20251006T120000Z",
      DTSTART: "20251007T090000Z",
      METHOD: "REQUEST",
      STATUS: "CONFIRMED",
      ATTENDEE: "mailto:patient@example.com"
    };
    const result = check_event_validity(event, 10);

    expect(result.valid).toBeTrue();
    expect(result.event_errors.length).toBe(0);
    expect(result.warning_messages.length).toBeGreaterThanOrEqual(0);
  });

  // Test 3. invalid METHOD value
  it("should detect invalid METHOD value", () => {
    const event = {
      UID: "uid@example.com",
      DTSTAMP: "20251006T120000Z",
      DTSTART: "20251007T090000Z",
      METHOD: "PUBLISH", 
      STATUS: "CONFIRMED",
      ATTENDEE: "mailto:patient@example.com"
    };
    const result = check_event_validity(event, 15);

    expect(result.valid).toBeFalse();
    expect(result.event_errors.some(e => e.includes("Invalid METHOD"))).toBeTrue();
  });

  // Test 4: Invalid DTSTAMP format
  it("should detect invalid DTSTAMP format", () => {
    const event = {
      UID: "uid@example.com",
      DTSTAMP: "2025-10-06T12:00", 
      DTSTART: "20251007T090000Z",
      METHOD: "REQUEST",
      STATUS: "CONFIRMED",
      ATTENDEE: "mailto:patient@example.com"
    };
    const result = check_event_validity(event, 20);

    expect(result.valid).toBeFalse();
    expect(result.event_errors.some(e => e.includes("Invalid DTSTAMP format"))).toBeTrue();
  });

  // Test 5. Invalid ATTENDEE format
  it("should detect invalid ATTENDEE format", () => {
    const event = {
      UID: "uid@example.com",
      DTSTAMP: "20251006T120000Z",
      DTSTART: "20251007T090000Z",
      METHOD: "REQUEST",
      STATUS: "CONFIRMED",
      ATTENDEE: "invalid@format" 
    };
    const result = check_event_validity(event, 25);

    expect(result.valid).toBeFalse();
    expect(result.event_errors.some(e => e.includes("Invalid ATTENDEE"))).toBeTrue();
  });

});
