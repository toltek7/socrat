//window.onload = function(){ alert("welcome"); }

var cellX = 10;
var cellY = 10;
var cellsNum;

var trackObj;

var openedCells = 0;
var codesNumbers = {
    numb:new Array(),
    word:new Array()
}
//Note: 101 - max numbers of cell in html table
var cellsMaxNum = 101;
//var startNumMin = 0;
//var startNumMax = 49;
var randomArray = new Array(cellsMaxNum);
function setRandomArray(min, max) {

    var num;
    var firstCellIndex = 0;
    var supremum = max - min + 1;
    var unequalRange = 4 * (max - min) / 5;

//    $(".timer").html("");
    for (var i = 0; i < cellsMaxNum; i++) {
        while (1) {
            num = Math.floor(Math.random() * supremum + min);
            //Set more random
            if (isMatchNumber(randomArray, num, firstCellIndex, i)) {
                break;
            }
        }
        /*   $(".timer").append(num + " - " + i + " - ");
         $(".timer").append(firstCellIndex);
         $(".timer").append( $('<br>'));*/
        firstCellIndex = Math.round(i - unequalRange + 1);
        if (firstCellIndex < 0)
            firstCellIndex = 0;

        randomArray[i] = num;
    }
}

function isMatchNumber(array, num, indexMin, indexMax) {

    for (var i = indexMin; i < indexMax; i++) {
        if (array[i] == num) {
            return false;
        }
    }
    return true;
}

function readNumbersValues(xml) {

    $(xml).find("num").each(function () {
        codesNumbers.numb.push($(this).attr("value"));
        codesNumbers.word.push($(this).text());
    });
    setRandomArray(trackObj.leftValue, trackObj.rightValue);
}

function buildNumTableHtml(container, table, x, y) {
    cellX = x;
    cellY = y;

    cellsNum = x*y;

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
    openedCells = 0;
    $(table + ' td').each(function (i, el) {

        var $cellNum = $('<span>').attr("class", "num");
        var $cellWord = $('<span>').attr("class", "word");

        var $div = $('<div>');
        /*
         $div.append($cellWord.text(codesNumbers.word[randomArray[randomArray[i]]]));
         $div.append($cellNum.text(codesNumbers.numb[randomArray[randomArray[i]]]));
         */

        $div.append($cellWord.text(codesNumbers.word[randomArray[i]]));
        $div.append($cellNum.text(codesNumbers.numb[randomArray[i]]));


        $(this).removeClass('opened');
        $(this).html($div);

        $(this).hover(
            function () {
                if ($(this).hasClass("opened"));
                else
                    $(this).stop().animate({"opacity":"1"}, { queue:true, duration:350 });
            },
            function () {
                if ($(this).hasClass("opened"))
                    $(this).stop().animate({"opacity":".8"}, { queue:true, duration:350 });
                else
                    $(this).stop().animate({"opacity":".5"}, { queue:true, duration:350 });
            }
        );

        $(this).click(function () {
            $(this).addClass('opened');
            $(this).children('div').children('.num').animate({"font-size":"10px", "right":"3px", "top":"-18px"});//hide("slow");
            $(this).children('div').children('.word').show("slow");
            openedCells++;

            if(openedCells ==1){
                $(".timer").hide("slow");//style("display","none");
                $(".timer").everyTime(1000, function(i) {
                    $(this).text(i + " сек.");
                });
            }

            if(openedCells == cellsNum ){
            // set fire event
                $(".timer").stopTime();
                $(".timer").show("slow");// style("display","block");

            }
//            $(this).children('div').children('.num').show("slow");
//            $(this).children('span.word').show("slow");
        });
    })

}



$(document).ready(function () {

    $('#trackbar').trackbar({
        width:500, // px
        leftLimit:0, // unit of value
        leftValue:0, // unit of value
        rightLimit:100, // unit of value
        rightValue:50, // unit of value
        clearLimits:true,
        clearValues:false,
        allowOverrideBorders:false,
        roundUp:1,
        tickDivider:10,
        tickRoundUp:1,
        /*showSmallTicks: false,
         showSmallTicks: false,
         showBigTicksText: false,
         precisePositioning: true,*/
        id:"date"
    });

    trackObj = $.trackbar.getObject("date");
    trackObj.onMouseUpMove = function () {
        setRandomArray(trackObj.leftValue, trackObj.rightValue);
        initNumTable('.number_table');
//    alert(this.rightValue);
    };

//    alert(trackObj.leftValue);


    //http://www.switchonthecode.com/tutorials/xml-parsing-with-jquery
    $.ajax({
        type:"GET",
        url:'../data/numbers.xml',
        async:false,
        dataType:"xml",
        isLocal:true,
        success:readNumbersValues
    });


    buildNumTableHtml('.wdt_1200', '.number_table', 6, 8);
    initNumTable('.number_table');



});