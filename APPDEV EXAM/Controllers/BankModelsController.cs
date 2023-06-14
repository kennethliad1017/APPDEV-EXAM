using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using APPDEV_EXAM;
using APPDEV_EXAM.Models;
using System.Drawing.Printing;

namespace APPDEV_EXAM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BankModelsController : ControllerBase
    {
        private readonly BankAccountDBContext _context;

        public BankModelsController(BankAccountDBContext context)
        {
            _context = context;
        }

        // GET: api/BankModels
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BankModel>>> GetBanks(int pageNumber, int pageSize)
        {
          if (_context.Banks == null)
          {
              return NotFound();
          }
            // Calculate the number of items to skip based on the page number and page size
            int itemsToSkip = (pageNumber - 1) * pageSize;

            // Get the total count of accounts
            int totalCount = await _context.Banks.CountAsync();

            // Get the paginated accounts based on the skip and take values
            var paginatedAccounts = await _context.Banks
                .OrderBy(a => a.id)
                .Include(account => account.branches)
                .Select(a => new BankModel
                {
                    id = a.id,
                    code = a.code,
                    description = a.description,
                    deleted = a.deleted,
                })
                .ToListAsync();

            // Return the paginated accounts along with the total count and page information
            return paginatedAccounts;
        }

        // GET: api/BankModels/5
        [HttpGet("{id}")]
        public async Task<ActionResult<BankModel>> GetBankModel(int id)
        {
          if (_context.Banks == null)
          {
              return NotFound();
          }
            var bankModel = await _context.Banks.FindAsync(id);

            if (bankModel == null)
            {
                return NotFound();
            }

            return bankModel;
        }

        // PUT: api/BankModels/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPatch("{id}")]
        public async Task<IActionResult> PatchBankModel(int id, BankModel bankModel)
        {
            if (id != bankModel.id)
            {
                return BadRequest();
            }

            _context.Entry(bankModel).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BankModelExists(id))
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

        // POST: api/BankModels
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<BankModel>> PostBankModel(BankModel bankModel)
        {
          if (_context.Banks == null)
          {
              return Problem("Entity set 'BankAccountDBContext.Banks'  is null.");
          }
            _context.Banks.Add(bankModel);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetBankModel", new { id = bankModel.id }, bankModel);
        }

        // DELETE: api/BankModels/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBankModel(int id)
        {
            if (_context.Banks == null)
            {
                return NotFound();
            }
            var bankModel = await _context.Banks.FindAsync(id);
            if (bankModel == null)
            {
                return NotFound();
            }

            _context.Banks.Remove(bankModel);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool BankModelExists(int id)
        {
            return (_context.Banks?.Any(e => e.id == id)).GetValueOrDefault();
        }
    }
}
