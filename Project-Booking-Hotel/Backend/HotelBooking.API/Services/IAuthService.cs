using HotelBooking.API.Models;

namespace HotelBooking.API.Services;

public interface IAuthService
{
    Task<AuthResult> HandleGoogleLogin(string idToken);
    Task<AuthResult> HandleFacebookLogin(string accessToken);
    Task<AuthResult> HandleGoogleCallback(string code);
    Task<AuthResult> HandleFacebookCallback(string code);
    Task<EmailResult> SendPasswordResetEmail(string email);
    Task<EmailResult> SendVerificationCode(string email);
    Task<EmailResult> VerifyCodeAndResetPassword(string email, string code, string newPassword);
    OAuthUrls GetOAuthUrls();
}