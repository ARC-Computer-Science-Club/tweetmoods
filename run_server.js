const express = require('express'); // analogue of #include <express> in C++
var bodyParser = require('body-parser')
const sqlite3 = require('sqlite3').verbose()
const app = express();
var today = new Date();



// declares the object that will open the connection to the SQLite database (filename = tweets.db)
function open_con() {
    db = new sqlite3.Database('tweets.db', (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Connected to the tweets.db database.');
    });
    //db.run('CREATE TABLE IF NOT EXISTS handles  ("entry_id" INTEGER PRIMARY KEY AUTOINCREMENT,"handle" TEXT NOT NULL,"mood" INTEGER NOT NULL,"month" INTEGER NOT NULL, "day" INTEGER NOT NULL, "year" INTEGER NOT NULL, "hour" INTEGER NOT NULL, "minute" INTEGER NOT NULL)');
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

    let month = (today.getMonth()+1)
    let day = today.getDate()
    let year = today.getFullYear()
    let hour = today.getHours()
    let minutes = today.getMinutes();
    var handle_entered = `${req.body['handle']}`

    open_con();
    // open connection to database


    console.log(handle_entered +'' + ' ' + month + '-' + day + '-' + year + ' ' + hour + ':' + minutes);
    // debug print statement

    let query = `INSERT INTO handles(handle, mood, month, day, year, hour, minute) VALUES('${handle_entered}',1,'${month}','${day}','${year}','${hour}','${minutes}')`;
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
            if (row.minute < 10) {
                let min = row.minute;
                let zero = 0;
                var minutes = zero.toString() + min.toString();
                console.log(row.entry_id, row.handle, row.mood, row.month + '-' + row.day + '-' + row.year, row.hour + ':' + minutes);
                // NOTE: the minutes column cannot store leading zeros
                // so to combat this problem we add a zero onto it when it is read
                // Don't forget!
            };
            console.log(row.entry_id, row.handle, row.mood, row.month + '-' + row.day + '-' + row.year, row.hour + ':' + row.minute);
            // if minute column is > 10 no need to add a leading zero
        });
    });
    close_con();
    // close connection
    res.redirect('/')
    // redirect
});


app.post('/graph', urlencodedParser, function (req, res) {

    if (req.body['handle']) {
        open_con();
        // declares database object
        // doesn't print message because object functions haven't been called yet

        let hand_sel = `SELECT * FROM handles WHERE handle='${req.body['handle']}'`;
        // set selection criteria

        // db.all is a async function and will be executed after everthing in the code
        // TO DO: figure out what it's promise is and how that all works, and how it effect variable scope
        // for now I've stuck the res.send and close_con() inside so that they still work
        db.all(hand_sel, [], (err, rows) => {
            // db.all() connects to the database and brings all of the contents into memory (expensive if many entries)
            // then we search through all the entries in memory
            // this is why we can close the connection in this function, because we are already done with the database (not sure on this)

            // IMPORTANT NOTE:
            // the open_con(); doesn't open the connection, calling the db object functions does
            // using db.all, db.each or db.get will connect

            if (err) {
                throw err
            };
            var data_list = rows;
            close_con();
            res.send(data_list);

        });
    } else {
        res.send('You did not enter a handle. Cannot Query Database.');
    };
});


app.listen(3000, () => {
    console.log('App listens on port 3000!');
});
