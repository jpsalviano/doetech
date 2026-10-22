using DoeTech.Data;
using DoeTech.Exceptions;
using DoeTech.Models;
using Microsoft.EntityFrameworkCore;

namespace DoeTech.Repositories;

public class ChatRepository : IRepository
{
    private readonly AppDbContext _dbContext;

    public ChatRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public void Add(Chat chat)
    {
        _dbContext.Chats.Add(chat);
        _dbContext.SaveChanges();
    }


    public void Update(Chat chat)
    {
        chat.UpdatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        _dbContext.Chats.Update(chat);
        _dbContext.SaveChanges();
    }

    public void RemoveById(Guid id)
    {
        var chatToRemove = _dbContext.Chats.FirstOrDefault(c => c.Id == id && !c.Removed);

        if (chatToRemove == null)
        {
            throw new NotFoundException("Chat not found to remove: " + id);
        }

        chatToRemove.UpdatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        chatToRemove.Removed = true;
        _dbContext.Chats.Update(chatToRemove);
        _dbContext.SaveChanges();
    }

    public Chat GetByIdAggregatingMessages(Guid id)
    {
        return _dbContext.Chats
            .Include(c => c.Messages)
            .FirstOrDefault(c => c.Id == id && !c.Removed);
    }

    public Chat GetById(Guid id)
    {
        return _dbContext.Chats
            .FirstOrDefault(e => e.Id == id && !e.Removed);
    }

    public List<Chat> GetChatsByAccountId(Guid accountId)
    {
        { 
            var query = _dbContext.Chats.AsQueryable();
            
                query = query.Where(c => c.ReceiverAccountId == accountId || c.SenderAccountId == accountId && !c.Removed);
                query = query.OrderBy(c => c.CreatedAt);

            return query.ToList();
        }
    }
}