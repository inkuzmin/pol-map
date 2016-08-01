// Copyright 2012 © Gavin Kistner, !@phrogz.net
// Copyright (c), Gavin Kistner (!@phrogz.net)
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
//
// 1) Redistributions of source code must retain the above copyright
//    notice verbatim, and this list of conditions and the following
//    disclaimer, either verbatim or through the inclusion of this
//    file's url.
//
// 2) Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in
//    the documentation and/or other materials provided with the
//    distribution.
//
// 3) You must include in the source code a description of any
//    modifications made to the code (including bugfixes).
//
// Neither the names of Gavin Kistner, Refinery Inc., Anark Inc. nor the
// names of its contributors may be used to endorse or promote products
// derived from this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
// FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
// COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
// INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
// LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
// ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.
//

//
// MODIFICATIONS: unscaleEach now also immediately unscales any elements sent to it.
//

// Undo the scaling to selected elements inside an SVGPan viewport
function unscaleEach(selector){
    if (!selector) selector = "g.non-scaling > *";
    window.addEventListener('mousewheel',     unzoom, false);
    window.addEventListener('DOMMouseScroll', unzoom, false);
    function unzoom(evt){
        // getRoot is a global function exposed by SVGPan
        var r = getRoot(evt.target.ownerDocument);
        [].forEach.call(r.querySelectorAll(selector), unscale);
    }

    [].forEach.call(getRoot(window.root).querySelectorAll(selector), unscale);
}

// Counteract all transforms applied above an element.
// Apply a translation to the element to have it remain at a local position
function unscale(el){
    var svg = el.ownerSVGElement;
    var xf = el.scaleIndependentXForm;
    if (!xf){
        // Keep a single transform matrix in the stack for fighting transformations
        // Be sure to apply this transform after existing transforms (translate)
        xf = el.scaleIndependentXForm = svg.createSVGTransform();
        el.transform.baseVal.appendItem(xf);
    }
    var m = svg.getTransformToElement(el.parentNode);
    m.e = m.f = 0; // Ignore (preserve) any translations done up to this point
    xf.setMatrix(m);
}