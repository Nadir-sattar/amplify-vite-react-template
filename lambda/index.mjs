export const handler = async (event) => {
  console.log("Received event:", JSON.stringify(event));

  if (event.motion !== true) {
      return { message: "No motion detected" };
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  const message = {
      content: "🚨 **Motion detected!**\n" +
               "Device: " + event.deviceName + "\n" +
               "Time: " + new Date(
                   Number(event.timestamp) * 1000
               ).toLocaleString("sv-SE", {
                   timeZone: "Europe/Stockholm"
               })
  };

  const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify(message)
  });

  if (!response.ok) {
      throw new Error("Discord error: " + response.status);
  }

  return { message: "Discord notification sent" };
};