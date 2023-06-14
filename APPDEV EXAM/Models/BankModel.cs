using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Runtime.Serialization;
using System.Text.Json.Serialization;

namespace APPDEV_EXAM.Models
{
    public class BankModel
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]

        public int id { get; set; }

        [Required]
        public string code { get; set; }

        [Required]
        public string description { get; set; }

        public bool deleted { get; set; }

        [JsonIgnore]
        [IgnoreDataMember]
        public virtual ICollection<BranchModel>? branches { get; set; }
    }
}
