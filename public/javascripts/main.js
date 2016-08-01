var map;

$(document).ready(function() {


    pubsub.subscribe('map:pin:click', function (type, event) {
        var pin = event.target;
        console.log('REGIONS: ' + pin.regs);
    });

    pubsub.subscribe('map:reg:click', function (type, event) {
        var reg = event.target;
        console.log('CLICK ON REG: ' + reg.num);
    });

    map = new PM.Map({
        svg: {
            url: 'svg/map2.svg'
        },
        centers: {
            '1': {
                y: 15443,
                x: 2978
            },
            '2': {
                y: 15372,
                x: 3008
            }
        },
        container: document.getElementById('map_content'),
        callback: function () {
            map.getReg(76).setColor(1);
            map.getReg(42).setColor(1);
            map.getReg(4).setColor(2);
            map.getReg(8).setColor(3);
            map.getReg(25).setColor(5);
            map.getReg(77).setColor(8);
            map.getReg(69).setColor(13);

            map.getReg(76).showUPin();

            map.getReg(1).showUPin();
            map.getReg(2).showUPin();

            map.showUPin(10, {
                src: 'http://fc00.deviantart.net/fs71/f/2010/108/b/e/Free_Cloud_and_star_icon_by_HeadyMcDodd.gif',
                align: true

            });
            map.showPPin(88, 74, {
                src: 'http://fc00.deviantart.net/fs70/f/2010/066/8/a/Earth_Icon_by_HeadyMcDodd.gif',
                align: true
            });

            map.showMark(56, 'red_mark', {
                 src: 'http://fc00.deviantart.net/fs70/f/2010/199/0/4/Spinning_Lollipop_Free_Icon_by_HeadyMcDodd.gif'
            });

            map.showMark(34, 'red_mark', {
                src: 'http://fc05.deviantart.net/fs70/f/2010/236/c/0/Free_Ice_Cream_Icon_by_HeadyMcDodd.gif'
            });

            map.showMark(82, 'red_mark', {
                src: 'http://fc00.deviantart.net/fs71/f/2010/108/b/e/Free_Cloud_and_star_icon_by_HeadyMcDodd.gif'
            });
            map.showMark(75, 'green_mark');
        }
    });

});