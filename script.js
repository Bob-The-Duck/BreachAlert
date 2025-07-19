document.addEventListener('DOMContentLoaded', () => {
    const checkButton = document.getElementById('checkButton');
    const emailInput = document.getElementById('emailInput');
    const resultDiv = document.getElementById('result');

    const showLoading = () => {
        resultDiv.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <span class="loading"></span> Trwa sprawdzanie...
            </div>
        `;
    };

    const checkEmail = async () => {
        const email = emailInput.value.trim();
        
        if (!validateEmail(email)) {
            showResult('❌ Proszę podać poprawny adres e-mail', 'error');
            return;
        }

        showLoading();

        try {
            const data = await fetchXposedOrNot(email);
            displayResult(email, data);
        } catch (error) {
            showResult(`❌ Błąd: ${error.message}`, 'error');
        }
    };

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const fetchXposedOrNot = async (email) => {
        const response = await fetch(`https://api.xposedornot.com/v1/check-email/${encodeURIComponent(email)}`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Status ${response.status}`);
        }
        
        return response.json();
    };

    const displayResult = (email, data) => {
        if (data.pwned) {
            resultDiv.innerHTML = `
                <div class="breach">
                    <h2>⚠️ E-mail został ujawniony w wyciekach!</h2>
                    <p>Adres <b>${email}</b> pojawił się w <b>${data.count}</b> wyciekach danych.</p>
                    
                    <div class="breach-data">
                        <span class="data-badge">📅 Ostatni wyciek: ${data.last_seen || 'nieznana data'}</span>
                        <span class="data-badge">🔑 Typ danych: ${data.data_types?.join(', ') || 'e-mail'}</span>
                    </div>
                    
                    <div class="recommendations">
                        <h3>🚨 Zalecenia bezpieczeństwa</h3>
                        <ul>
                            <li>Natychmiast zmień hasła na wszystkich kontach używających tego e-maila</li>
                            <li>Włącz weryfikację dwuetapową (2FA) gdzie tylko możesz</li>
                            <li>Uważaj na podejrzane wiadomości phishingowe</li>
                            <li>Rozważ użycie aliasów e-mail dla różnych serwisów</li>
                        </ul>
                        <p>ℹ️ Więcej informacji: <a href="https://haveibeenpwned.com/" target="_blank" style="color: #4285f4;">haveibeenpwned.com</a></p>
                    </div>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <div class="safe">
                    <h2>✅ Twój e-mail jest bezpieczny</h2>
                    <p>Adres <b>${email}</b> nie został znaleziony w znanych wyciekach danych.</p>
                    
                    <div class="recommendations">
                        <h3>🛡️ Jak zachować bezpieczeństwo?</h3>
                        <ul>
                            <li>Używaj unikalnych, silnych haseł dla każdej usługi</li>
                            <li>Regularnie aktualizuj swoje hasła</li>
                            <li>Włącz powiadomienia o nowych wyciekach</li>
                            <li>Rozważ użycie menedżera haseł</li>
                        </ul>
                    </div>
                </div>
            `;
        }
    };

    const showResult = (message, type = 'info') => {
        const color = type === 'error' ? 'var(--danger)' : 'var(--light)';
        resultDiv.innerHTML = `<p style="color: ${color}; text-align: center;">${message}</p>`;
    };

    // Event listeners
    checkButton.addEventListener('click', checkEmail);
    emailInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkEmail();
    });
});
