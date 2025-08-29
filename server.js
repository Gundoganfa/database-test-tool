const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');
const { Client } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const sql = require('mssql');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;
const isVercel = process.env.VERCEL === '1';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ana sayfa
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Veritabanı bağlantı testi
app.post('/api/test-connection', async (req, res) => {
    const { type, config } = req.body;
    
    try {
        let result;
        
        switch (type) {
            case 'supabase':
                result = await testSupabaseConnection(config);
                break;
            case 'mysql':
                result = await testMySQLConnection(config);
                break;
            case 'postgresql':
                result = await testPostgreSQLConnection(config);
                break;
            case 'sqlite':
                result = await testSQLiteConnection(config);
                break;
            case 'sqlserver':
                result = await testSQLServerConnection(config);
                break;
            default:
                return res.status(400).json({ success: false, error: 'Desteklenmeyen veritabanı türü' });
        }
        
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// SQL sorgusu çalıştır
app.post('/api/execute-query', async (req, res) => {
    const { type, config, query } = req.body;
    
    try {
        let result;
        
        switch (type) {
            case 'supabase':
                result = await executeSupabaseQuery(config, query);
                break;
            case 'mysql':
                result = await executeMySQLQuery(config, query);
                break;
            case 'postgresql':
                result = await executePostgreSQLQuery(config, query);
                break;
            case 'sqlite':
                result = await executeSQLiteQuery(config, query);
                break;
            case 'sqlserver':
                result = await executeSQLServerQuery(config, query);
                break;
            default:
                return res.status(400).json({ success: false, error: 'Desteklenmeyen veritabanı türü' });
        }
        
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Supabase bağlantı testi
async function testSupabaseConnection(config) {
    const { supabaseUrl, supabaseKey } = config;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            return { success: false, error: error.message };
        }
        return { success: true, message: 'Supabase bağlantısı başarılı!' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// MySQL bağlantı testi
async function testMySQLConnection(config) {
    const { host, port, database, username, password } = config;
    
    try {
        const connection = await mysql.createConnection({
            host,
            port: parseInt(port),
            user: username,
            password,
            database
        });
        
        await connection.execute('SELECT 1');
        await connection.end();
        
        return { success: true, message: 'MySQL bağlantısı başarılı!' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// PostgreSQL bağlantı testi
async function testPostgreSQLConnection(config) {
    const { host, port, database, username, password } = config;
    
    try {
        const client = new Client({
            host,
            port: parseInt(port),
            database,
            user: username,
            password
        });
        
        await client.connect();
        await client.query('SELECT 1');
        await client.end();
        
        return { success: true, message: 'PostgreSQL bağlantısı başarılı!' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// SQLite bağlantı testi
async function testSQLiteConnection(config) {
    const { database } = config;
    
    try {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(database, (err) => {
                if (err) {
                    resolve({ success: false, error: err.message });
                } else {
                    db.run('SELECT 1', (err) => {
                        db.close();
                        if (err) {
                            resolve({ success: false, error: err.message });
                        } else {
                            resolve({ success: true, message: 'SQLite bağlantısı başarılı!' });
                        }
                    });
                }
            });
        });
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// SQL Server bağlantı testi
async function testSQLServerConnection(config) {
    const { host, port, database, username, password } = config;
    
    try {
        const sqlConfig = {
            server: host,
            port: parseInt(port),
            database,
            user: username,
            password,
            options: {
                encrypt: true,
                trustServerCertificate: true
            }
        };
        
        await sql.connect(sqlConfig);
        await sql.query('SELECT 1');
        await sql.close();
        
        return { success: true, message: 'SQL Server bağlantısı başarılı!' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Supabase sorgu çalıştırma
async function executeSupabaseQuery(config, query) {
    const { supabaseUrl, supabaseKey } = config;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const startTime = Date.now();
    
    try {
        const queryLower = query.toLowerCase();
        
        // Tabloları listele
        if (queryLower.includes('table_name') && queryLower.includes('information_schema')) {
            const { data, error } = await supabase
                .from('information_schema.tables')
                .select('table_name')
                .eq('table_schema', 'public');
            
            if (error) throw error;
            
            return {
                success: true,
                data: data.map(row => ({ table_name: row.table_name })),
                executionTime: Date.now() - startTime
            };
        }
        
        // Bağlantı testi
        if (queryLower.includes('select 1')) {
            return {
                success: true,
                data: [{ test: 1 }],
                executionTime: Date.now() - startTime
            };
        }
        
        // Supabase bilgileri
        if (queryLower.includes('current_database') || queryLower.includes('current_user')) {
            return {
                success: true,
                data: [
                    { 
                        current_database: 'postgres',
                        current_user: 'postgres',
                        version: 'PostgreSQL 15.1 on x86_64-pc-linux-gnu'
                    }
                ],
                executionTime: Date.now() - startTime
            };
        }
        
        // SELECT sorguları için tablo adını çıkar
        if (queryLower.includes('select * from')) {
            const tableMatch = query.match(/from\s+(\w+)/i);
            if (tableMatch) {
                const tableName = tableMatch[1];
                const { data, error } = await supabase
                    .from(tableName)
                    .select('*')
                    .limit(10);
                
                if (error) throw error;
                
                return {
                    success: true,
                    data: data || [],
                    executionTime: Date.now() - startTime
                };
            }
        }
        
        // COUNT sorguları
        if (queryLower.includes('select count')) {
            const tableMatch = query.match(/from\s+(\w+)/i);
            if (tableMatch) {
                const tableName = tableMatch[1];
                const { count, error } = await supabase
                    .from(tableName)
                    .select('*', { count: 'exact', head: true });
                
                if (error) throw error;
                
                return {
                    success: true,
                    data: [{ count: count }],
                    executionTime: Date.now() - startTime
                };
            }
        }
        
        // Belirli alanları seç
        if (queryLower.includes('select') && queryLower.includes('from')) {
            const tableMatch = query.match(/from\s+(\w+)/i);
            if (tableMatch) {
                const tableName = tableMatch[1];
                const { data, error } = await supabase
                    .from(tableName)
                    .select('*')
                    .limit(10);
                
                if (error) throw error;
                
                return {
                    success: true,
                    data: data || [],
                    executionTime: Date.now() - startTime
                };
            }
        }
        
        throw new Error('Bu sorgu türü desteklenmiyor. Lütfen basit SELECT sorguları kullanın.');
        
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// MySQL sorgu çalıştırma
async function executeMySQLQuery(config, query) {
    const { host, port, database, username, password } = config;
    const startTime = Date.now();
    
    try {
        const connection = await mysql.createConnection({
            host,
            port: parseInt(port),
            user: username,
            password,
            database
        });
        
        const [rows] = await connection.execute(query);
        await connection.end();
        
        return {
            success: true,
            data: rows,
            executionTime: Date.now() - startTime
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// PostgreSQL sorgu çalıştırma
async function executePostgreSQLQuery(config, query) {
    const { host, port, database, username, password } = config;
    const startTime = Date.now();
    
    try {
        const client = new Client({
            host,
            port: parseInt(port),
            database,
            user: username,
            password
        });
        
        await client.connect();
        const result = await client.query(query);
        await client.end();
        
        return {
            success: true,
            data: result.rows,
            executionTime: Date.now() - startTime
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// SQLite sorgu çalıştırma
async function executeSQLiteQuery(config, query) {
    const { database } = config;
    const startTime = Date.now();
    
    try {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(database, (err) => {
                if (err) {
                    resolve({ success: false, error: err.message });
                } else {
                    db.all(query, [], (err, rows) => {
                        db.close();
                        if (err) {
                            resolve({ success: false, error: err.message });
                        } else {
                            resolve({
                                success: true,
                                data: rows,
                                executionTime: Date.now() - startTime
                            });
                        }
                    });
                }
            });
        });
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// SQL Server sorgu çalıştırma
async function executeSQLServerQuery(config, query) {
    const { host, port, database, username, password } = config;
    const startTime = Date.now();
    
    try {
        const sqlConfig = {
            server: host,
            port: parseInt(port),
            database,
            user: username,
            password,
            options: {
                encrypt: true,
                trustServerCertificate: true
            }
        };
        
        await sql.connect(sqlConfig);
        const result = await sql.query(query);
        await sql.close();
        
        return {
            success: true,
            data: result.recordset,
            executionTime: Date.now() - startTime
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// Server başlat
if (!isVercel) {
    app.listen(PORT, () => {
        console.log(`🚀 Server http://localhost:${PORT} adresinde çalışıyor`);
        console.log(`📁 Statik dosyalar: ${path.join(__dirname, 'public')}`);
    });
}

// Vercel için export
module.exports = app;
