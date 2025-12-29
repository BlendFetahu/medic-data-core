import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";

async function fastSeed() {
    const connection = await mysql.createConnection({
        host: 'mysql',
        user: 'root',
        password: 'password',
        database: 'medic_db',
        port: 3306
    });

    try {
        const hash = await bcrypt.hash("admin123", 10);
        await connection.query("DELETE FROM users WHERE email = 'admin@test.com'");
        await connection.query(
            "INSERT INTO users (email, password, role) VALUES ('admin@test.com', ?, 'ADMIN')", 
            [hash]
        );
        console.log("✅ Admin u krijua me sukses!");
    } catch (err) {
        console.error("❌ Gabim:", err);
    } finally {
        await connection.end();
        process.exit();
    }
}
fastSeed();