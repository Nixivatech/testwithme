using Microsoft.EntityFrameworkCore;
using TestWithMe.Api.Models;
using Module = TestWithMe.Api.Models.Module;

namespace TestWithMe.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Module> Modules => Set<Module>();
    public DbSet<Topic> Topics => Set<Topic>();
    public DbSet<Progress> ProgressEntries => Set<Progress>();
    public DbSet<Certificate> Certificates => Set<Certificate>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.ToTable("users");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.GoogleId).HasColumnName("google_id").IsRequired();
            e.Property(x => x.Email).HasColumnName("email").IsRequired();
            e.Property(x => x.Name).HasColumnName("name").IsRequired();
            e.Property(x => x.AvatarUrl).HasColumnName("avatar_url");
            e.Property(x => x.Role).HasColumnName("role").HasConversion<string>().IsRequired();
            e.Property(x => x.IsProMember).HasColumnName("is_pro_member");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            e.HasIndex(x => x.GoogleId).IsUnique();
            e.HasIndex(x => x.Email).IsUnique();
        });

        modelBuilder.Entity<Module>(e =>
        {
            e.ToTable("modules");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Slug).HasColumnName("slug").IsRequired();
            e.Property(x => x.Title).HasColumnName("title").IsRequired();
            e.Property(x => x.Description).HasColumnName("description");
            e.Property(x => x.OrderIndex).HasColumnName("order_index");
            e.Property(x => x.IsPro).HasColumnName("is_pro");
            e.Property(x => x.IsPublished).HasColumnName("is_published");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            e.HasIndex(x => x.Slug).IsUnique();
        });

        modelBuilder.Entity<Topic>(e =>
        {
            e.ToTable("topics");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.ModuleId).HasColumnName("module_id");
            e.Property(x => x.Slug).HasColumnName("slug").IsRequired();
            e.Property(x => x.Title).HasColumnName("title").IsRequired();
            e.Property(x => x.Content).HasColumnName("content").IsRequired();
            e.Property(x => x.OrderIndex).HasColumnName("order_index");
            e.Property(x => x.IsPublished).HasColumnName("is_published");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            e.HasIndex(x => new { x.ModuleId, x.Slug }).IsUnique();
            e.HasOne(x => x.Module).WithMany(m => m.Topics).HasForeignKey(x => x.ModuleId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Progress>(e =>
        {
            e.ToTable("progress");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.UserId).HasColumnName("user_id");
            e.Property(x => x.TopicId).HasColumnName("topic_id");
            e.Property(x => x.CompletedAt).HasColumnName("completed_at");
            e.HasIndex(x => new { x.UserId, x.TopicId }).IsUnique();
            e.HasOne(x => x.User).WithMany(u => u.ProgressEntries).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Topic).WithMany(t => t.ProgressEntries).HasForeignKey(x => x.TopicId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Certificate>(e =>
        {
            e.ToTable("certificates");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.CertificateCode).HasColumnName("certificate_code").IsRequired();
            e.Property(x => x.UserId).HasColumnName("user_id");
            e.Property(x => x.ModuleId).HasColumnName("module_id");
            e.Property(x => x.StudentNameSnapshot).HasColumnName("student_name_snapshot").IsRequired();
            e.Property(x => x.ModuleTitleSnapshot).HasColumnName("module_title_snapshot").IsRequired();
            e.Property(x => x.IssuedAt).HasColumnName("issued_at");
            e.HasIndex(x => x.CertificateCode).IsUnique();
            e.HasIndex(x => new { x.UserId, x.ModuleId }).IsUnique();
            e.HasOne(x => x.User).WithMany(u => u.Certificates).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Module).WithMany(m => m.Certificates).HasForeignKey(x => x.ModuleId).OnDelete(DeleteBehavior.Cascade);
        });
    }
}
