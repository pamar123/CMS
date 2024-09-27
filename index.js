// Import required packages
import inquirer from 'inquirer';
import db from './db.js'; // Ensure you update the db file similarly


// Main menu
function mainMenu() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                'View all departments',
                'View all roles',
                'View all employees',
                'Add a department',
                'Add a role',
                'Add an employee',
                'Update an employee role',
                'Exit'
            ]
        }
    ]).then(answer => {
        switch (answer.action) {
            case 'View all departments':
                viewAllDepartments();
                break;
            case 'View all roles':
                viewAllRoles();
                break;
            case 'View all employees':
                viewAllEmployees();
                break;
            case 'Add a department':
                addDepartment();
                break;
            case 'Add a role':
                addRole();
                break;
            case 'Add an employee':
                addEmployee();
                break;
            case 'Update an employee role':
                updateEmployeeRole();
                break;
            case 'Exit':
                db.end(); // Close the database connection
                console.log('Goodbye!');
                break;
            default:
                break;
        }
    });
}

// Example: View all departments
function viewAllDepartments() {
    db.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        console.table(res.rows);
        mainMenu();
    });
}

// Example: View all roles
function viewAllRoles() {
    const query = `
        SELECT role.id, role.title, department.name AS department, role.salary
        FROM role
        JOIN department ON role.department_id = department.id
    `;
    db.query(query, (err, res) => {
        if (err) throw err;
        console.table(res.rows);
        mainMenu();
    });
}

// Add missing function: View all employees
function viewAllEmployees() {
    const query = `
        SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary,
        CONCAT(manager.first_name, ' ', manager.last_name) AS manager
        FROM employee
        LEFT JOIN role ON employee.role_id = role.id
        LEFT JOIN department ON role.department_id = department.id
        LEFT JOIN employee manager ON employee.manager_id = manager.id;
    `;
    db.query(query, (err, res) => {
        if (err) throw err;
        console.table(res.rows);
        mainMenu();
    });
}

function addEmployee() {
    // Fetch available roles and employees (for manager selection)
    db.query('SELECT id, title FROM role', (err, roles) => {
        if (err) throw err;

        db.query('SELECT id, first_name, last_name FROM employee', (err, employees) => {
            if (err) throw err;

            inquirer.prompt([
                {
                    type: 'input',
                    name: 'firstName',
                    message: "Enter the employee's first name:"
                },
                {
                    type: 'input',
                    name: 'lastName',
                    message: "Enter the employee's last name:"
                },
                {
                    type: 'list',
                    name: 'roleId',
                    message: "Select the employee's role:",
                    choices: roles.rows.map(role => ({ name: role.title, value: role.id }))
                },
                {
                    type: 'list',
                    name: 'managerId',
                    message: "Select the employee's manager:",
                    choices: [{ name: 'None', value: null }].concat(employees.rows.map(employee => ({
                        name: `${employee.first_name} ${employee.last_name}`,
                        value: employee.id
                    })))
                }
            ]).then(answers => {
                const { firstName, lastName, roleId, managerId } = answers;
                db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', 
                [firstName, lastName, roleId, managerId], (err, res) => {
                    if (err) throw err;
                    console.log('Employee added successfully!');
                    mainMenu(); // Return to the main menu
                });
            });
        });
    });
}
function addDepartment() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'departmentName',
            message: 'Enter the name of the new department:'
        }
    ]).then(answer => {
        const { departmentName } = answer;
        db.query('INSERT INTO department (name) VALUES ($1)', [departmentName], (err, res) => {
            if (err) throw err;
            console.log(`Department ${departmentName} added successfully!`);
            mainMenu();
        });
    });
}

function addRole() {
    // Fetch available departments for associating the role
    db.query('SELECT * FROM department', (err, departments) => {
        if (err) throw err;

        inquirer.prompt([
            {
                type: 'input',
                name: 'roleTitle',
                message: 'Enter the title of the new role:'
            },
            {
                type: 'input',
                name: 'roleSalary',
                message: 'Enter the salary for the role:'
            },
            {
                type: 'list',
                name: 'departmentId',
                message: 'Select the department for this role:',
                choices: departments.rows.map(dept => ({
                    name: dept.name,
                    value: dept.id
                }))
            }
        ]).then(answers => {
            const { roleTitle, roleSalary, departmentId } = answers;
            db.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', 
            [roleTitle, roleSalary, departmentId], (err, res) => {
                if (err) throw err;
                console.log(`Role ${roleTitle} added successfully!`);
                mainMenu();
            });
        });
    });
}

function updateEmployeeRole() {
    // Fetch available employees and roles
    db.query('SELECT id, first_name, last_name FROM employee', (err, employees) => {
        if (err) throw err;

        db.query('SELECT id, title FROM role', (err, roles) => {
            if (err) throw err;

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'employeeId',
                    message: 'Select the employee to update:',
                    choices: employees.rows.map(employee => ({
                        name: `${employee.first_name} ${employee.last_name}`,
                        value: employee.id
                    }))
                },
                {
                    type: 'list',
                    name: 'roleId',
                    message: 'Select the new role:',
                    choices: roles.rows.map(role => ({
                        name: role.title,
                        value: role.id
                    }))
                }
            ]).then(answers => {
                const { employeeId, roleId } = answers;
                db.query('UPDATE employee SET role_id = $1 WHERE id = $2', [roleId, employeeId], (err, res) => {
                    if (err) throw err;
                    console.log('Employee role updated successfully!');
                    mainMenu();
                });
            });
        });
    });
}



// Start the application by showing the menu
mainMenu();
