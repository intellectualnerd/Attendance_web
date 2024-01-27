//REQUIRED FILES

const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const cors = require("cors");
const session = require('express-session');
const connectLivereload = require("connect-livereload");

const app = express();

//CONNECTIONS
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
var pool = mysql.createConnection({
    host: "localhost",
    database: "attendance_management",
    user: "root",
    password: "root",
    dateStrings: true
});
app.use(session({
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 86400000, secure: false }
}));
pool.connect(function (err) {
    if (err) {
        console.log("database not connected");
        throw err;
    }
    else {
        console.log("database connected");
    }

});
//admin
const Auth1 = (req, res, next) => {
    if (req.session.userid && req.session.role == 'Admin') {
        next(); // User is authenticated, continue to next middleware
    } else {
        res.redirect('/503'); // User is not authenticated, redirect to login page
    }
}
const Auth2 = (req, res, next) => {
    if (req.session.userid && req.session.role == 'Teacher') {
        next(); // User is authenticated, continue to next middleware
    } else {
        res.redirect('/503'); // User is not authenticated, redirect to login page
    }
}
function checkdate(date , period, id){
    
}

//REDIRECT
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/Pages/login.html");
});
app.get("/404", (req, res) => {
    res.sendFile(__dirname + "/public/Pages/Error/404.html");
});
app.get("/serverdown", (req, res) => {
    res.sendFile(__dirname + "/public/Pages/Error/serverdown.html");
});
app.get("/503", (req, res) => {
    res.sendFile(__dirname + "/public/Pages/Error/503.html");
});
app.get("/500", (req, res) => {
    res.sendFile(__dirname + "/public/Pages/Error/500.html");
});
app.get("/admin/student", Auth1, (req, res) => {
    res.sendFile(__dirname + "/public/Pages/Admin-Student.html");
});
app.get("/admin/teacher", Auth1, (req, res) => {
    res.sendFile(__dirname + "/public/Pages/Admin-Teacher.html");
});
app.get("/teacher", Auth2, (req, res) => {
    res.sendFile(__dirname + "/public/Pages/Teacher.html");
});

//CODE
app.post('/login', (req, res) => {
    const { role, email, pass } = req.body;
    // Validate user credentials
    pool.query(
        "SELECT * FROM employee where email=(?)",
        [email],
        (error, results) => {
            if (error) {
                console.log(error)
                res.redirect('/500');
            }
            else if (results && results[0]) {
                if (results[0].pass == pass && results[0].role == role) {
                    req.session.userid = results[0].id;
                    req.session.email = email;
                    req.session.pass = pass;
                    req.session.role = role;
                    if (role == 'Admin')
                        res.redirect('/admin/student');
                    else
                        res.redirect('/teacher');
                }
                else {
                    res.redirect('/503');
                }
            }
            else {
                res.redirect('/503');
            }
        }
    );
});

//teacher
app.post("/getstudents", Auth2, (req, res) => {
    const { sem, branch, batch } = req.body;
    var condition = `(batch='` + batch[0] + `'`, i = 1;
    for (i = 1; i < (2); i++) {
        condition += ` OR batch='` + batch[i] + `'`;
    }
    condition += `)`;
    pool.query(
        `SELECT name,enrollment,batch FROM student where sem=(?) AND branch=(?) AND` + condition,
        [sem, branch],
        (error, results) => {
            if (error) {
                console.log(error)
                res.redirect('/500');
            }
            else if (results && results[0]) {
                res.status(200).json(results);
            }
            else {
                res.redirect('/503');
            }
        }
    );
});
app.post("/add/attendance", Auth2, (req, res) => {
    const { submit_attendance } = req.body;
    
    pool.query(
        "SELECT * FROM attendance where date=(?) AND periodno=(?) AND teacher_id=(?)",
        [submit_attendance[0].date, submit_attendance[0].periodno, submit_attendance[0].teacher_id],
        (error, results) => {
            if (error) {
                console.log(error)
                res.redirect('/500');
            }
            else if (results && results[0]) {
                res.status(200).json("Attendance is already there");
            }
            else {
                var val=-1;
                for (i = 0; i < (submit_attendance.length); i++) {
                    if(submit_attendance[i].attendance=='true'){
                        val=1;
                    }
                    else if(submit_attendance[i].attendance=='false'){
                        val=0;
                    }
                    pool.query(
                        `insert into attendance(attendance,date,enrollment,periodno,subject,teacher_id,type) 
                        values(? , ?, ?, ?, ?, ?, ?);`,
                        [val, submit_attendance[i].date,submit_attendance[i].enrollment,
                        submit_attendance[i].periodno,submit_attendance[i].subject,submit_attendance[i].teacher_id,
                        submit_attendance[i].type],
                        (error, results) => {
                            if (error) {
                                console.log(error)
                                res.redirect('/500');
                            }
                        }
                    );
                }
                res.status(200).json("successful");
            }
        }
    );
});


//404
app.all('*', (req, res) => {
    res.sendFile(__dirname + "/public/Pages/Error/404.html");
});
//PORT
const PORT = 3000 || process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server started on ${PORT} `);
});
