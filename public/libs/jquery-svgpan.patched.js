//SVG PAN
(function(factory) {
    if (typeof define === "function" && define.amd) define(["jquery"], factory);
    else factory(jQuery)
})(function($) {
    var NONE = 0,
        PAN = 1,
        DRAG = 2,
        init = function(root, svgRoot, enablePan, enableZoom, enableDrag, zoomScale) {
            var state = NONE,
                stateTarget, stateOrigin, stateTf, svgDoc = root,
                $root = $(root),
                $parent = $root.parent(),
                recentOffset = $root.offset(),
                offsetIsBroken = Math.abs($root.offset().left) > 1E5,
                isMouseOverElem = false,
                dumpMatrix = function(matrix) {
                    var s = "[ " + matrix.a + ", " + matrix.c + ", " + matrix.e + "\n  " + matrix.b +
                        ", " + matrix.d + ", " + matrix.f + "]";
                    return s
                },
                getEventPoint = function(evt) {
                    var p = root.createSVGPoint(),
                        offsetX = evt.offsetX,
                        offsetY = evt.offsetY,
                        offset, ctm, matrix;
                    if (typeof offsetX === "undefined" || typeof offsetY === "undefined") {
                        offset = offsetIsBroken ? $parent.offset() : recentOffset;
                        offsetX = evt.pageX - offset.left;
                        offsetY = evt.pageY - offset.top
                    }
                    p.x = offsetX;
                    p.y = offsetY;
                    return p
                },
                setCTM = function(element, matrix) {
                    var s = "matrix(" + matrix.a + "," + matrix.b + "," + matrix.c + "," + matrix.d + "," + matrix.e + "," + matrix.f + ")";
                    element.setAttribute("transform",
                        s)
                },
                handleMouseWheel = function(evt) {
                    if (!enableZoom) return;
                    if (!isMouseOverElem) return;
                    if (evt.preventDefault) evt.preventDefault();
                    evt.returnValue = false;
                    recentOffset = $root.offset();
                    var delta = evt.wheelDelta ? evt.wheelDelta / 360 : evt.detail / -9;

                    if (delta > 0.5) {
                        delta = 0.5;
                    }
                    if (delta < -0.5) {
                        delta = -0.5;
                    }

                    var z = Math.pow(1 + zoomScale, delta),
                        g = svgRoot,
                        p = getEventPoint(evt),
                        k;

                    p = p.matrixTransform(g.getCTM().inverse());
                    k = root.createSVGMatrix().translate(p.x, p.y).scale(z).translate(-p.x, -p.y);


                    if(g.getCTM().d>1.3 && delta>0)
                    {
                        return;
                    }
                    if(g.getCTM().d<0.03 && delta<0)
                    {
                        return;
                    }
                    setCTM(g, g.getCTM().multiply(k));


                    if (typeof stateTf === "undefined") stateTf = g.getCTM().inverse();
                    stateTf = stateTf.multiply(k.inverse())
                },
                handleMouseMove = function(evt) {
                    if (evt.preventDefault) evt.preventDefault();
                    evt.returnValue = false;
                    var g = svgRoot,
                        p;
                    if (state === PAN && enablePan) {
                        p = getEventPoint(evt).matrixTransform(stateTf);
                        setCTM(g, stateTf.inverse().translate(p.x - stateOrigin.x, p.y - stateOrigin.y))
                    } else if (state === DRAG && enableDrag) {
                        p = getEventPoint(evt).matrixTransform(g.getCTM().inverse());
                        setCTM(stateTarget, root.createSVGMatrix().translate(p.x - stateOrigin.x, p.y - stateOrigin.y).multiply(g.getCTM().inverse()).multiply(stateTarget.getCTM()));
                        stateOrigin = p
                    }
//                    console.log(g.getCTM());
                },
                handleMouseEnter = function(evt) {
                    if (!isMouseOverElem) {
                        recentOffset = $root.offset();
                        $root.bind("mousemove", handleMouseMove);
                        isMouseOverElem = true
                    }
                },
                handleMouseLeave = function(evt) {
                    if (isMouseOverElem) {
                        $root.unbind("mousemove", handleMouseMove);
                        isMouseOverElem = false
                    }
                    state = NONE
                },
                handleMouseDown = function(evt) {
                    if (evt.preventDefault) evt.preventDefault();
                    evt.returnValue = false;
                    var g = svgRoot;
                    if (evt.target.tagName === "svg" || !enableDrag) {
                        state = PAN;
                        stateTf = g.getCTM().inverse();
                        stateOrigin = getEventPoint(evt).matrixTransform(stateTf)
                    } else {
                        state =
                            DRAG;
                        stateTarget = evt.target;
                        stateTf = g.getCTM().inverse();
                        stateOrigin = getEventPoint(evt).matrixTransform(stateTf)
                    }
                },
                handleMouseUp = function(evt) {
                    if (evt.preventDefault) evt.preventDefault();
                    evt.returnValue = false;
                    if (state === PAN || state === DRAG) state = NONE
                };
            $root.bind("mouseup", handleMouseUp).bind("mousedown", handleMouseDown).bind("mouseenter", handleMouseEnter).bind("mouseleave", handleMouseLeave);
            window.addEventListener("mousewheel", handleMouseWheel, false);
            window.addEventListener("DOMMouseScroll", handleMouseWheel,
                false)
        };
    $.fn.svgPan = function(viewportId, enablePan, enableZoom, enableDrag, zoomScale) {
        enablePan = typeof enablePan !== "undefined" ? enablePan : true;
        enableZoom = typeof enableZoom !== "undefined" ? enableZoom : true;
        enableDrag = typeof enableDrag !== "undefined" ? enableDrag : false;
        zoomScale = typeof zoomScale !== "undefined" ? zoomScale : 0.2;
        return $.each(this, function(i, el) {
            var $el = $(el),
                svg, viewport;
            if ($el.is("svg") && $el.data("SVGPan") !== true) {
                viewport = $el.find("#" + viewportId)[0];
                if (viewport) init($el[0], viewport, enablePan, enableZoom,
                    enableDrag, zoomScale)
            }
        })
    }
});
