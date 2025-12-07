namespace HotelBooking.API.Models;
using System.Text.Json.Serialization;

public class GoogleLoginRequest
{
    public string IdToken { get; set; } = string.Empty;
}

public class FacebookLoginRequest
{
    public string AccessToken { get; set; } = string.Empty;
}

public class ForgotPasswordRequest
{
    public string Email { get; set; } = string.Empty;
}

public class SendVerificationCodeRequest
{
    public string Email { get; set; } = string.Empty;
}

public class VerifyCodeAndResetPasswordRequest
{
    public string Email { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public class AuthResult
{
    public bool Success { get; set; }
    public UserInfo? User { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? Token { get; set; }
}

public class UserInfo
{
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Picture { get; set; }
    public string Provider { get; set; } = string.Empty;
}

public class EmailResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? ResetCode { get; set; } // For testing only
}

public class OAuthUrls
{
    public string GoogleAuthUrl { get; set; } = string.Empty;
    public string FacebookAuthUrl { get; set; } = string.Empty;
    public string RedirectUri { get; set; } = string.Empty;
}

// Internal models for OAuth providers
internal class GoogleTokenInfo
{
    [JsonPropertyName("aud")]
    public string? Audience { get; set; }
    public string? Email { get; set; }
    public string? Name { get; set; }
    public string? Picture { get; set; }
    public string? Sub { get; set; }
}

internal class GoogleUserInfo
{
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Picture { get; set; }
    public string? Sub { get; set; }
}

internal class FacebookUserInfo
{
    public string? Id { get; set; }
    public string? Name { get; set; }
    public string? Email { get; set; }
    public FacebookPicture? Picture { get; set; }
}

internal class FacebookPicture
{
    public FacebookPictureData? Data { get; set; }
}

internal class FacebookPictureData
{
    public string? Url { get; set; }
}

