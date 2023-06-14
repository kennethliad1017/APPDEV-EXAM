using APPDEV_EXAM.Models;
using Microsoft.EntityFrameworkCore;

namespace APPDEV_EXAM
{
    public class BankAccountDBContext : DbContext
    {
        public DbSet<AccountModel> Accounts { get; set; }
        public DbSet<BankModel> Banks { get; set; }
        public DbSet<BranchModel> Branches { get; set; }

        public BankAccountDBContext(DbContextOptions<BankAccountDBContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configure your entity relationships and constraints here
            // For example, defining foreign key relationships
            modelBuilder.Entity<AccountModel>()
                .HasOne(account => account.branches)
                .WithMany(branch => branch.accounts)
                .HasForeignKey(account => account.branchCode)
                .HasPrincipalKey(branch => branch.bankCode);

            modelBuilder.Entity<BranchModel>()
                .HasOne(branch => branch.bank)
                .WithMany(bank => bank.branches)
                .HasForeignKey(branch => branch.bankCode)
                .HasPrincipalKey(bank => bank.code);

            // You can add more configuration if needed

            base.OnModelCreating(modelBuilder);
        }
    }
}
