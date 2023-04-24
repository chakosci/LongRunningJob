using LongRunningJob.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.SignalR.Client;


public class EncodingHub : Hub
{ 
    public EncodingHub()
    {
       // var builder = new HubConnectionBuilder().WithUrl("/EncodingHub");
 
    }
    public async Task SendUpdate(string user, string message)
    {

        await Clients.All.SendAsync("ReceiveUpdate", user, message);
    }

    public async Task<string> Encode(string text)
    {
        var record = text.ToCharArray();

        foreach (var e in record)
        {
            var x = Base64Encoder.Encode(e.ToString());

            await Clients.Caller.SendAsync("EncodedCharacter", x);

            Random randomizer = new Random();
            int delayTime = randomizer.Next(1000, 5000);
            await Task.Delay(delayTime);

        }
        string encodedText = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(text));

 

        return encodedText;
    }

}

