
;(function(root, undefined){

    var document = root.document;

    var Map =  root.PM.Map;

    Map.prototype.minimap = function (opts) {
        var self = this;

        var minimap = new PM.Map({
            svg: {
                url: 'svg/map2.svg'
            },
            container: opts.container,
            callback: function () {


                var regs = [];
                var reg = minimap.getReg(opts.mainRegNum);
                reg.setColor(7);
                regs.push(reg);
                var i, len = opts.otherRegsNums.length;
                for (i = 0; i < len; i += 1) {
                    var reg = minimap.getReg(opts.otherRegsNums[i]);
                    regs.push(reg);
                    reg.setColor(2);
                }

                var viewBBox = {
                    x: Infinity,
                    y: Infinity,
                    x2: -Infinity,
                    y2: -Infinity
                };
                for (i = 0; i <= len; i += 1) {
                    viewBBox.x = Math.min(regs[i].el.getBBox().x, viewBBox.x);
                    viewBBox.y = Math.min(regs[i].el.getBBox().y, viewBBox.y);
                    viewBBox.x2 = Math.max(regs[i].el.getBBox().width + regs[i].el.getBBox().x, viewBBox.x2);
                    viewBBox.y2 = Math.max(regs[i].el.getBBox().height + regs[i].el.getBBox().y, viewBBox.y2);
                }

                viewBBox.width = viewBBox.x2 - viewBBox.x;
                viewBBox.height = viewBBox.y2 - viewBBox.y;

                console.log(viewBBox);

                minimap._focus(viewBBox);

                map.getReg(76).setColor(1);


                opts.callback();


            },
            interactivity: false
        });
    };


})(this);