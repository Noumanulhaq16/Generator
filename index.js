const express = require('express');
const puppeteer = require('puppeteer');
const pptxgen = require('pptxgenjs');
const PDFDocument = require('pdfkit')
const fs = require('fs');
const path = require('path');
const { promises } = require('dns');

const app = express();
const PORT = 5000;
function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  });
}
// Route to generate PDF from a webpage
app.get('/generate-pdf', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('URL is required');
  }

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Set a custom viewport size to ensure full page height
    await page.setViewport({ width: 1920, height: 1080 });

    // Set custom headers if needed
    await page.setExtraHTTPHeaders({
      'Cookie': '_gcl_au=1.1.480932350.1714026596; _ga=GA1.1.670194784.1714026596; hs_uhash=2135584481; _ym_uid=1714026596740287313; _ym_d=1714026596; _uetvid=3b8d4c9002cd11efb2b9ad48d8a58ac4; _fbp=fb.0.1714026596267.1472929880; __stripe_mid=8cc0bd42-6409-40de-abd2-1e0527505245655dcb; sc.connect.sid=s%3A35x1iz34CtFWnUKnqgh0bY9-FDUhYe1I.vSFxDt%2B5dDU11ifWwsel4TXomUniNJ5m%2BusZRnKgRfQ; _gid=GA1.1.606148466.1715838145; _uetsid=131d3a20134711efbe9ebfaff7ae2999; amp_19ae3d=gkA33oWz-UhkyckIagzla5.NjY0MzU3MDQyNWI1YWQ0YmE4ZWRlODY0..1hu0hcetr.1hu0hqvgn.1j.0.1j; _ym_isad=2; _ga_BR52H1E0FP=GS1.1.1715947815.54.1.1715948258.60.0.0; crisp-client%2Fsession%2F009dfb20-2c70-4bba-84b7-9bfb16bc429a=session_78d58ddf-98c3-4cb3-a4a8-d321b7aaaf6d; _gat_UA-28214804-3=1; _ga_PCVBQ26MQM=GS1.1.1715947757.51.1.1715948883.59.0.0'
    });

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    // await page.waitForRequest(
    //   response => console.log(response.url().toString()),
    //   { timeout: 30000 }
    // );
    const bodyHeight = await page.evaluate(() =>
      document.documentElement.scrollHeight
    );
    const bodyWidth = await page.evaluate(() => document.documentElement.scrollWidth);

    // await autoScroll(page);

    // Capture screenshot of the entire page
    const screenshot = await page.screenshot({ fullPage: true });

    await browser.close();

    // Convert screenshot to PDF
    const pdfDoc = new PDFDocument(
      {
        size: [bodyWidth, bodyHeight],
        margin: 0,
      }

    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=webpage.pdf');
    pdfDoc.pipe(res);
    pdfDoc.image(screenshot, { fit: [bodyWidth, bodyHeight] });
    pdfDoc.end();
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('Error generating PDF');
  }
});


async function autoScroll(page, maxScrolls) {
  await page.evaluate(async (maxScrolls) => {
    await new Promise((resolve) => {
      var totalHeight = 0;
      var distance = 100;
      var scrolls = 0;  // scrolls counter
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        scrolls++;  // increment counter

        // stop scrolling if reached the end or the maximum number of scrolls
        if (totalHeight >= scrollHeight - window.innerHeight || scrolls >= maxScrolls) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  }, maxScrolls);  // pass maxScrolls to the function
}

// Route to generate PPTX from a webpage
app.get('/generate-pptx', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('URL is required');
  }

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      'Cookie': '_gcl_au=1.1.480932350.1714026596; _ga=GA1.1.670194784.1714026596; hs_uhash=2135584481; _ym_uid=1714026596740287313; _ym_d=1714026596; _uetvid=3b8d4c9002cd11efb2b9ad48d8a58ac4; _fbp=fb.0.1714026596267.1472929880; __stripe_mid=8cc0bd42-6409-40de-abd2-1e0527505245655dcb; sc.connect.sid=s%3A35x1iz34CtFWnUKnqgh0bY9-FDUhYe1I.vSFxDt%2B5dDU11ifWwsel4TXomUniNJ5m%2BusZRnKgRfQ; _gid=GA1.1.606148466.1715838145; _uetsid=131d3a20134711efbe9ebfaff7ae2999; amp_19ae3d=gkA33oWz-UhkyckIagzla5.NjY0MzU3MDQyNWI1YWQ0YmE4ZWRlODY0..1hu0hcetr.1hu0hqvgn.1j.0.1j; _ym_isad=2; crisp-client%2Fsession%2F009dfb20-2c70-4bba-84b7-9bfb16bc429a=session_ede4e14d-df7f-41b7-9494-0d60af076c2c; _ga_BR52H1E0FP=GS1.1.1715930491.51.1.1715934045.58.0.0; _ga_PCVBQ26MQM=GS1.1.1715940722.49.1.1715940738.44.0.0; _gat_UA-28214804-3=1'
    })
    await page.goto(url, { waitUntil: 'networkidle2' });

    await page.waitForTimeout(5000)
    const bodyHeight = await page.evaluate(() =>
      document.documentElement.scrollHeight
    );
    const bodyWidth = await page.evaluate(() => document.documentElement.scrollWidth);

    // await autoScroll(page);

    // Capture screenshot of the entire page
    const screenshot = await page.screenshot({ fullPage: true });

    await browser.close();

    // Convert image to base64
    const base64Image = screenshot.toString('base64');

    // Create a new PowerPoint presentation
    const pptx = new pptxgen();
    const slide = pptx.addSlide();

    // Add the image to the slide
    slide.addImage({
      data: `data:image/png;base64,${base64Image}`,
      x: 0.5,
      y: 0.5,
      w: '90%',
      h: '90%'
    });

    // Write the PowerPoint presentation to buffer
    const pptxBuffer = await pptx.write('nodebuffer');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', 'attachment; filename=webpage.pptx');
    res.send(pptxBuffer);
  } catch (error) {
    console.error('Error generating PPTX:', error);
    res.status(500).send('Error generating PPTX');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
