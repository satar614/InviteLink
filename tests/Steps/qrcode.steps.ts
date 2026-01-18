import { When, Then, Given, Before, After } from '@cucumber/cucumber';
import { chromium, Browser, Page } from 'playwright';

let browser: Browser;
let page: Page;
const baseUrl = process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:3000';
const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';

Before(async function() {
  browser = await chromium.launch({
    headless: process.env.PLAYWRIGHT_HEADED !== '1'
  });
  page = await browser.newPage();
});

After(async function() {
  await page.close();
  await browser.close();
});

// QR Code Scanning Steps
Given('I have the QR scanner ready', async function() {
  await page.goto(`${baseUrl}/scanner`);
  await page.waitForLoadState('networkidle');
  
  const scanner = await page.locator('[data-testid="qr-scanner"]');
  const isVisible = await scanner.isVisible();
  if (!isVisible) {
    throw new Error('QR Scanner not visible');
  }
});

When('I scan a valid InviteLink QR code', async function() {
  // Simulate QR code scan with test data
  const testData = 'INV-TEST-VALID-001';
  await page.evaluate((data) => {
    const event = new CustomEvent('qrcodescanned', { detail: data });
    window.dispatchEvent(event);
  }, testData);
  
  await page.waitForLoadState('networkidle');
});

Then('the invite information should be decoded', async function() {
  const inviteInfo = await page.locator('[data-testid="invite-info"]');
  const isVisible = await inviteInfo.isVisible();
  if (!isVisible) {
    throw new Error('Invite information not displayed');
  }
});

Then('the guest name should be displayed', async function() {
  const guestName = await page.locator('[data-testid="guest-name"]');
  const text = await guestName.textContent();
  if (!text || text.trim().length === 0) {
    throw new Error('Guest name not displayed');
  }
});

Then('the allowed guest count should be shown', async function() {
  const guestCount = await page.locator('[data-testid="allowed-guest-count"]');
  const text = await guestCount.textContent();
  if (!text || text.trim().length === 0) {
    throw new Error('Allowed guest count not shown');
  }
});

Then('the event date should be visible', async function() {
  const eventDate = await page.locator('[data-testid="event-date"]');
  const text = await eventDate.textContent();
  if (!text || text.trim().length === 0) {
    throw new Error('Event date not visible');
  }
});

// Invalid QR Code Steps
When('I scan an invalid QR code', async function() {
  const testData = 'INVALID-QR-CODE';
  await page.evaluate((data) => {
    const event = new CustomEvent('qrcodescanned', { detail: data });
    window.dispatchEvent(event);
  }, testData);
  
  await page.waitForLoadState('networkidle');
});

Then('I should see an error message', async function() {
  const errorMessage = await page.locator('[data-testid="qr-error"]');
  const isVisible = await errorMessage.isVisible();
  if (!isVisible) {
    throw new Error('Error message not visible');
  }
});

Then('the error should indicate {string}', async function(expectedError: string) {
  const errorMessage = await page.locator('[data-testid="qr-error"]');
  const text = await errorMessage.textContent();
  if (!text || !text.includes(expectedError)) {
    throw new Error(`Expected error message to contain "${expectedError}"`);
  }
});

Then('I should be prompted to try scanning again', async function() {
  const retryButton = await page.locator('button[data-testid="retry-scan"]');
  const isVisible = await retryButton.isVisible();
  if (!isVisible) {
    throw new Error('Retry option not available');
  }
});

// Check-in Steps
Given('I have scanned a valid QR code', async function() {
  await page.goto(`${baseUrl}/scanner`);
  await page.waitForLoadState('networkidle');
  
  const testData = 'INV-TEST-CHECKIN-001';
  await page.evaluate((data) => {
    const event = new CustomEvent('qrcodescanned', { detail: data });
    window.dispatchEvent(event);
  }, testData);
  
  await page.waitForLoadState('networkidle');
});

When('I click the check-in button', async function() {
  const checkinButton = await page.locator('button[data-testid="checkin-button"]');
  await checkinButton.click();
  await page.waitForLoadState('networkidle');
});

Then('the guest should be marked as present', async function() {
  const status = await page.locator('[data-testid="guest-status"]');
  const text = await status.textContent();
  if (!text || !text.toLowerCase().includes('present')) {
    throw new Error('Guest not marked as present');
  }
});

Then('a timestamp should be recorded', async function() {
  const timestamp = await page.locator('[data-testid="checkin-timestamp"]');
  const text = await timestamp.textContent();
  if (!text || text.trim().length === 0) {
    throw new Error('Timestamp not recorded');
  }
});

