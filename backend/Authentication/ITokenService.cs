using Library.Entities;

namespace Library.Authentication;
public interface ITokenService
{
    string CreateToken(User user);
}
