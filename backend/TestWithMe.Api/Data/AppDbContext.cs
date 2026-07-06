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
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();
    public DbSet<PromoCode> PromoCodes => Set<PromoCode>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<QuizAttempt> QuizAttempts => Set<QuizAttempt>();
    public DbSet<QuizAnswerDetail> QuizAnswerDetails => Set<QuizAnswerDetail>();

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

        modelBuilder.Entity<Question>(e =>
        {
            e.ToTable("questions");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.TopicId).HasColumnName("topic_id");
            e.Property(x => x.Text).HasColumnName("text").IsRequired();
            e.Property(x => x.OptionA).HasColumnName("option_a").IsRequired();
            e.Property(x => x.OptionB).HasColumnName("option_b").IsRequired();
            e.Property(x => x.OptionC).HasColumnName("option_c").IsRequired();
            e.Property(x => x.OptionD).HasColumnName("option_d").IsRequired();
            e.Property(x => x.CorrectAnswer).HasColumnName("correct_answer").IsRequired();
            e.Property(x => x.Explanation).HasColumnName("explanation");
            e.Property(x => x.OrderIndex).HasColumnName("order_index");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.HasOne(x => x.Topic).WithMany().HasForeignKey(x => x.TopicId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<QuizAnswerDetail>(e =>
        {
            e.ToTable("quiz_answer_details");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.AttemptId).HasColumnName("attempt_id");
            e.Property(x => x.QuestionId).HasColumnName("question_id");
            e.Property(x => x.QuestionText).HasColumnName("question_text").IsRequired();
            e.Property(x => x.CorrectAnswer).HasColumnName("correct_answer").IsRequired();
            e.Property(x => x.GivenAnswer).HasColumnName("given_answer").IsRequired();
            e.Property(x => x.IsCorrect).HasColumnName("is_correct");
            e.HasOne(x => x.Attempt).WithMany().HasForeignKey(x => x.AttemptId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Question).WithMany().HasForeignKey(x => x.QuestionId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<QuizAttempt>(e =>
        {
            e.ToTable("quiz_attempts");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.UserId).HasColumnName("user_id");
            e.Property(x => x.TopicId).HasColumnName("topic_id");
            e.Property(x => x.Score).HasColumnName("score");
            e.Property(x => x.Total).HasColumnName("total");
            e.Property(x => x.Passed).HasColumnName("passed");
            e.Property(x => x.AttemptedAt).HasColumnName("attempted_at");
            e.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Topic).WithMany().HasForeignKey(x => x.TopicId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PromoCode>(e =>
        {
            e.ToTable("promo_codes");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Code).HasColumnName("code").IsRequired();
            e.Property(x => x.ModuleId).HasColumnName("module_id");
            e.Property(x => x.MaxUses).HasColumnName("max_uses");
            e.Property(x => x.UsedCount).HasColumnName("used_count");
            e.Property(x => x.IsActive).HasColumnName("is_active");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.HasIndex(x => x.Code).IsUnique();
            e.HasOne(x => x.Module).WithMany().HasForeignKey(x => x.ModuleId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Enrollment>(e =>
        {
            e.ToTable("enrollments");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.UserId).HasColumnName("user_id");
            e.Property(x => x.ModuleId).HasColumnName("module_id");
            e.Property(x => x.PurchasedAt).HasColumnName("purchased_at");
            e.Property(x => x.AmountPaid).HasColumnName("amount_paid");
            e.HasIndex(x => new { x.UserId, x.ModuleId }).IsUnique();
            e.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Module).WithMany().HasForeignKey(x => x.ModuleId).OnDelete(DeleteBehavior.Cascade);
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
