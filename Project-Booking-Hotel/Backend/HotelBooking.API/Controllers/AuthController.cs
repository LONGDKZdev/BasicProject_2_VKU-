using Microsoft.AspNetCore.Mvc;
using HotelBooking.API.Services;
using HotelBooking.API.Models;

namespace HotelBooking.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;
    private readonly IConfiguration _configuration;

    public AuthController(IAuthService authService, ILogger<AuthController> logger, IConfiguration configuration)
    {
        _authService = authService;
        _logger = logger;
        _configuration = configuration;
    }

    /// <summary>
    /// Initiate Google OAuth login
    /// </summary>
    [HttpPost("google/login")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
    {
        try
        {
            var result = await _authService.HandleGoogleLogin(request.IdToken);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in Google login");
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Initiate Facebook OAuth login
    /// </summary>
    [HttpPost("facebook/login")]
    public async Task<IActionResult> FacebookLogin([FromBody] FacebookLoginRequest request)
    {
        try
        {
            var result = await _authService.HandleFacebookLogin(request.AccessToken);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in Facebook login");
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Send password reset email
    /// </summary>
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        try
        {
            var result = await _authService.SendPasswordResetEmail(request.Email);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending password reset email");
            // Don't reveal if email exists or not for security
            return Ok(new { success = true, message = "If the email exists, a reset link has been sent." });
        }
    }

    /// <summary>
    /// Get OAuth redirect URLs for frontend
    /// </summary>
    [HttpGet("oauth/urls")]
    public IActionResult GetOAuthUrls()
    {
        var urls = _authService.GetOAuthUrls();
        return Ok(urls);
    }

    /// <summary>
    /// OAuth callback handler for Google
    /// </summary>
    [HttpGet("google/callback")]
    public async Task<IActionResult> GoogleCallback([FromQuery] string code)
    {
        try
        {
            if (string.IsNullOrEmpty(code))
            {
                return BadRequest(new { error = "Authorization code is missing" });
            }

            var result = await _authService.HandleGoogleCallback(code);
            
            if (result.Success && result.User != null)
            {
                // Redirect to frontend với user info
                var frontendUrl = _configuration["OAuth:RedirectUri"] ?? "http://localhost:5173";
                var redirectUrl = $"{frontendUrl}/auth/callback?provider=google&email={Uri.EscapeDataString(result.User.Email)}&name={Uri.EscapeDataString(result.User.Name ?? "")}";
                return Redirect(redirectUrl);
            }
            
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in Google callback");
            var frontendUrl = _configuration["OAuth:RedirectUri"] ?? "http://localhost:5173";
            return Redirect($"{frontendUrl}/auth/callback?error={Uri.EscapeDataString(ex.Message)}");
        }
    }

    /// <summary>
    /// OAuth callback handler for Facebook
    /// </summary>
    [HttpGet("facebook/callback")]
    public async Task<IActionResult> FacebookCallback([FromQuery] string code)
    {
        try
        {
            if (string.IsNullOrEmpty(code))
            {
                return BadRequest(new { error = "Authorization code is missing" });
            }

            var result = await _authService.HandleFacebookCallback(code);
            
            if (result.Success && result.User != null)
            {
                // Redirect to frontend với user info
                var frontendUrl = _configuration["OAuth:RedirectUri"] ?? "http://localhost:5173";
                var redirectUrl = $"{frontendUrl}/auth/callback?provider=facebook&email={Uri.EscapeDataString(result.User.Email)}&name={Uri.EscapeDataString(result.User.Name ?? "")}";
                return Redirect(redirectUrl);
            }
            
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in Facebook callback");
            var frontendUrl = _configuration["OAuth:RedirectUri"] ?? "http://localhost:5173";
            return Redirect($"{frontendUrl}/auth/callback?error={Uri.EscapeDataString(ex.Message)}");
        }
    }

    /// <summary>
    /// Send verification code to email for password reset
    /// </summary>
    [HttpPost("send-verification-code")]
    public async Task<IActionResult> SendVerificationCode([FromBody] SendVerificationCodeRequest request)
    {
        try
        {
            var result = await _authService.SendVerificationCode(request.Email);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending verification code");
            // Don't reveal if email exists or not for security
            return Ok(new { success = true, message = "If the email exists, a verification code has been sent." });
        }
    }

    /// <summary>
    /// Verify code and reset password
    /// </summary>
    [HttpPost("verify-code-reset-password")]
    public async Task<IActionResult> VerifyCodeAndResetPassword([FromBody] VerifyCodeAndResetPasswordRequest request)
    {
        try
        {
            var result = await _authService.VerifyCodeAndResetPassword(request.Email, request.Code, request.NewPassword);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying code and resetting password");
            return BadRequest(new { success = false, message = ex.Message });
        }
    }
}
