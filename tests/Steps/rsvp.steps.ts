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

// RSVP Feature Steps
Given('I am on the InviteLink home page', async function() {
  await page.goto(`${baseUrl}/`);
  await page.waitForLoadState('networkidle');
});

When('I scan a valid QR code', async function() {
  // Simulate QR code scan - in real tests, this would use a test QR code
  const testInviteId = 'INV-TEST-001';
  await page.goto(`${baseUrl}/rsvp?inviteId=${testInviteId}`);
  await page.waitForLoadState('networkidle');
});

Then('I should see the RSVP form', async function() {
  const form = await page.locator('form[data-testid="rsvp-form"]');
  if (!form) {
    throw new Error('RSVP form not found');
  }
  const isVisible = await form.isVisible();
  if (!isVisible) {
    throw new Error('RSVP form is not visible');
  }
});

Then('the form should pre-fill my guest name', async function() {
  const guestNameField = await page.locator('input[name="guestName"]');
  const value = await guestNameField.inputValue();
  if (!value || value.trim().length === 0) {
    throw new Error('Guest name field is not pre-filled');
  }
});

Then('I should be able to select attendance status', async function() {
  const attendanceSelect = await page.locator('select[name="attendanceStatus"]');
  const isEnabled = await attendanceSelect.isEnabled();
  if (!isEnabled) {
    throw new Error('Attendance status select is not enabled');
  }
});

Then('I should be able to add plus-ones', async function() {
  const plusOnesInput = await page.locator('input[name="numberOfGuests"]');
  const isEnabled = await plusOnesInput.isEnabled();
  if (!isEnabled) {
    throw new Error('Plus-ones input is not enabled');
  }
});

Then('I should be able to select parking preference', async function() {
  const parkingSelect = await page.locator('select[name="parkingPreference"]');
  const isEnabled = await parkingSelect.isEnabled();
  if (!isEnabled) {
    throw new Error('Parking preference select is not enabled');
  }
});

// RSVP Form Submission Steps
Given('I have the RSVP form open', async function() {
  await page.goto(`${baseUrl}/rsvp?inviteId=INV-TEST-002`);
  await page.waitForLoadState('networkidle');
  const form = await page.locator('form[data-testid="rsvp-form"]');
  if (!await form.isVisible()) {
    throw new Error('RSVP form not visible');
  }
});

When('I fill in the guest name as {string}', async function(name: string) {
  const guestNameField = await page.locator('input[name="guestName"]');
  await guestNameField.fill(name);
});

When('I select attendance status as {string}', async function(status: string) {
  const attendanceSelect = await page.locator('select[name="attendanceStatus"]');
  await attendanceSelect.selectOption(status.toLowerCase());
});

When('I add {int} plus-ones', async function(count: number) {
  const plusOnesInput = await page.locator('input[name="numberOfGuests"]');
  await plusOnesInput.fill(count.toString());
});

When('I select parking preference as {string}', async function(preference: string) {
  const parkingSelect = await page.locator('select[name="parkingPreference"]');
  await parkingSelect.selectOption(preference.toLowerCase());
});

When('I click the submit button', async function() {
  const submitButton = await page.locator('button[type="submit"]');
  await submitButton.click();
  await page.waitForLoadState('networkidle');
});

Then('I should see a confirmation message', async function() {
  const confirmation = await page.locator('[data-testid="confirmation-message"]');
  const isVisible = await confirmation.isVisible();
  if (!isVisible) {
    throw new Error('Confirmation message not visible');
  }
});

Then('the confirmation should display {string}', async function(text: string) {
  const pageContent = await page.textContent('body');
  if (!pageContent || !pageContent.includes(text)) {
    throw new Error(`Expected text "${text}" not found in confirmation`);
  }
});

Then('the confirmation should show the guest count', async function() {
  const guestCountElement = await page.locator('[data-testid="guest-count"]');
  const isVisible = await guestCountElement.isVisible();
  if (!isVisible) {
    throw new Error('Guest count not displayed');
  }
});

// Confirmation Page Steps
Given('I have successfully submitted my RSVP', async function() {
  await page.goto(`${baseUrl}/rsvp?inviteId=INV-TEST-003`);
  await page.waitForLoadState('networkidle');
  
  const guestNameField = await page.locator('input[name="guestName"]');
  await guestNameField.fill('Jane Smith');
  
  const attendanceSelect = await page.locator('select[name="attendanceStatus"]');
  await attendanceSelect.selectOption('attending');
  
  const submitButton = await page.locator('button[type="submit"]');
  await submitButton.click();
  await page.waitForLoadState('networkidle');
});

