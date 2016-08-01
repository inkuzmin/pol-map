
;(function(root, undefined){

    var document = root.document;

    var Map = function (options) {
        var self = this;
        self._obtainOptions(options);
        self._init();
    };

    Map.prototype = {

        centrate: function () {
            var self = this;

            function getEventPoint(e) {
                var p = self.svgNode.createSVGPoint();

                p.x = e.clientX;
                p.y = e.clientY;

                return p;
            }


            document.addEventListener('click', function (e) {
                var svgDoc = e.target.ownerDocument;
                var g = self.viewportNode;
                var stateTf = g.getScreenCTM().inverse();

                var stateOrigin = getEventPoint(e).matrixTransform(stateTf);

                console.log('Coordinates of click: ');
                console.log(stateOrigin);

            }, false);

        },

        minimap: function (opts) {
            var self = this;

            var minimap = new PM.Map({
                svg: opts.svg || self.options.svg,
                container: opts.container,
                callback: function () {


                    var regs = [];
                    var reg = minimap.getReg(opts.mainRegNum);
                    reg.setColor(21);
                    regs.push(reg);
                    var i, len = opts.otherRegsNums.length;
                    for (i = 0; i < len; i +=1) {
                        var reg = minimap.getReg(opts.otherRegsNums[i]);
                        regs.push(reg);
                        reg.setColor(22);
                    }

                    var viewBBox = {
                        x: Infinity,
                        y: Infinity,
                        x2: -Infinity,
                        y2: -Infinity
                    };
                    for (i = 0; i <= len; i +=1) {
                        viewBBox.x = Math.min(regs[i].el.getBBox().x, viewBBox.x);
                        viewBBox.y = Math.min(regs[i].el.getBBox().y, viewBBox.y);
                        viewBBox.x2 = Math.max(regs[i].el.getBBox().width + regs[i].el.getBBox().x, viewBBox.x2);
                        viewBBox.y2 = Math.max(regs[i].el.getBBox().height + regs[i].el.getBBox().y, viewBBox.y2);
                    }

                    viewBBox.width = viewBBox.x2 - viewBBox.x;
                    viewBBox.height = viewBBox.y2 - viewBBox.y;

//                    console.log(viewBBox);

                    minimap._focus(viewBBox);

                    map.getReg(76).setColor(1);


                    opts.callback();


                },
                interactivity: false
            });


        },

        focus: function (num, ms, zoomOut) {
            var self = this;
            var viewBBox;
            if (num) {
                viewBBox = self.regs[num].el.getBBox();
            }
            else {
                viewBBox = self.viewportNode.getBBox();
            }
            self._focus(viewBBox, ms, zoomOut);
        },

        getReg: function (num) {
            return this.regs[num];
        },
        showUPin: function (num, image) {
            var self = this;
            self.regs[num].showUPin(image);
        },
        hideUPin: function (num) {
            var self = this;
            self.regs[num].hideUPin();
        },
        showPPin: function (num1, num2, image) {
            var self = this;

            var reg1 = self.regs[num1];
            var reg2 = self.regs[num2];
            var centers = {
                a: reg1.center,
                b: reg2.center
            };

            var ppin = new root.PM.PPin({
                viewport: self.viewportNode,
                centers: centers,
                image: image,
                stroke: 'blue',
                regs: [reg1.num, reg2.num]
            });
            ppin.show();
            self.ppins[self._pair(num1, num2)] = ppin;
        },
        hidePPin: function (num1, num2) {
            var self = this;
            self.ppins[self._pair(num1, num2)].hide();
        },

        showMark: function (num, className, image) {
            var self = this;
            self.regs[num].showMark(className, image);
        },
        hideMark: function (num) {
            var self = this;
            self.regs[num].hideMark();
        },
        _animatrix: function (ms, from, to) {
            var self = this;

            ms = ms/10;

            var steps = {
                a:  (to.a - from.a) / ms,
                d:  (to.d - from.d) / ms,
                e:  (to.e - from.e) / ms,
                f:  (to.f - from.f) / ms
            };



            var i = setInterval(function() {
                if (ms--) {
                    console.log('zoooooooooooooooooooooooooom')

                    from.a += steps.a;
                    from.d += steps.d;
                    from.e += steps.e;
                    from.f += steps.f;

                    self._setCTM({
                        a: from.a,
                        d: from.d,
                        e: from.e,
                        f: from.f
                    });

                    self._wheel();
                } else {
                    clearInterval(i);
                }
            }, 10);


        },
        _applyMatrix: function (matrix) {
            var self = this;
            var svg = self.viewportNode.ownerSVGElement;

            var xf = svg.createSVGTransform();
            var m = svg.getTransformToElement(self.viewportNode);

            m.a = matrix.a || m.a;
            m.b = matrix.b || m.b;
            m.c = matrix.c || m.c;
            m.d = matrix.d || m.d;
            m.e = matrix.e || m.e;
            m.f = matrix.f || m.f;
            xf.setMatrix(m);

            self.viewportNode.transform.baseVal.appendItem(xf);
        },
        _pair: function (a, b) {
            if (a < b) {
                _a = a;
                a = b;
                b = _a;
            }
            return a + '_' + b;
        },
        _guid: function () {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
            return (function() {
                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
            })();
        },
        _init: function () {
            var self = this;
            self.ppins = {};

            self.options.container = self.options.container || self.options.$container[0];

            self.uid = self._guid();

//            self.interactivity = self.options.interactivity !== false;
            self.interactivity = self.options.interactivity === false ? false : true;

            function whenLoaded() {
                self.svgNode.id = 'pol-map-' + self.uid;

//                self._createMarkersLayer(); // first

                self._createRegions(); // second

                self._bindHandlers();

                self._panifySvg();


                self.options.callback();
            }

            if (self.options.svg.node) {
                self.svgNode = self.options.svg.node;
                whenLoaded();
            }
            else if (self.options.svg.text && self.options.container) {
                var svgWrap = document.createElement('div');
                svgWrap.className = 'pol-map-wrap';
                svgWrap.innerHTML = self.options.svg.text;
                self.options.container.innerHTML = '';
                self.options.container.appendChild(svgWrap);
                self.svgNode = svgWrap.getElementsByTagName('svg')[0];
                whenLoaded();
            }
            else if (self.options.svg.url && self.options.container) {
                var svgWrap = document.createElement('div');
                svgWrap.className = 'pol-map-wrap';
                self._loadSvg(self.options.svg.url, function (responseText) {
                    svgWrap.innerHTML = responseText;
                    self.options.container.innerHTML = '';
                    self.options.container.appendChild(svgWrap);
                    self.svgNode = svgWrap.getElementsByTagName('svg')[0];
                    whenLoaded();
                });
            }
            else {
                throw new Error('Object was instantiated with wrong set of params. Please, check up documentation.');
            }
        },
        _focus: function (viewBBox, ms, zoomOut) {
            var self = this;

            var zoomOut = zoomOut || 1;
            var svgBBox = self.svgNode.parentNode.getBoundingClientRect();

            var z = {
                y: svgBBox.height / viewBBox.height,
                x: svgBBox.width / viewBBox.width
            }

            z = Math.min(z.x, z.y) * zoomOut;

            var ctm = {
                a: z,
                d: z,
                e: -viewBBox.x*z - viewBBox.width*z/2 + svgBBox.width/2,
                f: -viewBBox.y*z - viewBBox.height*z/2 + svgBBox.height/2
            };

            if (ms) {
                self._animatrix(1000, self._getCTM(), ctm);
            }
            else {
                self._setCTM(ctm);
//                self._animatrix(1000, self._getCTM(), ctm);
            }
//            self._animatrix(1000, self._getCTM(), ctm);



            self._wheel();
        },
        _bindHandlers: function () {
            var self = this;

            if (self.interactivity) {
                window.addEventListener('mousewheel', function (e) {
                    self._wheel();
                }, false);
                window.addEventListener('DOMMouseScroll', function (e) {
                    self._wheel();
                }, false);
            }

        },
        _wheel: function () {
            var self = this;
            pubsub.publish( "map:wheel", "true" );
        },
        _createMarkersLayer: function () {
            var self = this;
            var layerNode = document.createElementNS("http://www.w3.org/2000/svg", "g");


            layerNode.id = 'markers-layer';

            self.svgNode.appendChild(layerNode);
        },
        _getCTM: function () {
            var self = this;
            return self.viewportNode.getCTM();
        },
        _setCTM: function (ctm) {
            var self = this;
            var xf = self.viewportNode.ownerSVGElement.createSVGTransform();

            var m = self._getCTM();
            m.a = ctm.a || m.a;
            m.b = ctm.b || m.b;
            m.c = ctm.c || m.c;
            m.d = ctm.d || m.d;
            m.e = ctm.e || m.e;
            m.f = ctm.f || m.f;

            xf.setMatrix(m);
            self.viewportNode.transform.baseVal.initialize(xf);
        },
        _createRegions: function () {
            var self = this;
            self.viewportNode = self.svgNode.getElementById('viewport');

            self.focus();
            var regNodes = Array.prototype.slice.call(self.viewportNode.childNodes);

            self.regs = [];

            console.log(self.interactive)

            var i, l = regNodes.length;
            for (i = 0; i < l; i += 1) {
                var node = regNodes[i];
                if (node.nodeType === Node.ELEMENT_NODE) {
                    var reg = new root.PM.Reg({
                        el: node,
                        interactivity: self.interactivity
                    });
                    if (reg) {
                        if (self.options.centers && self.options.centers[reg.num]) {
                            reg.setCenter(self.options.centers[reg.num]);
                        }
                        self.regs[reg.num] = reg;
                    }
                }
            }
        },
        _panifySvg: function (svgNode) {
            var self = this;

            if (self.interactivity) {
              var id = '#pol-map-' + self.uid;
              $(id).svgPan('viewport');

            }
        },
        _loadSvg: function (url, callback) {
            var self = this;
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status == 200) {
                    callback(xhr.responseText);
                }
            }
            xhr.send();
        },
        _obtainOptions: function (options) {
            var self = this;
            self.options = {};
            for (var param in options) {
                if (options.hasOwnProperty(param))
                    self.options[param] = options[param];
            }
        }
    };

    root.PM.Map = Map;

})(this);