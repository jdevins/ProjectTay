

async function insertUser() {
    const query = `
        INSERT INTO users (username, password, create_timestamp)
        VALUES ($1, $2, NOW())
        );
    `;
    try {
        await pool.query(query);
        console.log('User Created');
        return true;
    } catch (error) {
        console.error('Error creating user table:', error);
        return false;
    }

}
module.exports = pool;