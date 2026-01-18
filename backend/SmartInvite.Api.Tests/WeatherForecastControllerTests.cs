using System;
using System.Linq;
using Xunit;
using FluentAssertions;
using SmartInvite.Api.Controllers;
using Microsoft.Extensions.Logging;
using Moq;

namespace SmartInvite.Api.Tests.Controllers
{
    public class WeatherForecastControllerTests
    {
        private readonly Mock<ILogger<WeatherForecastController>> _mockLogger;
        private readonly WeatherForecastController _controller;

        public WeatherForecastControllerTests()
        {
            _mockLogger = new Mock<ILogger<WeatherForecastController>>();
            _controller = new WeatherForecastController(_mockLogger.Object);
        }

        [Fact]
        public void Get_ReturnsWeatherForecasts()
        {
            // Act
            var result = _controller.Get();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(5);
        }

        [Fact]
        public void Get_ReturnsValidTemperatures()
        {
            // Act
            var result = _controller.Get().ToList();

            // Assert
            result.Should().AllSatisfy(forecast =>
            {
                forecast.TemperatureC.Should().BeGreaterThanOrEqualTo(-20);
                forecast.TemperatureC.Should().BeLessThanOrEqualTo(55);
            });
        }

        [Fact]
        public void Get_ReturnsValidSummaries()
        {
            // Arrange
            var summaries = new[] { "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching" };

            // Act
            var result = _controller.Get().ToList();

            // Assert
            result.Should().AllSatisfy(forecast =>
            {
                summaries.Should().Contain(forecast.Summary);
            });
        }

        [Fact]
        public void Get_ReturnsDates()
        {
            // Act
            var result = _controller.Get().ToList();

            // Assert
            result.Should().AllSatisfy(forecast =>
            {
                forecast.Date.CompareTo(DateOnly.FromDateTime(DateTime.Now)).Should().BeGreaterThanOrEqualTo(0);
            });
        }

        [Fact]
        public void Get_CalculatesTemperatureFCorrectly()
        {
            // Act
            var result = _controller.Get().ToList();

            // Assert
            result.Should().AllSatisfy(forecast =>
            {
                var expectedF = (int)(forecast.TemperatureC / 0.5556) + 32;
                forecast.TemperatureF.Should().Be(expectedF);
            });
        }
    }
}
