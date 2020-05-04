var express = require('express'); // analogue of #include <express> in C++
var bodyParser = require('body-parser')
var sqlite3 = require('sqlite3').verbose()
var Chart = require('chart.js');
var path = require('path');
var app = express();
var today = new Date();


app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
// all of there are necessary for chart.js

// this function will parse our POST data for us
var urlencodedParser = bodyParser.urlencoded({ extended: false })

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
OPENING AND CLOSING THE DATABASE CONNECTION FUNCTIONS
- open_con()
- close_con()
*/

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

// function to close the sqlite connection
function close_con() {
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Closed the database connection.');
    });
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
QUERY, LIST, and SEND FUNCTIONS
- query_func()
       - used to query the database for the graph route and list route
- list_func()
       - used to print out all the rows from a query
- send_func()
       - used to get all the data for a graph from rows object and send it via res.render
*/

// the query_func opens the connection to the database, queries the database,
// then applies the send() function to the output (i.e. rows), the given res_object, and the handle entered by the user
// this is why we pass the res_obj into the query_func() function, so that we can then pass it into send()
// we pass (rows) and the (res_obj) into the send() function (res_obj is needed to access res.send() function)
// the code waits for the send() function to finish, then closes the database

var query_func = function (callback, handle, sel_data, res_obj) {
    open_con();
    // declare database object
    db.serialize(function() {
        // db.serialize gurantees each line below finishes executing before the next begins
        // important so the query can finish before the database is closed (callback() finishes before .close())

        db.all(sel_data, [], (err, rows) => {
            if (err) {
                console.log(err);
            }
            callback(rows, res_obj, handle);
            close_con();
        });
    });
};

var list_func = function (rows, res_obj, handle) {
    // The 'res_obj' and 'handle' arguments are not necessary,
    // but I include them because I want to use list_func as a callback in query_func
    // In python I would use **kwargs but I'm not sure how it works in js

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
    })
};

// function that we will apply as a callback in query_func()
// uses node.js res object to send the query data to the client
// creates lists of need info to send to html chart, sends w/ handle
var send_func = function (rows, res_obj, handle) {
    info_dict = {
        'moods_array':[],
        'hour_array':[],
        'minute_array':[],
    };
    // Stores the data to be sent to the graph

    rows.forEach((row) => {
        info_dict.moods_array.push(row.mood);
        info_dict.hour_array.push(row.hour);
        if (row.minute < 10) {
            info_dict.minute_array.push("0" + row.minute);
        } else {
            info_dict.minute_array.push(row.minute);
        };
    });
    res_obj.render('graph', {
        data: rows ,
        hour_array: info_dict.hour_array ,
        moods_array: info_dict.moods_array ,
        minute_array: info_dict.minute_array ,
        handle: handle
    });
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
ROUTES
- Home Page
- Handle POST
    - for putting a handle in the database
- List GET
    - for printing a list of all handles in the database onto the console
- Graph POST
    - for creating a graph and showing it in html
    - part of the code is in the html as well (/views/graph.html)
 */

// HOME PAGE
app.get('/', (req, res) => {
    res.sendFile(process.cwd()+ '/intro.html');
});

// when the server gets a POST request at this url (rather than a GET request), the server will run the code below
app.post('/handle', urlencodedParser, function (req, res) {
    info_dictionary = {
        'month':(today.getMonth()+1),
        'day':today.getDate(),
        'year':today.getFullYear(),
        'hour':today.getHours(),
        'minutes':today.getMinutes(),
        'handle_entered':`${req.body['handle']}`,
        'mood':2
        // Mood varible in dictionary needs to change dynamically using ML
    };

    open_con();
    // declare database object

    console.log(
        info_dictionary.handle_entered +'' + ' ' +
        info_dictionary.month + '-' +
        info_dictionary.day + '-' +
        info_dictionary.year + ' ' +
        info_dictionary.hour + ':' +
        info_dictionary.minutes
    );
    // debug print statement

    let query = `INSERT INTO handles(handle, mood, month, day, year, hour, minute) VALUES(
    '${info_dictionary.handle_entered}',
    '${info_dictionary.mood}',
    '${info_dictionary.month}',
    '${info_dictionary.day}',
    '${info_dictionary.year}',
    '${info_dictionary.hour}',
    '${info_dictionary.minutes}'
    )`;
    // create SQL query statement
    db.run(query);
    // insert data into table
    close_con();
    // close connection
    res.redirect('/');
    // redirect user to home page (temporary)
});

// this is route that prints all the entries in the database onto the console
app.get('/list', function (req, res) {

    let sel2 = 'SELECT * FROM handles ORDER BY entry_id'
    // create selection string ( select everything (*) from the table handles and order it by entry_id )
    query_func(list_func, 'dummy_handle', sel2, res)
    // use list_func() as a callback in query_func()
    // don't need handle or res objec, but put them in for compatability

    res.redirect('/')
    // redirect
    });

app.post('/graph', urlencodedParser, function (req, res) {
    if (req.body['handle']) {
        let hand_sel = `SELECT * FROM handles WHERE handle='${req.body['handle']}'`;
        query_func(send_func, req.body['handle'], hand_sel, res)
        // In the above code I use callbacks to make the res.send() function run after the query
        // The query function takes in four parameters
        // 1. the send() function (which takes itself 1. message 2. res_obj 3. handle)
        // 2. a string of the handle entered by the user (to put on top of our chart)
        // 3. the selection criteria for SQL (hand_sel)
        // 4. the res object, so that we can later send it into the send() function
        // --- this way works the same as before but cleaner i guess
    } else {
        res.send('You did not enter a handle. Cannot Query Database.');
    };
});

app.listen(3000, () => {
    console.log('App listens on port 3000!');
});

