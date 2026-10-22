using DoeTech.Data;
using DoeTech.DTOs;
using DoeTech.Exceptions;
using DoeTech.Models;
using Microsoft.EntityFrameworkCore;

namespace DoeTech.Repositories;

public class UserRepository : IRepository
{
    private readonly AppDbContext _dbContext;

    public UserRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }
    
    public void Add(User user)
    {
        _dbContext.Users.Add(user);
        _dbContext.SaveChanges();
    }

    public void Update(User user)
    {
        _dbContext.Users.Update(user);
        _dbContext.SaveChanges();
    }

    public User GetById(Guid id)
    {
        return _dbContext.Users.FirstOrDefault(u => u.Id == id && u.Removed == false);
    }
    
    public User GetByEmail(string email)
    {
        return _dbContext.Users.FirstOrDefault(u => u.Email == email && u.Removed == false);
    }

    public void RemoveById(Guid id)
    {
        var userFound = _dbContext.Users.FirstOrDefault(u => u.Id == id && u.Removed == false);

        if (userFound == null)
        {
            throw new NotFoundException("User not found to remove: " + id);
        }
        
        userFound.UpdatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        userFound.Removed = true;
        
        _dbContext.Users.Update(userFound);
        _dbContext.SaveChanges();
    } 
    
    public List<User> Query(UserQueryDto filter)
    {
        var query = _dbContext.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.Email)) {
            query = query.Where(u => u.Email.Contains(filter.Email));
        }

        if (filter.IsAdmin != null)
        {
            query = query.Where(u => u.IsAdmin.Equals(filter.IsAdmin));
        }
        
        if (filter.CreatedAtFrom != null)
        {
            query = query.Where(u => u.CreatedAt <= filter.CreatedAtFrom);
        }

        if (filter.CreatedAtTo != null)
        {
            query = query.Where(u => u.CreatedAt <= filter.CreatedAtTo);
        }

        query = query.Where(a => !a.Removed)
            .OrderBy(a => a.Email)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize);

        var result = query.Select(u => new User()
        {
            Id = u.Id,
            Email = u.Email,
            IsAdmin = u.IsAdmin,
            CreatedAt = u.CreatedAt,
            UpdatedAt = u.UpdatedAt,
            Removed = u.Removed
        }).ToList();

        return result;
    }
}