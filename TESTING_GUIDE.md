# InviteLink Testing Guide

Complete testing strategy for InviteLink covering unit tests, integration tests, and end-to-end tests.

## 📊 Testing Architecture

```
┌─────────────────────────────────────────────────────┐
│              InviteLink Testing Pyramid              │
├─────────────────────────────────────────────────────┤
│                                                     │
│                  E2E Tests (Top)                   │
│         Playwright + SpecFlow (BDD)                │
│    • RSVP Flow  • QR Scanning  • Mobile            │
│                                                     │
│           Integration Tests (Middle)               │
│   • API endpoints  • Database operations           │
│   • Service interactions                           │
│                                                     │
│        Unit Tests (Bottom - Foundation)            │
│   • Backend: xUnit, Moq, FluentAssertions         │
│   • Frontend: Jest/React Testing Library           │
│   • Controllers, Services, Components              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 🧪 Unit Tests

### Backend Unit Tests (C# xUnit)

**Location:** `backend/SmartInvite.Api.Tests/`

**Test Files:**
- `WeatherForecastControllerTests.cs` - Controller testing
- `HealthCheckTests.cs` - Application health checks

**Running Tests:**

```bash
cd backend/SmartInvite.Api.Tests
dotnet test
dotnet test --configuration Release
dotnet test --logger "trx" --results-directory "./test-results"
```

**Test Coverage:**

- ✅ Controller endpoints
- ✅ Temperature calculations
- ✅ Summary validation
- ✅ Date generation
- ✅ Health checks
- ✅ Version information

**Example Test:**

```csharp
[Fact]
public void Get_ReturnsWeatherForecasts()
{
    // Act
    var result = _controller.Get();

    // Assert
    result.Should().NotBeNull();
    result.Should().HaveCount(5);
}
```

### Frontend Unit Tests (Jest)

**Location:** `frontend/__tests__/`

**Test Files:**
- `App.test.tsx` - Component rendering and lifecycle
- `setup.test.ts` - Environment and configuration
- `rsvp.test.ts` - RSVP workflow logic
- `qrcode.test.ts` - QR code scanning logic

**Running Tests:**

```bash
cd frontend
npm test                              # Interactive watch mode
npm run test -- --coverage           # With coverage report
npm run test -- --watchAll=false     # Single run (CI mode)
```

**Test Coverage:**

- ✅ Component rendering
- ✅ RSVP data validation
- ✅ QR code format validation
- ✅ Email validation
- ✅ Phone number validation
- ✅ Guest count validation
- ✅ Parking preference validation

**Example Test:**

```typescript
it('should have valid email format', () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  expect(emailRegex.test(mockRSVPData.email)).toBe(true);
});
```

## 🧩 Integration Tests

Integration tests verify that different components work together correctly.

**Backend Integration Tests:**
- API endpoints with actual database
- Service-to-service communication
- Authentication and authorization

**Frontend Integration Tests:**
- Component interaction testing
- State management
- API client calls

## 🎭 End-to-End Tests (E2E)

### Technology Stack

- **Framework:** Playwright
- **BDD:** Cucumber (Gherkin)
- **Language:** TypeScript

### Feature Files

**Location:** `tests/Features/`

#### RSVP Flow (`rsvp.feature`)

Tests the complete guest RSVP workflow:

```gherkin
Scenario: Guest RSVPs to event
  Given I am on the InviteLink home page
  When I scan a valid QR code
  Then I should see the RSVP form
  And the form should pre-fill my guest name
  And I should be able to select attendance status
```

**Scenarios Covered:**
- ✅ Home page access
- ✅ QR code scanning
- ✅ Form display and population
- ✅ RSVP submission
- ✅ Confirmation display
- ✅ Error handling
- ✅ Mobile responsiveness

#### QR Code Scanning (`qrcode.feature`)

Tests QR code scanning and check-in process:

```gherkin
Scenario: Check-in with QR code
  Given I have scanned a valid QR code
  When I click the check-in button
  Then the guest should be marked as present
  And a timestamp should be recorded
```

**Scenarios Covered:**
- ✅ Valid QR code decoding
- ✅ Invalid QR code handling
- ✅ Check-in process
- ✅ Multiple guest check-in
- ✅ Duplicate check-in prevention
- ✅ Timestamp recording

### Step Implementations

**Location:** `tests/Steps/`

#### RSVP Steps (`rsvp.steps.ts`)

- 28+ step implementations
- Page navigation
- Form interactions
- Validation checks

#### QR Code Steps (`qrcode.steps.ts`)

- 25+ step implementations
- Scanner interaction
- Check-in process
- Event simulation

### Running E2E Tests

```bash
cd tests

# Install dependencies
npm install

# Run all tests (headless)
npm test

# Run with browser visible
npm run test:headed

# Debug mode
npm run test:debug

# Generate HTML report
npm run test:report
```

**Test Output:**

```
✓ RSVP Flow - Guest RSVPs to event (1.2s)
✓ RSVP Flow - Guest submits RSVP (2.1s)
✓ RSVP Flow - Guest views confirmation (1.5s)
✓ QR Code Scanning - Scan valid QR code (0.8s)
✓ QR Code Scanning - Check-in with QR code (1.3s)

5 passing (6.9s)
```

## 🔄 CI/CD Test Integration

### Test Execution Flow

```
┌─────────────────┐
│  Code Push      │
└────────┬────────┘
         │
    ┌────▼────┐
    │ Backend │
    │ Tests   │
    ├─────────┤
    │• Build  │
    │• Unit   │
    │• Report │
    └────┬────┘
         │
    ┌────▼─────────┐
    │  Frontend     │
    │  Tests        │
    ├───────────────┤
    │• Unit Tests   │
    │• E2E Tests    │
    │• Coverage     │
    │• Reports      │
    └────┬──────────┘
         │
    ┌────▼──────────┐
    │  Docker Build │
    │  & Push       │
    └────┬──────────┘
         │
    ┌────▼──────┐
    │ Deploy     │
    │ to AKS    │
    └───────────┘
