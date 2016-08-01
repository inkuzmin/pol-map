;
(function (root, undefined) {

    var document = root.document;

    var Mark = function (options) {
        var self = this;
        self._obtainOptions(options);
        self._init();
    };


    Mark.prototype = _.extends(root.PM.Pin, {
        _unscale: function () {
            var self = this;
            var m = self.svg.getTransformToElement(self.viewport);

            if (self.image) {
                function unscaleImage() {
                    self.nodes.image.setAttribute('height', self.image.height * m.a);
                    self.nodes.image.setAttribute('width', self.image.width * m.a);

                    if (self.image.align) {
                        self.nodes.image.setAttribute('y', self.center.y - self.image.height / 2 * m.a);
                    }
                    else {
                        self.nodes.image.setAttribute('y', self.center.y - self.image.height * m.a);
                    }
                    self.nodes.image.setAttribute('x', self.center.x - self.image.width / 2 * m.a);
                }

                if (self.image.height && self.image.width) {
                    unscaleImage();
                    clearInterval(i);
                }
                else {
                    var i = setInterval(function () {
                        if (self.image.height && self.image.width) {
                            unscaleImage();
                            clearInterval(i);
                        }
                    }, 100);
                }

            }
            else {
                self.nodes.circleInner.setAttribute('r', 10 * m.a);
                self.nodes.circleInner.setAttribute('cy', self.center.y - 20 * m.a);

                self.nodes.circleOuter.setAttribute('r', 25 * m.a);
                self.nodes.circleOuter.setAttribute('cy', self.center.y - 20 * m.a);
            }

        },

        _createPin: function () {
            var self = this;

            var groupNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
            groupNode.className = 'mark ' + self.options.className;
            groupNode.style.display = 'none';

            if (self.image) {

                var imageNode = self._createImage({
                    'x': self.center.x - 500,
                    'y': self.center.y,
                    className: 'mark ' + self.options.className,
                    src: self.image.src
                });

                groupNode.appendChild(imageNode);

                return {
                    group: groupNode,
                    image: imageNode
                };

            }

            else {

                var circleInnerNode = self._createCircle({
                    'cy': self.center.y - 500,
                    'cx': self.center.x,
                    'r': '10',
                    'stroke': self.options.stroke || 'royalblue',
                    'fill': self.options.fill || 'white',
                    'strokeWidth': '2',
                    'vectorEffect': 'non-scaling-stroke',
                    'className': 'mark ' + self.options.className
                });

                var circleOuterNode = self._createCircle({
                    'cy': self.center.y - 500,
                    'cx': self.center.x,
                    'r': '30',
                    'opacity': '0.5',
                    'fill': self.options.stroke || 'royalblue',
                    'strokeWidth': '0',
                    'vectorEffect': 'non-scaling-stroke',
                    'className': 'mark ' + self.options.className
                });

                groupNode.appendChild(circleOuterNode);
                groupNode.appendChild(circleInnerNode);

                return {
                    group: groupNode,
                    circleInner: circleInnerNode,
                    circleOuter: circleOuterNode

                };
            }

        }
    });

    root.PM.Mark = Mark;

})(this);