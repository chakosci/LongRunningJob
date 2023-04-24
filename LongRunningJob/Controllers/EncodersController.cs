using LongRunningJob.Interfaces;
using LongRunningJob.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
using System.Net;
using System.Text;

namespace LongRunningJob.Controllers
{



    [ApiController]
    [Route("[controller]")]
    public class EncodersController : ControllerBase
    {

        private readonly IHubContext<EncodingHub> _hubContext;

        public EncodersController(IHubContext<EncodingHub> hubContext)
        {
            _hubContext = hubContext;
        }


        [HttpPost("Post")]
        public async Task<IActionResult> PostAsync([FromBody] Request request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Value))
            {
                return BadRequest("Text cannot be empty");
            }

            
            var values = request.Value.ToCharArray();
 

            foreach (var value in values)
            {
                if (cancellationToken.IsCancellationRequested)
                {
                    return StatusCode((int)HttpStatusCode.ServiceUnavailable, "Encoding cancelled");
                }
                string encodedChar = Base64Encoder.Encode(value.ToString());
 
                await Task.Delay(new Random().Next(1, 5) * 1000, cancellationToken);
                await _hubContext.Clients.All.SendAsync("EncodedCharacter", encodedChar, cancellationToken);
            }

            return Ok();
        }

         
    }
}
