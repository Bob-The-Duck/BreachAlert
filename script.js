document.addEventListener('DOMContentLoaded', () => {
    const checkButton = document.getElementById('checkButton');
    const emailInput = document.getElementById('emailInput');
    const resultDiv = document.getElementById('result');

    const checkEmail = async () => {
        const email = emailInput.value.trim();
        
        if (!validateEmail(email)) {
            showResult('❌ Proszę podać poprawny adres e-mail');
            return;
        }

        showResult('<div class="loading">🔍 Sprawdzam bezpieczeństwo adresu...</div>');

        try {
            const data = await fetchBreaches(email);
            displayResults(email, data);
        } catch (error) {
            showResult(`❌ Wystąpił błąd: ${error.message}`);
        }
    };

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const fetchBreaches = async (email) => {
        const response = await fetch(`https://haveibeenpwned.com/api/v2/breachedaccount/${encodeURIComponent(email)}`, {
            headers: {
                'User-Agent': 'BreachAlert/2.0'
            }
        });

        if (response.status === 404) return [];
        if (response.status === 429) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            return fetchBreaches(email);
        }
        if (!response.ok) throw new Error(`API zwróciło status ${response.status}`);

        return response.json();
    };

    const displayResults = (email, breaches) => {
        if (breaches.length === 0) {
            resultDiv.innerHTML = `
                <div class="safe-result">
                    <h2>🛡️ Brak wycieków!</h2>
                    <p>Adres <b>${email}</b> nie został znaleziony w żadnych znanych wyciekach danych.</p>
                </div>
            `;
            return;
        }

        let breachesHTML = `
            <div class="breach-header">
                <h2>⚠️ WYKRYTO WYCIEKI!</h2>
                <p>Adres <b>${email}</b> został ujawniony w <b>${breaches.length}</b> wyciekach:</p>
            </div>
        `;

        breaches.forEach(breach => {
            breachesHTML += `
                <div class="breach-card">
                    <h3 class="breach-title">${breach.Title}</h3>
                    <div class="breach-data">
                        <span class="data-badge">📅 ${breach.BreachDate}</span>
                        <span class="data-badge">👥 ${breach.PwnCount?.toLocaleString() || 'N/A'} kont</span>
                    </div>
                    <p><strong>Opis:</strong> ${breach.Description || 'Brak opisu'}</p>
                </div>
            `;
        });

        breachesHTML += `
            <div class="recommendations">
                <h3>🛡️ Zalecenia bezpieczeństwa:</h3>
                <ul>
                    <li>Natychmiast zmień hasła na wszystkich powiązanych kontach</li>
                    <li>Włącz weryfikację dwuetapową (2FA)</li>
                    <li>Użyj menedżera haseł (np. Bitwarden, KeePass)</li>
                </ul>
            </div>
        `;

        resultDiv.innerHTML = breachesHTML;
    };

    const showResult = (message) => {
        resultDiv.innerHTML = message;
    };

    checkButton.addEventListener('click', checkEmail);
    emailInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkEmail();
    });
});
