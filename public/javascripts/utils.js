var _ = (function () {
    var _ = {};
    _.hasProp = {}.hasOwnProperty;
    _.extends = function (child, parent) {
        var result = {};
        for (var key in child) {
            if (_.hasProp.call(child, key)) {
                result[key] = child[key];
            }
        }
        for (var key in parent) {
            if (_.hasProp.call(parent, key)) {
                result[key] = parent[key];
            }
        }
        return result;
    };
    return _;
})();

Number.prototype.toFixedDown = function(digits) {
    var re = new RegExp("(\\d+\\.\\d{" + digits + "})(\\d)"),
        m = this.toString().match(re);
    return m ? parseFloat(m[1]) : this.valueOf();
};