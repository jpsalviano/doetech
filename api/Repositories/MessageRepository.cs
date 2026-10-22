using DoeTech.Data;
using DoeTech.Exceptions;
using DoeTech.Models;
using Microsoft.EntityFrameworkCore;

namespace DoeTech.Repositories;

public class MessageRepository : IRepository
{
    
    private readonly AppDbContext _dbContext;

    public MessageRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public void Add(Message message)
    {
        _dbContext.Messages.Add(message);
        _dbContext.SaveChanges();
    }


    public void Update(Message message)
    {
        message.UpdatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        _dbContext.Messages.Update(message);
        _dbContext.SaveChanges();
    }

    public void RemoveById(Guid id)
    {
        var messageToRemove = _dbContext.Messages.FirstOrDefault(m => m.Id == id && !m.Removed);

        if (messageToRemove == null)
        {
            throw new NotFoundException("Chat not found to remove: " + id);
        }
        
        messageToRemove.UpdatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        messageToRemove.Removed = true;
        
        _dbContext.Messages.Update(messageToRemove);
        _dbContext.SaveChanges();
    }
    
    public Chat GetById(Guid id)
    {
        return _dbContext.Chats
            .FirstOrDefault(m => m.Id == id && !m.Removed);
    }
}