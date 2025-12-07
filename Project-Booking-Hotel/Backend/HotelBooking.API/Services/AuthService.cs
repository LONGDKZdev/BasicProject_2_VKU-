using HotelBooking.API.Models;
using System.Text.Json;
using System.Net.Http.Headers;

namespace HotelBooking.API.Services;

public class AuthService : IAuthService
{
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService;
    private readonly ILogger<AuthService> _logger;
    private readonly HttpClient _httpClient;

    public AuthService(
        IConfiguration configuration,
        IEmailService emailService,
        ILogger<AuthService> logger,
        IHttpClientFactory httpClientFactory)
    {
        _configuration = configuration;
        _emailService = emailService;
        _logger = logger;
        _httpClient = httpClientFactory.CreateClient();
    }

    public async Task<AuthResult> HandleGoogleLogin(string idToken)
    {
        try
        {
            // Verify Google ID token
            var googleUserInfo = await VerifyGoogleToken(idToken);
            
            if (googleUserInfo == null)
            {
                throw new Exception("Invalid Google token");
            }

            // Check if user exists in database (you'll need to query Supabase here)
            // For now, return user info
            return new AuthResult
            {
                Success = true,
                User = new UserInfo
                {
                    Email = googleUserInfo.Email,
                    Name = googleUserInfo.Name,
                    Picture = googleUserInfo.Picture,
                    Provider = "Google"
                },
                Message = "Google login successful"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error handling Google login");
            throw;
        }
    }

    public async Task<AuthResult> HandleFacebookLogin(string accessToken)
    {
        try
        {
            // Verify Facebook access token
            var facebookUserInfo = await VerifyFacebookToken(accessToken);
            
            if (facebookUserInfo == null)
            {
                throw new Exception("Invalid Facebook token");
            }

            return new AuthResult
            {
                Success = true,
                User = new UserInfo
                {
                    Email = facebookUserInfo.Email ?? string.Empty,
                    Name = facebookUserInfo.Name ?? string.Empty,
                    Picture = facebookUserInfo.Picture?.Data?.Url,
                    Provider = "Facebook"
                },
                Message = "Facebook login successful"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error handling Facebook login");
            throw;
        }
    }

    public async Task<EmailResult> SendPasswordResetEmail(string email)
    {
        try
        {
            // Generate reset code
            var resetCode = GenerateResetCode();
            
            // TODO: Save reset code to database with expiration
            
            // Send email
            var emailSubject = "Password Reset Request - Hotel Booking";
            var emailBody = $@"
                <h2>Password Reset Request</h2>
                <p>Hello,</p>
                <p>You have requested to reset your password. Please use the following code:</p>
                <h3 style='color: #8B5A2B; font-size: 24px;'>{resetCode}</h3>
                <p>This code will expire in 15 minutes.</p>
                <p>If you did not request this, please ignore this email.</p>
                <br>
                <p>Best regards,<br>Hotel Booking Team</p>
            ";

            var result = await _emailService.SendEmailAsync(email, emailSubject, emailBody);
            
            return new EmailResult
            {
                Success = result,
                Message = result 
                    ? "Password reset email sent successfully" 
                    : "Failed to send email",
                ResetCode = resetCode // Return code for testing (remove in production)
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending password reset email");
            throw;
        }
    }

    public async Task<AuthResult> HandleGoogleCallback(string code)
    {
        try
        {
            var clientId = _configuration["OAuth:Google:ClientId"];
            var clientSecret = _configuration["OAuth:Google:ClientSecret"];
            var apiBaseUrl = _configuration["ApiBaseUrl"] ?? "http://localhost:5000";
            var redirectUri = $"{apiBaseUrl}/api/auth/google/callback";

            // Exchange authorization code for access token
            var tokenRequest = new Dictionary<string, string>
            {
                { "code", code },
                { "client_id", clientId ?? string.Empty },
                { "client_secret", clientSecret ?? string.Empty },
                { "redirect_uri", redirectUri },
                { "grant_type", "authorization_code" }
            };

            var tokenResponse = await _httpClient.PostAsync(
                "https://oauth2.googleapis.com/token",
                new FormUrlEncodedContent(tokenRequest)
            );

            if (!tokenResponse.IsSuccessStatusCode)
            {
                throw new Exception("Failed to exchange authorization code");
            }

            var tokenContent = await tokenResponse.Content.ReadAsStringAsync();
            var tokenData = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(tokenContent);
            
            var accessToken = tokenData?["access_token"].GetString();
            var idToken = tokenData?["id_token"].GetString();

            if (string.IsNullOrEmpty(idToken))
            {
                throw new Exception("ID token not received");
            }

            // Verify and get user info
            return await HandleGoogleLogin(idToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error handling Google callback");
            throw;
        }
    }

    public async Task<AuthResult> HandleFacebookCallback(string code)
    {
        try
        {
            var appId = _configuration["OAuth:Facebook:AppId"];
            var appSecret = _configuration["OAuth:Facebook:AppSecret"];
            var apiBaseUrl = _configuration["ApiBaseUrl"] ?? "http://localhost:5000";
            var redirectUri = $"{apiBaseUrl}/api/auth/facebook/callback";

            // Exchange authorization code for access token
            var tokenUrl = $"https://graph.facebook.com/v18.0/oauth/access_token?client_id={appId}&redirect_uri={redirectUri}&client_secret={appSecret}&code={code}";
            
            var tokenResponse = await _httpClient.GetAsync(tokenUrl);

            if (!tokenResponse.IsSuccessStatusCode)
            {
                throw new Exception("Failed to exchange authorization code");
            }

            var tokenContent = await tokenResponse.Content.ReadAsStringAsync();
            var tokenData = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(tokenContent);
            
            var accessToken = tokenData?["access_token"].GetString();

            if (string.IsNullOrEmpty(accessToken))
            {
                throw new Exception("Access token not received");
            }

            // Get user info using access token
            return await HandleFacebookLogin(accessToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error handling Facebook callback");
            throw;
        }
    }

    public OAuthUrls GetOAuthUrls()
    {
        var googleClientId = _configuration["OAuth:Google:ClientId"];
        var facebookAppId = _configuration["OAuth:Facebook:AppId"];
        var apiBaseUrl = _configuration["ApiBaseUrl"] ?? "http://localhost:5000";
        var frontendUrl = _configuration["OAuth:RedirectUri"] ?? "http://localhost:5173";
        
        // C# API callback URLs (OAuth providers sẽ redirect về đây)
        var googleCallbackUrl = $"{apiBaseUrl}/api/auth/google/callback";
        var facebookCallbackUrl = $"{apiBaseUrl}/api/auth/facebook/callback";
        
        // Frontend callback URL (sau khi C# API xử lý xong sẽ redirect về đây)
        var frontendCallbackUrl = $"{frontendUrl}/auth/callback";

        return new OAuthUrls
        {
            GoogleAuthUrl = $"https://accounts.google.com/o/oauth2/v2/auth?client_id={googleClientId}&redirect_uri={Uri.EscapeDataString(googleCallbackUrl)}&response_type=code&scope=openid email profile&access_type=offline&prompt=consent",
            FacebookAuthUrl = $"https://www.facebook.com/v18.0/dialog/oauth?client_id={facebookAppId}&redirect_uri={Uri.EscapeDataString(facebookCallbackUrl)}&scope=email",
            RedirectUri = frontendCallbackUrl
        };
    }

    private async Task<GoogleUserInfo?> VerifyGoogleToken(string idToken)
    {
        try
        {
            var response = await _httpClient.GetAsync($"https://oauth2.googleapis.com/tokeninfo?id_token={idToken}");
            
            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            var content = await response.Content.ReadAsStringAsync();
            var tokenInfo = JsonSerializer.Deserialize<GoogleTokenInfo>(content);

            if (tokenInfo == null || tokenInfo.Audience != _configuration["OAuth:Google:ClientId"])
            {
                return null;
            }

            return new GoogleUserInfo
            {
                Email = tokenInfo.Email ?? string.Empty,
                Name = tokenInfo.Name ?? string.Empty,
                Picture = tokenInfo.Picture,
                Sub = tokenInfo.Sub
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying Google token");
            return null;
        }
    }

    private async Task<FacebookUserInfo?> VerifyFacebookToken(string accessToken)
    {
        try
        {
            var appId = _configuration["OAuth:Facebook:AppId"];
            var appSecret = _configuration["OAuth:Facebook:AppSecret"];
            
            // Verify token
            var verifyUrl = $"https://graph.facebook.com/debug_token?input_token={accessToken}&access_token={appId}|{appSecret}";
            var verifyResponse = await _httpClient.GetAsync(verifyUrl);
            
            if (!verifyResponse.IsSuccessStatusCode)
            {
                return null;
            }

            // Get user info
            var userInfoUrl = $"https://graph.facebook.com/me?fields=id,name,email,picture&access_token={accessToken}";
            var userResponse = await _httpClient.GetAsync(userInfoUrl);
            
            if (!userResponse.IsSuccessStatusCode)
            {
                return null;
            }

            var content = await userResponse.Content.ReadAsStringAsync();
            var userInfo = JsonSerializer.Deserialize<FacebookUserInfo>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            // Extract picture URL if available
            if (userInfo?.Picture?.Data?.Url != null)
            {
                userInfo.Picture.Data.Url = userInfo.Picture.Data.Url;
            }

            return userInfo;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying Facebook token");
            return null;
        }
    }

    public async Task<EmailResult> SendVerificationCode(string email)
    {
        try
        {
            // Generate verification code
            var verificationCode = GenerateResetCode();
            
            // TODO: Save verification code to database with expiration (15 minutes)
            // For now, we'll just send the email
            
            // Send email
            var emailSubject = "Password Reset Verification Code - Hotel Booking";
            var emailBody = $@"
                <h2>Password Reset Verification Code</h2>
                <p>Hello,</p>
                <p>You have requested to reset your password. Please use the following verification code:</p>
                <h3 style='color: #8B5A2B; font-size: 24px; letter-spacing: 4px;'>{verificationCode}</h3>
                <p>This code will expire in 15 minutes.</p>
                <p>If you did not request this, please ignore this email.</p>
                <br>
                <p>Best regards,<br>Hotel Booking Team</p>
            ";

            var result = await _emailService.SendEmailAsync(email, emailSubject, emailBody);
            
            return new EmailResult
            {
                Success = result,
                Message = result 
                    ? "Verification code sent successfully" 
                    : "Failed to send email",
                ResetCode = verificationCode // Return code for testing (remove in production)
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending verification code");
            throw;
        }
    }

    public async Task<EmailResult> VerifyCodeAndResetPassword(string email, string code, string newPassword)
    {
        try
        {
            // TODO: Verify code from database and check expiration
            // For now, we'll just validate the password
            
            if (string.IsNullOrWhiteSpace(newPassword) || newPassword.Length < 8)
            {
                return new EmailResult
                {
                    Success = false,
                    Message = "Password must be at least 8 characters long"
                };
            }

            // TODO: Update password in database (Supabase)
            // For now, return success
            
            return new EmailResult
            {
                Success = true,
                Message = "Password reset successfully"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying code and resetting password");
            throw;
        }
    }

    private string GenerateResetCode()
    {
        var random = new Random();
        return random.Next(100000, 999999).ToString();
    }
}

