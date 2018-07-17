var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');

var table = new Table({
    head: ['ID', 'Item', 'Department', 'Price', 'In stock']
    , colWidths: [10, 50, 75, 15, 15]
});

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
});

function start() {
    tableDisplay();
    inquirer.prompt([
        {
            type: "input",
            name: "id",
            message: "What would you like to buy? Use 1-10 to choose.\n",
        },
        {
            type: "input",
            name: "quantity",
            message: "How many would you like to purchase?"
        }
    ]).then(function (a) {
        var index = a.id - 1;
        var quantity = parseInt(a.quantity);
        connection.query("SELECT * FROM products", function (err, res) {
            if (err) throw err;
           // console.log(res);
            var updatedStock = res[index].stock_quantity - quantity;
            var id = res[index].item_id;
            connection.query("UPDATE products SET ? WHERE ?",
                [
                    {
                        stock_quantity: updatedStock
                    },
                    {
                        item_id: id
                    }
                ],
                function(error){
                    if (error) throw err;
                    console.log("Item succesfully purchased!!");
                    start();
                }
            );
        });
    });
}

function tableDisplay() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            table.push(
                [res[i].item_id, res[i].product_name, res[i].department_name, '$' + res[i].price, res[i].stock_quantity]

            );
        }
        console.log(table.toString());
        for (var i = 0; i < res.length; i++) {
            table.shift();
        }
    });
}

start();