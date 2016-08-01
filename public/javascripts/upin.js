
;(function(root, undefined){

    var document = root.document;

    var UPin = function (options) {
        var self = this;
        self._obtainOptions(options);
        self._init();
    };


    UPin.prototype = _.extends(root.PM.Pin, {
        _unscale: function () {
            var self = this;
            var m = self.svg.getTransformToElement(self.viewport);
            if (self.image) {
                function unscaleImage() {
                    self.nodes.image.setAttribute('height', self.image.height * m.a);
                    self.nodes.image.setAttribute('width', self.image.width * m.a);

                    if (self.image.align) {
                        self.nodes.image.setAttribute('y', self.center.y - self.image.height / 2 * m.a - 20 * m.a);
                    }
                    else {
                        self.nodes.image.setAttribute('y', self.center.y - self.image.height * m.a - 20 * m.a);
                    }
                    self.nodes.image.setAttribute('x', self.center.x - self.image.width / 2 * m.a);
                }

                if (self.image.height && self.image.width) {
                    unscaleImage();
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
                self.nodes.circle.setAttribute('r', 10 * m.a);
                self.nodes.circle.setAttribute('cy', self.center.y - 20 * m.a);
            }
            self.nodes.path.setAttribute('d', 'M ' + self.center.x + ' ' + self.center.y + ' l 0 -' + (20 * m.a));

        },

        _createPin: function () {
            var self = this;

            var groupNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
            groupNode.className = 'upin';
            groupNode.style.display = 'none';

            var pathNode = self._createPath({
                'vectorEffect': 'non-scaling-stroke',
                'stroke': self.options.stroke || 'royalblue',
                'strokeWidth': '2',
                'd': 'M ' + self.center.x + ' ' + self.center.y + ' l 0 -500',
                'fill': 'none',
                'className': 'upin'
            });
            groupNode.appendChild(pathNode);


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
                    image: imageNode,
                    path: pathNode
                };

            }

            else {


                var circleNode = self._createCircle({
                    'cy': self.center.y - 500,
                    'cx': self.center.x,
                    'r': '10',
                    'stroke': self.options.stroke || 'royalblue',
                    'fill': self.options.fill || 'white',
                    'strokeWidth': '2',
                    'vectorEffect': 'non-scaling-stroke',
                    'className': 'upin'
                })

                groupNode.appendChild(circleNode);

                return {
                    group: groupNode,
                    path: pathNode,
                    circle: circleNode
                };
            }

        }
    });

    root.PM.UPin = UPin;

})(this);