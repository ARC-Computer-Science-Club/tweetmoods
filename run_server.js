var express = require('express'); // analogue of #include <express> in C++
var bodyParser = require('body-parser')
var sqlite3 = require('sqlite3').verbose()
var Chart = require('chart.js');
var path = require('path');
var app = express();
var today = new Date();

// Import Database Functions using module.exports
var database_functions = require('./database/sqlite3')
// Define Database Functions from object attributes
open_con = database_functions.open_con
close_con = database_functions.close_con
query_func = database_functions.query_func
list_func = database_functions.list_func
send_func = database_functions.send_func


app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
// all of there are necessary for chart.js

// this function will parse our POST data for us
var urlencodedParser = bodyParser.urlencoded({ extended: false })

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

