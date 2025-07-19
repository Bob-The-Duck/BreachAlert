document.addEventListener('DOMContentLoaded', function() {
    const checkButton = document.getElementById('checkButton');
    const emailInput = document.getElementById('emailInput');
    const resultDiv = document.getElementById('result');

    if (!checkButton || !emailInput || !resultDiv) {
        console.error('Brak wymaganych elementów w DOM!');
        return;
    }

    checkButton.addEventListener('click', checkEmail);

    async function checkEmail() {
        const email = emailInput.value.trim();
        
        if (!validateEmail(email)) {
            showResult('❌ Proszę podać poprawny adres e-mail');
            return;
        }

        showResult('🔍 Sprawdzam bezpieczeństwo adresu...');

        try {
            const data = await checkXposedOrNot(email);
            displayResult(email, data);
        } catch (error) {
            showResult(`❌ Błąd: ${error.message}`);
        }
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    async function checkXposedOrNot(email) {
        const response = await fetch(`https://api.xposedornot.com/v1/check-email/${encodeURIComponent(email)}`);
        
        if (!response.ok) {
            throw new Error('Problem z połączeniem. Spróbuj później.');
        }
        
        return response.json();
    }

    function displayResult(email, data) {
        if (data.pwned) {
            resultDiv.innerHTML = `
                <div class="breach">
                    <h2>⚠️ E-mail wyciekł!</h2>
                    <p>Adres <b>${email}</b> pojawił się w <b>${data.count}</b> wyciekach.</p>
                    <p>Ostatnia aktywność: ${data.last_seen || 'nieznana data'}</p>
                    <h3>Zalecenia:</h3>
                    <ul>
                        <li>Zmień hasła na wszystkich kontach używających tego e-maila</li>
                        <li>Włącz weryfikację dwuetapową (2FA)</li>
                        <li>Uważaj na podejrzane wiadomości</li>
                    </ul>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <div class="safe">
                    <h2>✅ Twój e-mail jest bezpieczny</h2>
                    <p>Adres <b>${email}</b> nie został znaleziony w znanych wyciekach.</p>
                    <h3>Dobre praktyki:</h3>
                    <ul>
                        <li>Używaj unikalnych haseł</li>
                        <li>Regularnie sprawdzaj swoje konta</li>
                        <li>Rozważ użycie menedżera haseł</li>
                    </ul>
                </div>
            `;
        }
    }

    function showResult(message) {
        resultDiv.innerHTML = `<p>${message}</p>`;
    }
});
