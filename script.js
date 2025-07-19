document.getElementById('checkButton').addEventListener('click', checkBreaches);

async function checkBreaches() {
    const email = document.getElementById('emailInput').value.trim();
    
    if (!validateEmail(email)) {
        showResult('❌ Proszę podać poprawny adres e-mail');
        return;
    }

    document.getElementById('result').innerHTML = `
        <div class="loading">
            <p>🔍 Sprawdzam bezpieczeństwo adresu: <b>${email}</b>...</p>
        </div>
    `;

    try {
        const breaches = await fetchBreaches(email);
        displayResults(email, breaches);
    } catch (error) {
        console.error('Błąd:', error);
        showResult(`❌ Wystąpił błąd: ${error.message}`);
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

async function fetchBreaches(email) {
    const response = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}`, {
        headers: {
            'User-Agent': 'BreachAlert/1.0' // WYMAGANE przez HIBP v2
        }
    });

    if (response.status === 404) return []; // Brak wycieków
    if (response.status === 429) throw new Error('Za dużo zapytań! Poczekaj 1.5 sekundy.');
    if (!response.ok) throw new Error(`Błąd API: ${response.status}`);

    return response.json();
}

function displayResults(email, breaches) {
    const resultDiv = document.getElementById('result');
    
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
            <p class="more-info">ℹ️ Więcej informacji: <a href="https://haveibeenpwned.com/" target="_blank">haveibeenpwned.com</a></p>
        </div>
    `;

    resultDiv.innerHTML = breachesHTML;
}

function showResult(message) {
    document.getElementById('result').innerHTML = `<p>${message}</p>`;
}
