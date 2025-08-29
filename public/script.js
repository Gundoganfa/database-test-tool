// Global değişkenler
let currentConnection = null;
let currentDbType = 'supabase';

// DOM elementlerini seç
const dbTypeButtons = document.querySelectorAll('.db-type-btn');
const connectionForms = document.querySelectorAll('.connection-form');
const testConnectionBtn = document.getElementById('testConnection');
const sqlQueryTextarea = document.getElementById('sqlQuery');
const executeQueryBtn = document.getElementById('executeQuery');
const clearQueryBtn = document.getElementById('clearQuery');
const connectionStatus = document.getElementById('connectionStatus');
const queryResults = document.getElementById('queryResults');
const sampleBtns = document.querySelectorAll('.sample-btn');

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Veritabanı türü seçimi
    dbTypeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const dbType = this.getAttribute('data-type');
            switchDatabaseType(dbType);
        });
    });

    // Bağlantı testi
    testConnectionBtn.addEventListener('click', testDatabaseConnection);
    
    // Sorgu çalıştırma
    executeQueryBtn.addEventListener('click', executeSQLQuery);
    
    // Sorgu temizleme
    clearQueryBtn.addEventListener('click', clearQuery);
    
    // Örnek sorgu butonları
    sampleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const query = this.getAttribute('data-query');
            sqlQueryTextarea.value = query;
        });
    });
});

// Veritabanı türünü değiştir
function switchDatabaseType(dbType) {
    currentDbType = dbType;
    
    // Buton durumlarını güncelle
    dbTypeButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-type') === dbType) {
            btn.classList.add('active');
        }
    });
    
    // Form görünürlüğünü güncelle
    connectionForms.forEach(form => {
        form.classList.add('hidden');
    });
    
    const activeForm = document.getElementById(`${dbType}-form`);
    if (activeForm) {
        activeForm.classList.remove('hidden');
    }
    
    // Bağlantı durumunu sıfırla
    updateConnectionStatus('Bağlantı bekleniyor...', '');
    currentConnection = null;
}

// Veritabanı bağlantısını test et
async function testDatabaseConnection() {
    const config = getConnectionConfig();
    
    if (!validateConnectionConfig(config)) {
        return;
    }
    
    showLoading(testConnectionBtn, 'Bağlantı test ediliyor...');
    updateConnectionStatus('Bağlantı test ediliyor...', 'loading');
    
    try {
        const response = await fetch('/api/test-connection', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: currentDbType,
                config: config
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentConnection = { type: currentDbType, config: config };
            updateConnectionStatus('✅ ' + result.message, 'connected');
            showSuccessMessage(result.message);
        } else {
            updateConnectionStatus('❌ Bağlantı başarısız: ' + result.error, 'error');
            showErrorMessage('Bağlantı hatası: ' + result.error);
        }
    } catch (error) {
        updateConnectionStatus('❌ Bağlantı hatası: ' + error.message, 'error');
        showErrorMessage('Bağlantı hatası: ' + error.message);
    } finally {
        hideLoading(testConnectionBtn, '🔗 Bağlantıyı Test Et');
    }
}

// Bağlantı konfigürasyonunu al
function getConnectionConfig() {
    switch (currentDbType) {
        case 'supabase':
            return {
                supabaseUrl: document.getElementById('supabaseUrl').value.trim(),
                supabaseKey: document.getElementById('supabaseKey').value.trim()
            };
        case 'mysql':
            return {
                host: document.getElementById('mysqlHost').value.trim(),
                port: document.getElementById('mysqlPort').value.trim(),
                database: document.getElementById('mysqlDatabase').value.trim(),
                username: document.getElementById('mysqlUsername').value.trim(),
                password: document.getElementById('mysqlPassword').value.trim()
            };
        case 'postgresql':
            return {
                host: document.getElementById('postgresqlHost').value.trim(),
                port: document.getElementById('postgresqlPort').value.trim(),
                database: document.getElementById('postgresqlDatabase').value.trim(),
                username: document.getElementById('postgresqlUsername').value.trim(),
                password: document.getElementById('postgresqlPassword').value.trim()
            };
        case 'sqlite':
            return {
                database: document.getElementById('sqliteDatabase').value.trim()
            };
        case 'sqlserver':
            return {
                host: document.getElementById('sqlserverHost').value.trim(),
                port: document.getElementById('sqlserverPort').value.trim(),
                database: document.getElementById('sqlserverDatabase').value.trim(),
                username: document.getElementById('sqlserverUsername').value.trim(),
                password: document.getElementById('sqlserverPassword').value.trim()
            };
        default:
            return {};
    }
}

// Bağlantı konfigürasyonunu doğrula
function validateConnectionConfig(config) {
    switch (currentDbType) {
        case 'supabase':
            if (!config.supabaseUrl || !config.supabaseKey) {
                showErrorMessage('Supabase URL ve Anon Key gerekli!');
                return false;
            }
            break;
        case 'mysql':
        case 'postgresql':
        case 'sqlserver':
            if (!config.host || !config.database || !config.username) {
                showErrorMessage('Host, Database ve Username gerekli!');
                return false;
            }
            break;
        case 'sqlite':
            if (!config.database) {
                showErrorMessage('Database dosya yolu gerekli!');
                return false;
            }
            break;
    }
    return true;
}

