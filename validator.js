// validator.js — validates properties inside each VEVENT block

const REQUIRED = ["UID", "DTSTAMP", "DTSTART", "METHOD", "STATUS", "ATTENDEE"];

// Known iCalendar properties (RFC 5545 subset)
const KNOWN = [
  "UID", "DTSTAMP", "DTSTART", "DTEND", "DURATION", "CREATED", "DESCRIPTION",
  "LAST-MODIFIED", "ORGANIZER", "SUMMARY", "SEQUENCE", "LOCATION", "ATTENDEE",
  "STATUS", "METHOD", "CATEGORIES", "CLASS", "PRIORITY", "TRANSP", "URL"
];

// Strict UTC timestamp (YYYYMMDDTHHMMSSZ)
const DATETIME_REGEX = /^\d{8}T\d{6}Z$/;

function check_event_validity(event, lineNum) {
  const event_errors = [];
  const warning_messages = [];

  // --- Check for missing required props ---
  for (const prop of REQUIRED) {
    if (!event[prop]) {
      event_errors.push(`Missing required property '${prop}' near line ${lineNum}`);
    }
  }

  // --- Validate METHOD ---
  if (event.METHOD && event.METHOD !== "REQUEST") {
    event_errors.push(`Invalid METHOD value '${event.METHOD}' near line ${lineNum}`);
  }

  // --- Validate STATUS ---
  if (event.STATUS && !["TENTATIVE", "CONFIRMED", "CANCELLED"].includes(event.STATUS)) {
    event_errors.push(`Invalid STATUS value '${event.STATUS}' near line ${lineNum}`);
  }

  // --- Validate DTSTAMP ---
  if (event.DTSTAMP && !DATETIME_REGEX.test(event.DTSTAMP)) {
    event_errors.push(`Invalid DTSTAMP format '${event.DTSTAMP}' near line ${lineNum}`);
  }

  // --- Validate DTSTART ---
  if (event.DTSTART && !DATETIME_REGEX.test(event.DTSTART)) {
    event_errors.push(`Invalid DTSTART format '${event.DTSTART}' near line ${lineNum}`);
  }

  // --- Validate ATTENDEE ---
  if (event.ATTENDEE && !/^((mailto:|tel:).+)/.test(event.ATTENDEE)) {
    event_errors.push(`Invalid ATTENDEE '${event.ATTENDEE}' near line ${lineNum}`);
  }

  // --- Optional / Known vs Unknown properties ---
  Object.keys(event).forEach((prop) => {
    if (!REQUIRED.includes(prop) && !KNOWN.includes(prop)) {
      event_errors.push(`Unknown property '${prop}' near line ${lineNum}`);
    } else if (KNOWN.includes(prop) && !REQUIRED.includes(prop)) {
      warning_messages.push(`Optional property '${prop}' has been ignored.`);
    }
  });

  return {
    valid: event_errors.length === 0,
    event_errors,
    warning_messages
  };
}

module.exports = { check_event_validity };
