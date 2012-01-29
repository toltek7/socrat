//window.onload = function(){ alert("welcome"); }

var cellX = 10;
var cellY = 10;


function readNumbersValues(){


}


function buildNumTable(container, table, x, y) {
    var $tbl = $(table).empty();
    var $tr = $('<tr>');

    for (var i = 0; i < x; i++) {
        $tr.append($('<td>'));
    }

    for (var i = 0; i < y; i++) {
        $tbl.append($tr.clone());
    }

    $(container).append($tbl);
}

function initNumTable(table) {

    $(table + ' td').each(function (i, el) {


        var  $cellNum = $('<span>').attr("class","num");
        var  $cellWord = $('<span>').attr("class","word");

        var $div = $('<div>');
        $div.append($cellWord.text("ГаГарин"));

        $div.append($cellNum.text(11));

        $(this).append($div);


        $(this).hover(
            function () {
                if($(this).hasClass("opened"));
                else
                    $(this).stop().animate({"opacity":"1"}, { queue:true, duration:350 });
            },
            function () {
                if($(this).hasClass("opened"))
                    $(this).stop().animate({"opacity":".7"}, { queue:true, duration:350 });
                else
                    $(this).stop().animate({"opacity":".5"}, { queue:true, duration:350 });
            }
        );

        $(this).click(function () {
            $(this).addClass('opened');
            $(this).children('div').children('.num').animate({"font-size":"10px", "right":"3px","top":"-18px"});//hide("slow");
            $(this).children('div').children('.word').show("slow");
//            $(this).children('div').children('.num').show("slow");
//            $(this).children('span.word').show("slow");
        });
    })

}



$(document).ready(function () {

    readNumbersValues();
    buildNumTable('.wdt_1200','.number_table',10,5);
    initNumTable('.number_table');

//    $("#slider").slider();
});