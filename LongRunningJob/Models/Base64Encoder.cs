using LongRunningJob.Interfaces;
using System.Text;

namespace LongRunningJob.Models
{
    
 
    public static class Base64Encoder
    {
        private static IEncoder _encoder = new DefaultBase64Encoder();

        public static void SetEncoder(IEncoder encoder)
        {
            _encoder = encoder;
        }

        public static string Encode(string inputString)
        {
            return _encoder.Encode(inputString);
        }
    }

    public class DefaultBase64Encoder : IEncoder
    {
        public string Encode(string inputString)
        {
            byte[] byteArray = Encoding.UTF8.GetBytes(inputString);
            string base64String = Convert.ToBase64String(byteArray);
            return base64String;
        }
    }
}
