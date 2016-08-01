
;(function(root, undefined){

    var document = root.document;

    var Pin = {
        show: function () {
            var self = this;
            self.nodes.group.style.display = '';
        },
        hide: function () {
            var self = this;
            self.nodes.group.style.display = 'none';
        },
        _init: function () {
            var self = this;
            self.center = self.options.center;
            self.viewport = self.options.viewport;
            self.image = self.options.image;
            self.regs = self.options.regs;
            function init() {
                self.svg = self.viewport.ownerSVGElement;
                self.nodes = self._createPin();
                self._addPin();
                self._unscale();
                self._bindHandlers();
            }

            if (self.image) {
                var img = new Image();
                img.onload = function () {
                    self.image.width = img.width;
                    self.image.height = img.height;
                };
                img.src = self.image.src;
                init();
            }
            else {
                init();
            }
        },
        _bindHandlers: function () {
            var self = this;

            var subscription = pubsub.subscribe("map:wheel", function () {
                self._unscale();
            });

            self.nodes.group.addEventListener('mouseover', function (e) {
                pubsub.publish('map:pin:over', {
                    target: self,
                    original: e
                });
            }, false);
            self.nodes.group.addEventListener('mouseleave', function (e) {
                pubsub.publish('map:pin:out', {
                    target: self,
                    original: e
                });
            }, false);
            self.nodes.group.addEventListener('mousedown', function (e) {
                self.click = [e.clientX, e.clientY];
            }, false);
            self.nodes.group.addEventListener('mouseup', function (e) {
                if (Math.abs(e.clientX - self.click[0]) < 3 &&
                    Math.abs(e.clientY - self.click[1]) < 3) {
                    pubsub.publish('map:pin:click', {
                        target: self,
                        original: e
                    });
                }
            }, false);

        },
        _unscale: function () {
            console.log('Override it!')
        },
        _addPin: function () {
            var self = this;
            self.viewport.appendChild(self.nodes.group);
        },
        _createPin: function () {
            console.log('Override it!');
        },
        _obtainOptions: function (options) {
            var self = this;
            self.options = {};
            for (var param in options) {
                if (options.hasOwnProperty(param))
                    self.options[param] = options[param];
            }
        },
        _createPath: function (opts) {
            var self = this;
            var pathNode = document.createElementNS("http://www.w3.org/2000/svg", "path");
            pathNode.setAttribute('vector-effect', opts.vectorEffect);
            pathNode.setAttribute('stroke', opts.stroke);
            pathNode.setAttribute('stroke-width', opts.strokeWidth);
            pathNode.setAttribute('d', opts.d);
            pathNode.setAttribute('fill', opts.fill);
            pathNode.setAttribute('class', opts.className);
            return pathNode;
        },
        _createCircle: function (opts) {
            var self = this;
            var circleNode = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circleNode.setAttribute('cy', opts.cy);
            circleNode.setAttribute('cx', opts.cx);
            circleNode.setAttribute('r', opts.r);
            circleNode.setAttribute('stroke', opts.stroke);
            circleNode.setAttribute('fill', opts.fill);
            circleNode.setAttribute('stroke-width', opts.strokeWidth);
            circleNode.setAttribute('vector-effect', opts.vectorEffect);
            circleNode.setAttribute('class', opts.className);
            circleNode.setAttribute('opacity', opts.opacity);
            return circleNode;
        },
        _createImage: function (opts) {
            var self = this;

            var imageNode = document.createElementNS("http://www.w3.org/2000/svg", "image");
            imageNode.setAttribute('x', opts.x);
            imageNode.setAttribute('y', opts.y);

            if (opts.height && opts.width) {
                imageNode.setAttribute('height', opts.height);
                imageNode.setAttribute('width', opts.width);
            }

            imageNode.setAttributeNS('http://www.w3.org/1999/xlink', 'href', opts.src);

            imageNode.setAttribute('class', opts.className);
            imageNode.setAttribute('opacity', opts.opacity);

            return imageNode;
        }
    };

    root.PM.Pin = Pin;

})(this);