// SQL sorgusunu çalıştır
async function executeSQLQuery() {
    if (!currentConnection) {
        showErrorMessage('Önce veritabanı bağlantısını test edin!');
        return;
    }
    
    const query = sqlQueryTextarea.value.trim();
    if (!query) {
        showErrorMessage('SQL sorgusu gerekli!');
        return;
    }
    
    showLoading(executeQueryBtn, 'Sorgu çalıştırılıyor...');
    
    try {
        const response = await fetch('/api/execute-query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: currentConnection.type,
                config: currentConnection.config,
                query: query
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            displayQueryResult(query, result.data, result.executionTime);
        } else {
            displayQueryError(query, result.error);
        }
    } catch (error) {
        displayQueryError(query, error.message);
    } finally {
        hideLoading(executeQueryBtn, '▶️ Sorguyu Çalıştır');
    }
}

// Sorgu sonucunu göster
function displayQueryResult(query, data, executionTime) {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'query-result success';
    
    let html = `
        <h4>✅ Sorgu Başarılı</h4>
        <p><strong>Sorgu:</strong> <code>${escapeHtml(query)}</code></p>
        <p><strong>Çalışma Süresi:</strong> ${executionTime}ms</p>
    `;
    
    if (data && data.length > 0) {
        html += '<p><strong>Sonuçlar:</strong></p>';
        html += createResultTable(data);
    } else {
        html += '<p class="success-message">Sorgu başarıyla çalıştırıldı. Sonuç döndürülmedi.</p>';
    }
    
    resultDiv.innerHTML = html;
    addResultToContainer(resultDiv);
}

// Sorgu hatasını göster
function displayQueryError(query, error) {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'query-result error';
    
    resultDiv.innerHTML = `
        <h4>❌ Sorgu Hatası</h4>
        <p><strong>Sorgu:</strong> <code>${escapeHtml(query)}</code></p>
        <div class="error-message">${escapeHtml(error)}</div>
    `;
    
    addResultToContainer(resultDiv);
}

// Sonuç tablosu oluştur
function createResultTable(data) {
    if (!data || data.length === 0) return '';
    
    const columns = Object.keys(data[0]);
    let tableHtml = '<table class="result-table"><thead><tr>';
    
    // Başlık satırı
    columns.forEach(column => {
        tableHtml += `<th>${escapeHtml(column)}</th>`;
    });
    tableHtml += '</tr></thead><tbody>';
    
    // Veri satırları
    data.forEach(row => {
        tableHtml += '<tr>';
        columns.forEach(column => {
            const value = row[column] !== null && row[column] !== undefined ? row[column] : '';
            tableHtml += `<td>${escapeHtml(String(value))}</td>`;
        });
        tableHtml += '</tr>';
    });
    
    tableHtml += '</tbody></table>';
    return tableHtml;
}

// Sonucu container'a ekle
function addResultToContainer(resultElement) {
    // Placeholder'ı kaldır
    const placeholder = queryResults.querySelector('.results-placeholder');
    if (placeholder) {
        placeholder.remove();
    }
    
    // Yeni sonucu en üste ekle
    queryResults.insertBefore(resultElement, queryResults.firstChild);
}

// Sorguyu temizle
function clearQuery() {
    sqlQueryTextarea.value = '';
    sqlQueryTextarea.focus();
}

// Bağlantı durumunu güncelle
function updateConnectionStatus(message, status) {
    const statusText = connectionStatus.querySelector('.status-text');
    const statusIcon = connectionStatus.querySelector('.status-icon');
    
    statusText.textContent = message;
    
    // Icon güncelle
    if (status === 'connected') {
        statusIcon.textContent = '✅';
    } else if (status === 'error') {
        statusIcon.textContent = '❌';
    } else if (status === 'loading') {
        statusIcon.textContent = '⏳';
    } else {
        statusIcon.textContent = '⏳';
    }
    
    // CSS class güncelle
    connectionStatus.className = 'status-indicator';
    if (status) {
        connectionStatus.classList.add(status);
    }
}

// Loading göster
function showLoading(button, text) {
    button.disabled = true;
    button.innerHTML = `<span class="loading"></span>${text}`;
}

// Loading gizle
function hideLoading(button, text) {
    button.disabled = false;
    button.innerHTML = text;
}

// Başarı mesajı göster
function showSuccessMessage(message) {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'query-result success';
    resultDiv.innerHTML = `<div class="success-message">${escapeHtml(message)}</div>`;
    addResultToContainer(resultDiv);
}

// Hata mesajı göster
function showErrorMessage(message) {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'query-result error';
    resultDiv.innerHTML = `<div class="error-message">${escapeHtml(message)}</div>`;
    addResultToContainer(resultDiv);
}

// HTML escape
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
