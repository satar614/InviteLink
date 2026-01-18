# InviteLink E2E Tests

SpecFlow BDD tests for InviteLink using .NET 8.0 and NUnit.

## Prerequisites

- .NET 8.0 SDK
- Backend and Frontend services running

## Test Structure

```
InviteLink.E2ETests/
├── Features/              # Gherkin feature files
│   ├── RSVP.feature
│   └── QRCode.feature
├── StepDefinitions/       # C# step bindings
│   ├── RSVPStepDefinitions.cs
│   └── QRCodeStepDefinitions.cs
├── Support/               # Test configuration and helpers
│   └── TestConfiguration.cs
└── specflow.json          # SpecFlow configuration
```

## Running Tests

### Run all tests
```bash
cd tests/InviteLink.E2ETests
dotnet test
```

### Run with verbosity
```bash
dotnet test --logger "console;verbosity=detailed"
```

### Run specific feature
```bash
dotnet test --filter "FullyQualifiedName~RSVP"
```

### Run with environment variables
```bash
BACKEND_URL=http://your-backend:8080 FRONTEND_URL=http://your-frontend:3000 dotnet test
```

## Environment Variables

- `BACKEND_URL` - Backend API URL (default: http://localhost:8080)
- `FRONTEND_URL` - Frontend URL (default: http://localhost:3000)
- `CI` - Set to indicate running in CI environment

## Features

### RSVP Flow
Tests the complete guest RSVP workflow:
- Valid RSVP submission
- Missing required fields validation
- RSVP confirmation retrieval

### QR Code Scanning
Tests QR code scanning and check-in:
- Valid QR code scanning
- Invalid QR code handling
- Guest check-in process

## CI/CD Integration

Tests run in the GitHub Actions E2E workflow after deployments complete:
1. Backend and Frontend deploy
2. Services become healthy
3. E2E tests execute against deployed environment
4. Results posted to PR

See `.github/workflows/e2e-tests.yml` for pipeline configuration.

## Writing New Tests

### Add a new feature:
1. Create a `.feature` file in `Features/`
2. Write scenarios in Gherkin syntax
3. Generate step definitions (SpecFlow will help)
4. Implement step bindings in `StepDefinitions/`

### Example:
```gherkin
Feature: My Feature
  Scenario: My scenario
    Given some precondition
    When I perform an action
    Then I expect a result
```

## Test Reports

Test results are output in TRX format and can be uploaded as artifacts in CI/CD pipelines.

To generate HTML reports, use a tool like `ReportGenerator`:
```bash
dotnet test --logger "trx;LogFileName=test-results.trx"
reportgenerator -reports:test-results.trx -targetdir:reports
```
