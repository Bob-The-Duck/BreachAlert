document.getElementById('checkButton').addEventListener('click', checkEmail);

async function checkEmail() {
    const email = document.getElementById('emailInput').value.trim();
    
    if (!validateEmail(email)) {
        showResult('❌ Wpisz poprawny adres e-mail');
        return;
    }

    document.getElementById('result').innerHTML = `
        <p>🔍 Sprawdzam czy adres <b>${email}</b> pojawił się w wyciekach...</p>
    `;

    try {
        const data = await checkXposedOrNot(email);
        displayResult(email, data);
    } catch (error) {
        showResult(`❌ Wystąpił błąd: ${error.message}`);
    }
}

// Walidacja e-maila
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

async function checkXposedOrNot(email) {
    const response = await fetch(`https://api.xposedornot.com/v1/check-email/${encodeURIComponent(email)}`);
    
    if (!response.ok) {
        throw new Error('Problem z połączeniem z API');
    }
    
    return response.json();
}

function displayResult(email, data) {
    const resultDiv = document.getElementById('result');
    
    if (data.pwned) {
        resultDiv.innerHTML = `
            <p class="breach-found">⚠️ E-MAIL WYCIEKŁ!</p>
            <p>Adres <b>${email}</b> znaleziono w <b>${data.count}</b> wyciekach.</p>
            <p>Ostatni wyciek: <b>${data.last_seen || 'nieznana data'}</b></p>
            <p><b>Zalecenia:</b></p>
            <ul>
                <li>Natychmiast zmień hasła na wszystkich kontach używających tego e-maila</li>
                <li>Włącz weryfikację dwuetapową (2FA) gdzie tylko możesz</li>
                <li>Sprawdź czy nie masz podejrzanych aktywności na kontach</li>
                <li>Rozważ użycie aliasów e-mail dla różnych serwisów</li>
            </ul>
            <p>ℹ️ Więcej informacji: <a href="https://haveibeenpwned.com/" target="_blank">haveibeenpwned.com</a></p>
        `;
    } else {
        resultDiv.innerHTML = `
            <p class="safe">✅ Adres <b>${email}</b> nie został znaleziony w znanych wyciekach</p>
            <p><b>Dobre praktyki:</b></p>
            <ul>
                <li>Używaj unikalnych haseł dla każdej usługi</li>
                <li>Regularnie sprawdzaj czy Twój e-mail nie wyciekł</li>
                <li>Włącz powiadomienia o nowych wyciekach</li>
            </ul>
        `;
    }
}

function showResult(message) {
    document.getElementById('result').innerHTML = `<p>${message}</p>`;
}
