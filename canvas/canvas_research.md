Act as a Principal Graphics Engine & Systems Engineer. Build a high-performance, single-file HTML5 local-first Canvas Drawing App (index.html).

### CORE REQUIREMENTS & UI
1. CANVAS & TOOLBAR ONLY:
   - Full-screen infinite canvas background.
   - Minimalist floating toolbar containing:
     * Tools: Freehand Pen, Line, Eraser, Pan (Hand tool).
     * Color Picker: Exactly 10 pre-defined quick-switches + custom hex picker.
     * Stroke Width: 3 preset sizes.
     * Multi-Tab Bar: Top bar to switch between multiple active note buffers, add new note tabs, or close tabs.

2. PERFORMANCE ARCHITECTURE (CRITICAL FOR UNLIMITED SCRIBBLES):
   - Offscreen Canvas & Spatial Indexing: Render strokes using path simplification (Ramer-Douglas-Peucker algorithm) to convert raw mouse points into smooth, optimized Bézier curves.
   - Viewport Culling: Only draw vector paths that intersect the current visible screen bounds during pan/zoom.
   - Render Loop: Do NOT bind redraws directly to `mousemove`. Use `requestAnimationFrame` with a dirty-flag render loop to maintain 60 FPS under massive element counts.
   - Matrix Math: Implement smooth 2D Matrix transformations for infinite panning (Middle-click drag or Space+Left-click drag) and zooming (Mouse wheel centered on pointer).

3. LOCAL STORAGE & UNLIMITED SAVING:
   - File System Access API: Integrate `showOpenFilePicker()` and `showSaveFilePicker()` to open and auto-save the active session state as raw JSON directly to the user's local disk without memory or local-storage limits.
   - Schema Structure: Ensure each element has a unique ID, type, coordinate array, bounding box, stroke color, and thickness.

4. FUTURE-PROOFING ARCHITECTURE (MODULAR HOOKS):
   - Structurally separate the codebase into clear sections using vanilla JS ES6 modules/classes:
     * `Engine2D`: Manages camera matrix, canvas context, and animation loops.
     * `StorageManager`: Handles JSON serialization and file handle streams.
     * `Workspace`: Manages tabs and canvas buffer states.
     * `CanvasMode` Enum/Class: Structure canvas bounds handling so it can easily support mode switches in the future (e.g., `FREESTYLE_INFINITE`, `PAGINATED_NOTEBOOK`, and `FIXED_ASPECT_PRESENTATION`).

Output the complete, self-contained HTML/JS/CSS file inside a single code block. No missing code, no placeholder comments.
