# iCalVerify 🗓️
**Node.js CLI for Verifying iCalendar (.ics) Event Files**

# PROJECT OVERVIEW
iCalVerify is a Node.js-based command-line utility that validates iCalendar (.ics) files according to the RFC 5545 standard. Specifically focused on the VEVENT component, iCalVerify ensures that calendar files used for patient scheduling or event booking contain the required structure and properties while gracefully handling optional and nested elements (like VALARM).

The tool reads a calendar file, checks each event for compliance, reports all errors and warnings, and summarizes the results directly in the console.

# KEY FEATURES 🔑
- 🧾 Reads .ics calendar files and validates their structure (BEGIN:VCALENDAR ... END:VCALENDAR) and event components (BEGIN:VEVENT ... END:VEVENT).

- Checks for required iCalendar properties: UID, DTSTAMP, DTSTART, METHOD, STATUS, and ATTENDEE.

- Includes full Jasmine test coverage for edge cases (missing fields, bad METHOD, invalid timestamps, malformed ATTENDEE).


# TECHNICAL STACK 🧱
- Programming Languages/Technologies: Node.js, JavaScript (ES6)

- Testing Framework: Jasmine

- File System & Path Utilities: Node’s built-in fs and path modules.

- Development Tools: VS Code, npm, Git/GitHub.


# WHAT'S NEXT?
- Add support for additional calendar components (VTODO, VJOURNAL).

- Introduce a CLI flag for JSON or text output reports.

- Bundle the tool as an npm package for public use

# Contributors

- Kelvin Ihezue
