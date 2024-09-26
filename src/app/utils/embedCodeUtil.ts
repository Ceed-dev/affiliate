/**
 * Generates an iframe embed code for an image with a clickable link.
 * 
 * @param imageUrl - The URL of the image to embed.
 * @param linkUrl - The URL to open when the image is clicked.
 * @param width - The width of the iframe (default: 600).
 * @param height - The height of the iframe (default: 400).
 * @returns The generated iframe embed code as a string.
 */
export function generateEmbedCode(imageUrl: string, linkUrl: string, width: number = 600, height: number = 400): string {
  // HTML structure for embedding the image and clickable link
  const embedHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body, html {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background: transparent;
        }
        .image-container {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .image-container img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
      </style>
    </head>
    <body>
      <div class="image-container">
        <img src="${imageUrl}" alt="Embedded Image">
      </div>
      <a href="${linkUrl}" target="_blank" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 10; cursor: pointer;"></a>
    </body>
    </html>`.trim(); // Trim any extra whitespace

  // Replace quotes and newlines for proper embedding in srcdoc
  const sanitizedHtml = embedHtml.replace(/"/g, '&quot;').replace(/\n/g, '');

  // Generate iframe code with the provided width and height
  const iframeCode = `<iframe srcdoc="${sanitizedHtml}" frameborder="0" width="${width}" height="${height}"></iframe>`;

  return iframeCode;
}
