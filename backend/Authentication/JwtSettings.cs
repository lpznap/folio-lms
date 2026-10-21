namespace Library.Authentication;
public class JwtSettings
{
    public string Key { get; set; } = "";
    public string Issuer { get; set; } = "library-api";
    public string Audience { get; set; } = "library-web";
}
