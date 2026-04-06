export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/webhook" && request.method === "POST") {
      const body = await request.json();

      const replyToken = body.events?.[0]?.replyToken;
      const userMessage = body.events?.[0]?.message?.text;

      if (replyToken && userMessage) {
        await fetch("https://api.line.me/v2/bot/message/reply", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer Mu0bjnx9cg+gsGlzpiIgTYCj95B5LEA2jEnjCCDwcn61V4E8mcCisoJy9aSqelVDH6ET2Pbl5gF4RitvlcDjYJGuH0zASH7kGVCGk9pfOi/r2ZPX14h7m4VcXtnHUbMIO5iHE7tw7FNRWpzXSiSDLwdB04t89/1O/w1cDnyilFU="
          },
          body: JSON.stringify({
            replyToken,
            messages: [
              {
                type: "text",
                text: `あなたのメッセージ: ${userMessage}`
              }
            ]
          })
        });
      }

      return new Response("OK", { status: 200 });
    }

    return new Response("Hello Worker!");
  },
};