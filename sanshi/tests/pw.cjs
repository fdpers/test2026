const { chromium } = require('playwright');
const fs = require('fs');

function launchChromium(options = {}) {
  const configured = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
  const cloudDefault = '/opt/pw-browsers/chromium';
  const executablePath = configured || (fs.existsSync(cloudDefault) ? cloudDefault : null);
  return chromium.launch(executablePath ? { executablePath, ...options } : options);
}

module.exports = { launchChromium };
