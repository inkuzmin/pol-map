
;(function(root, undefined){

    var document = root.document;

    var previousPM = root.PM;

    if (previousPM) {
        throw new Error('Class PM was already defined');
        return;
    }

    root.PM = {};

})(window);