
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Runtime.Serialization;
using System.Text.Json.Serialization;

namespace APPDEV_EXAM.Models
{
    public class BranchModel
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]

        public int id { get; set; }

        public string bankCode { get; set; }

        [Required]
        public string description { get; set; }

        public bool deleted { get; set; }


        [ForeignKey("bankCode")]
        public virtual BankModel bank { get; set; }

        [JsonIgnore]
        [IgnoreDataMember]
        public virtual ICollection<AccountModel>? accounts { get; set; }

    }
}
