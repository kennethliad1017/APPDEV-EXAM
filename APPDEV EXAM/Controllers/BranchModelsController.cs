using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using APPDEV_EXAM;
using APPDEV_EXAM.Models;

namespace APPDEV_EXAM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BranchModelsController : ControllerBase
    {
        private readonly BankAccountDBContext _context;

        public BranchModelsController(BankAccountDBContext context)
        {
            _context = context;
        }

        // GET: api/BranchModels
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BranchModel>>> GetBranches()
        {
          if (_context.Branches == null)
          {
              return NotFound();
          }

            // Get the paginated accounts based on the skip and take values
            var paginatedBranches = await _context.Branches
                .OrderBy(a => a.id)
                .Include(branches => branches.bank)
                .Select(a => new BranchModel
                {
                    id = a.id,
                    bankCode = a.bankCode,
                    description = a.description,
                    deleted = a.deleted,
                })
                .ToListAsync();

            // Return the paginated accounts along with the total count and page information
            return paginatedBranches;
        }

        // GET: api/BranchModels/5
        [HttpGet("{id}")]
        public async Task<ActionResult<BranchModel>> GetBranchModel(int id)
        {
          if (_context.Branches == null)
          {
              return NotFound();
          }
            var branchModel = await _context.Branches.FindAsync(id);

            if (branchModel == null)
            {
                return NotFound();
            }

            return branchModel;
        }

        // PUT: api/BranchModels/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPatch("{id}")]
        public async Task<IActionResult> PatchBranchModel(int id, BranchModel branchModel)
        {
            if (id != branchModel.id)
            {
                return BadRequest();
            }

            _context.Entry(branchModel).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BranchModelExists(id))
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

        // POST: api/BranchModels
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<BranchModel>> PostBranchModel(BranchModel branchModel)
        {
          if (_context.Branches == null)
          {
              return Problem("Entity set 'BankAccountDBContext.Branches'  is null.");
          }
            _context.Branches.Add(branchModel);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetBranchModel", new { id = branchModel.id }, branchModel);
        }

        // DELETE: api/BranchModels/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBranchModel(int id)
        {
            if (_context.Branches == null)
            {
                return NotFound();
            }
            var branchModel = await _context.Branches.FindAsync(id);
            if (branchModel == null)
            {
                return NotFound();
            }

            _context.Branches.Remove(branchModel);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool BranchModelExists(int id)
        {
            return (_context.Branches?.Any(e => e.id == id)).GetValueOrDefault();
        }
    }
}
