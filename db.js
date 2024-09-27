import pkg from 'pg'; 
const { Pool } = pkg;  

const pool = new Pool({
    user: 'amarpatel',
    host: 'localhost',
    database: 'employee_tracker_db',
    password: 'pamar',
    port: 5432,
});

export default pool;
