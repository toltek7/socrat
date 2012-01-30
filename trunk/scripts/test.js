//window.onload = function(){ alert("welcome"); }

var cellX = 10;
var cellY = 10;
var codesNumbers ={
    numb : new Array(),
    word : new Array()
}
//Note: 101 - max numbers of cell in html table
var cellsMaxNum = 101;
var startNumMin = 0;
var startNumMax = 49;
var randomArray = new Array(cellsMaxNum);
function setRandomArray(min, max){
    for(var i = 0; i< cellsMaxNum; i++){
        randomArray[i] = Math.floor(Math.random()*(max - min + 1) + min);
    }
}

function readNumbersValues(xml){

    $(xml).find("num").each(function()
    {
        codesNumbers.numb.push($(this).attr("value"));
        codesNumbers.word.push($(this).text());
    });
    setRandomArray(startNumMin,startNumMax);
}

function buildNumTableHtml(container, table, x, y) {
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
        $div.append($cellWord.text(codesNumbers.word[randomArray[randomArray[i]]]));
        $div.append($cellNum.text(codesNumbers.numb[randomArray[randomArray[i]]]));
        $(this).append($div);

        $(this).hover(
            function () {
                if($(this).hasClass("opened"));
                else
                    $(this).stop().animate({"opacity":"1"}, { queue:true, duration:350 });
            },
            function () {
                if($(this).hasClass("opened"))
                    $(this).stop().animate({"opacity":".8"}, { queue:true, duration:350 });
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

    //http://www.switchonthecode.com/tutorials/xml-parsing-with-jquery
    $.ajax({
        type: "GET",
        url: '../data/numbers.xml',
        async: false,
        dataType: "xml",
        isLocal: true,
        success: readNumbersValues
    });


    buildNumTableHtml('.wdt_1200','.number_table',8,6);
    initNumTable('.number_table');

//    $("#slider").slider();
});