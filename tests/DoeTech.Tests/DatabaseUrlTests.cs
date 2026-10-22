using DoeTech.Configurations;
using Npgsql;
using Xunit;

namespace DoeTech.Tests;

public class DatabaseUrlTests
{
    [Theory]
    [InlineData("postgresql+asyncpg://doetech:s3nh%40forte@postgres:5432/doetech", "postgres", 5432, "s3nh@forte")]
    [InlineData("postgresql://doetech:abc@db.local/doetech", "db.local", 5432, "abc")]
    [InlineData("postgres://doetech:abc@localhost:6543/doetech", "localhost", 6543, "abc")]
    public void Url_becomes_an_Npgsql_connection_string(string url, string host, int port, string password)
    {
        var cs = new NpgsqlConnectionStringBuilder(DatabaseConfig.FromUrl(url));

        Assert.Equal(host, cs.Host);
        Assert.Equal(port, cs.Port);
        Assert.Equal("doetech", cs.Database);
        Assert.Equal("doetech", cs.Username);
        Assert.Equal(password, cs.Password);
    }
}
