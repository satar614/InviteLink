using System;

namespace InviteLink.E2ETests.Support
{
    public static class TestConfiguration
    {
        public static string BackendUrl => 
            Environment.GetEnvironmentVariable("BACKEND_URL") ?? "http://localhost:8080";
        
        public static string FrontendUrl => 
            Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:3000";
        
        public static int DefaultTimeout => 30000; // 30 seconds
        
        public static bool IsRunningInCI => 
            !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("CI"));
    }
}
