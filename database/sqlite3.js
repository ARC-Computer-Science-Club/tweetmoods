var sqlite3 = require('sqlite3').verbose()

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

module.exports = {
    open_con: open_con,
    close_con: close_con,
    query_func: query_func,
    list_func: list_func,
    send_func: send_func
};