
;(function(root, undefined){

    var document = root.document;

    var PPin = function (options) {
        var self = this;
        self._obtainOptions(options);
        self._init();
    };


    PPin.prototype = _.extends(root.PM.Pin, {
        _init: function () {
            var self = this;
            self.centers = {
                a: self.options.centers.a,
                b: self.options.centers.b
            };

            root.PM.Pin._init.call(this);

        },

        _unscale: function () {
            var self = this;

            var m = self.svg.getTransformToElement(self.viewport);

            if (self.image) {
                function unscaleImage() {
                    self.nodes.image.setAttribute('height', self.image.height * m.a);
                    self.nodes.image.setAttribute('width', self.image.width * m.a);

                    if (self.image.align) {
                        self.nodes.image.setAttribute('y', self.center.y - self.image.height / 2 * m.a - 50 * m.a);
                    }
                    else {
                        self.nodes.image.setAttribute('y', self.center.y - self.image.height * m.a - 50 * m.a);
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

                self.nodes.circle.setAttribute('r',  10 * m.a);
                self.nodes.circle.setAttribute('cy', self.center.y - 50*m.a);

            }

            self.nodes.pathA.setAttribute('d', 'M ' + self.centers.a.x + ' ' + self.centers.a.y + ' L ' + self.center.x + ' ' + (self.center.y - 50* m.a));
            self.nodes.pathB.setAttribute('d', 'M ' + self.centers.b.x + ' ' + self.centers.b.y + ' L ' + self.center.x + ' ' + (self.center.y - 50* m.a));
        },

        _createPin: function () {
            var self = this;

            self.center = {
                x: (self.centers.a.x + self.centers.b.x) / 2,
                y: Math.max(self.centers.a.y, self.centers.b.y)
            }

            var groupNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
            groupNode.className = 'ppin';
            groupNode.style.display = 'none';

            var pathNodeA = self._createPath({
                'vectorEffect': 'non-scaling-stroke',
                'stroke': self.options.stroke || 'darkred',
                'strokeWidth': '2',
                'd': 'M ' + self.centers.a.x + ' ' + self.centers.a.y + ' L ' + self.center.x + ' ' + (self.center.y - 500),
                'fill': 'none',
                'className': 'ppin'
            });

            var pathNodeB = self._createPath({
                'vectorEffect': 'non-scaling-stroke',
                'stroke': self.options.stroke || 'darkred',
                'strokeWidth': '2',
                'd': 'M ' + self.centers.b.x + ' ' + self.centers.b.y + ' L ' + self.center.x + ' ' + (self.center.y - 500),
                'fill': 'none',
                'className': 'ppin'
            });

            groupNode.appendChild(pathNodeA);
            groupNode.appendChild(pathNodeB);

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
                    pathA: pathNodeA,
                    pathB: pathNodeB
                };

            }

            else {
                var circleNode = self._createCircle({
                    'cy': self.center.y - 500,
                    'cx': self.center.x,
                    'r': '10',
                    'stroke': self.options.stroke || 'darkred',
                    'fill': self.options.fill || 'grey',
                    'strokeWidth': '2',
                    'vectorEffect': 'non-scaling-stroke',
                    'className': 'ppin'
                })

                groupNode.appendChild(circleNode);

                return {
                    group: groupNode,
                    pathA: pathNodeA,
                    pathB: pathNodeB,
                    circle: circleNode
                };
            }

        }

    });

    root.PM.PPin = PPin;

})(this);