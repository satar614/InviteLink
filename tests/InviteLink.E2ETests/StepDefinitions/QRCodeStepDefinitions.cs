using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FluentAssertions;
using NUnit.Framework;
using RestSharp;
using TechTalk.SpecFlow;

namespace InviteLink.E2ETests.StepDefinitions
{
    [Binding]
    public class QRCodeStepDefinitions
    {
        private readonly ScenarioContext _scenarioContext;
        private RestClient? _client;
        private RestResponse? _response;
        private string _baseUrl;
        private string? _inviteId;
        private Dictionary<string, object>? _inviteData;

        public QRCodeStepDefinitions(ScenarioContext scenarioContext)
        {
            _scenarioContext = scenarioContext;
            _baseUrl = Environment.GetEnvironmentVariable("BACKEND_URL") ?? "http://localhost:8080";
            _client = new RestClient(_baseUrl);
        }

        [When(@"I scan a QR code with invite ID ""(.*)""")]
        public async Task WhenIScanAQRCodeWithInviteID(string inviteId)
        {
            _inviteId = inviteId;
            var request = new RestRequest($"/api/invite/{inviteId}", Method.Get);
            
            _response = await _client!.ExecuteAsync(request);
            _scenarioContext["Response"] = _response;
        }

        [When(@"I scan a QR code with invalid invite ID ""(.*)""")]
        public async Task WhenIScanAQRCodeWithInvalidInviteID(string inviteId)
        {
            _inviteId = inviteId;
            var request = new RestRequest($"/api/invite/{inviteId}", Method.Get);
            
            _response = await _client!.ExecuteAsync(request);
            _scenarioContext["Response"] = _response;
        }

        [Given(@"I have scanned a valid QR code with invite ID ""(.*)""")]
        public async Task GivenIHaveScannedAValidQRCodeWithInviteID(string inviteId)
        {
            _inviteId = inviteId;
            var request = new RestRequest($"/api/invite/{inviteId}", Method.Get);
            
            _response = await _client!.ExecuteAsync(request);
            
            // Store the invite data for use in subsequent steps
            _inviteData = new Dictionary<string, object>
            {
                { "InviteId", inviteId },
                { "GuestName", "John Doe" },
                { "AllowedGuests", 3 }
            };
            
            _scenarioContext["InviteData"] = _inviteData;
        }

        [When(@"I check in the guest")]
        public async Task WhenICheckInTheGuest()
        {
            var inviteData = _scenarioContext["InviteData"] as Dictionary<string, object>;
            var inviteId = inviteData?["InviteId"]?.ToString();
            
            var request = new RestRequest($"/api/checkin", Method.Post);
            request.AddJsonBody(new
            {
                InviteId = inviteId,
                CheckInTime = DateTime.UtcNow
            });
            
            _response = await _client!.ExecuteAsync(request);
            _scenarioContext["CheckInResponse"] = _response;
        }

        [Then(@"the invite information should be retrieved")]
        public void ThenTheInviteInformationShouldBeRetrieved()
        {
            _response.Should().NotBeNull();
            _response!.IsSuccessful.Should().BeTrue("Invite information should be retrieved successfully");
        }

        [Then(@"the guest name should be displayed")]
        public void ThenTheGuestNameShouldBeDisplayed()
        {
            _response.Should().NotBeNull();
            _response!.Content.Should().NotBeNullOrEmpty("Response should contain guest name");
        }

        [Then(@"the allowed guest count should be shown")]
        public void ThenTheAllowedGuestCountShouldBeShown()
        {
            _response.Should().NotBeNull();
            _response!.Content.Should().NotBeNullOrEmpty("Response should contain guest count");
        }

        [Then(@"I should receive an error message")]
        public void ThenIShouldReceiveAnErrorMessage()
        {
            _response.Should().NotBeNull();
            _response!.IsSuccessful.Should().BeFalse("Invalid QR code should return an error");
        }

        [Then(@"the error should indicate the QR code is invalid")]
        public void ThenTheErrorShouldIndicateTheQRCodeIsInvalid()
        {
            _response.Should().NotBeNull();
            _response!.Content.Should().NotBeNullOrEmpty("Error message should be present");
        }

        [Then(@"the guest should be marked as present")]
        public void ThenTheGuestShouldBeMarkedAsPresent()
        {
            var checkInResponse = _scenarioContext["CheckInResponse"] as RestResponse;
            checkInResponse.Should().NotBeNull();
            checkInResponse!.IsSuccessful.Should().BeTrue("Check-in should be successful");
        }

        [Then(@"a check-in timestamp should be recorded")]
        public void ThenACheckInTimestampShouldBeRecorded()
        {
            var checkInResponse = _scenarioContext["CheckInResponse"] as RestResponse;
            checkInResponse.Should().NotBeNull();
            checkInResponse!.Content.Should().NotBeNullOrEmpty("Check-in response should contain timestamp");
        }
    }
}
