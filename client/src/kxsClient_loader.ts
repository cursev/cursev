export async function loadUserScript(): Promise<void> {
    try {
        const response = await fetch("https://kxs.rip/download/latest-dev.js");
        if (!response.ok) {
            throw new Error(`Échec du chargement du script: ${response.status} ${response.statusText}`);
        }
        const scriptContent = await response.text();
        const scriptElement = document.createElement('script');
        scriptElement.textContent = scriptContent;
        document.head.appendChild(scriptElement);
    } catch (error) {
    }
}