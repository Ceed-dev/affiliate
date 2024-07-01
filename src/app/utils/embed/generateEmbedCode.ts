export function generateEmbedCode(imageUrl: string, linkUrl: string, width: number = 600, height: number = 400): string {
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
      <a href="${linkUrl}" target="_blank" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:10;cursor:pointer;"></a>
    </body>
    </html>`;

  const iframeCode = `<iframe srcdoc="${embedHtml.replace(/"/g, '&quot;').replace(/\n/g, '')}" frameborder="0" width="${width}" height="${height}"></iframe>`;
  return iframeCode;
}