When('I view the confirmation page', async function() {
  const confirmationPage = await page.locator('[data-testid="confirmation-page"]');
  const isVisible = await confirmationPage.isVisible();
  if (!isVisible) {
    throw new Error('Confirmation page not visible');
  }
});

Then('I should see my guest information', async function() {
  const guestInfo = await page.locator('[data-testid="guest-info"]');
  const isVisible = await guestInfo.isVisible();
  if (!isVisible) {
    throw new Error('Guest information not visible');
  }
});

Then('I should see the event details', async function() {
  const eventDetails = await page.locator('[data-testid="event-details"]');
  const isVisible = await eventDetails.isVisible();
  if (!isVisible) {
    throw new Error('Event details not visible');
  }
});

Then('I should see a QR code for check-in', async function() {
  const qrCode = await page.locator('[data-testid="checkin-qr-code"]');
  const isVisible = await qrCode.isVisible();
  if (!isVisible) {
    throw new Error('Check-in QR code not visible');
  }
});

Then('I should have an option to modify my RSVP', async function() {
  const modifyButton = await page.locator('button[data-testid="modify-rsvp"]');
  const isVisible = await modifyButton.isVisible();
  if (!isVisible) {
    throw new Error('Modify RSVP option not visible');
  }
});

// Validation Error Steps
When('I submit the form without filling in required fields', async function() {
  const submitButton = await page.locator('button[type="submit"]');
  await submitButton.click();
  await page.waitForLoadState('networkidle');
});

Then('I should see validation error messages', async function() {
  const errorMessages = await page.locator('[data-testid="error-message"]');
  const count = await errorMessages.count();
  if (count === 0) {
    throw new Error('No validation error messages found');
  }
});

Then('the error messages should be clear', async function() {
  const errorMessages = await page.locator('[data-testid="error-message"]');
  const count = await errorMessages.count();
  for (let i = 0; i < count; i++) {
    const text = await errorMessages.nth(i).textContent();
    if (!text || text.trim().length === 0) {
      throw new Error(`Error message ${i} is empty`);
    }
  }
});

Then('the form should remain open', async function() {
  const form = await page.locator('form[data-testid="rsvp-form"]');
  const isVisible = await form.isVisible();
  if (!isVisible) {
    throw new Error('Form should remain open but is not visible');
  }
});

Then('I should be able to correct the errors', async function() {
  const guestNameField = await page.locator('input[name="guestName"]');
  await guestNameField.fill('Corrected Name');
  
  const attendanceSelect = await page.locator('select[name="attendanceStatus"]');
  await attendanceSelect.selectOption('attending');
});

// Mobile Responsiveness Steps
Given('I am viewing the app on a mobile device', async function() {
  await page.setViewportSize({ width: 375, height: 667 });
});

When('I navigate to the RSVP page', async function() {
  await page.goto(`${baseUrl}/rsvp?inviteId=INV-TEST-004`);
  await page.waitForLoadState('networkidle');
});

Then('the form should be mobile-friendly', async function() {
  const viewport = page.viewportSize();
  if (!viewport || viewport.width > 500) {
    throw new Error('Not in mobile viewport');
  }
  const form = await page.locator('form[data-testid="rsvp-form"]');
  const isVisible = await form.isVisible();
  if (!isVisible) {
    throw new Error('Form not visible in mobile viewport');
  }
});

Then('the buttons should be easily clickable', async function() {
  const buttons = await page.locator('button').all();
  for (const button of buttons) {
    const boundingBox = await button.boundingBox();
    if (boundingBox && boundingBox.height < 44) {
      console.warn('Button might be too small for mobile');
    }
  }
});

Then('the text should be readable', async function() {
  const bodyText = await page.locator('body');
  const fontSize = await bodyText.evaluate(el => window.getComputedStyle(el).fontSize);
  const fsValue = parseInt(fontSize);
  if (fsValue < 14) {
    throw new Error('Text size might be too small for mobile');
  }
});

Then('all fields should be accessible', async function() {
  const inputs = await page.locator('input, select, textarea').all();
  if (inputs.length === 0) {
    throw new Error('No form fields found');
  }
  for (const input of inputs) {
    const isVisible = await input.isVisible();
    if (!isVisible) {
      throw new Error('Some form fields are not accessible');
    }
  }
});