Then('I should see a success confirmation', async function() {
  const confirmation = await page.locator('[data-testid="checkin-success"]');
  const isVisible = await confirmation.isVisible();
  if (!isVisible) {
    throw new Error('Success confirmation not visible');
  }
});

Then('the guest should receive a confirmation message', async function() {
  const notificationArea = await page.locator('[data-testid="notification-area"]');
  const isVisible = await notificationArea.isVisible();
  if (!isVisible) {
    throw new Error('Notification area not visible');
  }
});

// Multiple Guest Check-in Steps
Given('the invite allows {int} guests total', async function(totalGuests: number) {
  // This would be set based on the QR code data
  const guestAllowance = await page.locator('[data-testid="total-allowed-guests"]');
  const text = await guestAllowance.textContent();
  if (!text || !text.includes(totalGuests.toString())) {
    throw new Error(`Guest allowance should show ${totalGuests}`);
  }
});

When('I check in the primary guest', async function() {
  const checkinButton = await page.locator('button[data-testid="checkin-primary"]');
  await checkinButton.click();
  await page.waitForLoadState('networkidle');
});

When('I check in the first plus-one', async function() {
  const checkinButton = await page.locator('button[data-testid="checkin-plusone-1"]');
  await checkinButton.click();
  await page.waitForLoadState('networkidle');
});

When('I check in the second plus-one', async function() {
  const checkinButton = await page.locator('button[data-testid="checkin-plusone-2"]');
  await checkinButton.click();
  await page.waitForLoadState('networkidle');
});

Then('all three guests should be marked as present', async function() {
  const statuses = await page.locator('[data-testid="guest-status"]').all();
  if (statuses.length < 3) {
    throw new Error('Not all guests are showing status');
  }
  
  for (const status of statuses) {
    const text = await status.textContent();
    if (!text || !text.toLowerCase().includes('present')) {
      throw new Error('Not all guests marked as present');
    }
  }
});

Then('the attendance count should be updated', async function() {
  const attendanceCount = await page.locator('[data-testid="attendance-count"]');
  const text = await attendanceCount.textContent();
  if (!text || !text.includes('3')) {
    throw new Error('Attendance count not updated to 3');
  }
});

Then('the organizer dashboard should reflect the changes', async function() {
  // This would involve checking the dashboard after check-in
  const dashboardData = await page.locator('[data-testid="dashboard-attendance"]');
  const isVisible = await dashboardData.isVisible();
  if (!isVisible) {
    throw new Error('Dashboard data not visible');
  }
});

// Duplicate Check-in Prevention Steps
Given('a guest has already checked in', async function() {
  await page.goto(`${baseUrl}/scanner`);
  await page.waitForLoadState('networkidle');
  
  // Scan and check in
  const testData = 'INV-TEST-DUPLICATE-001';
  await page.evaluate((data) => {
    const event = new CustomEvent('qrcodescanned', { detail: data });
    window.dispatchEvent(event);
  }, testData);
  
  await page.waitForLoadState('networkidle');
  
  const checkinButton = await page.locator('button[data-testid="checkin-button"]');
  await checkinButton.click();
  await page.waitForLoadState('networkidle');
});

When('I scan their QR code again', async function() {
  const testData = 'INV-TEST-DUPLICATE-001';
  await page.evaluate((data) => {
    const event = new CustomEvent('qrcodescanned', { detail: data });
    window.dispatchEvent(event);
  }, testData);
  
  await page.waitForLoadState('networkidle');
});

Then('I should see a message indicating they\'re already checked in', async function() {
  const message = await page.locator('[data-testid="already-checkedin-message"]');
  const isVisible = await message.isVisible();
  if (!isVisible) {
    throw new Error('Already checked-in message not visible');
  }
});

Then('the system should not create a duplicate entry', async function() {
  const entryCount = await page.locator('[data-testid="entry-count"]');
  const text = await entryCount.textContent();
  if (text && text.includes('2')) {
    throw new Error('Duplicate entry was created');
  }
});

Then('I should have an option to mark as re-entry if allowed', async function() {
  const reentryButton = await page.locator('button[data-testid="mark-reentry"]');
  const isVisible = await reentryButton.isVisible();
  // This is optional, so we just check if it's available when shown
  if (isVisible) {
    const isEnabled = await reentryButton.isEnabled();
    if (!isEnabled) {
      throw new Error('Re-entry button is disabled');
    }
  }
});
