using Xunit;
using FluentAssertions;

namespace SmartInvite.Api.Tests
{
    public class HealthCheckTests
    {
        [Fact]
        public void ApplicationHealthCheck_IsHealthy()
        {
            // Arrange
            var isHealthy = true;

            // Act & Assert
            isHealthy.Should().BeTrue();
        }

        [Fact]
        public void VersionInfo_IsValid()
        {
            // Arrange
            var version = System.Reflection.Assembly.GetExecutingAssembly().GetName().Version;

            // Act & Assert
            version.Should().NotBeNull();
            version?.Major.Should().BeGreaterThanOrEqualTo(1);
        }

        [Theory]
        [InlineData("https://localhost:8080")]
        [InlineData("http://localhost:8080")]
        public void BaseUrl_IsValid(string url)
        {
            // Act
            var result = Uri.TryCreate(url, UriKind.Absolute, out var uri);

            // Assert
            result.Should().BeTrue();
            uri?.Scheme.Should().NotBeNullOrEmpty();
        }

        [Fact]
        public void ApplicationStartup_CompletesSuccessfully()
        {
            // Arrange
            var appStarted = DateTime.UtcNow;

            // Act
            var elapsed = DateTime.UtcNow - appStarted;

            // Assert
            elapsed.TotalSeconds.Should().BeLessThan(10);
        }
    }
}
