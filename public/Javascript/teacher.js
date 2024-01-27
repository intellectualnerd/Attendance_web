//set default today's date 
function formatDate() {
    let date = new Date();
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}
$(document).ready(function () {
    $('#date').val(formatDate());
});


//button back color of days
$(document).ready(function () {
    $("#days>button").click(function () {
        $("#days>button").removeClass("btn-color-change");
        $(this).addClass("btn-color-change");
    });
});
//know day of date yyyy-mm-dd 
function getLocalizedDate(dateStr) {
    var d = new Date(dateStr);
    return new Date(d.getTime() + d.getTimezoneOffset() * 60000);
}

//global var
var period;
var submit_attendance = [];
function attendance_search() {
    //day,date,period
    var date = $("#date").val();
    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const d = getLocalizedDate(date);
    let day = weekday[d.getDay()];
    var period_no = $("#period").val();

    //check input
    if (period_no == "Select") {
        alert("Input All Values");
    }
    else if (day == 'Sunday') {
        alert('Take extra class');
    }
    else {
        const time = ["10:30AM - 11:30AM", "11:30AM - 12:30PM", "1:00PM - 2:00PM", "2:00PM - 3:00PM", "3:15PM - 4:15PM", "4:15AM - 5:15AM"];
        period = {
            no: period_no,
            time: time[period_no - 1],
            day: day,
            branch: "cse",
            batch: ["m1", "m2"],
            sem: "3",
            subject: "math",
            type: "period"
        }
        $("#period-details").css({ "display": "flex" });
        $("#this-period").html("#" + period.no);
        $("#this-period-time").html(period.time);
        $("#this-day").html(period.day);
        $("#this-branch").html(period.branch);
        $("#this-sem").html(period.sem);
        $("#this-sub").html(period.subject);
        $("#this-type").html(period.type);

        document.getElementById("this-batch").innerHTML = period.batch[0];

        for (var i = 1; i < period.batch.length; i++) {
            document.getElementById("this-batch").innerHTML += ', ' + period.batch[i]
        }
        $.post("/getstudents",
            {
                sem: period.sem,
                branch: period.branch,
                batch: period.batch
            },
            function (data, status) {
                $("#attendance_table").DataTable({
                    destroy: true,
                    data: data,
                    bLengthChange: true,
                    columns: [
                        { data: "enrollment", title: "Enrollment" },
                        { data: "name", title: "Name" },
                        { data: "batch", title: "Batch" },
                        {
                            data: "enrollment",
                            render: (data, type, row, meta) => {
                                return (`<input type="checkbox" id="` + data + `" class="present_check">`);
                            },
                            title: "Attendance",
                        },
                    ],
                });
            });
    }
}

//submit attendance
function submit() {
    var count = $('#attendance_table .present_check').length;
    submit_attendance = []
    for (i = 0; i < count; i++) {
        var check = document.getElementById("attendance_table").getElementsByClassName("present_check")[i];
        if (check != undefined && check.id) {
            val = check.checked;
            enrollment = check.id;
            submit_attendance.push(new attendance(enrollment, 1, $("#date").val(), period.subject, period.type, period.no, val));
        }
    }
    $.post("/add/attendance",
        {
            submit_attendance: submit_attendance
        },
        function (data, status) {
            alert("Data: " + data);
        });
}
class attendance {
    constructor(enrollment, teacher_id, date, subject, type, periodno, present) {
        this.enrollment = enrollment;
        this.teacher_id = teacher_id;
        this.date = date;
        this.subject = subject;
        this.type = type;
        this.periodno = periodno;
        this.attendance = present;
    }
}

//check all
function checkAll() {
    var count = $('#attendance_table .present_check').length;
    for (var i = 0; i < count; i++) {
        var check = document.getElementById("attendance_table").getElementsByClassName("present_check")[i];
        check.checked = true;
    }
}

//Format of get/post req
/*
$("button").click(function () {
    $.get("demo_test.asp", function (data, status) {
        alert("Data: " + data + "\nStatus: " + status);
    });
});
//post req  
$("button").click(function () {
    $.post("demo_test_post.asp",
        {
            name: "Donald Duck",
            city: "Duckburg"
        },
        function (data, status) {
            alert("Data: " + data + "\nStatus: " + status);
        });
});*/
