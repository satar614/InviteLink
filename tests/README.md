# InviteLink End-to-End Tests

Playwright-based BDD tests using SpecFlow (Cucumber) for InviteLink frontend.

## Test Features

- **RSVP Flow** - Guest RSVP process from start to finish
- **QR Code Scanning** - QR code decoding, scanning, and check-in
- **Mobile Responsiveness** - Mobile device testing
- **Validation** - Form validation and error handling

## Setup

```bash
cd tests
npm install
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in headed mode (see browser)
```bash
npm run test:headed
```

### Run tests in debug mode
```bash
npm run test:debug
```

### Generate HTML report
```bash
npm run test:report
```

## Test Structure

- `Features/` - Gherkin feature files (.feature)
- `Steps/` - Step implementation files (.steps.ts)

## Environment Variables

- `APP_URL` - Application URL (default: http://localhost:3000)
- `PLAYWRIGHT_HEADED` - Set to '1' to run in headed mode

## Feature Files

### rsvp.feature
Tests the complete RSVP workflow:
- Home page access
- QR code scanning
- Form filling
- Submission
- Confirmation page
- Error handling
- Mobile responsiveness

### qrcode.feature
Tests QR code scanning and check-in:
- Valid QR code scanning
- Invalid QR code handling
- Check-in process
- Multiple guest check-in
- Duplicate check-in prevention

## CI/CD Integration

Tests run in the GitHub Actions pipeline:
1. Frontend builds
2. Unit tests run
3. Application starts
4. E2E tests execute
5. Reports generated

See `.github/workflows/deploy-frontend.yml` for pipeline configuration.
