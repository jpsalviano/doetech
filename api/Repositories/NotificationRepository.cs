using DoeTech.Data;
using DoeTech.DTOs;
using DoeTech.Exceptions;
using DoeTech.Models;

namespace DoeTech.Repositories;

public class NotificationRepository : IRepository
{
    private readonly AppDbContext _dbContext;

    public NotificationRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public void Add(Notification notification)
    {
        _dbContext.Notifications.Add(notification);
        _dbContext.SaveChanges();
    }

    public void MarkNotificationsAsRead(Guid notificationId)
    {
        var notification = _dbContext.Notifications.FirstOrDefault(n => n.Id == notificationId && !n.Removed);

        if (notification == null)
        {
            throw new NotFoundException("notification not found to set as read: " + notificationId);
        }
        
        notification.UpdatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        notification.Read = true;
        
        _dbContext.Notifications.Update(notification);
        _dbContext.SaveChanges();
    }

    public void Update(Notification notification)
    {
        notification.UpdatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        _dbContext.Notifications.Update(notification);
        _dbContext.SaveChanges();
    }

    public void RemoveById(Guid id)
    {
        var notificationToRemove = _dbContext.Notifications.FirstOrDefault(n => n.Id == id && !n.Removed);

        if (notificationToRemove == null)
        {
            throw new NotFoundException("Notification not found to remove: " + id);
        }

        notificationToRemove.UpdatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        notificationToRemove.Removed = true;

        _dbContext.Notifications.Update(notificationToRemove);
        _dbContext.SaveChanges();
    }

    public Notification GetById(Guid id)
    {
        return _dbContext.Notifications.FirstOrDefault(n => n.Id == id && !n.Removed);
    }

    public List<Notification> GetAllByAccount(Guid accountId)
    {
        return _dbContext.Notifications.Where(n => n.AccountId == accountId && !n.Removed).ToList();
    }
    
    public List<Notification> QueryNotifications(NotificationDTO filters)
    {
        
        var query = _dbContext.Notifications.AsQueryable();

        if (filters.AccountId != null) {
            query = query.Where(n => n.AccountId == filters.AccountId);
        }

        if (filters.Read != null)
        {
            query = query.Where(n => n.Read.Equals(filters.Read));
        }
        
        if (filters.CreatedAtFrom != null)
        {
            query = query.Where(n => n.CreatedAt >= filters.CreatedAtFrom);
        }

        if (filters.CreatedAtTo != null)
        {
            query = query.Where(n => n.CreatedAt <= filters.CreatedAtTo);
        }
        
        query = query.Where(a => !a.Removed)
            .OrderByDescending(n => n.CreatedAt)
            .Skip((filters.Page - 1) * filters.PageSize)
            .Take(filters.PageSize);

        return query.ToList();
    }
}