```

### Backend Workflow Tests

**File:** `.github/workflows/deploy-backend.yml`

```yaml
- name: Run backend unit tests
  working-directory: ./backend/SmartInvite.Api.Tests
  run: dotnet test --configuration Release --logger "trx"
```

**Test Artifacts:**
- Test results (TRX format)
- Coverage reports
- Failed test logs

### Frontend Workflow Tests

**File:** `.github/workflows/deploy-frontend.yml`

```yaml
- name: Run frontend unit tests
  working-directory: ./frontend
  run: npm run test -- --coverage --watchAll=false

- name: Run E2E tests
  working-directory: ./tests
  run: npm test
```

**Test Artifacts:**
- Coverage reports (frontend)
- E2E test reports
- Screenshots/videos on failure (optional)

## 📊 Test Reports

### Test Artifacts

Tests generate reports stored in GitHub Actions:

**Backend:**
- TRX test results: `test-results/`
- Coverage summary: Console output

**Frontend:**
- Jest coverage: `frontend/coverage/`
- E2E HTML report: `tests/reports/test-report.html`
- E2E JSON report: `tests/reports/test-report.json`

### Accessing Reports

1. Go to GitHub Actions → Workflow Run
2. Click "Summary"
3. Scroll to "Artifacts"
4. Download test results

### Coverage Thresholds

**Backend:**
- Line coverage: ≥ 70%
- Branch coverage: ≥ 65%

**Frontend:**
- Line coverage: ≥ 60%
- Branch coverage: ≥ 50%

## 🚀 Running Tests Locally

### Prerequisites

```bash
# Backend
dotnet --version    # 8.0 or later

# Frontend
node --version      # 18 or later
npm --version       # 9 or later
```

### Complete Local Test Run

```bash
# Backend tests
cd backend/SmartInvite.Api.Tests
dotnet test
cd ../..

# Frontend unit tests
cd frontend
npm install
npm run test -- --watchAll=false --coverage
cd ..

# Frontend E2E tests
cd tests
npm install
npm test
cd ..
```

### Test Results Summary

```
Backend Unit Tests:
  5 passed, 0 failed
  Coverage: 75%

Frontend Unit Tests:
  8 passed, 0 failed
  Coverage: 62%

Frontend E2E Tests:
  12 passed, 0 failed
  Duration: 45s
```

## 📝 Writing New Tests

### Adding a Backend Unit Test

```csharp
[Fact]
public void YourTest_ShouldDescribeExpectedBehavior()
{
    // Arrange
    var controller = new YourController(_mockService.Object);

    // Act
    var result = controller.YourMethod();

    // Assert
    result.Should().NotBeNull();
    result.Should().Be(expectedValue);
}
```

### Adding a Frontend Unit Test

```typescript
describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Adding an E2E Test

1. Add a new `.feature` file in `tests/Features/`
2. Write Gherkin scenarios
3. Implement steps in `tests/Steps/`
4. Run: `npm test`

```gherkin
Feature: Your Feature
  Scenario: Your scenario
    Given some precondition
    When user performs action
    Then expected outcome
```

## ✅ Test Checklist

Before merging to main:

- [ ] All backend unit tests pass
- [ ] All frontend unit tests pass
- [ ] E2E tests pass
- [ ] Code coverage meets thresholds
- [ ] No console errors in tests
- [ ] All test artifacts generated
- [ ] Test results reviewed

## 🐛 Debugging Tests

### Backend Test Debugging

```bash
# Run specific test
dotnet test --filter "MethodName"

# Verbose output
dotnet test --verbosity detailed

# Debug mode
dotnet test --no-build --logger "console;verbosity=detailed"
```

### Frontend Test Debugging

```bash
# Watch mode with debugging
npm test

# Debug specific test file
npm test -- rsvp.test.ts

# Debug mode (opens debugger)
node --inspect-brk node_modules/.bin/jest --runInBand
```

### E2E Test Debugging

```bash
# Run in headed mode
npm run test:headed

# Debug mode
npm run test:debug

# Run specific feature
npx cucumber-js tests/Features/rsvp.feature
```

## 📚 Best Practices

1. **Test Naming:** Be descriptive
   - ✅ `TestWeatherForecastController_Get_ReturnsValidTemperatures`
   - ❌ `TestWeatherForecast`

2. **Arrange-Act-Assert:** Follow AAA pattern
   ```csharp
   // Arrange - Set up test data
   // Act - Execute the method
   // Assert - Verify results
   ```

3. **One Assertion Per Test:** Keep tests focused
   - ✅ One scenario per test
   - ❌ Multiple unrelated assertions

4. **Mock External Dependencies:** Isolate units
   - Use Moq for backend
   - Use Jest mocks for frontend

5. **Use Meaningful Data:** Not just "test", "data", etc.
   - ✅ "john.doe@example.com"
   - ❌ "test@test.com"

## 🎯 Coverage Goals

| Layer | Current | Target | Priority |
|-------|---------|--------|----------|
| Backend | 75% | 80% | Medium |
| Frontend | 62% | 70% | High |
| E2E Scenarios | 12 | 25 | Medium |

## 📞 Support

- Backend Issues: Check xUnit documentation
- Frontend Issues: Check Jest documentation
- E2E Issues: Check Playwright & Cucumber documentation

## Related Documentation

- [SETUP_CHECKLIST.md](../SETUP_CHECKLIST.md)
- [DEPLOYMENT_READY.md](../DEPLOYMENT_READY.md)
- [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md)
