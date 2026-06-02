const getEmailTemplate = (title, content) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        color: #0f1419;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      }
      .header {
        background-color: #0f1419;
        padding: 30px 20px;
        text-align: center;
        border-bottom: 4px solid #d4af37;
      }
      .header img {
        max-width: 180px;
        height: auto;
      }
      .content {
        padding: 40px 30px;
        line-height: 1.6;
        font-size: 16px;
      }
      .content h1 {
        color: #d4af37;
        font-size: 24px;
        margin-top: 0;
        margin-bottom: 20px;
      }
      .footer {
        background-color: #f9f9f9;
        padding: 20px;
        text-align: center;
        font-size: 12px;
        color: #777777;
        border-top: 1px solid #eeeeee;
      }
      .btn {
        display: inline-block;
        padding: 12px 24px;
        background-color: #22c8e5;
        color: #ffffff;
        text-decoration: none;
        border-radius: 4px;
        font-weight: bold;
        margin-top: 20px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="https://evobrandconcepts.com/logo.png" alt="EVOBRAND" />
      </div>
      <div class="content">
        <h1>${title}</h1>
        ${content}
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} EVOBRAND. All rights reserved.<br>
        <a href="https://evobrandconcepts.com" style="color: #22c8e5; text-decoration: none;">evobrandconcepts.com</a>
      </div>
    </div>
  </body>
  </html>
  `;
};

module.exports = { getEmailTemplate };
