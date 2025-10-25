# Reset Database Script
Write-Host "🔄 Resetting Database..." -ForegroundColor Cyan

$env:PGPASSWORD = "badsha@123"

# Drop all tables in the database
$dropTables = @"
DO `$`$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END `$`$;
"@

Write-Host "Dropping all tables..." -ForegroundColor Yellow
$dropTables | & "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d ar_rahnu

Write-Host "✅ Database reset complete!" -ForegroundColor Green
Write-Host ""

