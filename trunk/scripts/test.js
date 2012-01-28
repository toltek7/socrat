//window.onload = function(){ alert("welcome"); }

function initNumTable(table) {

    $(table + ' td').each(function (i, el) {

        $(this).hover(
            function () {
                $(this).animate({"opacity":"1"}, { queue:true, duration:350 });
            },
            function () {
                $(this).animate({"opacity":".2"}, { queue:true, duration:350 });
            }
        );

        $(this).click(function () {
            $(this).hide("slow");
        });
    })


    $("a").click(function (event) {
//        alert("Thanks for visiting!");
        event.preventDefault();
        $(this).hide("slow");

    });

}
$(document).ready(function () {
    initNumTable('.number_table');

});