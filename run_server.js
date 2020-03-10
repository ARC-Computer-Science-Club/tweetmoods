const express = require('express'); // analogue of #include <express> in C++
var bodyParser = require('body-parser')
const sqlite3 = require('sqlite3').verbose()
const app = express();
var today = new Date();



// opens the connection to the SQLite database (filename = tweets.db)
function open_con() {
    db = new sqlite3.Database('tweets.db', (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Connected to the tweets.db database.');
    });
    //db.run('CREATE TABLE IF NOT EXISTS handles  ("entry_id" INTEGER PRIMARY KEY AUTOINCREMENT,"handle" TEXT NOT NULL,"month" INTEGER NOT NULL, "day" INTEGER NOT NULL, "year" INTEGER NOT NULL, "hour" INTEGER NOT NULL, "minute" INTEGER NOT NULL)');
    // create the handles table is it doesn't exist
    // NOTE: you cannot create a table if you have an INSERT anywhere in the code
    // that is why it is commented out, it won't work unless you comment out the db.run(query) below
};

function close_con() {
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Close the database connection.');
    });
}
// function to close the sqlite connection

// this function will parse our POST data for us
var urlencodedParser = bodyParser.urlencoded({ extended: false })


// HOME PAGE
app.get('/', (req, res) => {
    res.sendFile(process.cwd()+ '\\intro.html');
});

// handle page for get request (just redirect to home)
app.get('/handle', function (req, res) {
    res.redirect('/');
});

// when the server gets a POST request at this url (rather than a GET request), the server will run the code below
app.post('/handle', urlencodedParser, function (req, res) {
    if (today.getMinutes() < 10) {
        var min = today.getMinutes()
        var zero = 0
        var minutes = zero.toString() + min.toString();
    } else {
        minutes = today.getMinutes();
    };
    // setting the minutes (if < 10 put a 0 in front for readability)

    var month = (today.getMonth()+1)
    var day = today.getDate()
    var year = today.getFullYear()
    var hour = today.getHours()
    var handle_entered = '"' + `${req.body['handle']}` + '"'
    // setting the other time variables and the handle
    // NOTE: we add "" around the handle string so that SQLite recognizes it as a string when we insert it,
    // just using VALUES(@testhandle) will NOT work, use: VALUES("@testhandle")
    // must do this because of the arroba

    open_con();
    // open connection to database

    console.log(handle_entered +'' + ' ' + month + '-' + day + '-' + year + ' ' + hour + ':' + minutes);
    // debug print statement

    var query = 'INSERT INTO handles(handle, month, day, year, hour, minute) VALUES(' + handle_entered + ',' + month + ',' + day + ',' + year + ',' + hour + ',' + minutes + ')';
    db.run(query);
    // insert data into table

    close_con();
    // close connection

    res.redirect('/');
    // redirect user to home page (temporary)
});

// this is route that prints all the entries in the database onto the console
app.get('/list', function (req, res) {
    open_con();
    // open connection to database
    let sel2 = 'SELECT * FROM handles ORDER BY entry_id'
    // create selection string ( select everything (*) from the table handles and order it by entry_id )
    db.all(sel2, [], (err, rows) => {
        // db.all (selection, parameters (none), (errors, rows (with attributes corresponding to columns))
        if (err) {
            throw err;
        }
        // here we user a FOR loop like in python to print each attribute of every row in the database
        rows.forEach((row) => {
            console.log(row.entry_id, row.handle, row.month + '-' + row.day + '-' + row.year, row.hour + ':' + row.minute);
        });
    });
    close_con();
    res.redirect('/')
});

app.listen(3000, () => {
    console.log('App listens on port 3000!');
});

