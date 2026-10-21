using System.ComponentModel.DataAnnotations;

namespace Library.Entities;
public class Audit
{
    public int Id { get; set; }
    public int ActorId { get; set; }
    public string Action { get; set; } = "";
    public DateTime At { get; set; } = DateTime.UtcNow;
}
