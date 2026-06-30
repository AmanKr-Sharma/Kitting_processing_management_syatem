# Kitting_processing_management_syatem

Tata Motors Ltd · Solo Project · Node-RED · Node.js · JavaScript · HTML5 · CSS3 · Socket.IO · PostgreSQL · jsQR

– Built an end-to-end pick-to-light kitting system for Tata Motors' assembly line, where scanning a vehicle's QR code auto-activates LED lights on correct part bins, guiding new workers to pick exact parts among multiple co-stored vehicle models

– Engineered LED control module sending real-time commands to physical hardware via MAC ID, with multi-stage part status tracking (Request Sent → Blink Pass/Fail → Pickup Done/Not Done) for complete kitting visibility

– Developed a live WebSocket dashboard (Node-RED + Socket.IO) showing paginated ASN-wise kitting status, today's completed-vehicle count, and shift-wise donut chart analytics — all auto-updating without page refresh

– Built Kitting In Process and Today's Completed modals with live filtered data, plus a Manual Complete feature with supervisor authentication for exceptional cases

– Integrated jsQR-based QR scanning with manual fallback entry, and PostgreSQL for vehicle-part mapping, kitting history, and LED device registry

– Independently owned the full stack — UI/UX, backend logic, real-time hardware communication, and database design — currently deployed and in active use on the shop floor
