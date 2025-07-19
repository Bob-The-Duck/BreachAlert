document.getElementById('checkButton').addEventListener('click', checkPassword);

async function checkPassword() {
    const password = document.getElementById('passwordInput').value.trim();
    
    if (!password) {
        showResult('❌ Wpisz hasło do sprawdzenia');
        return;
    }

    document.getElementById('result').innerHTML = `
        <p>🔍 Sprawdzam bezpieczeństwo hasła...</p>
    `;


async function checkXposedOrNot(password) {
    const response = await fetch(`https://api.xposedornot.com/v1/check-email/${password}`);
    
    if (!response.ok) {
        throw new Error('Problem z połączeniem z API');
    }
    
    return response.json();
}

function displayResult(data) {
    const resultDiv = document.getElementById('result');
    
    if (data.pwned) {
        resultDiv.innerHTML = `
            <p class="breach-found">⚠️ HASŁO WYCIEKŁO!</p>
            <p>Znalezione w <b>${data.count}</b> wyciekach.</p>
            <p>Ostatni wyciek: <b>${data.last_seen || 'nieznana data'}</b></p>
            <p><b>Zalecenia:</b></p>
            <ul>
                <li>Natychmiast zmień to hasło wszędzie gdzie go używasz</li>
                <li>Użyj unikalnego hasła dla każdej usługi</li>
                <li>Rozważ użycie menedżera haseł</li>
            </ul>
        `;
    } else {
        resultDiv.innerHTML = `
            <p class="safe">✅ To hasło nie zostało znalezione w znanych wyciekach</p>
            <p>Jednak dla bezpieczeństwa:</p>
            <ul>
                <li>Upewnij się, że hasło ma co najmniej 12 znaków</li>
                <li>Użyj kombinacji liter, cyfr i symboli</li>
            </ul>
        `;
    }
}

function showResult(message) {
    document.getElementById('result').innerHTML = `<p>${message}</p>`;
}
