using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using APPDEV_EXAM;
using APPDEV_EXAM.Models;
using System.Text.Json.Serialization;
using System.Text.Json;

namespace APPDEV_EXAM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BankAccountsController : ControllerBase
    {
        private readonly BankAccountDBContext _context;

        public BankAccountsController(BankAccountDBContext context)
        {
            _context = context;
        }

        // GET: api/BankAccounts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AccountData>>> GetAccounts()
        {

            if (_context.Accounts == null)
            {
                return NotFound();
            }

            

            // Get the paginated accounts based on the skip and take values
            var paginatedAccounts = await _context.Accounts
                .OrderBy(a => a.id)
                .Include(account => account.branches)
                .Select(a => new AccountData
                {
                    id = a.id,
                    bankName = a.branches.bank.description,
                    branchName = a.branches.description,
                    dateOpen = a.openDate,
                    accountNo = a.accountNo,
                    fullName = $"{a.lastName}, {a.firstName} {a.middleName}",
                    balance = a.balance.ToString("N2")
                })
                .ToListAsync();

            // Return the paginated accounts along with the total count and page information
            return paginatedAccounts;
        }

        // GET: api/BankAccounts/bank
        [HttpGet("bank")]
        public async Task<ActionResult<IEnumerable<BankModel>>> GetBanks()
        {
            if (_context.Banks == null)
            {
                return NotFound();
            }
            var jsonOptions = new JsonSerializerOptions
            {
                ReferenceHandler = ReferenceHandler.Preserve
            };

            var banks = await _context.Banks.Include(bank => bank.branches).ToListAsync();
            var serializedBanks = JsonSerializer.Serialize(banks, jsonOptions);
            //Content(serializedBanks, "application/json")
            return banks;
        }

        // GET: api/BankAccounts/branch
        [HttpGet("branch")]
        public async Task<ActionResult<IEnumerable<BranchModel>>> GetBranches()
        {
            if (_context.Branches == null)
            {
                return NotFound();
            }
            var branches = await _context.Branches
                .Include(branch => branch.bank)
                .ThenInclude(bank => bank.branches)
                .ToListAsync();

            return branches;
        }

        // GET: api/BankAccounts/5
        [HttpGet("{id}")]
        public async Task<ActionResult<AccountModel>> GetAccountModel(int id)
        {
            if (_context.Accounts == null)
            {
                return NotFound();
            }
            var accountModel = await _context.Accounts
        .Include(a => a.branches)
        .ThenInclude(br => br.bank)
        .FirstOrDefaultAsync(a => a.id == id);

            if (accountModel == null)
            {
                return NotFound();
            }

            return accountModel;
        }

        // PUT: api/BankAccounts/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPatch("{id}")]
        public async Task<IActionResult> PatchAccountModel(int id, AccountModel accountModel)
        {
            if (id != accountModel.id)
            {
                return BadRequest();
            }

            _context.Entry(accountModel).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AccountModelExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/BankAccounts
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<AccountModel>> PostAccountModel(AccountModel accountModel)
        {
            if (_context.Accounts == null)
            {
                return Problem("Entity set 'BankAccountDBContext.Accounts'  is null.");
            }

            // Convert the 'balance' value from string to decimal
            if (decimal.TryParse(accountModel.balance.ToString(), out decimal balance))
            {
                accountModel.balance = balance;
            }
            else
            {
                // Handle invalid 'balance' value
                return BadRequest("Invalid balance value.");
            }

            // Retrieve the BranchModel and BankModel based on branchCode and bankCode
            var branch = await _context.Branches
                .Include(b => b.bank)
                .FirstOrDefaultAsync(b => b.bankCode == accountModel.branchCode);

            if (branch == null)
            {
                // Handle branch not found
                return NotFound("Branch not found.");
            }

            // Set the retrieved branch to the accountModel's branches property
            accountModel.branches = branch;

            // Set the branch's bank to the accountModel's branches property
            accountModel.branches.bank = branch.bank;

            _context.Accounts.Add(accountModel);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetAccountModel", new { id = accountModel.id }, accountModel);
        }

        // DELETE: api/BankAccounts/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAccountModel(int id)
        {
            if (_context.Accounts == null)
            {
                return NotFound();
            }
            var accountModel = await _context.Accounts.FindAsync(id);
            if (accountModel == null)
            {
                return NotFound();
            }

            _context.Accounts.Remove(accountModel);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AccountModelExists(int id)
        {
            return (_context.Accounts?.Any(e => e.id == id)).GetValueOrDefault();
        }
    }
}
