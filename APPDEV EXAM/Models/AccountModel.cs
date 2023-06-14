using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace APPDEV_EXAM.Models
{
    public class AccountModel
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id { get; set; }

        public string branchCode { get; set; }

        [Required]
        public string accountNo { get; set; }

        [Required]
        public string lastName { get; set; }

        [Required]
        public string firstName { get; set; }

        public string middleName { get; set; }

        [Required]
        public DateTime birthdate { get; set; }

        [Required]
        public DateTime openDate { get; set; }

        [Required]
        public decimal balance { get; set; }


        [ForeignKey("branchCode")]
        public virtual  BranchModel branches { get; set; }
    }
}
