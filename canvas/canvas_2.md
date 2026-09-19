Update our HTML5 Canvas codebase to support importing external file types via drag-and-drop or file picker:

1. IMAGE IMPORT (PNG/JPG/SVG):
   - Allow users to drop image files onto the canvas.
   - Store them as "image" element types with x, y, width, height, and dataURL properties.
   - Render them on the 2D context inside the current view transform matrix.

2. EXCALIDRAW IMPORT (.excalidraw):
   - Add a file importer option that parses .excalidraw JSON files.
   - Map Excalidraw freedraw points and lines into our internal vector element array.

3. UI ADJUSTMENT:
   - Separate the bottom toolbar into visual groups using subtle vertical dividers (Tools | Colors | Sizes | File Actions).
   - Collapse the top-right shortcuts box into a toggleable modal icon.
