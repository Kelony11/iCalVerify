// --- Import modules and helpers ---
const fs = require("fs");              
const path = require("path");         
const { check_event_validity } = require("./validator");

// --- Retrieve user input file path from CLI ---
const user_input = process.argv[2];
if (!user_input) {
    console.error("Usage: node index.js <filename>");
    process.exit(1);
}

try {
    // --- Read file content and prep containers ---
    const file_content = fs.readFileSync(path.resolve(user_input), "utf-8");

    const events = [], detected_errors = [], warnings = [];  

    let e_object = null, inbetween_calendar = false;           
    let line_index = 0, ignore_nested = false; 
     
    const file_lines = file_content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    // --- Iterate through each line in the file ---
    for (const line of file_lines) {
        line_index++;

        // Detect START of VCALENDAR

        if (/^begin:vcalendar$/i.test(line)) {
            if (inbetween_calendar) {
                detected_errors.push(`VCALENDAR IS NESTED AT LINE: ${line_index}`);
            }
            // Marks inbetween_calendar = true so future lines are treated as part of the calendar.
            inbetween_calendar = true;
            continue;
        }

        // Detect END of VCALENDAR
        if (/^end:vcalendar$/i.test(line)) {
            if (!inbetween_calendar) {
                detected_errors.push(`VCALENDAR ENDED WITHOUT BEGIN AT LINE: ${line_index}`);
            }
            
            inbetween_calendar = false;
            continue;
        }

        // Skip anything outside the calendar
        if (!inbetween_calendar) {
            continue;
        }

        // Detect START of VEVENT block
        if (/^begin:vevent$/i.test(line)) {
            if (e_object) { detected_errors.push(`NESTED VEVENT DETECTED AT LINE: ${line_index}`); }
            
            e_object = {};
            continue;
        }

        // Detect END of VEVENT block
        if (/^end:vevent$/i.test(line) && !e_object) {
            detected_errors.push(`VEVENT ENDED WITHOUT BEGIN AT LINE: ${line_index}`);
        } else if (/^end:vevent$/i.test(line) && e_object) {

            const { valid, event_errors, warning_messages } = check_event_validity(e_object, line_index);

            if (!valid) { detected_errors.push(...event_errors) };

            warnings.push(...warning_messages);
            events.push(e_object);
            e_object = null;
            continue;
        }

        // Parse lines inside VEVENT block
        if (e_object) {

            // If currently skipping nested component, ignore until matching END:
            if (ignore_nested) {
                if (/^end:/i.test(line)) {
                    ignore_nested = false;
                }
                continue;
            }

            // IGNORE NESTED COMPONENTS LIKE VALARM OR VTODO
            if (/^begin:/i.test(line) && !/^begin:vevent$/i.test(line)) {
                warnings.push(`IGNORED NESTED COMPONENT: ${line} AT LINE: ${line_index}`);
                ignore_nested = true; // enter skip mode
                continue; // skip all nested component lines
            }


            //  *** Normal property parsing ****

            const parts = line.split(":"); // each property follows name:value
            if (parts.length < 2) {
                detected_errors.push(`LINE FORMAT IS INVALID AT LINE: ${line_index}`);
                continue;
            }

            const key = parts[0].trim().toUpperCase();      
            const val = parts.slice(1).join(":").trim();   

            // DETECT KEY DUPLICATES 
            if (e_object[key]) {
                detected_errors.push(`DETECTED DUPLICATE KEY: '${key}' AT LINE: ${line_index}`);
            } else {
                e_object[key] = val; // store/update property
            }
        }
    }

    // --- Enforce Calendar-Level Checks
    if (!file_lines.some((l) => /^PRODID:/i.test(l))) {
        detected_errors.push("PRODID PROPERTY IS MISSING IN VCALENDAR!");
    }

    if (!file_lines.some((l) => /^VERSION:/i.test(l))) {
        detected_errors.push("VERSION PROPERTY IS MISSING IN VCALENDAR!");
    }

    if (events.length === 0) { detected_errors.push("NO VEVENT BLOCKS FOUND"); }

    

    // --- PRINT FINAL REPORT IN A TXT FILE ---
    const program_report = [
        "\n ===> iCALENDAR VALIDATION SUMMARY <=== \n",
        ...warnings.map(w => "⚠️ " + w), " ",
        detected_errors.length 
        // if errors were detected
        ? [`\n==> ❌ INVALID CALENDAR. WE DETECTED ${detected_errors.length} IN THE FILE <== \n`, ...detected_errors.map(e => "❌ " + e)] // True
        : ["\n✅ CALENDAR IS VALID -> NO ERROR FOUND! ✅"] // False 
    ].flat().join("\n");
    
    fs.writeFileSync("program_result.txt", program_report);
    console.log("\n📁 program_result.txt created successfully!");



    // PRINT THE PROGRAM OUTPUT ON THE CONSOLE
    console.log("\n ===> iCALENDAR VALIDATION SUMMARY <=== \n");

    // Ignored Warnings
    if (warnings.length) {
        for (let w of warnings) { console.log("\n⚠️ " + w + "") }
    }

    // Detected errors 
    if (detected_errors.length) {
        console.log(`\n==> ❌ INVALID CALENDAR. WE DETECTED ${detected_errors.length} IN THE FILE <== \n`)
        for (let e of detected_errors) {console.log("❌ " + e)};
        
    } else {
        console.log("\n✅ CALENDAR IS VALID -> NO ERROR FOUND! ✅");
    }

} catch (err) {
    console.error("❌ Execution error:", err.message);
}
