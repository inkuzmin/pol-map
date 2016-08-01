;(function (root, undefined) {


    var poly2tri = root.poly2tri;

    var Reg = function (options) {
        var self = this;
        self._obtainOptions(options);
        self._init();
    };

    Reg.prototype = {
        showUPin: function (image) {
            var self = this;
            if (!self.upin) {
                self.upin = new root.PM.UPin({
                    center: self.center,
                    viewport: self.el.parentNode,
                    image: image,
                    regs: [self.num]
                });
            }
            self.upin.show();

        },
        hideUPin: function () {
            var self = this;
            self.upin.hide();

        },
        showMark: function (className, image) {
            var self = this;
            if (!self.mark) {
                self.mark = new root.PM.Mark({
                    center: self.center,
                    viewport: self.el.parentNode,
                    className: className,
                    image: image,
                    regs: [self.num]
                });
            }
            self.mark.show();
        },
        hideMark: function () {
            var self = this;
            self.mark.hide();
        },
        setColor: function (num) {
            var self = this;

            self.color = num;
            self._addColorClass(num);
        },
        setCenter: function (center) {
            var self = this;
            self.center = center;
        },
        _init: function () {
            var self = this;
            self.el = self.options.el;
            self.markers = {};

            self.interactivity = self.options.interactivity === false ? false : true;

            if (self._isReg(self.el)) {

                var reg = self.interactivity ? 'reg' : 'reg_static';

                self.el.setAttribute('class', reg);

                self.num = parseInt(self._getNumber());
                self.polygons = self._pickPoligons();
                self._bindHandlers();
                self.center = self._defineGeometricCenter();

            }

        },

        _triangularize: function () {
            var self = this;

            var allTriangles = [];
            var areas = [];
            var i, l = self.polygons.length;
            for (i = 0; i < l; i += 1) {
                var contour = [];
                var points = self.polygons[i].getAttribute('points').split(' ');
                var j, len = points.length;
                for (j = 0; j < len; j += 1) {
                    var pair = points[j].split(',');

                    var x = parseInt(pair[0]);
                    var y = parseInt(pair[1]);
                    if (x && y) {
                        var uniq = true;
                        var k, length = contour.length;
                        for (k = 0; k < length; k += 1) {
                            if (x === contour[k]['x'] && y === contour[k]['y']) {
                                uniq = false;
                                console.log(123);
                                break;
                            }
                        }

                        if (uniq) {
                            contour.push(new poly2tri.Point(x, y));
                        }
                    }
                }
                console.log(contour)
                var swctx = new poly2tri.SweepContext(contour);
                swctx.triangulate();
                var triangles = swctx.getTriangles();

                triangles.forEach(function (t) {

                    allTriangles.push(t);

                    var A = t.getPoint(0);
                    var B = t.getPoint(1);
                    var C = t.getPoint(2);

                    var area = Math.abs((A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y)) / 2);

                    areas.push(area);
                });

            }


        },

        _getLargestPoly: function () {
            var self = this;
            var points = [];
            var i, len = self.polygons.length;
            for (i = 0; i < len; i += 1) {
                if (self.polygons[i].getAttribute('points')) {
                    points.push(self.polygons[i].getAttribute('points').split(' ').length);
                }
                else {
                    return false;
                }
            }

            return points.indexOf(Math.max.apply(Math, points));

        },

        _defineGeometricCenter: function () {
            var self = this;


            var num = self._getLargestPoly() || 0;


            var coordinates = self.polygons[num].getBBox();

            var lat = (coordinates.y + coordinates.y + coordinates.height) / 2;
            var lng = (coordinates.x + coordinates.x + coordinates.width) / 2;

            return {
                x: lng,
                y: lat
            };
        },

        _unscaleMarker: function () {
            var self = this;

            if (self.pinNodes) {
                self._unscale();
            }

        },
        _applyMatrix: function (el, matrix) {
            var self = this;
            var svg = self.el.ownerSVGElement;

            var xf = svg.createSVGTransform();
            var m = svg.getTransformToElement(self.el.parentNode);

            m.a = matrix.a || m.a;
            m.b = matrix.b || m.b;
            m.c = matrix.c || m.c;
            m.d = matrix.d || m.d;
            m.e = matrix.e || m.e;
            m.f = matrix.f || m.f;
            xf.setMatrix(m);

            el.transform.baseVal.appendItem(xf);
        },

        _addColorClass: function (num) {
            var self = this;
            var classes = self.el.getAttribute('class') ? self.el.getAttribute('class').split() : [];
            var resultClasses = [];
            var i, l = classes.length;
            for (i = 0; i < l; i += 1) {
                if (classes[i].substr(0, 5) !== 'color') {
                    resultClasses.push(classes[i]);
                }
            }
            resultClasses.push('color_' + num);
            self.el.setAttribute('class', resultClasses.join(' '));
        },
        _getNumber: function () {
            var self = this;
            return self.el.id.substr(3);
        },
        _pickPoligons: function () {
            var self = this;
            var polygons = [];
            var pathNodes = Array.prototype.slice.call(self.el.childNodes);

            var i, l = pathNodes.length;
            for (i = 0; i < l; i += 1) {
                var node = pathNodes[i];
                if (node.nodeType === Node.ELEMENT_NODE) {
                    polygons.push(node);
                }
            }
            return polygons;
        },
        _bindHandlers: function () {
            var self = this;

            self.el.addEventListener('mouseover', function (e) {
                pubsub.publish('map:reg:over', {
                    target: self,
                    original: e
                });
            }, false);
            self.el.addEventListener('mouseleave', function (e) {
                pubsub.publish('map:reg:out', {
                    target: self,
                    original: e
                });
            }, false);


            self.el.addEventListener('mousedown', function (e) {
                self.click = [e.clientX, e.clientY];
            }, false);
            self.el.addEventListener('mouseup', function (e) {
                if (Math.abs(e.clientX - self.click[0]) < 3 &&
                    Math.abs(e.clientY - self.click[1]) < 3) {
                    pubsub.publish('map:reg:click', {
                        target: self,
                        original: e
                    });
                }
            }, false);

        },
        _isReg: function (el) {
            return (el.id.substr(0, 3) === 'reg') ? true : false;
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

    root.PM.Reg = Reg;

})(this);