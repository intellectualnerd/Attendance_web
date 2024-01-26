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
const today = new Date();
$("#date").val(today.getDate());

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
        const time=["10:30AM - 11:30AM","11:30AM - 12:30PM", "1:00PM - 2:00PM", "2:00PM - 3:00PM","3:15PM - 4:15PM","4:15AM - 5:15AM"];
        const period={
            no:period_no,
            time:time[period_no-1],
            day:day,
            branch:"cse",
            sem:"4",
            subject:"math",
            type:"period"
        }
        
        $("#period-details").css({"display":"flex"});
        $("#this-period").html("#" + period.no);
        $("#this-period-time").html(period.time);
        $("#this-day").html(period.day);
        $("#this-branch").html(period.branch);
        $("#this-sem").html(period.sem);
        $("#this-sub").html(period.subject);
        $("#this-type").html(period.type);
    }
}

