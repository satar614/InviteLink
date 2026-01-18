using System;
using System.Threading.Tasks;
using FluentAssertions;
using NUnit.Framework;
using RestSharp;
using TechTalk.SpecFlow;
using TechTalk.SpecFlow.Assist;

namespace InviteLink.E2ETests.StepDefinitions
{
    [Binding]
    public class RSVPStepDefinitions
    {
        private readonly ScenarioContext _scenarioContext;
        private RestClient? _client;
        private RestResponse? _response;
        private string _baseUrl;
        private RSVPRequest? _rsvpRequest;

        public RSVPStepDefinitions(ScenarioContext scenarioContext)
        {
            _scenarioContext = scenarioContext;
            _baseUrl = Environment.GetEnvironmentVariable("BACKEND_URL") ?? "http://localhost:8080";
            _client = new RestClient(_baseUrl);
        }

        [Given(@"the InviteLink application is running")]
        public async Task GivenTheInviteLinkApplicationIsRunning()
        {
            // Check if the application is running by calling the health endpoint
            var request = new RestRequest("/health", Method.Get);
            _response = await _client!.ExecuteAsync(request);
            _response.IsSuccessful.Should().BeTrue("Application should be running and healthy");
        }

        [When(@"I submit an RSVP with the following details")]
        public async Task WhenISubmitAnRSVPWithTheFollowingDetails(Table table)
        {
            _rsvpRequest = table.CreateInstance<RSVPRequest>();
            
            var request = new RestRequest("/api/rsvp", Method.Post);
            request.AddJsonBody(_rsvpRequest);
            
            _response = await _client!.ExecuteAsync(request);
            _scenarioContext["Response"] = _response;
        }

        [When(@"I submit an RSVP with missing required fields")]
        public async Task WhenISubmitAnRSVPWithMissingRequiredFields()
        {
            _rsvpRequest = new RSVPRequest
            {
                GuestName = "", // Missing required field
                Email = "",
                AttendanceStatus = "",
                NumberOfGuests = 0
            };
            
            var request = new RestRequest("/api/rsvp", Method.Post);
            request.AddJsonBody(_rsvpRequest);
            
            _response = await _client!.ExecuteAsync(request);
            _scenarioContext["Response"] = _response;
        }

        [Given(@"I have successfully submitted my RSVP")]
        public async Task GivenIHaveSuccessfullySubmittedMyRSVP()
        {
            _rsvpRequest = new RSVPRequest
            {
                GuestName = "Test Guest",
                Email = "test@example.com",
                AttendanceStatus = "Attending",
                NumberOfGuests = 1
            };
            
            var request = new RestRequest("/api/rsvp", Method.Post);
            request.AddJsonBody(_rsvpRequest);
            
            _response = await _client!.ExecuteAsync(request);
            _response.IsSuccessful.Should().BeTrue();
            
            _scenarioContext["RSVPId"] = "RSVP-TEST-001";
        }

        [When(@"I request my RSVP confirmation")]
        public async Task WhenIRequestMyRSVPConfirmation()
        {
            var rsvpId = _scenarioContext["RSVPId"].ToString();
            var request = new RestRequest($"/api/rsvp/{rsvpId}", Method.Get);
            
            _response = await _client!.ExecuteAsync(request);
            _scenarioContext["Response"] = _response;
        }

        [Then(@"the RSVP should be accepted")]
        public void ThenTheRSVPShouldBeAccepted()
        {
            _response.Should().NotBeNull();
            _response!.IsSuccessful.Should().BeTrue("RSVP should be accepted");
        }

        [Then(@"I should receive a confirmation")]
        public void ThenIShouldReceiveAConfirmation()
        {
            _response.Should().NotBeNull();
            _response!.Content.Should().NotBeNullOrEmpty("Confirmation response should contain data");
        }

        [Then(@"the RSVP should be rejected")]
        public void ThenTheRSVPShouldBeRejected()
        {
            _response.Should().NotBeNull();
            _response!.IsSuccessful.Should().BeFalse("RSVP with missing fields should be rejected");
        }

        [Then(@"I should see a validation error message")]
        public void ThenIShouldSeeAValidationErrorMessage()
        {
            _response.Should().NotBeNull();
            _response!.Content.Should().NotBeNullOrEmpty("Error message should be present");
        }

        [Then(@"I should see my guest information")]
        public void ThenIShouldSeeMyGuestInformation()
        {
            _response.Should().NotBeNull();
            _response!.IsSuccessful.Should().BeTrue();
            _response.Content.Should().NotBeNullOrEmpty();
        }

        [Then(@"I should see the event details")]
        public void ThenIShouldSeeTheEventDetails()
        {
            _response.Should().NotBeNull();
            _response!.Content.Should().NotBeNullOrEmpty();
        }
    }

    public class RSVPRequest
    {
        public string GuestName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string AttendanceStatus { get; set; } = string.Empty;
        public int NumberOfGuests { get; set; }
    }
}
